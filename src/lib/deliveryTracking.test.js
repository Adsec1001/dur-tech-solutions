import { describe, it, expect } from "bun:test";
import { uncollectedDays } from "./deliveryTracking";
describe("collection waiting period", () => {
  it("counts from ready date rather than notification date", () => {
    expect(uncollectedDays("2026-11-01", undefined, new Date(2026, 10, 10))).toBe(9);
  });
  it("stops counting when collected", () => {
    expect(uncollectedDays("2026-11-01", "2026-11-04", new Date(2026, 10, 10))).toBe(3);
  });
  it("does not invent a period without a ready date", () => {
    expect(uncollectedDays(undefined)).toBeNull();
  });
});