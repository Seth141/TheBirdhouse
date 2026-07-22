"use client";

import { useId, useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  useHourlyVisits,
  useVisitorShare,
  useWeeklyVisits,
} from "@/lib/query/hooks";

const ease = [0.22, 1, 0.36, 1] as const;

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[20px] bg-white/40 ${className ?? ""}`}
      aria-hidden
    />
  );
}

/** Smooth cubic path through points (chalky ribbon, not sharp polyline). */
function smoothCurve(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/** Scroll-drawn weekly ribbon — sage mist, peak glow, soft day markers. */
function WeeklyAreaChart({
  data,
}: {
  data: { day: string; visits: number }[];
}) {
  const fillId = useId();
  const lineId = useId();
  const glowId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4, margin: "0px 0px -40px 0px" });

  const width = 360;
  const height = 188;
  const padX = 22;
  const padTop = 28;
  const padBottom = 36;
  const max = Math.max(...data.map((d) => d.visits), 1);
  const baseline = height - padBottom;
  const peakVisits = max;

  const points = useMemo(() => {
    const innerW = width - padX * 2;
    const innerH = height - padTop - padBottom;
    return data.map((d, i) => {
      const x =
        padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
      const y = padTop + innerH - (d.visits / max) * innerH * 0.88;
      return { ...d, x, y, isPeak: d.visits === peakVisits && d.visits > 0 };
    });
  }, [data, max, peakVisits]);

  const linePath = useMemo(() => smoothCurve(points), [points]);
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baseline} L ${points[0].x.toFixed(1)} ${baseline} Z`;

  return (
    <div ref={ref} className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-2 inset-y-1 rounded-[22px] bg-[radial-gradient(ellipse_at_30%_20%,rgba(214,225,213,0.55),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(185,203,216,0.35),transparent_50%)]"
      />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="relative h-auto w-full"
        role="img"
        aria-label="Weekly visits over the past seven days"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9BB5A3" stopOpacity="0.42" />
            <stop offset="45%" stopColor="#B9CBD8" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#EAF3F8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8FA896" />
            <stop offset="55%" stopColor="#7FA0B5" />
            <stop offset="100%" stopColor="#A8BFD0" />
          </linearGradient>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Quiet guide lines */}
        {[0.25, 0.5, 0.75].map((t) => {
          const y = padTop + (height - padTop - padBottom) * t;
          return (
            <line
              key={t}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="rgba(79,84,90,0.06)"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
          );
        })}

        <motion.path
          d={areaPath}
          fill={`url(#${fillId})`}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.55, duration: 0.9, ease }}
        />

        {/* Soft under-glow stroke */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#B9CBD8"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.28}
          filter={`url(#${glowId})`}
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.35, ease }}
        />

        <motion.path
          d={linePath}
          fill="none"
          stroke={`url(#${lineId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            inView
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{ duration: 1.35, ease }}
        />

        {points.map((p, i) => (
          <g key={p.day}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              fill={p.isPeak ? "#6F8F7A" : "#F7FBFC"}
              stroke={p.isPeak ? "#EAF3F0" : "#8FA896"}
              strokeWidth={p.isPeak ? 2.5 : 1.75}
              initial={{ r: 0, opacity: 0 }}
              animate={
                inView
                  ? { r: p.isPeak ? 6.5 : 4, opacity: 1 }
                  : { r: 0, opacity: 0 }
              }
              transition={{
                delay: 0.85 + i * 0.07,
                duration: 0.45,
                ease,
              }}
            />
            {p.isPeak && (
              <motion.text
                x={p.x}
                textAnchor="middle"
                fill="#4F545A"
                initial={{ opacity: 0, y: p.y - 4 }}
                animate={
                  inView
                    ? { opacity: 1, y: p.y - 14 }
                    : { opacity: 0, y: p.y - 4 }
                }
                transition={{ delay: 1.15, duration: 0.45, ease }}
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                }}
              >
                {p.visits}
              </motion.text>
            )}
            <text
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              fill={p.isPeak ? "#4F545A" : "#8A8F94"}
              style={{
                fontSize: 11,
                fontFamily: "var(--font-body)",
                fontWeight: p.isPeak ? 600 : 400,
              }}
            >
              {p.day}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Soft rounded bars — busy hours of the day. */
function HourlyBars({ data }: { data: { hour: string; visits: number }[] }) {
  const max = Math.max(...data.map((d) => d.visits), 1);
  const washes = ["#B9CBD8", "#D6E1D5", "#DCD6E8", "#EFD9DD", "#C9D8E4", "#DDE7DC", "#E8DDE8"];

  return (
    <div
      className="flex h-[132px] gap-2 px-1"
      role="img"
      aria-label="Visits by hour of day"
    >
      {data.map((d, i) => {
        const h = Math.max(12, (d.visits / max) * 100);
        return (
          <div
            key={d.hour}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <div className="flex w-full flex-1 items-end justify-center">
              <motion.div
                className="w-full max-w-[28px] rounded-full"
                style={{
                  height: `${h}%`,
                  transformOrigin: "bottom",
                  background: `linear-gradient(180deg, ${washes[i % washes.length]} 0%, ${washes[i % washes.length]}99 100%)`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.55, ease }}
              />
            </div>
            <span className="text-[10px] text-[#8A8F94]">{d.hour}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Soft pastel donut — visitor mix. */
function VisitorDonut({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const size = 148;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let offset = 0;
  const segments = data.map((d) => {
    const len = (d.value / total) * c;
    const seg = { ...d, len, offset };
    offset += len;
    return seg;
  });

  const top = data.reduce((a, b) => (b.value > a.value ? b : a));

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label="Visitor share by bird type"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={stroke}
          />
          {segments.map((seg, i) => (
            <motion.circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${seg.len} ${c - seg.len}`}
              strokeDashoffset={-seg.offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease }}
            />
          ))}
        </svg>
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center overflow-hidden text-center"
          style={{ padding: stroke + 6 }}
        >
          <span className="font-heading text-2xl font-medium leading-none text-[#4F545A]">
            {top.value}%
          </span>
          <span
            className="mt-1 line-clamp-2 w-full break-words text-[9px] leading-tight text-[#8A8F94]"
            title={top.label}
          >
            {top.label}
          </span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2.5">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-xs text-[#4F545A]">
              {d.label}
            </span>
            <span className="text-xs tabular-nums text-[#8A8F94]">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WeeklyCard() {
  const weekly = useWeeklyVisits();
  const weekTotal =
    weekly.data?.reduce((sum, d) => sum + d.visits, 0) ?? null;
  const peakDay = weekly.data
    ? weekly.data.reduce((a, b) => (b.visits > a.visits ? b : a))
    : null;

  return (
    <GlassCard
      padding="md"
      className="relative overflow-hidden lg:p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[#D6E1D5]/45 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-6 h-40 w-40 rounded-full bg-[#B9CBD8]/30 blur-2xl"
      />

      <div className="relative mb-3 flex items-end justify-between gap-3 lg:mb-4">
        <div>
          <h2 className="font-heading text-lg font-medium text-[#4F545A] lg:text-xl">
            This Week
          </h2>
          <p className="mt-0.5 text-xs text-[#8A8F94]">
            How the perch has been humming
          </p>
        </div>
        {weekTotal != null && (
          <div className="text-right">
            <p className="font-heading text-2xl font-medium leading-none text-[#4F545A]">
              {weekTotal}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[#8A8F94]">
              visits
            </p>
          </div>
        )}
      </div>

      {weekly.isLoading || !weekly.data ? (
        <ChartSkeleton className="h-[188px]" />
      ) : (
        <WeeklyAreaChart data={weekly.data} />
      )}

      {peakDay && (
        <p className="relative mt-2 text-xs text-[#8A8F94] lg:mt-3">
          Busiest day ·{" "}
          <span className="font-medium text-[#4F545A]">{peakDay.day}</span> with{" "}
          <span className="font-medium text-[#4F545A]">{peakDay.visits}</span>{" "}
          visits
        </p>
      )}
    </GlassCard>
  );
}

export function DesktopInsights() {
  const hourly = useHourlyVisits();
  const share = useVisitorShare();

  return (
    <FadeIn delay={0.15} className="space-y-6">
      <WeeklyCard />

      <div className="hidden gap-6 lg:grid lg:grid-cols-1 xl:grid-cols-2">
        <GlassCard padding="md" className="lg:p-5">
          <h2 className="font-heading text-lg font-medium text-[#4F545A]">
            Busy Hours
          </h2>
          <p className="mb-4 mt-0.5 text-xs text-[#8A8F94]">
            When the perch is most alive
          </p>
          {hourly.isLoading || !hourly.data ? (
            <ChartSkeleton className="h-[132px]" />
          ) : (
            <HourlyBars data={hourly.data} />
          )}
        </GlassCard>

        <GlassCard padding="md" className="lg:p-5">
          <h2 className="font-heading text-lg font-medium text-[#4F545A]">
            Visitors
          </h2>
          <p className="mb-4 mt-0.5 text-xs text-[#8A8F94]">
            Who stops by most often
          </p>
          {share.isLoading || !share.data ? (
            <ChartSkeleton className="h-[148px]" />
          ) : (
            <VisitorDonut data={share.data} />
          )}
        </GlassCard>
      </div>
    </FadeIn>
  );
}
