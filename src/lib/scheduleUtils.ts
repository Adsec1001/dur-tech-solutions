const DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Human friendly Turkish label: weekday + date (+ time when available) + relative hint */
export const formatSchedule = (iso: string, withTime = true): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diffDays = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / 86400000);

  let rel = "";
  if (diffDays === 0) rel = "Bugün";
  else if (diffDays === 1) rel = "Yarın";
  else if (diffDays === -1) rel = "Dün";
  else if (diffDays > 1 && diffDays <= 7) rel = `${diffDays} gün sonra`;
  else if (diffDays < -1 && diffDays >= -7) rel = `${Math.abs(diffDays)} gün önce`;

  const dateStr = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = withTime ? ` ${d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}` : "";
  return `${DAYS[d.getDay()]}${rel ? ` (${rel})` : ""} • ${dateStr}${timeStr}`;
};

const pad = (n: number) => String(n).padStart(2, "0");
const toIcsUtc = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

/**
 * Downloads a calendar (.ics) reminder with an alarm at the exact time.
 * On Windows 11 the file opens in Takvim/Outlook and rings at the set hour.
 */
export const downloadAlarm = (iso: string, title: string, description = "", minutesBefore = 0) => {
  const start = new Date(iso);
  if (isNaN(start.getTime())) return;
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dur Bilisim//Is Alarmi//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@durbilisim`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${esc(title)}`,
    description ? `DESCRIPTION:${esc(description)}` : "",
    "BEGIN:VALARM",
    `TRIGGER:-PT${minutesBefore}M`,
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `alarm-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
