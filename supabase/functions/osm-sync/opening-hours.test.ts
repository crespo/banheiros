import { expect, test } from "vitest";
import { parseOpeningHours } from "./opening-hours";

test("parses a simple HH:MM-HH:MM string into open_time and close_time", () => {
  expect(parseOpeningHours("06:00-22:00")).toEqual({
    open_time: "06:00",
    close_time: "22:00",
  });
});

test("returns null for a multi-rule opening_hours string", () => {
  expect(parseOpeningHours("Mo-Fr 08:00-18:00; Sa 08:00-12:00")).toBeNull();
});
