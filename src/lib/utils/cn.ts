import { type ClassValue, clsx } from "clsx";

/** Merge conditional class names. Thin wrapper so call sites stay tidy. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
