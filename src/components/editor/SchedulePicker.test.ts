import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { zonedDateTime } from "./SchedulePicker";

describe("scheduled wall time", () => {
  test("resolves the selected IANA time zone across daylight saving changes", () => {
    assert.equal(
      zonedDateTime("2026-09-21", "09:00", "America/Chicago").toISOString(),
      "2026-09-21T14:00:00.000Z",
    );
    assert.equal(
      zonedDateTime("2026-12-21", "09:00", "America/Chicago").toISOString(),
      "2026-12-21T15:00:00.000Z",
    );
  });
});
