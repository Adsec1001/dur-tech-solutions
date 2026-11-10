import { differenceInCalendarDays, parseISO } from "date-fns";

export function uncollectedDays(readyAt?: string, collectedAt?: string, now = new Date()): number | null {
  if (!readyAt) return null;
  const ready = parseISO(readyAt);
  const end = collectedAt ? parseISO(collectedAt) : now;
  if (Number.isNaN(ready.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.max(0, differenceInCalendarDays(end, ready));
}