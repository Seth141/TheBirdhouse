"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
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

/** Soft chalk pastel wash — dusty blue, sage, sky only. */
function WeeklyAreaChart({
  data,
}: {
  data: { day: string; visits: number }[];
}) {
  const fillId = useId();
  const width = 340;
  const height = 160;
  const padX = 14;
  const padTop = 20;
  const padBottom = 30;
  const max = Math.max(...data.map((d) => d.visits), 1);
  const baseline = height - padBottom;

  const points = useMemo(() => {
    const innerW = width - padX * 2;
    const innerH = height - padTop - padBottom;
    return data.map((d, i) => {
      const x =
        padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
      const y = padTop + innerH - (d.visits / max) * innerH * 0.9;
      return { ...d, x, y };
    });
  }, [data, max]);

  const linePath = useMemo(() => smoothCurve(points), [points]);
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baseline} L ${points[0].x.toFixed(1)} ${baseline} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Weekly visits over the past seven days"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B9CBD8" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#D6E1D5" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#EAF3F8" stopOpacity="0" />
        </linearGradient>
      </defs>

      <motion.path
        d={areaPath}
        fill={`url(#${fillId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.85, ease }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke="#B9CBD8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.85 }}
        transition={{ duration: 1.05, ease }}
      />

      {points.map((p) => (
        <text
          key={`label-${p.day}`}
          x={p.x}
          y={height - 6}
          textAnchor="middle"
          fill="#8A8F94"
          style={{
            fontSize: 10,
            fontFamily: "var(--font-body)",
          }}
        >
          {p.day}
        </text>
      ))}
    </svg>
  );
}

/** Soft rounded bars — quiet hours of the day. */
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
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-heading text-2xl font-medium leading-none text-[#4F545A]">
            {top.value}%
          </span>
          <span className="mt-1 text-[10px] text-[#8A8F94]">{top.label}</span>
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

export function DesktopInsights() {
  const weekly = useWeeklyVisits();
  const hourly = useHourlyVisits();
  const share = useVisitorShare();

  const weekTotal =
    weekly.data?.reduce((sum, d) => sum + d.visits, 0) ?? null;
  const peakDay = weekly.data
    ? weekly.data.reduce((a, b) => (b.visits > a.visits ? b : a))
    : null;

  return (
    <FadeIn delay={0.2} className="hidden space-y-6 lg:block">
      <GlassCard padding="md" className="lg:p-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-medium text-[#4F545A]">
              This Week
            </h2>
            <p className="mt-0.5 text-xs text-[#8A8F94]">
              Soft visits across quiet mornings
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
          <ChartSkeleton className="h-[160px]" />
        ) : (
          <WeeklyAreaChart data={weekly.data} />
        )}

        {peakDay && (
          <p className="mt-3 text-xs text-[#8A8F94]">
            Busiest day ·{" "}
            <span className="text-[#4F545A]">{peakDay.day}</span> with{" "}
            <span className="text-[#4F545A]">{peakDay.visits}</span> visits
          </p>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <GlassCard padding="md" className="lg:p-5">
          <h2 className="font-heading text-lg font-medium text-[#4F545A]">
            Quiet Hours
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
