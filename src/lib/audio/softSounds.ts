/**
 * Soft bird-like UI sounds via Web Audio — quiet chirps and wing flutters.
 * Pre-warms the audio graph and caches flutter buffers so clicks stay lag-free.
 */

export type LiveCamChirpId =
  | "bright-peep"
  | "soft-tweet"
  | "chickadee"
  | "wren-blip"
  | "seed-drop"
  | "dawn-note"
  | "finch-trill"
  | "warbler-arc"
  | "nuthatch-yank"
  | "swallow-zip"
  | "owl-hoot"
  | "rainy-pip"
  | "crystal-ping"
  | "meadow-bounce";

export type LiveCamChirpOption = {
  id: LiveCamChirpId;
  name: string;
  description: string;
};

export const LIVE_CAM_CHIRPS: LiveCamChirpOption[] = [
  {
    id: "bright-peep",
    name: "Bright peep",
    description: "Quick high up-glide",
  },
  {
    id: "soft-tweet",
    name: "Soft tweet",
    description: "Gentle mid-range slide",
  },
  {
    id: "chickadee",
    name: "Chickadee",
    description: "Little down-then-up peep",
  },
  {
    id: "wren-blip",
    name: "Wren blip",
    description: "Short sharp spark",
  },
  {
    id: "seed-drop",
    name: "Seed drop",
    description: "Tiny high tick",
  },
  {
    id: "dawn-note",
    name: "Dawn note",
    description: "Warm lower whistle",
  },
  {
    id: "finch-trill",
    name: "Finch trill",
    description: "Tiny vibrating flutter",
  },
  {
    id: "warbler-arc",
    name: "Warbler arc",
    description: "Long sweet rise and fall",
  },
  {
    id: "nuthatch-yank",
    name: "Nuthatch yank",
    description: "Nasal two-tone call",
  },
  {
    id: "swallow-zip",
    name: "Swallow zip",
    description: "Fast skyward streak",
  },
  {
    id: "owl-hoot",
    name: "Owl hoot",
    description: "Soft low whoo",
  },
  {
    id: "rainy-pip",
    name: "Rainy pip",
    description: "Damp little water-drop peep",
  },
  {
    id: "crystal-ping",
    name: "Crystal ping",
    description: "Bell-like glassy sparkle",
  },
  {
    id: "meadow-bounce",
    name: "Meadow bounce",
    description: "Playful hop of three notes",
  },
];

const STORAGE_KEY = "birdhouse.liveCamChirp";
const DEFAULT_CHIRP: LiveCamChirpId = "bright-peep";

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

function isLiveCamChirpId(value: string): value is LiveCamChirpId {
  return LIVE_CAM_CHIRPS.some((option) => option.id === value);
}

export function getLiveCamChirpId(): LiveCamChirpId {
  if (typeof window === "undefined") return DEFAULT_CHIRP;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && isLiveCamChirpId(raw)) return raw;
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
  return DEFAULT_CHIRP;
}

export function setLiveCamChirpId(id: LiveCamChirpId) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Ignore storage failures.
  }
}

function playChirp({
  startFreq,
  endFreq,
  startAt = 0,
  duration = 0.09,
  volume = 0.035,
  type = "sine",
  q = 6,
}: {
  startFreq: number;
  endFreq: number;
  startAt?: number;
  duration?: number;
  volume?: number;
  type?: OscillatorType;
  q?: number;
}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + startAt;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(endFreq, 1),
    now + duration
  );

  filter.type = "bandpass";
  filter.frequency.setValueAtTime((startFreq + endFreq) / 2, now);
  filter.Q.setValueAtTime(q, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

/** Vibrato trill — frequency wobbles like a tiny finch. */
function playTrill({
  centerFreq,
  depth = 180,
  rate = 28,
  duration = 0.16,
  volume = 0.03,
  startAt = 0,
}: {
  centerFreq: number;
  depth?: number;
  rate?: number;
  duration?: number;
  volume?: number;
  startAt?: number;
}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + startAt;
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sine";
  osc.frequency.setValueAtTime(centerFreq, now);

  lfo.type = "sine";
  lfo.frequency.setValueAtTime(rate, now);
  lfoGain.gain.setValueAtTime(depth, now);
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(centerFreq, now);
  filter.Q.setValueAtTime(8, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  lfo.start(now);
  osc.stop(now + duration + 0.02);
  lfo.stop(now + duration + 0.02);
}

/** Soft harmonic stack for glassy / owl-like tones. */
function playHarmonicTone({
  fundamental,
  endFreq,
  duration = 0.18,
  volume = 0.028,
  startAt = 0,
  type = "sine" as OscillatorType,
}: {
  fundamental: number;
  endFreq: number;
  duration?: number;
  volume?: number;
  startAt?: number;
  type?: OscillatorType;
}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + startAt;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  master.connect(ctx.destination);

  for (const [mult, level] of [
    [1, 1],
    [2, 0.28],
    [3, 0.12],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(fundamental * mult, now);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(endFreq * mult, 1),
      now + duration
    );
    const g = ctx.createGain();
    g.gain.setValueAtTime(level, now);
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }
}

/** Soft delayed echo of a chirp. */
function playEchoChirp({
  startFreq,
  endFreq,
  duration = 0.08,
  volume = 0.032,
  echoDelay = 0.1,
  echoVolume = 0.45,
}: {
  startFreq: number;
  endFreq: number;
  duration?: number;
  volume?: number;
  echoDelay?: number;
  echoVolume?: number;
}) {
  playChirp({ startFreq, endFreq, duration, volume });
  playChirp({
    startFreq: startFreq * 0.96,
    endFreq: endFreq * 0.96,
    startAt: echoDelay,
    duration: duration * 0.9,
    volume: volume * echoVolume,
  });
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

function playChirpPreset(id: LiveCamChirpId) {
  switch (id) {
    case "bright-peep":
      playChirp({
        startFreq: 2850,
        endFreq: 3600,
        duration: 0.1,
        volume: 0.036,
      });
      return;
    case "soft-tweet":
      playChirp({
        startFreq: 1950,
        endFreq: 2450,
        duration: 0.12,
        volume: 0.034,
        type: "triangle",
      });
      return;
    case "chickadee":
      playChirp({
        startFreq: 2500,
        endFreq: 1900,
        duration: 0.055,
        volume: 0.033,
      });
      playChirp({
        startFreq: 2100,
        endFreq: 3000,
        startAt: 0.07,
        duration: 0.08,
        volume: 0.03,
      });
      return;
    case "wren-blip":
      playChirp({
        startFreq: 3400,
        endFreq: 2200,
        duration: 0.055,
        volume: 0.038,
      });
      return;
    case "seed-drop":
      playChirp({
        startFreq: 4200,
        endFreq: 3100,
        duration: 0.04,
        volume: 0.032,
      });
      return;
    case "dawn-note":
      playChirp({
        startFreq: 1400,
        endFreq: 1750,
        duration: 0.16,
        volume: 0.03,
        type: "triangle",
      });
      return;
    case "finch-trill":
      playTrill({
        centerFreq: 2700,
        depth: 220,
        rate: 32,
        duration: 0.17,
        volume: 0.03,
      });
      return;
    case "warbler-arc":
      playChirp({
        startFreq: 1800,
        endFreq: 3200,
        duration: 0.1,
        volume: 0.03,
        type: "triangle",
      });
      playChirp({
        startFreq: 3200,
        endFreq: 1600,
        startAt: 0.1,
        duration: 0.14,
        volume: 0.028,
        type: "triangle",
      });
      return;
    case "nuthatch-yank":
      playChirp({
        startFreq: 1600,
        endFreq: 1200,
        duration: 0.07,
        volume: 0.034,
        type: "sawtooth",
        q: 3.5,
      });
      playChirp({
        startFreq: 1500,
        endFreq: 1100,
        startAt: 0.09,
        duration: 0.08,
        volume: 0.03,
        type: "sawtooth",
        q: 3.5,
      });
      return;
    case "swallow-zip":
      playChirp({
        startFreq: 1200,
        endFreq: 4800,
        duration: 0.09,
        volume: 0.034,
        q: 9,
      });
      return;
    case "owl-hoot":
      playHarmonicTone({
        fundamental: 420,
        endFreq: 380,
        duration: 0.28,
        volume: 0.034,
        type: "sine",
      });
      return;
    case "rainy-pip":
      playEchoChirp({
        startFreq: 2400,
        endFreq: 1900,
        duration: 0.07,
        volume: 0.03,
        echoDelay: 0.11,
        echoVolume: 0.4,
      });
      return;
    case "crystal-ping":
      playHarmonicTone({
        fundamental: 2100,
        endFreq: 2600,
        duration: 0.2,
        volume: 0.026,
        type: "sine",
      });
      return;
    case "meadow-bounce":
      playChirp({
        startFreq: 2000,
        endFreq: 2600,
        duration: 0.05,
        volume: 0.03,
      });
      playChirp({
        startFreq: 2300,
        endFreq: 3000,
        startAt: 0.08,
        duration: 0.05,
        volume: 0.028,
      });
      playChirp({
        startFreq: 2600,
        endFreq: 1800,
        startAt: 0.16,
        duration: 0.07,
        volume: 0.026,
      });
      return;
  }
}

/** Preview any Live Cam chirp option (does not change the saved choice). */
export function previewLiveCamChirp(id: LiveCamChirpId) {
  kickOff(() => playChirpPreset(id));
}

/** Single chirp when tapping Live Cam — uses the saved selection. */
export function playLiveCamSound() {
  kickOff(() => playChirpPreset(getLiveCamChirpId()));
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
