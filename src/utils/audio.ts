// Web Audio API sound generator for Metronome, Roulette, and Chat sounds

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playMetronomeClick = (isAccent: boolean, soundType: 'classic' | 'digital' | 'wood' | 'bell' = 'classic') => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (soundType === 'classic') {
      // Wood/classic tick
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isAccent ? 1600 : 980, now);
      gain.gain.setValueAtTime(isAccent ? 0.9 : 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isAccent ? 0.08 : 0.04));
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (soundType === 'digital') {
      // Short modern beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 1800 : 1200, now);
      gain.gain.setValueAtTime(isAccent ? 0.8 : 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (soundType === 'wood') {
      // Woodblock resonant sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 1200 : 750, now);
      gain.gain.setValueAtTime(0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (soundType === 'bell') {
      // Cowbell / metallic ting
      osc.type = 'square';
      osc.frequency.setValueAtTime(isAccent ? 880 : 587, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (err) {
    console.warn('Audio click error', err);
  }
};

export const playWheelTick = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch {
    // ignore
  }
};

export const playWinFanfare = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.09;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch {
    // ignore
  }
};

export const playChatPop = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.05);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch {
    // ignore
  }
};
