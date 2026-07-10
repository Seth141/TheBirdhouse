"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { useNotifications } from "@/lib/query/hooks";
import { useAppStore } from "@/lib/store/useAppStore";
import { NotificationIcon } from "@/components/icons";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: notifications = [] } = useNotifications();
  const dismissedIds = useAppStore((s) => s.dismissedNotificationIds);
  const readIds = useAppStore((s) => s.readNotificationIds);
  const dismissNotification = useAppStore((s) => s.dismissNotification);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);

  const visible = useMemo(
    () => notifications.filter((n) => !dismissedIds.includes(n.id)),
    [notifications, dismissedIds]
  );

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
            className="glass-card fixed top-1/2 left-1/2 z-50 w-[min(18rem,calc(100vw-2.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden p-3"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="font-heading text-base font-medium">
                Notifications
              </span>
              {visible.length > 0 && (
                <button
                  type="button"
                  onClick={() => markAllNotificationsRead(visible.map((n) => n.id))}
                  className="text-xs text-[#8A8F94] underline-offset-2 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {visible.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                <span className="relative h-20 w-20">
                  <Image
                    src="/artwork/empty-states/empty-nature.png"
                    alt=""
                    fill
                    className="object-contain"
                  />
                </span>
                <p className="text-sm text-[#8A8F94]">
                  No notifications right now. Enjoy the quiet.
                </p>
              </div>
            ) : (
              <ul className="flex max-h-[min(20rem,55vh)] flex-col gap-1 overflow-y-auto no-scrollbar">
                {visible.map((n) => {
                  const isRead = readIds.includes(n.id);
                  return (
                    <li
                      key={n.id}
                      className="group flex items-start gap-2.5 rounded-2xl px-2 py-2.5 hover:bg-white/40"
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          isRead ? "bg-transparent" : "bg-[#F4E5E7]/70"
                        }`}
                      >
                        <NotificationIcon size={16} wash="blush" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium text-[#4F545A]">
                            {n.title}
                          </span>
                          <span className="shrink-0 text-[10px] text-[#8A8F94]">
                            {timeAgo(n.timestamp)}
                          </span>
                        </span>
                        <span className="line-clamp-2 text-xs text-[#8A8F94]">
                          {n.body}
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label={`Dismiss ${n.title}`}
                        onClick={() => dismissNotification(n.id)}
                        className="mt-0.5 shrink-0 text-[#8A8F94] opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
