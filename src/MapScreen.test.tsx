import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";
import { setLanguage, t } from "./i18n/i18n";
import MapScreen from "./MapScreen";

beforeEach(() => {
  setLanguage("pt");
});

test("MapScreen renders a button for the all-filter chip", () => {
  render(<MapScreen />);
  expect(screen.getByRole("button", { name: t("map.filterAll") })).toBeInTheDocument();
});
