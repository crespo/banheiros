import { expect, test } from "vitest";
import { parseOpeningHours } from "./opening-hours";

test("parses a simple HH:MM-HH:MM string into open_time and close_time", () => {
  expect(parseOpeningHours("06:00-22:00")).toEqual({
    open_time: "06:00",
    close_time: "22:00",
  });
});
