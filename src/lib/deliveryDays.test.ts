import { describe, it, expect } from "vitest";
import { daysSince, uncollectedDays } from "./deliveryDays";
const today = new Date(2026, 10, 10);
describe("delivery days", () => {
  it("counts days since ready", () => expect(uncollectedDays("2026-11-03", undefined, today)).toBe(7));
  it("stops counting once collected", () => expect(uncollectedDays("2026-11-03", "2026-11-05", today)).toBeNull());
  it("no ready date, no count", () => expect(uncollectedDays(undefined, undefined, today)).toBeNull());
  it("days since last notification", () => expect(daysSince("2026-11-09", today)).toBe(1));
});
