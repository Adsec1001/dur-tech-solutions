import { test } from "node:test";
import { strict as assert } from "node:assert";
import { daysSince, uncollectedDays } from "./deliveryDays.ts";
const today = new Date(2026, 10, 10);
test("counts days since ready", () => assert.equal(uncollectedDays("2026-11-03", undefined, today), 7));
test("stops counting once collected", () => assert.equal(uncollectedDays("2026-11-03", "2026-11-05", today), null));
test("no ready date, no count", () => assert.equal(uncollectedDays(undefined, undefined, today), null));
test("days since last notification", () => assert.equal(daysSince("2026-11-09", today), 1));
