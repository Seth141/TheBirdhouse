import { create } from "zustand";

interface Toast {
  id: string;
  message: string;
}

interface AppState {
  favoriteMomentIds: string[];
  readNotificationIds: string[];
  dismissedNotificationIds: string[];
  toasts: Toast[];
  toggleFavorite: (momentId: string) => void;
  isFavorite: (momentId: string) => boolean;
  markAllNotificationsRead: (ids: string[]) => void;
  dismissNotification: (id: string) => void;
  pushToast: (message: string) => void;
  dismissToast: (id: string) => void;
}

/**
 * Lightweight client-side UI state (favorites, toasts, notification
 * read/dismiss state). Server-shaped data (stats, moments, camera status)
 * lives in the React Query layer under `src/lib/query`, ready to be
 * swapped for real API calls without touching this store.
 */
export const useAppStore = create<AppState>((set, get) => ({
  favoriteMomentIds: [],
  readNotificationIds: [],
  dismissedNotificationIds: [],
  toasts: [],
  toggleFavorite: (momentId) =>
    set((state) => ({
      favoriteMomentIds: state.favoriteMomentIds.includes(momentId)
        ? state.favoriteMomentIds.filter((id) => id !== momentId)
        : [...state.favoriteMomentIds, momentId],
    })),
  isFavorite: (momentId) => get().favoriteMomentIds.includes(momentId),
  markAllNotificationsRead: (ids) =>
    set((state) => ({
      readNotificationIds: Array.from(
        new Set([...state.readNotificationIds, ...ids])
      ),
    })),
  dismissNotification: (id) =>
    set((state) => ({
      dismissedNotificationIds: [...state.dismissedNotificationIds, id],
    })),
  pushToast: (message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: `toast-${Date.now()}`, message }],
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
