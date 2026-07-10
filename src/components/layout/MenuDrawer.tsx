"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  HomeIcon,
  LiveCameraIcon,
  GalleryIcon,
  SettingsIcon,
  ChevronRightIcon,
} from "@/components/icons";

const links = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/live-camera", label: "Live Camera", Icon: LiveCameraIcon },
  { href: "/gallery", label: "Gallery", Icon: GalleryIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

export function MenuDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-[#EAF3F8]/20 backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card fixed top-1/2 left-1/2 z-50 w-[min(16rem,calc(100vw-2.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden p-2"
            role="dialog"
            aria-label="Main menu"
          >
            <nav>
              {links.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm text-[#4F545A] transition-colors hover:bg-white/50"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={20} />
                    {label}
                  </span>
                  <ChevronRightIcon size={14} />
                </Link>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
