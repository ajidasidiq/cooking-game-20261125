// All sound is synthesized live with WebAudio: short blips for actions and
// a small looping tune for the kitchen. No audio files, no network.
// The tune is an original 8-step bass + sparkle loop written for this game.

export function createAudio() {
  let ctx = null;
  let muted = false;
  let musicTimer = null;
  let step = 0;

  // Bass line (Hz) and sparkle notes (Hz, 0 = rest) for one 8-step loop.
  const BASS = [110, 0, 130.81, 0, 98, 0, 146.83, 0];
  const SPARKLE = [440, 523.25, 659.25, 523.25, 587.33, 659.25, 783.99, 659.25];

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, when = 0, slideTo = 0) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function startMusic() {
    if (musicTimer || muted) return;
    ensure();
    musicTimer = setInterval(() => {
      if (muted) return;
      const i = step % 8;
      if (BASS[i]) tone(BASS[i], 0.22, 'triangle', 0.10);
      if (SPARKLE[i]) tone(SPARKLE[i], 0.16, 'sine', 0.045);
      step += 1;
    }, 210);
  }

  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  return {
    unlock() { ensure(); startMusic(); },
    toggleMute() {
      muted = !muted;
      if (muted) stopMusic(); else startMusic();
      return muted;
    },
    get muted() { return muted; },
    pickup() { tone(520, 0.09, 'sine', 0.12, 0, 760); },
    drop() { tone(340, 0.08, 'sine', 0.10, 0, 240); },
    chop() { tone(190, 0.06, 'square', 0.07, 0, 120); },
    sizzle() { tone(1200, 0.12, 'sawtooth', 0.025, 0, 900); },
    ready() { tone(880, 0.12, 'sine', 0.12); tone(1174, 0.16, 'sine', 0.12, 0.1); },
    coin() {
      tone(988, 0.09, 'square', 0.08);
      tone(1319, 0.12, 'square', 0.08, 0.08);
      tone(1568, 0.2, 'square', 0.08, 0.16);
    },
    fail() { tone(220, 0.25, 'sawtooth', 0.09, 0, 110); },
    bell() { tone(1568, 0.35, 'sine', 0.14); tone(2093, 0.3, 'sine', 0.08, 0.02); },
    start() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.14, 'triangle', 0.11, i * 0.09));
    },
  };
}
