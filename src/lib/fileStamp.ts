const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Local-time stamp for downloaded file names, e.g. "2026-10-31_22-32-05".
 * Uses the user's own clock (not UTC) so the file always carries the day
 * they actually pressed the button, and the time part keeps every new
 * download a separate file instead of overwriting / appending to the last one.
 */
export const fileStamp = (withTime = true) => {
  const n = new Date();
  const date = `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
  return withTime ? `${date}_${pad(n.getHours())}-${pad(n.getMinutes())}-${pad(n.getSeconds())}` : date;
};

/** Human readable local date/time for inside documents, e.g. "31.10.2026 22:32". */
export const humanStamp = () => new Date().toLocaleString("tr-TR");
