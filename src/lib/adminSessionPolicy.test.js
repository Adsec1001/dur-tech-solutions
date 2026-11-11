import { test } from "node:test";
import { strict as assert } from "node:assert";
import { sessionExpired } from "./adminSessionPolicy.ts";

test("locks after ten inactive minutes", () => {
  assert.equal(sessionExpired(0, 0, 599999), false);
  assert.equal(sessionExpired(0, 0, 600000), true);
});
test("locks after thirty minutes even with activity", () => {
  assert.equal(sessionExpired(0, 1799999, 1799999), false);
  assert.equal(sessionExpired(0, 1800000, 1800000), true);
});