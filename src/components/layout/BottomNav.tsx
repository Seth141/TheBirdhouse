"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { HomeIcon, LiveCameraIcon, GalleryIcon, SettingsIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/live-camera", label: "Live Cam", Icon: LiveCameraIcon },
];

const trailingTabs = [
  { href: "/gallery", label: "Gallery", Icon: GalleryIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

/**
 * Floating frosted-glass tab bar. The center button is a raised snapshot
 * shortcut (birdhouse artwork) rather than a redundant tab — a placeholder
 * for the eventual Wyze Cam V3 "capture snapshot" action.
 */
export function BottomNav() {
  const pathname = usePathname();
  const pushToast = useAppStore((s) => s.pushToast);

  const renderTab = (tab: (typeof tabs)[number]) => {
    const active = pathname === tab.href;
    return (
      <Link
        key={tab.href}
        href={tab.href}
        aria-current={active ? "page" : undefined}
        className="flex min-w-[56px] flex-1 flex-col items-center gap-1 py-2"
      >
        <span
          className={cn(
            "flex h-9 w-11 items-center justify-center rounded-full transition-colors duration-500",
            active ? "bg-[#F4E5E7]/70" : "bg-transparent"
          )}
        >
          <tab.Icon size={20} wash="none" className={active ? "text-[#4F545A]" : "text-[#8A8F94]"} />
        </span>
        <span
          className={cn(
            "text-[11px] transition-colors duration-500",
            active ? "text-[#4F545A] font-medium" : "text-[#8A8F94]"
          )}
        >
          {tab.label}
        </span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-30 mx-auto w-full px-5 pb-6 pt-2"
    >
      <div className="glass-card relative flex items-end justify-between px-2 py-1">
        {tabs.map(renderTab)}

        <div className="flex flex-1 justify-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.93 }}
            onClick={() => pushToast("Snapshot saved to your gallery.")}
            aria-label="Capture a snapshot"
            className="relative -top-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-white/50 shadow-[0_10px_30px_rgba(80,80,80,0.14)] backdrop-blur-xl"
          >
            <span className="animate-float relative block h-11 w-11">
              <Image
                src="/icons/app-icon.png"
                alt=""
                fill
                sizes="44px"
                className="rounded-full object-cover"
              />
            </span>
          </motion.button>
        </div>

        {trailingTabs.map(renderTab)}
      </div>
    </nav>
  );
}
