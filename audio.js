// Background music comes from a file (assets/audio/fondo.*); the case sounds are synthesised
// with the Web Audio API. Browsers only allow sound after a user gesture, so everything starts
// on the first click or key.

let ctx = null, master = null, sfxBus = null;
let enabled = true, started = false;

const MUSIC_FILES = ['assets/audio/fondo.mp3', 'assets/audio/fondo.m4a', 'assets/audio/fondo.ogg', 'assets/audio/fondo.wav'];
const MUSIC_VOLUME = 0.35;
let track = null, fadeTimer = null;

let noiseBuf = null;
function noise() {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  return src;
}

function setup() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = enabled ? 1 : 0;
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.9;
  sfxBus.connect(master);
}

// first file that exists wins; if none is there the page simply stays quiet
async function loadTrack() {
  for (const src of MUSIC_FILES) {
    try {
      const res = await fetch(src, { method: 'HEAD' });
      if (!res.ok) continue;
      const a = new Audio(src);
      a.loop = true;
      a.preload = 'auto';
      a.volume = 0;
      return a;
    } catch (e) { /* try the next format */ }
  }
  return null;
}

function fadeTrack(to, seconds) {
  if (!track) return;
  clearInterval(fadeTimer);
  const from = track.volume, steps = Math.max(1, Math.round(seconds * 30));
  let i = 0;
  if (to > 0 && track.paused) track.play().catch(() => {});
  fadeTimer = setInterval(() => {
    i++;
    track.volume = Math.min(1, Math.max(0, from + (to - from) * (i / steps)));
    if (i >= steps) {
      clearInterval(fadeTimer);
      if (to === 0) track.pause();
    }
  }, 1000 / 30);
}

export const music = {
  // call from any user gesture; safe to call many times
  async unlock() {
    if (!ctx) setup();
    if (ctx.state === 'suspended') ctx.resume();
    if (started) return;
    started = true;
    track = await loadTrack();
    if (track && enabled) fadeTrack(MUSIC_VOLUME, 3);
  },
  setEnabled(on) {
    enabled = on;
    if (master) master.gain.value = on ? 1 : 0;
    fadeTrack(on ? MUSIC_VOLUME : 0, on ? 1.5 : 0.6);
  },
  get enabled() { return enabled; },
};

export const sfx = {
  latch() {
    if (!ctx || !enabled) return;
    const t = ctx.currentTime;
    for (const d of [0, 0.13]) {
      const n = noise(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 2;
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(0.5, t + d + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.05);
      n.connect(bp).connect(g).connect(sfxBus);
      n.start(t + d, 0, 0.08);
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.frequency.value = 1900; og.gain.setValueAtTime(0.0001, t + d);
      og.gain.exponentialRampToValueAtTime(0.12, t + d + 0.002);
      og.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.06);
      o.connect(og).connect(sfxBus); o.start(t + d); o.stop(t + d + 0.08);
    }
  },
  creak() {
    if (!ctx || !enabled) return;
    const t = ctx.currentTime, n = noise(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = 'bandpass'; bp.Q.value = 6;
    bp.frequency.setValueAtTime(520, t); bp.frequency.linearRampToValueAtTime(320, t + 1.2);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    n.connect(bp).connect(g).connect(sfxBus);
    n.start(t, 0, 1.4);
  },
  thud() {
    if (!ctx || !enabled) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.connect(g).connect(sfxBus); o.start(t); o.stop(t + 0.3);
  },
};
