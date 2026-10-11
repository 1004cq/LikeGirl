/**
 * Minimalist Soundscape Controller
 * Consent-first ambient pad via Web Audio API — zero autoplay.
 */
(function () {
  const root = document.getElementById('soundscape');
  const toggle = document.getElementById('soundscape-toggle');
  const labelState = document.getElementById('soundscape-state');
  const wave = document.getElementById('wave-canvas');
  if (!root || !toggle || !wave) return;

  const wctx = wave.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let audioCtx = null;
  let master = null;
  let oscillators = [];
  let gains = [];
  let lfo = null;
  let lfoGain = null;
  let playing = false;
  let raf = 0;
  let phase = 0;

  function ensureAudio() {
    if (audioCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
    master = audioCtx.createGain();
    master.gain.value = 0;
    master.connect(audioCtx.destination);

    // Soft dual-tone ambient — restrained, archival
    const specs = [
      { freq: 110, type: 'sine', gain: 0.045 },
      { freq: 164.81, type: 'sine', gain: 0.028 },
      { freq: 220, type: 'triangle', gain: 0.012 },
    ];

    specs.forEach((spec) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = spec.type;
      osc.frequency.value = spec.freq;
      g.gain.value = spec.gain;
      osc.connect(g);
      g.connect(master);
      osc.start();
      oscillators.push(osc);
      gains.push(g);
    });

    lfo = audioCtx.createOscillator();
    lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(gains[0].gain);
    lfo.start();
  }

  function setPlaying(next) {
    playing = next;
    root.dataset.state = playing ? 'playing' : 'idle';
    toggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
    toggle.setAttribute(
      'aria-label',
      playing ? 'Pause ambient soundscape' : 'Play ambient soundscape'
    );
    if (labelState) labelState.textContent = playing ? 'On' : 'Off';
  }

  async function play() {
    ensureAudio();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0.85, now + 1.4);
    setPlaying(true);
    startWave();
  }

  function pause() {
    if (!audioCtx || !master) {
      setPlaying(false);
      return;
    }
    const now = audioCtx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.9);
    setPlaying(false);
  }

  toggle.addEventListener('click', () => {
    if (playing) pause();
    else play();
  });

  function drawWave(t) {
    const w = wave.width;
    const h = wave.height;
    wctx.clearRect(0, 0, w, h);

    const mid = h / 2;
    const amp = playing ? 7.5 : 2.2;
    const speed = playing ? 2.2 : 0.7;

    wctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const n1 = Math.sin((x / w) * Math.PI * 3 + t * speed);
      const n2 = Math.sin((x / w) * Math.PI * 5 - t * speed * 0.6) * 0.45;
      const y = mid + (n1 + n2) * amp * (0.35 + 0.65 * Math.sin((x / w) * Math.PI));
      if (x === 0) wctx.moveTo(x, y);
      else wctx.lineTo(x, y);
    }
    wctx.strokeStyle = playing
      ? 'rgba(182, 90, 66, 0.85)'
      : 'rgba(30, 29, 27, 0.35)';
    wctx.lineWidth = 1.25;
    wctx.lineCap = 'round';
    wctx.stroke();

    // Pulse dot
    const px = w * (0.5 + Math.sin(t * (playing ? 1.4 : 0.5)) * 0.28);
    const py =
      mid +
      Math.sin(px / w * Math.PI * 3 + t * speed) * amp * 0.7;
    wctx.beginPath();
    wctx.arc(px, py, playing ? 2.2 : 1.6, 0, Math.PI * 2);
    wctx.fillStyle = playing
      ? 'rgba(182, 90, 66, 0.95)'
      : 'rgba(30, 29, 27, 0.4)';
    wctx.fill();
  }

  function loop(now) {
    phase = now / 1000;
    drawWave(phase);
    raf = requestAnimationFrame(loop);
  }

  function startWave() {
    if (reduced) {
      drawWave(0);
      return;
    }
    if (!raf) raf = requestAnimationFrame(loop);
  }

  // Idle pulse always visible (non-audio)
  startWave();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing && audioCtx) {
      audioCtx.suspend();
    } else if (!document.hidden && playing && audioCtx) {
      audioCtx.resume();
    }
  });
})();
