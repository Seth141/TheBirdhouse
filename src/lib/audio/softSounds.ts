/**
 * Soft bird-like UI sounds via Web Audio — quiet chirps and wing flutters.
 * Pre-warms the audio graph and caches flutter buffers so clicks stay lag-free.
 */

let sharedCtx: AudioContext | null = null;
let flutterBuffer: AudioBuffer | null = null;
let warming: Promise<void> | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioCtx) return null;

  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioCtx();
  }

  return sharedCtx;
}

function buildFlutterBuffer(ctx: AudioContext, duration = 0.26): AudioBuffer {
  const sampleCount = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < sampleCount; i++) {
    const t = i / sampleCount;
    const pulse =
      Math.sin(t * Math.PI * 10) * 0.55 +
      Math.sin(t * Math.PI * 16) * 0.35 +
      0.2;
    data[i] = (Math.random() * 2 - 1) * pulse * (1 - t * 0.7);
  }

  return buffer;
}

/** Call once on first interaction so later taps never wait on setup. */
export function warmSoftSounds() {
  if (warming) return warming;

  warming = (async () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // Ignore — browsers may still unlock on the next gesture.
      }
    }

    if (!flutterBuffer) {
      flutterBuffer = buildFlutterBuffer(ctx);
    }
  })();

  return warming;
}

function playChirp({
  startFreq,
  endFreq,
  startAt = 0,
  duration = 0.09,
  volume = 0.035,
}: {
  startFreq: number;
  endFreq: number;
  startAt?: number;
  duration?: number;
  volume?: number;
}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + startAt;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sine";
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(endFreq, 1),
    now + duration
  );

  filter.type = "bandpass";
  filter.frequency.setValueAtTime((startFreq + endFreq) / 2, now);
  filter.Q.setValueAtTime(6, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playFlutter({
  startAt = 0,
  duration = 0.22,
  volume = 0.028,
}: {
  startAt?: number;
  duration?: number;
  volume?: number;
} = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (!flutterBuffer) {
    flutterBuffer = buildFlutterBuffer(ctx);
  }

  const now = ctx.currentTime + startAt;
  const source = ctx.createBufferSource();
  source.buffer = flutterBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1800, now);
  filter.frequency.exponentialRampToValueAtTime(900, now + duration);
  filter.Q.setValueAtTime(1.2, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(now);
  source.stop(now + duration + 0.02);
}

function kickOff(play: () => void) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume is async; schedule the sound immediately after so the click
  // handler itself never waits on audio work.
  if (ctx.state === "suspended") {
    void ctx.resume().then(play);
    return;
  }

  play();
}

/** Single bright peep when tapping Live Cam — distinct from tip / playlist. */
export function playLiveCamSound() {
  kickOff(() => {
    playChirp({
      startFreq: 2850,
      endFreq: 3600,
      startAt: 0,
      duration: 0.1,
      volume: 0.036,
    });
  });
}

/** Quieter chirplet for Tip of the Day. */
export function playTipSound() {
  kickOff(() => {
    playChirp({
      startFreq: 1800,
      endFreq: 2500,
      startAt: 0,
      duration: 0.07,
      volume: 0.03,
    });
    playChirp({
      startFreq: 2200,
      endFreq: 1600,
      startAt: 0.1,
      duration: 0.09,
      volume: 0.026,
    });
    playFlutter({ startAt: 0.05, duration: 0.18, volume: 0.018 });
  });
}
