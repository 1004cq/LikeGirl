/**
 * Consent-first ambient soundscape — Web Audio + waveform pulse.
 */

export function initSoundscape(root: HTMLElement): () => void {
  const toggle = root.querySelector<HTMLButtonElement>('#soundscape-toggle');
  const labelState = root.querySelector<HTMLElement>('#soundscape-state');
  const wave = root.querySelector<HTMLCanvasElement>('#wave-canvas');
  if (!toggle || !wave) return () => undefined;

  const wctx = wave.getContext('2d');
  if (!wctx) return () => undefined;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let audioCtx: AudioContext | null = null;
  let master: GainNode | null = null;
  let oscillators: OscillatorNode[] = [];
  let gains: GainNode[] = [];
  let lfo: OscillatorNode | null = null;
  let playing = false;
  let raf = 0;

  function ensureAudio() {
    if (audioCtx) return;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) throw new Error('Web Audio unavailable');

    audioCtx = new AC();
    master = audioCtx.createGain();
    master.gain.value = 0;
    master.connect(audioCtx.destination);

    const specs: { freq: number; type: OscillatorType; gain: number }[] = [
      { freq: 110, type: 'sine', gain: 0.045 },
      { freq: 164.81, type: 'sine', gain: 0.028 },
      { freq: 220, type: 'triangle', gain: 0.012 },
    ];

    specs.forEach((spec) => {
      const osc = audioCtx!.createOscillator();
      const g = audioCtx!.createGain();
      osc.type = spec.type;
      osc.frequency.value = spec.freq;
      g.gain.value = spec.gain;
      osc.connect(g);
      g.connect(master!);
      osc.start();
      oscillators.push(osc);
      gains.push(g);
    });

    lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(gains[0].gain);
    lfo.start();
  }

  function setPlaying(next: boolean) {
    playing = next;
    root.dataset.state = playing ? 'playing' : 'idle';
    toggle!.setAttribute('aria-pressed', playing ? 'true' : 'false');
    toggle!.setAttribute(
      'aria-label',
      playing ? 'Pause ambient soundscape' : 'Play ambient soundscape',
    );
    if (labelState) labelState.textContent = playing ? 'On' : 'Off';
  }

  async function play() {
    // Update UI immediately so consent feedback never depends on audio unlock timing.
    setPlaying(true);
    try {
      ensureAudio();
      if (!audioCtx || !master) return;
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      const now = audioCtx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0.85, now + 1.4);
    } catch {
      // Audio may be blocked in locked-down browsers; visual state still reflects consent.
    }
  }

  function pause() {
    setPlaying(false);
    if (!audioCtx || !master) return;
    try {
      const now = audioCtx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.9);
    } catch {
      // ignore
    }
  }

  function onClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (playing) pause();
    else void play();
  }

  function drawWave(t: number) {
    const w = wave!.width;
    const h = wave!.height;
    wctx!.clearRect(0, 0, w, h);
    const mid = h / 2;
    const amp = playing ? 7.5 : 2.2;
    const speed = playing ? 2.2 : 0.7;

    wctx!.beginPath();
    for (let x = 0; x <= w; x++) {
      const n1 = Math.sin((x / w) * Math.PI * 3 + t * speed);
      const n2 = Math.sin((x / w) * Math.PI * 5 - t * speed * 0.6) * 0.45;
      const y = mid + (n1 + n2) * amp * (0.35 + 0.65 * Math.sin((x / w) * Math.PI));
      if (x === 0) wctx!.moveTo(x, y);
      else wctx!.lineTo(x, y);
    }
    wctx!.strokeStyle = playing ? 'rgba(182, 90, 66, 0.85)' : 'rgba(30, 29, 27, 0.35)';
    wctx!.lineWidth = 1.25;
    wctx!.lineCap = 'round';
    wctx!.stroke();

    const px = w * (0.5 + Math.sin(t * (playing ? 1.4 : 0.5)) * 0.28);
    const py = mid + Math.sin((px / w) * Math.PI * 3 + t * speed) * amp * 0.7;
    wctx!.beginPath();
    wctx!.arc(px, py, playing ? 2.2 : 1.6, 0, Math.PI * 2);
    wctx!.fillStyle = playing ? 'rgba(182, 90, 66, 0.95)' : 'rgba(30, 29, 27, 0.4)';
    wctx!.fill();
  }

  function loop(now: number) {
    drawWave(now / 1000);
    raf = requestAnimationFrame(loop);
  }

  function onVisibility() {
    if (!audioCtx || !playing) return;
    if (document.hidden) void audioCtx.suspend();
    else void audioCtx.resume();
  }

  toggle.addEventListener('click', onClick);
  document.addEventListener('visibilitychange', onVisibility);

  if (reduced) drawWave(0);
  else raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    toggle.removeEventListener('click', onClick);
    document.removeEventListener('visibilitychange', onVisibility);
    oscillators.forEach((o) => o.stop());
    lfo?.stop();
    void audioCtx?.close();
  };
}
