// ============================================================
// VIDEO ENGINE – HTML5 Animated Explainer Video Player
// ============================================================

function buildVideoPlayer(topicId) {
  const course = DETAILED_OFFLINE_COURSES[topicId];
  if (!course || !course.videoScript) return "";

  const scriptLines = course.videoScript;
  const totalDuration = scriptLines[scriptLines.length - 1].time + 5;

  return `
<div class="video-player-container" id="vid-player-${topicId}">
  <div class="video-header">
    <span class="video-badge"><i class="fas fa-play-circle"></i> סרטון הסבר</span>
    <span class="video-duration">${totalDuration} שניות</span>
  </div>
  <div class="video-screen" id="vid-screen-${topicId}">
    <div class="video-bg-grid"></div>
    <div class="video-icon-bg">${getCourseEmoji(topicId)}</div>
    <div class="video-caption" id="vid-caption-${topicId}">
      לחץ על ▶ כדי להתחיל את סרטון ההסבר
    </div>
    <div class="video-progress-bar">
      <div class="video-progress-fill" id="vid-progress-${topicId}" style="width:0%"></div>
    </div>
  </div>
  <div class="video-controls">
    <button class="btn btn-primary vid-btn" id="vid-playbtn-${topicId}" onclick="toggleVideo(${topicId})">
      <i class="fas fa-play"></i> הפעל סרטון
    </button>
    <div class="video-timeline" id="vid-timeline-${topicId}">
      ${scriptLines.map((line, i) => `
        <div class="timeline-dot" id="vid-dot-${topicId}-${i}" title="${line.text}" onclick="seekVideo(${topicId}, ${i})"></div>
      `).join('')}
    </div>
    <span class="vid-time" id="vid-time-${topicId}">0:00 / ${formatTime(totalDuration)}</span>
  </div>
</div>`;
}

function getCourseEmoji(topicId) {
  const emojis = ['🛡️','🔑','🎣','🦠','🧑‍💻','💻','🗄️','🌐','🎯','💥','📋'];
  return emojis[topicId] || '🎓';
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2,'0')}`;
}

// Video state tracking per topic
const videoStates = {};

function toggleVideo(topicId) {
  const state = videoStates[topicId];
  if (!state) {
    startVideo(topicId);
    return;
  }
  if (state.playing) {
    pauseVideo(topicId);
  } else {
    resumeVideo(topicId);
  }
}

function startVideo(topicId) {
  const course = DETAILED_OFFLINE_COURSES[topicId];
  if (!course || !course.videoScript) return;

  const script = course.videoScript;
  const totalDuration = script[script.length - 1].time + 5;
  
  videoStates[topicId] = {
    playing: true,
    startTime: Date.now(),
    elapsed: 0,
    script: script,
    totalDuration: totalDuration,
    currentLine: -1,
    interval: null
  };

  updatePlayButton(topicId, true);
  animateVideo(topicId);
}

function pauseVideo(topicId) {
  const state = videoStates[topicId];
  if (!state) return;
  state.elapsed += (Date.now() - state.startTime) / 1000;
  clearInterval(state.interval);
  state.playing = false;
  updatePlayButton(topicId, false);
}

function resumeVideo(topicId) {
  const state = videoStates[topicId];
  if (!state) return;
  state.startTime = Date.now();
  state.playing = true;
  updatePlayButton(topicId, true);
  animateVideo(topicId);
}

function seekVideo(topicId, lineIndex) {
  const course = DETAILED_OFFLINE_COURSES[topicId];
  if (!course || !course.videoScript) return;
  const script = course.videoScript;
  const targetTime = script[lineIndex].time;
  
  if (videoStates[topicId]) {
    clearInterval(videoStates[topicId].interval);
  } else {
    const totalDuration = script[script.length - 1].time + 5;
    videoStates[topicId] = { script, totalDuration, currentLine: -1, interval: null };
  }
  
  videoStates[topicId].elapsed = targetTime;
  videoStates[topicId].startTime = Date.now();
  videoStates[topicId].playing = true;
  updatePlayButton(topicId, true);
  animateVideo(topicId);
}

function animateVideo(topicId) {
  const state = videoStates[topicId];
  if (!state) return;
  
  clearInterval(state.interval);
  state.interval = setInterval(() => {
    if (!state.playing) {
      clearInterval(state.interval);
      return;
    }
    
    const elapsed = state.elapsed + (Date.now() - state.startTime) / 1000;
    const progress = Math.min(elapsed / state.totalDuration, 1);
    
    // Update progress bar
    const progressBar = document.getElementById(`vid-progress-${topicId}`);
    if (progressBar) progressBar.style.width = (progress * 100) + '%';
    
    // Update time display
    const timeEl = document.getElementById(`vid-time-${topicId}`);
    if (timeEl) timeEl.textContent = `${formatTime(Math.floor(elapsed))} / ${formatTime(state.totalDuration)}`;
    
    // Find current script line
    let currentLine = -1;
    for (let i = state.script.length - 1; i >= 0; i--) {
      if (elapsed >= state.script[i].time) {
        currentLine = i;
        break;
      }
    }
    
    // Update caption with animation if line changed
    if (currentLine !== state.currentLine && currentLine >= 0) {
      state.currentLine = currentLine;
      const caption = document.getElementById(`vid-caption-${topicId}`);
      if (caption) {
        caption.style.opacity = '0';
        setTimeout(() => {
          if (caption) {
            caption.textContent = state.script[currentLine].text;
            caption.style.opacity = '1';
          }
        }, 200);
      }
      
      // Update timeline dots
      state.script.forEach((_, i) => {
        const dot = document.getElementById(`vid-dot-${topicId}-${i}`);
        if (dot) {
          dot.classList.toggle('active', i <= currentLine);
          dot.classList.toggle('current', i === currentLine);
        }
      });
    }
    
    // End of video
    if (progress >= 1) {
      clearInterval(state.interval);
      state.playing = false;
      updatePlayButton(topicId, false);
      const caption = document.getElementById(`vid-caption-${topicId}`);
      if (caption) caption.textContent = '✅ הסרטון הסתיים – עבור לשקפי ההדרכה למטה';
      const btn = document.getElementById(`vid-playbtn-${topicId}`);
      if (btn) {
        btn.innerHTML = '<i class="fas fa-redo"></i> צפה שוב';
        btn.onclick = () => {
          videoStates[topicId] = null;
          startVideo(topicId);
        };
      }
    }
  }, 100);
}

function updatePlayButton(topicId, isPlaying) {
  const btn = document.getElementById(`vid-playbtn-${topicId}`);
  if (btn) {
    btn.innerHTML = isPlaying
      ? '<i class="fas fa-pause"></i> השהה'
      : '<i class="fas fa-play"></i> המשך';
  }
}
