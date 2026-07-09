"use client";

import { useEffect, useRef, useState, type FormEvent, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "birdhouse-unlocked";
const VALID_PASSWORDS = new Set(["S&S", "SandS"]);

function isValidPassword(value: string) {
  return VALID_PASSWORDS.has(value.trim());
}

const BUTTERFLIES = [
  {
    id: "a",
    wing: "#C4B8DE",
    accent: "#A89BC8",
    size: 34,
    homeX: 0.18,
    homeY: 0.86,
    duration: 18,
    delay: 0,
    flap: 0.72,
    x: [0, 22, 48, 68, 58, 30, 0, -18, -36, -22, 0],
    y: [0, -10, -6, -20, -14, -8, -16, -10, -22, -12, 0],
    rotate: [4, 10, 14, 8, -2, -8, -12, -6, 2, 6, 4],
    gather: { x: -28, y: -18 },
  },
  {
    id: "b",
    wing: "#B8A8D4",
    accent: "#9A88C0",
    size: 28,
    homeX: 0.52,
    homeY: 0.92,
    duration: 21,
    delay: 1.4,
    flap: 0.8,
    x: [0, -20, -42, -58, -40, -12, 10, 36, 52, 24, 0],
    y: [0, -8, -18, -12, -24, -14, -6, -16, -10, -20, 0],
    rotate: [-4, -10, -14, -6, 2, 8, 12, 6, -2, -6, -4],
    gather: { x: 18, y: -26 },
  },
  {
    id: "c",
    wing: "#D0C4E6",
    accent: "#B0A0D0",
    size: 30,
    homeX: 0.74,
    homeY: 0.84,
    duration: 19,
    delay: 0.6,
    flap: 0.68,
    x: [0, -28, -54, -72, -50, -18, 8, 28, 12, -8, 0],
    y: [0, -14, -8, -24, -18, -10, -20, -12, -6, -16, 0],
    rotate: [-6, -12, -16, -8, 0, 8, 12, 4, -4, -2, -6],
    gather: { x: 30, y: 12 },
  },
  {
    id: "d",
    wing: "#B4A4D0",
    accent: "#9484BC",
    size: 24,
    homeX: 0.3,
    homeY: 0.94,
    duration: 23,
    delay: 2.2,
    flap: 0.76,
    x: [0, 16, 38, 50, 34, 8, -14, -40, -28, -6, 0],
    y: [0, -6, -14, -8, -18, -12, -4, -16, -10, -20, 0],
    rotate: [2, 8, 12, 4, -4, -10, -8, 0, 6, 4, 2],
    gather: { x: -12, y: 22 },
  },
] as const;

type AttractPoint = { x: number; y: number; id: number };
type FlightMode = "idle" | "attracted" | "returning";

function Butterfly({
  wing,
  accent,
  size,
  flap,
  busy,
}: {
  wing: string;
  accent: string;
  size: number;
  flap: number;
  busy: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 2px 4px rgba(79,84,90,0.18))" }}
    >
      <motion.g
        style={{ transformOrigin: "16px 16px" }}
        animate={{ scaleX: [1, 0.5, 1] }}
        transition={{
          duration: busy ? flap * 0.55 : flap,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ellipse cx="9" cy="13" rx="7" ry="5" fill={wing} />
        <ellipse cx="23" cy="13" rx="7" ry="5" fill={wing} />
        <ellipse cx="10" cy="20" rx="4.5" ry="3.5" fill={accent} />
        <ellipse cx="22" cy="20" rx="4.5" ry="3.5" fill={accent} />
      </motion.g>
      <path
        d="M16 8.5v14"
        stroke="#6B7076"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M16 9c-1.8-2.2-3.6-3-4.8-2.8M16 9c1.8-2.2 3.6-3 4.8-2.8"
        stroke="#6B7076"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="10.5" r="1.3" fill="#6B7076" />
    </svg>
  );
}

function Butterflies({
  attract,
}: {
  attract: AttractPoint | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [mode, setMode] = useState<FlightMode>("idle");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!attract) return;

    setMode("attracted");
    const returnTimer = window.setTimeout(() => {
      setMode("returning");
    }, 3200);

    return () => window.clearTimeout(returnTimer);
  }, [attract?.id]);

  useEffect(() => {
    if (mode !== "returning") return;
    const idleTimer = window.setTimeout(() => setMode("idle"), 2400);
    return () => window.clearTimeout(idleTimer);
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-[5]"
      aria-hidden="true"
    >
      {size.w > 0 &&
        BUTTERFLIES.map((butterfly, index) => {
          const homeX = butterfly.homeX * size.w - butterfly.size / 2;
          const homeY = butterfly.homeY * size.h - butterfly.size / 2;
          const busy = mode !== "idle";

          const animate =
            mode === "attracted" && attract
              ? {
                  x: attract.x + butterfly.gather.x - butterfly.size / 2,
                  y: attract.y + butterfly.gather.y - butterfly.size / 2,
                  rotate: butterfly.gather.x >= 0 ? 12 : -12,
                }
              : mode === "returning"
                ? {
                    x: homeX,
                    y: homeY,
                    rotate: 0,
                  }
                : {
                    x: butterfly.x.map((value) => homeX + value),
                    y: butterfly.y.map((value) => homeY + value),
                    rotate: [...butterfly.rotate],
                  };

          const transition =
            mode === "attracted"
              ? {
                  x: {
                    type: "spring" as const,
                    stiffness: 38,
                    damping: 18,
                    mass: 1.15,
                    delay: index * 0.08,
                  },
                  y: {
                    type: "spring" as const,
                    stiffness: 38,
                    damping: 18,
                    mass: 1.15,
                    delay: index * 0.08,
                  },
                  rotate: {
                    type: "tween" as const,
                    duration: 0.7,
                    ease: "easeOut" as const,
                    delay: index * 0.08,
                  },
                }
              : mode === "returning"
                ? {
                    x: {
                      type: "tween" as const,
                      duration: 2.2,
                      ease: [0.22, 1, 0.36, 1] as const,
                      delay: index * 0.12,
                    },
                    y: {
                      type: "tween" as const,
                      duration: 2.2,
                      ease: [0.22, 1, 0.36, 1] as const,
                      delay: index * 0.12,
                    },
                    rotate: {
                      type: "tween" as const,
                      duration: 1.8,
                      ease: "easeInOut" as const,
                      delay: index * 0.12,
                    },
                  }
                : {
                    duration: butterfly.duration,
                    delay: 0,
                    repeat: Infinity,
                    ease: [0.37, 0, 0.63, 1] as const,
                    times: [
                      0, 0.1, 0.22, 0.34, 0.44, 0.54, 0.64, 0.76, 0.86, 0.94, 1,
                    ],
                  };

          return (
            <motion.div
              key={butterfly.id}
              className="absolute left-0 top-0"
              initial={false}
              animate={animate}
              transition={transition}
            >
              <Butterfly
                wing={butterfly.wing}
                accent={butterfly.accent}
                size={butterfly.size}
                flap={butterfly.flap}
                busy={busy}
              />
            </motion.div>
          );
        })}
    </div>
  );
}

/**
 * Full-screen secret gate shown before any app content.
 * Unlocks for "S&S" or "SandS" and remembers the unlock in localStorage.
 * Visit /lock to clear the unlock and show this screen again.
 */
export function PasswordGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLockRoute = pathname === "/lock";
  const gateRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [attract, setAttract] = useState<AttractPoint | null>(null);

  useEffect(() => {
    if (isLockRoute) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage failures; still force the lock UI.
      }
      setUnlocked(false);
      setPassword("");
      setError(false);
      setReady(true);
      return;
    }

    try {
      setUnlocked(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setUnlocked(false);
    }
    setReady(true);
  }, [isLockRoute]);

  function handleAttractPointer(event: PointerEvent<HTMLDivElement>) {
    // Keep typing / button presses from summoning butterflies.
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, button, textarea, select, label, a")) {
      return;
    }

    const el = gateRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    setAttract({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      id: Date.now(),
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isValidPassword(password)) {
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // Still unlock for this session if storage is unavailable.
      }
      setError(false);
      setUnlocked(true);
      if (isLockRoute) {
        router.replace("/");
      }
      return;
    }

    setError(true);
    setShakeKey((key) => key + 1);
  }

  if (!ready) {
    return (
      <div
        className="fixed inset-0 z-[100] bg-[#EAF3F8]"
        aria-hidden="true"
      />
    );
  }

  return (
    <>
      <AnimatePresence>
        {!unlocked && (
          <motion.div
            key="password-gate"
            ref={gateRef}
            className="fixed inset-0 z-[100] flex touch-manipulation items-center justify-center px-6"
            style={{ WebkitTapHighlightColor: "transparent" }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            onPointerDown={handleAttractPointer}
          >
            <div
              className="animate-pastel-wave absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, #EAF3F8 0%, #B9CBD8 50%, #EAF3F8 100%)",
              }}
            />
            <div className="paper-texture absolute inset-0 opacity-30" />
            <Butterflies attract={attract} />

            <motion.div
              className="pointer-events-none relative z-10 w-full max-w-[340px]"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-10 flex flex-col items-center text-center">
                <motion.h1
                  className="font-heading text-[2.35rem] leading-[1.08] font-medium text-[#4F545A]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  Welcome to
                  <br />
                  the Birdhouse
                </motion.h1>
                <motion.p
                  className="mt-4 text-sm leading-relaxed text-[#8A8F94]"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  Step Inside our Quiet Space
                </motion.p>
              </div>

              <motion.div
                className="pointer-events-auto space-y-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 2.0, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.form
                  key={shakeKey}
                  onSubmit={handleSubmit}
                  className="space-y-3"
                  initial={error ? { x: 0 } : false}
                  animate={
                    error
                      ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.45 }}
                >
                  <label className="relative block">
                    <span className="sr-only">Secret password</span>
                    <input
                      type="password"
                      name="password"
                      autoComplete="off"
                      autoFocus
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (error) setError(false);
                      }}
                      className="w-full rounded-full border border-[#C5D4DF]/70 bg-white/50 px-5 py-3.5 text-left text-base text-[#4F545A] caret-[#4F545A] shadow-[0_10px_28px_rgba(100,130,160,0.22)] outline-none backdrop-blur-md transition-[background-color,box-shadow] focus:border-[#C5D4DF] focus:bg-white/70 focus:shadow-[0_12px_32px_rgba(100,130,160,0.32)]"
                      aria-invalid={error}
                      aria-describedby={error ? "password-error" : undefined}
                    />
                    {!password && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-base text-[#8A8F94]"
                      >
                        Secret password
                      </span>
                    )}
                  </label>

                  {error && (
                    <p
                      id="password-error"
                      className="text-center text-sm text-[#8A8F94]"
                      role="alert"
                    >
                      That isn&apos;t quite right. Try again.
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-full border border-[#C5D4DF] bg-[#C5D6E4] px-5 py-3.5 text-sm font-medium tracking-wide text-[#4F5A62] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_28px_rgba(100,130,160,0.32)] transition-[background-color,box-shadow,transform] hover:bg-[#B9CBD8] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_12px_32px_rgba(100,130,160,0.38)] active:scale-[0.985]"
                  >
                    Open the door
                  </button>
                </motion.form>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {unlocked ? children : null}
    </>
  );
}
