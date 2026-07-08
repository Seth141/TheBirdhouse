"use client";

import { motion } from "framer-motion";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

/** A soft pill toggle — warm cream when off, dusty-rose wash when on. Never neon. */
export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300"
      style={{ background: checked ? "#EFD9DD" : "rgba(185,174,164,0.35)" }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm"
        style={{ left: checked ? "calc(100% - 26px)" : "2px" }}
      />
    </button>
  );
}
