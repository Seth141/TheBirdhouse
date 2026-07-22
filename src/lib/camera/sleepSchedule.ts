/**
 * Overnight camera sleep — Pacific time (America/Los_Angeles).
 * Sleeps 8:00 PM through 4:59 AM so Railway isn't billed overnight.
 */

export const CAMERA_SLEEP_TIME_ZONE = "America/Los_Angeles";
/** Inclusive local hour when sleep begins (8 PM). */
export const CAMERA_SLEEP_START_HOUR = 20;
/** Exclusive local hour when sleep ends (5 AM). */
export const CAMERA_SLEEP_END_HOUR = 5;

/** Current hour 0–23 in America/Los_Angeles. */
export function getPacificHour(now = new Date()): number {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: CAMERA_SLEEP_TIME_ZONE,
      hour: "numeric",
      hourCycle: "h23",
    }).format(now)
  );
  return Number.isFinite(hour) ? hour : now.getUTCHours();
}

/** True from 8:00 PM Pacific until 5:00 AM Pacific. */
export function isCameraSleeping(now = new Date()): boolean {
  const hour = getPacificHour(now);
  return hour >= CAMERA_SLEEP_START_HOUR || hour < CAMERA_SLEEP_END_HOUR;
}
