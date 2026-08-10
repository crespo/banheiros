import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { t } from "./i18n/i18n";
import PrivacidadeScreen from "./PrivacidadeScreen";

test("PrivacidadeScreen renders the privacy policy title", () => {
  render(<PrivacidadeScreen />);
  expect(screen.getByRole("heading", { name: t("auth.privacyLinkText") })).toBeInTheDocument();
});

test("PrivacidadeScreen renders the placeholder text", () => {
  render(<PrivacidadeScreen />);
  expect(screen.getByText(t("legal.placeholder"))).toBeInTheDocument();
});

test("PrivacidadeScreen renders a link back to the app", () => {
  render(<PrivacidadeScreen />);
  expect(screen.getByRole("link", { name: t("common.back") })).toHaveAttribute("href", "/");
});
