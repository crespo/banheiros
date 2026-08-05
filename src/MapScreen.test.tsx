import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";
import { setLanguage, t } from "./i18n/i18n";
import MapScreen from "./MapScreen";

beforeEach(() => {
  setLanguage("pt");
});

test.each([
  ["map.filterAll"],
  ["map.filterPublic"],
  ["map.filterInstore"],
  ["map.filterPaid"],
])('MapScreen renders a button for filter chip "%s"', (key) => {
  render(<MapScreen />);
  expect(screen.getByRole("button", { name: t(key as Parameters<typeof t>[0]) })).toBeInTheDocument();
});

test('the "all" filter chip is pressed by default', () => {
  render(<MapScreen />);
  expect(screen.getByRole("button", { name: t("map.filterAll") })).toHaveAttribute("aria-pressed", "true");
});
