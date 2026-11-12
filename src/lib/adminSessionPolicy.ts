export const ADMIN_IDLE_MS = 10 * 60 * 1000;
export const ADMIN_MAX_MS = 30 * 60 * 1000;

export function sessionExpired(startedAt: number, lastActivityAt: number, now: number) {
  return now - startedAt >= ADMIN_MAX_MS || now - lastActivityAt >= ADMIN_IDLE_MS;
}/** A page refresh keeps the admin signed in only if the tab was active within this window. */
export const REFRESH_GRACE_MS = 2 * 60 * 1000;
