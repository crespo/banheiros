import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "./App";
import { t } from "./i18n/i18n";

test("app shell renders the app name heading", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    t("common.appName"),
  );
});
