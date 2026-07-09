"use client";

import Image from "next/image";
import { useState } from "react";
import { NotificationIcon, MenuIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { FadeIn } from "@/components/motion/FadeIn";
import { MenuDrawer } from "@/components/layout/MenuDrawer";
import { NotificationsDrawer } from "@/components/layout/NotificationsDrawer";
import { useAppStore } from "@/lib/store/useAppStore";
import { useNotifications } from "@/lib/query/hooks";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  variant?: "home" | "page";
}

export function Header({
  title = "Sara's Birdhouse",
  subtitle = "A peaceful place for every bird.",
  variant = "home",
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const dismissedIds = useAppStore((s) => s.dismissedNotificationIds);
  const readIds = useAppStore((s) => s.readNotificationIds);
  const unread = notifications.filter(
    (n) => !dismissedIds.includes(n.id) && !readIds.includes(n.id)
  ).length;

  return (
    <FadeIn className="sticky top-0 z-30 px-5 pt-4 pb-2">
      <div className="relative">
        <div className="glass-pill flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
          <Link
            href="/"
            className={cn(
              "flex min-w-0 items-center gap-3",
              variant === "page" && "gap-2"
            )}
          >
            {variant === "home" && (
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/70">
                <Image
                  src="/icons/app-icon.png"
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </span>
            )}
            <span className="min-w-0">
              <span
                className={cn(
                  "font-heading block truncate leading-tight text-[#4F545A]",
                  variant === "home" ? "text-xl font-medium" : "text-lg font-medium"
                )}
              >
                {title}
              </span>
              {subtitle && variant === "home" && (
                <span className="block truncate text-xs text-[#8A8F94]">
                  {subtitle}
                </span>
              )}
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <IconButton
              aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
              aria-expanded={notifOpen}
              badge={unread}
              size={40}
              surface="inset"
              onClick={() => {
                setNotifOpen((v) => !v);
                setMenuOpen(false);
              }}
            >
              <NotificationIcon size={19} />
            </IconButton>
            <IconButton
              aria-label="Open menu"
              aria-expanded={menuOpen}
              size={40}
              surface="inset"
              onClick={() => {
                setMenuOpen((v) => !v);
                setNotifOpen(false);
              }}
            >
              <MenuIcon size={19} />
            </IconButton>
          </div>
        </div>

        <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
        <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>
    </FadeIn>
  );
}
