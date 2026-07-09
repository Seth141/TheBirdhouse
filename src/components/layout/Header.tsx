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
import { usePathname } from "next/navigation";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  variant?: "home" | "page";
}

const desktopLinks = [
  { href: "/", label: "Home" },
  { href: "/live-camera", label: "Live Cam" },
  { href: "/gallery", label: "Gallery" },
  { href: "/settings", label: "Settings" },
];

export function Header({
  title = "Sara's Birdhouse",
  subtitle = "A peaceful place for every bird.",
  variant = "home",
}: HeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const dismissedIds = useAppStore((s) => s.dismissedNotificationIds);
  const readIds = useAppStore((s) => s.readNotificationIds);
  const unread = notifications.filter(
    (n) => !dismissedIds.includes(n.id) && !readIds.includes(n.id)
  ).length;

  return (
    <FadeIn className="sticky top-0 z-30 px-5 pt-4 pb-2 lg:bg-[#EAF3F8] lg:px-0 lg:pt-8 lg:pb-0">
      <div className="glass-pill flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 lg:bg-white/70 lg:px-6 lg:py-3.5 lg:[backdrop-filter:none] lg:[-webkit-backdrop-filter:none]">
        <Link
          href="/"
          className={cn(
            "flex min-w-0 items-center gap-3",
            variant === "page" && "gap-2",
            "lg:gap-4"
          )}
        >
          <span
            className={cn(
              "relative shrink-0 overflow-hidden rounded-full ring-1 ring-white/70",
              variant === "home"
                ? "h-10 w-10 lg:h-12 lg:w-12"
                : "hidden h-10 w-10 lg:block lg:h-11 lg:w-11"
            )}
          >
            <Image
              src="/icons/app-icon.png"
              alt=""
              fill
              sizes="48px"
              className="object-cover"
              priority
            />
          </span>
          <span className="min-w-0">
            <span
              className={cn(
                "font-heading block truncate leading-tight text-[#4F545A]",
                variant === "home"
                  ? "text-xl font-medium lg:text-[1.75rem]"
                  : "text-lg font-medium lg:text-2xl"
              )}
            >
              {title}
            </span>
            {subtitle && variant === "home" && (
              <span className="block truncate text-xs text-[#8A8F94] lg:mt-0.5 lg:text-sm">
                {subtitle}
              </span>
            )}
            {subtitle && variant === "page" && (
              <span className="hidden truncate text-sm text-[#8A8F94] lg:mt-0.5 lg:block">
                {subtitle}
              </span>
            )}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1 lg:gap-2">
          <nav
            aria-label="Desktop"
            className="mr-2 hidden items-center gap-1 lg:flex"
          >
            {desktopLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-white/55 font-medium text-[#4F545A]"
                      : "text-[#8A8F94] hover:bg-white/45 hover:text-[#4F545A]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
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
          <div className="lg:hidden">
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
      </div>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </FadeIn>
  );
}
