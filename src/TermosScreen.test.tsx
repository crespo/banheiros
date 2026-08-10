import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { t } from "./i18n/i18n";
import TermosScreen from "./TermosScreen";

test("TermosScreen renders the terms of use title", () => {
  render(<TermosScreen />);
  expect(screen.getByRole("heading", { name: t("auth.termsLinkText") })).toBeInTheDocument();
});

test("TermosScreen renders the placeholder text", () => {
  render(<TermosScreen />);
  expect(screen.getByText(t("legal.placeholder"))).toBeInTheDocument();
});

test("TermosScreen renders a link back to the app", () => {
  render(<TermosScreen />);
  expect(screen.getByRole("link", { name: t("common.back") })).toHaveAttribute("href", "/");
});
