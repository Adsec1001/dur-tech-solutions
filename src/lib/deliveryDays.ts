/** Whole days between a YYYY-MM-DD date and today (local), never negative. */
export const daysSince = (date?: string, today: Date = new Date()): number | null => {
  if (!date) return null;
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  const start = new Date(y, m - 1, d).getTime();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.max(0, Math.round((end - start) / 86400000));
};

/** Days the device has waited uncollected since it became ready (stops at collection). */
export const uncollectedDays = (readyAt?: string, collectedAt?: string, today: Date = new Date()): number | null => {
  if (!readyAt || collectedAt) return null;
  return daysSince(readyAt, today);
};
