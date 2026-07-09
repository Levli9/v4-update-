// ============================================================
// VIDEO ENGINE v2 – Cinematic Animated Explainer with TTS + Fullscreen
// Uses Web Speech API (free, built-in) for Hebrew narration
// ============================================================

// ── Emoji per topic ──────────────────────────────────────────
const TOPIC_EMOJIS   = ['🛡️','🔑','🎣','🦠','🧑‍💻','💻','🗄️','🌐','🎯','💥','📋'];
const TOPIC_COLORS   = [
  '#00e6ff','#9d4edd','#ffb703','#ff007f',
  '#00e676','#4cc9f0','#f72585','#3a86c8',
  '#f3722c','#f94144','#90be6d'
];

function getCourseEmoji(id) { return TOPIC_EMOJIS[id] || '🎓'; }
function getCourseColor(id) { return TOPIC_COLORS[id] || '#00e6ff'; }
function formatTime(s) {
  const m = Math.floor(s / 60), sec = Math.floor(s) % 60;
  return `${m}:${String(sec).padStart(2,'0')}`;
}

// ── Build player HTML ─────────────────────────────────────────
function buildVideoPlayer(topicId) {
  const course = DETAILED_OFFLINE_COURSES[topicId];
  if (!course || !course.videoScript) return '';

  const lines        = course.videoScript;
  const total        = lines[lines.length - 1].time + 5;
  const emoji        = getCourseEmoji(topicId);
  const color        = getCourseColor(topicId);
  const courseTitle  = course.courseTitle || '';
  const ttsSupported = 'speechSynthesis' in window;

  return `
<div class="cinema-player" id="cinema-${topicId}" data-topic="${topicId}" data-total="${total}" style="--vcolor:${color}">

  <!-- ─ Fullscreen wrapper ─ -->
  <div class="cinema-fullscreen-wrap" id="cinema-fsw-${topicId}">

    <!-- ─ Screen ─ -->
    <div class="cinema-screen" id="cinema-screen-${topicId}">

      <!-- Decorative corner lines -->
      <div class="cinema-corner c-tl"></div>
      <div class="cinema-corner c-tr"></div>
      <div class="cinema-corner c-bl"></div>
      <div class="cinema-corner c-br"></div>

      <!-- Background emoji watermark -->
      <div class="cinema-watermark" aria-hidden="true">${emoji}</div>

      <!-- Animated scan-line overlay -->
      <div class="cinema-scanlines" aria-hidden="true"></div>

      <!-- Play-button overlay (shown before start) -->
      <div class="cinema-play-overlay" id="cinema-overlay-${topicId}" onclick="toggleVideo(${topicId})">
        <div class="cinema-play-ring" style="border-color:${color}">
          <i class="fas fa-play cinema-play-icon" style="color:${color}"></i>
        </div>
        <p class="cinema-overlay-label">לחץ להפעלת סרטון ההסבר</p>
      </div>

      <!-- Caption area -->
      <div class="cinema-captions" id="cinema-captions-${topicId}"></div>

      <!-- Chapter chips -->
      <div class="cinema-chapters" id="cinema-chapters-${topicId}">
        ${lines.map((l,i) => `
          <span class="cinema-chip" id="chip-${topicId}-${i}"
                onclick="seekVideo(${topicId}, ${i})"
                title="${l.text.replace(/"/g,'')}">
            ${i+1}
          </span>`).join('')}
      </div>

      <!-- Progress bar at bottom of screen -->
      <div class="cinema-progress-track" onclick="scrubVideo(event, ${topicId}, ${total})" id="cinema-track-${topicId}">
        <div class="cinema-progress-fill" id="cinema-fill-${topicId}" style="background:${color}"></div>
        <div class="cinema-progress-thumb" id="cinema-thumb-${topicId}" style="background:${color}"></div>
      </div>
    </div>

    <!-- ─ Control bar ─ -->
    <div class="cinema-controls">

      <!-- Left cluster: play/pause + time -->
      <div class="cinema-ctrl-left">
        <button class="cinema-btn-icon" id="cinema-playbtn-${topicId}"
                onclick="toggleVideo(${topicId})" title="הפעל / השהה">
          <i class="fas fa-play"></i>
        </button>
        <span class="cinema-time" id="cinema-time-${topicId}">0:00 / ${formatTime(total)}</span>
      </div>

      <!-- Center: title + TTS badge -->
      <div class="cinema-ctrl-center">
        <span class="cinema-title-label">${emoji} ${courseTitle}</span>
        ${ttsSupported ? `<span class="cinema-tts-badge" id="cinema-tts-${topicId}" onclick="toggleTTS(${topicId})" title="הפעל / כבה קריינות">🔊 קריינות</span>` : ''}
      </div>

      <!-- Right cluster: speed + fullscreen -->
      <div class="cinema-ctrl-right">
        <select class="cinema-speed" id="cinema-speed-${topicId}" onchange="changeSpeed(${topicId}, this.value)" title="מהירות ניגון">
          <option value="0.75">0.75x</option>
          <option value="1" selected>1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
        <button class="cinema-btn-icon" onclick="togglePlayerFullscreen(${topicId})" title="מסך מלא">
          <i class="fas fa-expand" id="cinema-fs-icon-${topicId}"></i>
        </button>
      </div>

    </div>
  </div><!-- /cinema-fullscreen-wrap -->

</div><!-- /cinema-player -->
`;
}

// ── State ──────────────────────────────────────────────────────
const videoStates = {};

// ── Core: toggle / start / pause / resume ─────────────────────
function toggleVideo(topicId) {
  const s = videoStates[topicId];
  if (!s)              { startVideo(topicId); return; }
  if (s.playing)       { pauseVideo(topicId); }
  else                 { resumeVideo(topicId); }
}

function startVideo(topicId) {
  const course = DETAILED_OFFLINE_COURSES[topicId];
  if (!course?.videoScript) return;

  const script = course.videoScript;
  const total  = script[script.length - 1].time + 5;

  // Hide play overlay
  const overlay = document.getElementById(`cinema-overlay-${topicId}`);
  if (overlay) overlay.style.display = 'none';

  videoStates[topicId] = {
    playing: true, startTime: Date.now(), elapsed: 0,
    script, total, currentLine: -1, interval: null,
    speed: 1, ttsEnabled: true, utterance: null
  };

  _setPlayIcon(topicId, true);
  _animateLoop(topicId);
}

function pauseVideo(topicId) {
  const s = videoStates[topicId]; if (!s) return;
  s.elapsed += (Date.now() - s.startTime) / 1000;
  clearInterval(s.interval);
  s.playing = false;
  _setPlayIcon(topicId, false);
  _stopTTS();
}

function resumeVideo(topicId) {
  const s = videoStates[topicId]; if (!s) return;
  s.startTime = Date.now();
  s.playing = true;
  _setPlayIcon(topicId, true);
  _animateLoop(topicId);
}

function seekVideo(topicId, lineIndex) {
  const course = DETAILED_OFFLINE_COURSES[topicId];
  if (!course?.videoScript) return;
  const script = course.videoScript;
  const target = script[lineIndex].time;

  // Stop any existing TTS
  _stopTTS();

  if (!videoStates[topicId]) {
    const overlay = document.getElementById(`cinema-overlay-${topicId}`);
    if (overlay) overlay.style.display = 'none';
    const total = script[script.length - 1].time + 5;
    videoStates[topicId] = {
      playing: true, startTime: Date.now(), elapsed: target,
      script, total, currentLine: lineIndex - 1, interval: null,
      speed: 1, ttsEnabled: true, utterance: null
    };
  } else {
    const s = videoStates[topicId];
    clearInterval(s.interval);
    s.elapsed = target;
    s.startTime = Date.now();
    s.playing = true;
    s.currentLine = lineIndex - 1;
  }

  _setPlayIcon(topicId, true);
  _animateLoop(topicId);
}

function scrubVideo(event, topicId, total) {
  const track = document.getElementById(`cinema-track-${topicId}`);
  if (!track) return;
  const rect = track.getBoundingClientRect();
  // Progress is right-to-left (RTL layout) – invert
  const pct  = 1 - (event.clientX - rect.left) / rect.width;
  const targetTime = Math.max(0, Math.min(total, pct * total));

  _stopTTS();
  if (!videoStates[topicId]) {
    seekVideo(topicId, 0);
    return;
  }
  const s = videoStates[topicId];
  clearInterval(s.interval);
  s.elapsed = targetTime;
  s.startTime = Date.now();
  s.currentLine = -1;
  if (s.playing) _animateLoop(topicId);
}

function changeSpeed(topicId, val) {
  const s = videoStates[topicId]; if (!s) return;
  s.speed = parseFloat(val);
  // Sync elapsed before changing speed
  s.elapsed += (Date.now() - s.startTime) / 1000;
  s.startTime = Date.now();
}

// ── TTS (Web Speech API) ──────────────────────────────────────
let _currentUtterance = null;

function toggleTTS(topicId) {
  const s = videoStates[topicId];
  const badge = document.getElementById(`cinema-tts-${topicId}`);
  if (s) {
    s.ttsEnabled = !s.ttsEnabled;
    if (!s.ttsEnabled) { _stopTTS(); if (badge) badge.classList.remove('active'); }
    else { if (badge) badge.classList.add('active'); }
  } else {
    // Not started yet – toggle will apply when started
    if (badge) badge.classList.toggle('active');
  }
}

function _speak(text, speed = 1) {
  if (!('speechSynthesis' in window)) return;
  _stopTTS();
  const u = new SpeechSynthesisUtterance(text);
  u.lang  = 'he-IL';
  u.rate  = Math.max(0.7, Math.min(2, speed));
  u.pitch = 1.05;
  u.volume = 0.85;
  // Try to pick a Hebrew voice
  const voices = window.speechSynthesis.getVoices();
  const heVoice = voices.find(v => v.lang.startsWith('he'));
  if (heVoice) u.voice = heVoice;
  window.speechSynthesis.speak(u);
  _currentUtterance = u;
}

function _stopTTS() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  _currentUtterance = null;
}

// ── Main animation loop ───────────────────────────────────────
function _animateLoop(topicId) {
  const s = videoStates[topicId]; if (!s) return;
  clearInterval(s.interval);

  s.interval = setInterval(() => {
    if (!s.playing) { clearInterval(s.interval); return; }

    const elapsed  = s.elapsed + (Date.now() - s.startTime) / 1000 * s.speed;
    const progress = Math.min(elapsed / s.total, 1);

    // Progress bar + thumb
    const fill  = document.getElementById(`cinema-fill-${topicId}`);
    const thumb = document.getElementById(`cinema-thumb-${topicId}`);
    if (fill)  fill.style.width  = (progress * 100) + '%';
    if (thumb) thumb.style.left  = (progress * 100) + '%';

    // Time display
    const timeEl = document.getElementById(`cinema-time-${topicId}`);
    if (timeEl) timeEl.textContent = `${formatTime(elapsed)} / ${formatTime(s.total)}`;

    // Find current line
    let line = -1;
    for (let i = s.script.length - 1; i >= 0; i--) {
      if (elapsed >= s.script[i].time) { line = i; break; }
    }

    if (line !== s.currentLine && line >= 0) {
      s.currentLine = line;
      const txt = s.script[line].text;

      // ── Animated caption ──
      const captions = document.getElementById(`cinema-captions-${topicId}`);
      if (captions) {
        // Slide out old, slide in new
        const old = captions.querySelector('.caption-current');
        if (old) {
          old.classList.remove('caption-current');
          old.classList.add('caption-exit');
          setTimeout(() => old.remove(), 350);
        }
        const span = document.createElement('span');
        span.className = 'caption-current';
        span.textContent = txt;
        captions.appendChild(span);
      }

      // ── Chapter chips ──
      s.script.forEach((_, i) => {
        const chip = document.getElementById(`chip-${topicId}-${i}`);
        if (!chip) return;
        chip.classList.toggle('chip-done',    i < line);
        chip.classList.toggle('chip-current', i === line);
      });

      // ── TTS narration ──
      if (s.ttsEnabled) _speak(txt.replace(/[^\u0590-\u05FF\u200f\u200ea-zA-Z0-9 .,:!?]/g, ' '), s.speed);
    }

    // End of video
    if (progress >= 1) {
      clearInterval(s.interval);
      s.playing = false;
      _stopTTS();
      _setPlayIcon(topicId, false);

      const captions = document.getElementById(`cinema-captions-${topicId}`);
      if (captions) {
        const old = captions.querySelector('.caption-current');
        if (old) { old.classList.add('caption-exit'); setTimeout(() => old.remove(), 350); }
        const done = document.createElement('span');
        done.className = 'caption-current caption-done';
        done.textContent = '✅ הסרטון הסתיים – עבור לשקפי ההדרכה';
        captions.appendChild(done);
      }

      // Swap play button to Replay
      const btn = document.getElementById(`cinema-playbtn-${topicId}`);
      if (btn) {
        btn.innerHTML = '<i class="fas fa-redo"></i>';
        btn.title = 'צפה שוב';
        btn.onclick = () => {
          videoStates[topicId] = null;
          const overlay = document.getElementById(`cinema-overlay-${topicId}`);
          if (overlay) { overlay.style.display = 'flex'; }
          const c = document.getElementById(`cinema-captions-${topicId}`);
          if (c) c.innerHTML = '';
          startVideo(topicId);
        };
      }
    }
  }, 80);
}

// ── Helpers ───────────────────────────────────────────────────
function _setPlayIcon(topicId, playing) {
  const btn = document.getElementById(`cinema-playbtn-${topicId}`);
  if (btn) btn.innerHTML = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

// ── Fullscreen ────────────────────────────────────────────────
function togglePlayerFullscreen(topicId) {
  const wrap = document.getElementById(`cinema-fsw-${topicId}`);
  const icon = document.getElementById(`cinema-fs-icon-${topicId}`);
  if (!wrap) return;

  if (!document.fullscreenElement) {
    wrap.requestFullscreen().then(() => {
      wrap.classList.add('cinema-is-fullscreen');
      if (icon) { icon.classList.remove('fa-expand'); icon.classList.add('fa-compress'); }
    }).catch(err => console.warn('Fullscreen error:', err));
  } else {
    document.exitFullscreen().then(() => {
      wrap.classList.remove('cinema-is-fullscreen');
      if (icon) { icon.classList.remove('fa-compress'); icon.classList.add('fa-expand'); }
    });
  }
}

// Sync icon when user presses Escape to exit fullscreen
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    document.querySelectorAll('.cinema-fullscreen-wrap').forEach(el => {
      el.classList.remove('cinema-is-fullscreen');
    });
    document.querySelectorAll('[id^="cinema-fs-icon-"]').forEach(icon => {
      icon.classList.remove('fa-compress');
      icon.classList.add('fa-expand');
    });
  }
});

// Pre-load voices (Chrome defers until first interaction)
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  window.speechSynthesis.getVoices();
}
