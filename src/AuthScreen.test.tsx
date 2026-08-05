import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { t } from "./i18n/i18n";
import AuthScreen from "./AuthScreen";

test("AuthScreen renders a login submit button by default", () => {
  render(<AuthScreen />);
  expect(screen.getByRole("button", { name: t("auth.loginButton") })).toBeInTheDocument();
});

test("AuthScreen renders an email input in login mode", () => {
  render(<AuthScreen />);
  expect(screen.getByLabelText(t("auth.emailLabel"))).toBeInTheDocument();
});
