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
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card absolute left-1/2 top-full z-40 -mt-px w-56 -translate-x-1/2 overflow-hidden rounded-t-none p-2"
          >
            <nav aria-label="Main menu">
              {links.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm text-[#4F545A] transition-colors hover:bg-white/50"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={18} />
                    {label}
                  </span>
                  <ChevronRightIcon size={14} className="text-[#8A8F94]" />
                </Link>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
