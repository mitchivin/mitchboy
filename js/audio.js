/**
 * GBC Menu Audio — Web Audio API chiptune music + UI SFX.
 * @file js/audio.js
 */

import { State } from './state.js';

// ─── AudioContext (lazy) ────────────────────────────────────────────────────
// Created only when the user opts into sound effects. That Yes click is the unlock gesture.

const AudioCtxCtor = window.AudioContext || window.webkitAudioContext;

let ctx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let shellAudioEnabled = false;

/** Base bus levels before the user volume slider (0–100 → masterGain). */
const MUSIC_GAIN_BASE = 0.08;
const SFX_GAIN_BASE = 0.22;

/** Overall shell loudness ceiling vs a typical app max (Spotify-ish). */
const MASTER_VOLUME_SCALE = 0.4;

function volumeToMasterGain(volume) {
  const v = typeof volume === 'number' ? volume : State.get('currentVolume');
  if (!v || v <= 0) return 0;
  return Math.max(0, Math.min(1, (v / 100) * MASTER_VOLUME_SCALE));
}

function applyMasterVolume(volume = State.get('currentVolume')) {
  if (!masterGain) return;
  const now = ctx?.currentTime ?? 0;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(volumeToMasterGain(volume), now);
}

function ensureAudioGraph() {
  if (ctx || !AudioCtxCtor) return !!ctx;

  ctx = new AudioCtxCtor();
  masterGain = ctx.createGain();
  masterGain.gain.value = volumeToMasterGain(State.get('currentVolume'));
  masterGain.connect(ctx.destination);

  musicGain = ctx.createGain();
  musicGain.gain.value = MUSIC_GAIN_BASE;
  musicGain.connect(masterGain);

  sfxGain = ctx.createGain();
  sfxGain.gain.value = SFX_GAIN_BASE;
  sfxGain.connect(masterGain);

  return true;
}

function resumeIfSuspended() {
  if (!shellAudioEnabled || !ctx) return Promise.resolve(false);
  if (ctx.state === 'running') return Promise.resolve(true);
  if (ctx.state !== 'suspended') return Promise.resolve(false);

  return ctx
    .resume()
    .then(() => ctx.state === 'running')
    .catch(() => false);
}

/**
 * Call from the sound-prompt confirm gesture to unlock Web Audio.
 * Must be invoked from pointerup/touchend/click/keydown — not pointerdown/touchstart.
 */
export function enableShellAudio() {
  if (!ensureAudioGraph()) {
    shellAudioEnabled = false;
    return Promise.resolve(false);
  }

  shellAudioEnabled = true;

  // Silent warm-up in the same gesture (helps some mobile WebViews).
  try {
    const silent = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = silent;
    source.connect(ctx.destination);
    source.start(0);
  } catch (_) {
    /* ignore */
  }

  // Soft resume on later focus returns (after user opted in). Once only.
  if (!enableShellAudio._visibilityBound) {
    enableShellAudio._visibilityBound = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        resumeIfSuspended().then((ok) => {
          if (ok && musicActive && musicLoopTimeout === null) {
            startMenuMusic();
          }
        });
      }
    });
  }

  return resumeIfSuspended();
}

// ─── Note helper ────────────────────────────────────────────────────────────

// Track all active oscillator nodes so we can stop them immediately
const activeOscillators = [];

function playNote(freq, startTime, duration, vol = 0.3, type = 'square', target = musicGain) {
  if (!ctx || !target) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.004);
  gain.gain.setValueAtTime(vol, startTime + duration - 0.018);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.connect(gain);
  gain.connect(target);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
  if (target === musicGain) {
    activeOscillators.push(osc);
    osc.onended = () => {
      const i = activeOscillators.indexOf(osc);
      if (i !== -1) activeOscillators.splice(i, 1);
    };
  }
}

// ─── Music data ─────────────────────────────────────────────────────────────

const BPM = 150;
const BEAT = 60 / BPM;
const S = BEAT / 4;

const N = {
  Bb2: 116.54,
  C3: 130.81,
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  Ab3: 207.65,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  Ab4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  Eb5: 622.25,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  Ab5: 830.61,
  A5: 880.0,
  Bb5: 932.33,
  B5: 987.77,
  C6: 1046.5,
  D6: 1174.7,
  Eb6: 1244.5,
  E6: 1318.5,
  F6: 1396.9,
  G6: 1568.0,
  R: 0,
};

const LEAD = [
  // ── Section A (bars 1–8): Starport main theme, extended ──
  // Bar 1
  [N.A5, 3],
  [N.C6, 1],
  [N.E6, 2],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 2],
  [N.C5, 3],
  [N.R, 1],
  // Bar 2
  [N.E5, 3],
  [N.G5, 1],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 2],
  [N.C5, 2],
  [N.A4, 3],
  [N.R, 1],
  // Bar 3
  [N.C6, 3],
  [N.A5, 1],
  [N.G5, 2],
  [N.E5, 2],
  [N.G5, 2],
  [N.A5, 2],
  [N.G5, 3],
  [N.R, 1],
  // Bar 4
  [N.E5, 2],
  [N.G5, 2],
  [N.A5, 4],
  [N.G5, 2],
  [N.E5, 2],
  [N.C5, 4],
  // Bar 5
  [N.A5, 3],
  [N.G5, 1],
  [N.E5, 2],
  [N.C5, 2],
  [N.E5, 3],
  [N.G5, 1],
  [N.A5, 4],
  // Bar 6
  [N.C6, 3],
  [N.E6, 1],
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 2],
  [N.G5, 4],
  // Bar 7
  [N.A5, 2],
  [N.C6, 2],
  [N.E6, 2],
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 4],
  // Bar 8
  [N.G5, 4],
  [N.A5, 4],
  [N.G5, 4],
  [N.R, 4],

  // ── Section B (bars 9–16): higher register development ──
  // Bar 9
  [N.C6, 3],
  [N.E6, 1],
  [N.G6, 2],
  [N.E6, 2],
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 3],
  [N.R, 1],
  // Bar 10
  [N.A5, 3],
  [N.C6, 1],
  [N.E6, 2],
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 4],
  // Bar 11
  [N.G5, 3],
  [N.A5, 1],
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 2],
  [N.G5, 3],
  [N.R, 1],
  // Bar 12
  [N.E6, 3],
  [N.G6, 1],
  [N.E6, 2],
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 4],
  // Bar 13
  [N.G6, 3],
  [N.E6, 1],
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 2],
  [N.C5, 4],
  // Bar 14
  [N.E5, 3],
  [N.G5, 1],
  [N.A5, 2],
  [N.C6, 2],
  [N.E6, 3],
  [N.C6, 1],
  [N.A5, 4],
  // Bar 15
  [N.G5, 2],
  [N.A5, 2],
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 2],
  [N.G5, 4],
  // Bar 16
  [N.A5, 4],
  [N.G5, 4],
  [N.E5, 4],
  [N.R, 4],

  // ── Section C (bars 17–24): gentle descent, breathing space ──
  // Bar 17
  [N.G5, 4],
  [N.E5, 2],
  [N.C5, 2],
  [N.A4, 4],
  [N.R, 4],
  // Bar 18
  [N.C5, 3],
  [N.E5, 1],
  [N.G5, 2],
  [N.A5, 2],
  [N.G5, 4],
  [N.R, 4],
  // Bar 19
  [N.E5, 4],
  [N.G5, 4],
  [N.A5, 4],
  [N.G5, 4],
  // Bar 20
  [N.C6, 4],
  [N.A5, 4],
  [N.G5, 4],
  [N.R, 4],
  // Bar 21
  [N.A5, 3],
  [N.G5, 1],
  [N.E5, 3],
  [N.C5, 1],
  [N.E5, 3],
  [N.G5, 1],
  [N.A5, 4],
  // Bar 22
  [N.G5, 4],
  [N.E5, 4],
  [N.C5, 4],
  [N.A4, 4],
  // Bar 23
  [N.C5, 2],
  [N.E5, 2],
  [N.G5, 2],
  [N.A5, 2],
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 2],
  // Bar 24
  [N.A5, 6],
  [N.R, 2],
  [N.G5, 4],
  [N.R, 4],

  // ── Section D (bars 25–32): big build, full ascent, resolve ──
  // Bar 25
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 2],
  [N.G5, 2],
  [N.A5, 2],
  [N.C6, 2],
  [N.E6, 2],
  // Bar 26
  [N.G6, 3],
  [N.E6, 1],
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 2],
  [N.G5, 4],
  // Bar 27
  [N.A5, 2],
  [N.C6, 2],
  [N.E6, 2],
  [N.G6, 2],
  [N.E6, 2],
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 2],
  // Bar 28
  [N.E5, 2],
  [N.G5, 2],
  [N.A5, 4],
  [N.G5, 4],
  [N.R, 4],
  // Bar 29
  [N.C5, 1],
  [N.E5, 1],
  [N.G5, 1],
  [N.A5, 1],
  [N.C6, 1],
  [N.E6, 1],
  [N.G6, 1],
  [N.E6, 1],
  [N.C6, 1],
  [N.A5, 1],
  [N.G5, 1],
  [N.E5, 1],
  [N.C5, 1],
  [N.A4, 1],
  [N.G4, 1],
  [N.R, 1],
  // Bar 30
  [N.A5, 3],
  [N.G5, 1],
  [N.E5, 2],
  [N.G5, 2],
  [N.A5, 3],
  [N.C6, 1],
  [N.E6, 4],
  // Bar 31
  [N.C6, 2],
  [N.A5, 2],
  [N.G5, 2],
  [N.E5, 2],
  [N.G5, 2],
  [N.A5, 2],
  [N.G5, 4],
  // Bar 32 — long resolve
  [N.A5, 8],
  [N.R, 8],
];

const COUNTER = [
  // Section A (8 bars)
  [N.A4, 4],
  [N.E4, 4],
  [N.C4, 4],
  [N.G3, 4],
  [N.A3, 4],
  [N.E4, 4],
  [N.A3, 4],
  [N.R, 4],
  [N.C5, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.A4, 4],
  [N.G4, 4],
  [N.C5, 4],
  [N.E4, 4],
  [N.R, 4],
  [N.A4, 4],
  [N.E4, 4],
  [N.G4, 4],
  [N.A4, 4],
  [N.C5, 4],
  [N.E5, 4],
  [N.C5, 4],
  [N.R, 4],
  [N.G4, 4],
  [N.A4, 4],
  [N.C5, 4],
  [N.E5, 4],
  [N.A4, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.R, 4],
  // Section B (8 bars)
  [N.C5, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.A4, 4],
  [N.G4, 4],
  [N.C5, 4],
  [N.E5, 4],
  [N.R, 4],
  [N.A4, 4],
  [N.E5, 4],
  [N.A4, 4],
  [N.G4, 4],
  [N.C5, 4],
  [N.E5, 4],
  [N.C5, 4],
  [N.R, 4],
  [N.E5, 4],
  [N.C5, 4],
  [N.A4, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.G4, 4],
  [N.A4, 4],
  [N.R, 4],
  [N.C5, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.G4, 4],
  [N.A4, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.R, 4],
  // Section C (8 bars)
  [N.E4, 4],
  [N.C4, 4],
  [N.A3, 4],
  [N.R, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.C4, 4],
  [N.R, 4],
  [N.A4, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.G4, 4],
  [N.C5, 4],
  [N.A4, 4],
  [N.G4, 4],
  [N.R, 4],
  [N.E4, 4],
  [N.G4, 4],
  [N.A4, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.C4, 4],
  [N.A3, 4],
  [N.R, 4],
  [N.G4, 4],
  [N.A4, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.A4, 8],
  [N.R, 8],
  // Section D (8 bars)
  [N.A4, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.G4, 4],
  [N.A4, 4],
  [N.C5, 4],
  [N.E5, 4],
  [N.R, 4],
  [N.G4, 4],
  [N.A4, 4],
  [N.C5, 4],
  [N.E5, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.C4, 4],
  [N.R, 4],
  [N.E4, 4],
  [N.G4, 4],
  [N.A4, 4],
  [N.C5, 4],
  [N.E5, 4],
  [N.C5, 4],
  [N.A4, 4],
  [N.R, 4],
  [N.G4, 4],
  [N.E4, 4],
  [N.C4, 4],
  [N.G4, 4],
  [N.A4, 8],
  [N.R, 8],
];

const BASS = [
  // Section A
  [N.A3, 4],
  [N.R, 4],
  [N.A3, 4],
  [N.R, 4],
  [N.A3, 4],
  [N.R, 4],
  [N.A3, 4],
  [N.R, 4],
  [N.C3, 4],
  [N.R, 4],
  [N.G3, 4],
  [N.R, 4],
  [N.A3, 4],
  [N.R, 4],
  [N.A3, 4],
  [N.R, 4],
  // Section B
  [N.C3, 4],
  [N.R, 4],
  [N.C3, 4],
  [N.R, 4],
  [N.G3, 4],
  [N.R, 4],
  [N.G3, 4],
  [N.R, 4],
  [N.A3, 4],
  [N.R, 4],
  [N.E3, 4],
  [N.R, 4],
  [N.A3, 4],
  [N.R, 4],
  [N.A3, 4],
  [N.R, 4],
  // Section C
  [N.A3, 6],
  [N.R, 2],
  [N.E3, 4],
  [N.R, 4],
  [N.G3, 6],
  [N.R, 2],
  [N.C3, 4],
  [N.R, 4],
  [N.A3, 4],
  [N.E3, 4],
  [N.A3, 4],
  [N.R, 4],
  [N.G3, 4],
  [N.C3, 4],
  [N.G3, 4],
  [N.R, 4],
  // Section D
  [N.A3, 4],
  [N.R, 4],
  [N.G3, 4],
  [N.R, 4],
  [N.E3, 4],
  [N.R, 4],
  [N.A3, 4],
  [N.R, 4],
  [N.C3, 4],
  [N.R, 4],
  [N.E3, 4],
  [N.R, 4],
  [N.A3, 8],
  [N.R, 8],
];

const LOOP_DURATION = 32 * 16 * S;

// ─── Music playback ─────────────────────────────────────────────────────────
// Generation counter: every startMenuMusic call increments it.
// Every async path checks it hasn't changed — if it has, abort.

let musicGeneration = 0;
let musicLoopTimeout = null;

function scheduleSequence(seq, startAt, vol, type) {
  let t = startAt;
  for (const [freq, steps] of seq) {
    const dur = steps * S;
    if (freq !== N.R) playNote(freq, t, dur * 0.82, vol, type);
    t += dur;
  }
}

function scheduleLoop(gen) {
  if (!shellAudioEnabled || !ctx) return;
  if (gen !== musicGeneration) return;
  if (ctx.state !== 'running') return;

  const startAt = ctx.currentTime + 0.05;
  scheduleSequence(LEAD, startAt, 0.9, 'square');
  scheduleSequence(COUNTER, startAt, 0.6, 'triangle');
  scheduleSequence(BASS, startAt, 0.7, 'square');

  musicLoopTimeout = setTimeout(() => scheduleLoop(gen), (LOOP_DURATION - 0.08) * 1000);
}

// Track whether music is currently supposed to be playing
let musicActive = false;

export function startMenuMusic() {
  if (!shellAudioEnabled || !ctx || !musicGain) return;
  if (State.get('currentVolume') === 0) return;

  // Kill any in-flight notes before arming a new loop (prevents stacked layers).
  const now = ctx.currentTime;
  activeOscillators.forEach((osc) => {
    try {
      osc.stop(now);
    } catch (_) {}
  });
  activeOscillators.length = 0;

  musicActive = true;
  musicGeneration++;
  const myGen = musicGeneration;
  clearTimeout(musicLoopTimeout);
  musicLoopTimeout = null;

  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(MUSIC_GAIN_BASE, now);
  applyMasterVolume();

  if (ctx.state === 'running') {
    scheduleLoop(myGen);
  } else {
    ctx
      .resume()
      .then(() => {
        if (myGen === musicGeneration && ctx.state === 'running') {
          scheduleLoop(myGen);
        }
      })
      .catch(() => {});
  }
}

export function stopMenuMusic() {
  musicActive = false;
  musicGeneration++;
  clearTimeout(musicLoopTimeout);
  musicLoopTimeout = null;
  if (!ctx || !musicGain) return;
  const now = ctx.currentTime;
  activeOscillators.forEach((osc) => {
    try {
      osc.stop(now);
    } catch (_) {}
  });
  activeOscillators.length = 0;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(0, now);
}

// ─── SFX ────────────────────────────────────────────────────────────────────

function canPlaySfx() {
  return shellAudioEnabled && ctx && sfxGain && State.get('currentVolume') !== 0 && ctx.state === 'running';
}

export function playNavBlip() {
  if (!canPlaySfx()) return;
  const t = ctx.currentTime;
  playNote(1200, t, 0.04, 1.0, 'square', sfxGain);
  playNote(900, t + 0.03, 0.03, 0.6, 'square', sfxGain);
}

export function playSelectSound() {
  if (!canPlaySfx()) return;
  const t = ctx.currentTime;
  playNote(523, t, 0.05, 1.0, 'square', sfxGain);
  playNote(659, t + 0.05, 0.05, 0.9, 'square', sfxGain);
  playNote(784, t + 0.1, 0.08, 0.8, 'square', sfxGain);
}

export function playBackSound() {
  if (!canPlaySfx()) return;
  const t = ctx.currentTime;
  playNote(330, t, 0.04, 0.9, 'square', sfxGain);
  playNote(220, t + 0.04, 0.09, 0.7, 'square', sfxGain);
}

export function playCheatOpenSound() {
  if (!canPlaySfx()) return;
  const t = ctx.currentTime;
  // Mysterious descending arp
  playNote(659, t, 0.07, 0.7, 'square', sfxGain);
  playNote(523, t + 0.07, 0.07, 0.6, 'square', sfxGain);
  playNote(392, t + 0.14, 0.1, 0.5, 'square', sfxGain);
}

export function playCheatInputSound() {
  if (!canPlaySfx()) return;
  const t = ctx.currentTime;
  // Single short blip, slightly different pitch to nav blip
  playNote(740, t, 0.05, 0.7, 'square', sfxGain);
}

export function playCheatSuccessSound() {
  if (!canPlaySfx()) return;
  const t = ctx.currentTime;
  // Classic fanfare arp — ascending, triumphant
  playNote(523, t, 0.08, 0.8, 'square', sfxGain);
  playNote(659, t + 0.08, 0.08, 0.8, 'square', sfxGain);
  playNote(784, t + 0.16, 0.08, 0.8, 'square', sfxGain);
  playNote(1047, t + 0.24, 0.15, 0.9, 'square', sfxGain);
}

export function playCheatFailSound() {
  if (!canPlaySfx()) return;
  const t = ctx.currentTime;
  // Descending "wrong answer" buzzer
  playNote(330, t, 0.08, 0.8, 'square', sfxGain);
  playNote(277, t + 0.08, 0.08, 0.7, 'square', sfxGain);
  playNote(220, t + 0.16, 0.14, 0.6, 'square', sfxGain);
}

// ─── Volume sync ─────────────────────────────────────────────────────────────

export function syncAudioVolume(volume) {
  if (!shellAudioEnabled || !ctx || !masterGain) return;
  if (volume === 0) {
    stopMenuMusic();
    applyMasterVolume(0);
    return;
  }
  applyMasterVolume(volume);
}
