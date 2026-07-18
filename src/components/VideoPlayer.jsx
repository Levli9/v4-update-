// src/components/VideoPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';

export default function VideoPlayer({ videoUrl, videoScript, emoji, color, initialTime = 0, onAnalytics }) {
  const [isPlaying, setIsPlaying] = useState(!videoUrl);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLineIdx, setCurrentLineIdx] = useState(-1);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);
  
  // Real HTML5 Video element reference
  const videoElementRef = useRef(null);
  const previousPlaybackTimeRef = useRef(0);
  const pendingWatchSecondsRef = useRef(0);
  const lastTelemetryAtRef = useRef(0);
  const restoredPositionRef = useRef(false);

  // If a real video url is provided, use the native HTML5 player
  const isRealVideo = !!videoUrl;

  // TTS helper
  const speakText = (text) => {
    if (!('speechSynthesis' in window) || !ttsEnabled) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[🛡️📊✅🎯🔐⚡]/gu, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'he-IL';
    utterance.rate = playbackRate;
    utterance.volume = volume;
    
    // Pick Hebrew voice if available
    const voices = window.speechSynthesis.getVoices();
    const heVoice = voices.find(v => v.lang.startsWith('he'));
    if (heVoice) utterance.voice = heVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  const stopTts = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // ── Custom Simulated Player Logic (Fallback TTS) ──
  useEffect(() => {
    if (isRealVideo) return; // Skip if it's a real video
    
    if (isPlaying) {
      const startTime = Date.now() - (currentTime * 1000) / playbackRate;
      timerRef.current = setInterval(() => {
        const elapsed = ((Date.now() - startTime) / 1000) * playbackRate;
        
        if (videoScript && videoScript.length > 0) {
          const totalDuration = videoScript[videoScript.length - 1].time + 5;
          setDuration(totalDuration);
          
          if (elapsed >= totalDuration) {
            handleStop();
            return;
          }
        }
        
        setCurrentTime(elapsed);
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, playbackRate, isRealVideo]);

  // Sync Hebrew narration and captions with both bundled and simulated video.
  useEffect(() => {
    if (!videoScript) return;
    
    let activeLine = -1;
    for (let i = videoScript.length - 1; i >= 0; i--) {
      if (currentTime >= videoScript[i].time) {
        activeLine = i;
        break;
      }
    }
    
    if (activeLine !== currentLineIdx && activeLine >= 0) {
      setCurrentLineIdx(activeLine);
      if (!isRealVideo) speakText(videoScript[activeLine].text);
    }
  }, [currentTime, videoScript, ttsEnabled]);

  const handlePlayPause = () => {
    if (isRealVideo) {
      if (isPlaying) {
        videoElementRef.current.pause();
      } else {
        videoElementRef.current.muted = !ttsEnabled;
        videoElementRef.current.play().catch(() => setIsPlaying(false));
      }
    } else {
      if (isPlaying) {
        setIsPlaying(false);
        stopTts();
      } else {
        setIsPlaying(true);
      }
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentLineIdx(-1);
    stopTts();
    if (isRealVideo && videoElementRef.current) {
      videoElementRef.current.pause();
      videoElementRef.current.currentTime = 0;
    }
  };

  const seekToLine = (index) => {
    if (isRealVideo) return;
    stopTts();
    const targetTime = videoScript[index].time;
    setCurrentTime(targetTime);
    setCurrentLineIdx(index);
    setIsPlaying(true);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await wrapperRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen is unavailable', error);
    }
  };

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    };
    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  // Sync state with HTML5 native events
  const onTimeUpdate = () => {
    if (videoElementRef.current) {
      const nextTime = videoElementRef.current.currentTime;
      const delta = nextTime - previousPlaybackTimeRef.current;
      if (!videoElementRef.current.paused && delta > 0 && delta < 2.5) {
        pendingWatchSecondsRef.current += delta;
      }
      previousPlaybackTimeRef.current = nextTime;
      setCurrentTime(nextTime);
      if (Date.now() - lastTelemetryAtRef.current > 5000) {
        onAnalytics?.({
          currentTime: nextTime,
          duration: videoElementRef.current.duration || duration,
          watchedDelta: pendingWatchSecondsRef.current
        });
        pendingWatchSecondsRef.current = 0;
        lastTelemetryAtRef.current = Date.now();
      }
    }
  };

  const onLoadedMetadata = () => {
    if (videoElementRef.current) {
      setDuration(videoElementRef.current.duration);
      if (!restoredPositionRef.current && initialTime > 1 && initialTime < videoElementRef.current.duration - 2) {
        videoElementRef.current.currentTime = initialTime;
        previousPlaybackTimeRef.current = initialTime;
        setCurrentTime(initialTime);
      }
      restoredPositionRef.current = true;
      onAnalytics?.({ currentTime: videoElementRef.current.currentTime, duration: videoElementRef.current.duration, watchedDelta: 0 });

      // Auto-start playing
      videoElementRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("Autoplay unmuted blocked:", err);
          // Fallback: try playing muted
          if (videoElementRef.current) {
            videoElementRef.current.muted = true;
            setTtsEnabled(false);
            videoElementRef.current.play()
              .then(() => {
                setIsPlaying(true);
              })
              .catch((mutedErr) => {
                console.log("Muted autoplay also blocked:", mutedErr);
                setIsPlaying(false);
              });
          }
        });
    }
  };

  const onVideoEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentLineIdx(-1);
    stopTts();
    onAnalytics?.({ currentTime: duration, duration, watchedDelta: pendingWatchSecondsRef.current, completed: true });
    pendingWatchSecondsRef.current = 0;
  };

  // Timeline scrub
  const handleScrubChange = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (isRealVideo && videoElementRef.current) {
      videoElementRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    setTtsEnabled(nextVolume > 0);
    if (videoElementRef.current) {
      videoElementRef.current.volume = nextVolume;
      videoElementRef.current.muted = nextVolume === 0;
    }
    if (nextVolume === 0) stopTts();
  };

  const toggleMute = () => {
    const nextEnabled = !ttsEnabled;
    setTtsEnabled(nextEnabled);
    if (videoElementRef.current) {
      videoElementRef.current.volume = volume;
      videoElementRef.current.muted = !nextEnabled;
    } else if (!nextEnabled) {
      stopTts();
    } else if (isPlaying && currentLineIdx >= 0 && videoScript?.[currentLineIdx]) {
      speakText(videoScript[currentLineIdx].text);
    }
  };

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => stopTts();
  }, []);

  return (
    <div 
      ref={wrapperRef}
      className={`bg-[#06060e] border border-gray-800 overflow-hidden shadow-2xl relative flex flex-col ${
        isFullscreen ? 'h-screen w-screen rounded-none border-0' : 'mx-auto w-full max-w-5xl rounded-3xl'
      }`}
      style={{ '--vcolor': color }}
    >
      {/* ── SCREEN AREA ── */}
      <div className={`relative bg-radial-gradient flex flex-1 flex-col items-center justify-center overflow-hidden select-none ${isFullscreen ? 'min-h-0' : 'min-h-[320px] sm:min-h-[430px]'}`}>
        
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-grid-lines pointer-events-none opacity-20"></div>

        {/* corner accents */}
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: color }}></div>
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: color }}></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: color }}></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: color }}></div>

        {isRealVideo ? (
          /* NATIVE HTML5 VIDEO PLAYER */
          <video
            ref={videoElementRef}
            src={videoUrl}
            preload="metadata"
            playsInline
            muted={!ttsEnabled}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onEnded={onVideoEnded}
            onPlay={() => {
              setIsPlaying(true);
              previousPlaybackTimeRef.current = videoElementRef.current?.currentTime || 0;
              onAnalytics?.({ currentTime: videoElementRef.current?.currentTime || 0, duration: videoElementRef.current?.duration || duration, watchedDelta: 0, event: 'play' });
            }}
            onPause={() => {
              setIsPlaying(false);
              onAnalytics?.({ currentTime: videoElementRef.current?.currentTime || currentTime, duration: videoElementRef.current?.duration || duration, watchedDelta: pendingWatchSecondsRef.current });
              pendingWatchSecondsRef.current = 0;
            }}
            className={`block w-full object-contain ${isFullscreen ? 'h-full max-h-none flex-1' : 'h-auto max-h-[min(68vh,620px)] aspect-video'}`}
            onClick={handlePlayPause}
          />
        ) : (
          /* SIMULATED TTS ENGINE SCREEN */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center z-10">
            <span className="text-7xl filter drop-shadow-[0_0_20px_rgba(0,230,255,0.2)] mb-4 animate-pulse">
              {emoji}
            </span>
            <div className="min-h-[60px] flex items-center justify-center px-4 max-w-[80%]">
              {currentLineIdx >= 0 && videoScript ? (
                <span className="bg-black/60 border border-gray-850 text-white font-bold text-md px-5 py-2.5 rounded-xl shadow-lg leading-relaxed animate-fade-in">
                  {videoScript[currentLineIdx].text}
                </span>
              ) : (
                <span className="text-xs text-gray-500 font-semibold">לחץ על כפתור ההפעלה כדי להתחיל קריינות מסונכרנת</span>
              )}
            </div>
            
            {/* Timeline dot navigation for fallback */}
            {videoScript && (
              <div className="flex gap-2 justify-center mt-6 flex-wrap">
                {videoScript.map((line, idx) => (
                  <button
                    key={idx}
                    onClick={() => seekToLine(idx)}
                    className={`w-6 h-6 rounded-full border text-[10px] font-bold flex items-center justify-center transition-all ${
                      idx === currentLineIdx
                        ? 'text-black font-extrabold shadow-md scale-110'
                        : idx < currentLineIdx
                        ? 'text-white/60 bg-white/10'
                        : 'text-gray-600 border-gray-800 bg-transparent'
                    }`}
                    style={{
                      backgroundColor: idx === currentLineIdx ? color : '',
                      borderColor: idx === currentLineIdx ? color : 'rgba(255,255,255,0.1)'
                    }}
                    title={line.text}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── TIMELINE SCRUB BAR ── */}
      <div className="px-4 bg-gray-950/60 border-t border-gray-900">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleScrubChange}
          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#00e6ff]"
          style={{ accentColor: color }}
        />
      </div>

      {/* ── CONTROL BAR ── */}
      <div className="flex items-center justify-between p-4 bg-gray-950/90 border-t border-gray-900 flex-wrap gap-4 text-xs font-semibold text-gray-400">
        
        {/* Left Cluster */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPause}
            className="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 text-white flex items-center justify-center hover:border-gray-700 hover:text-[#00e6ff] transition-all"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={handleStop}
            className="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 text-white flex items-center justify-center hover:border-gray-700 hover:text-red-500 transition-all"
          >
            ⏹
          </button>
          <span className="font-mono text-xs">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>

        {/* Right Cluster */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition-all ${
              ttsEnabled ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-gray-800 text-gray-500'
            }`}>
            <button type="button" onClick={toggleMute} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg hover:bg-white/5" aria-label={ttsEnabled ? 'השתקת קול' : 'הפעלת קול'} aria-pressed={!ttsEnabled} title={ttsEnabled ? 'השתקת קול' : 'הפעלת קול'}>
              {ttsEnabled && volume > 0 ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <label className="flex items-center gap-2" title={`עוצמת קול ${Math.round(volume * 100)}%`}>
              <span className="hidden whitespace-nowrap text-[10px] font-black sm:inline">עוצמת קול</span>
              <input dir="ltr" type="range" min="0" max="1" step="0.05" value={ttsEnabled ? volume : 0} onChange={handleVolumeChange} className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-gray-700 accent-emerald-400 sm:w-28" aria-label="עוצמת קול" />
              <span className="w-7 text-left font-mono text-[9px]">{ttsEnabled ? Math.round(volume * 100) : 0}%</span>
            </label>
          </div>

          {/* Speed Selector */}
          <select
            value={playbackRate}
            onChange={(e) => {
              const rate = parseFloat(e.target.value);
              setPlaybackRate(rate);
              if (isRealVideo && videoElementRef.current) {
                videoElementRef.current.playbackRate = rate;
              }
            }}
            className="bg-gray-900 border border-gray-850 px-2 py-1 rounded text-xs text-gray-300 focus:outline-none"
          >
            <option value="0.75">0.75x</option>
            <option value="1">1.0x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="grid h-9 w-9 place-items-center rounded-lg border border-gray-800 bg-gray-900 text-gray-300 transition-colors hover:border-gray-700 hover:text-white"
            title={isFullscreen ? 'יציאה ממסך מלא' : 'מסך מלא'}
            aria-label={isFullscreen ? 'יציאה ממסך מלא' : 'מסך מלא'}
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </div>
    </div>
  );
}
