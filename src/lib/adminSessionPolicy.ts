export const ADMIN_IDLE_MS = 10 * 60 * 1000;
export const ADMIN_MAX_MS = 30 * 60 * 1000;

export function sessionExpired(startedAt: number, lastActivityAt: number, now: number) {
  return now - startedAt >= ADMIN_MAX_MS || now - lastActivityAt >= ADMIN_IDLE_MS;
}