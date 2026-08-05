import { fireEvent, render, screen } from "@testing-library/react";
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

test("AuthScreen renders a password input in login mode", () => {
  render(<AuthScreen />);
  expect(screen.getByLabelText(t("auth.passwordLabel"))).toBeInTheDocument();
});

test("clicking the create-account link switches to signup mode", () => {
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  expect(screen.getByLabelText(t("auth.usernameLabel"))).toBeInTheDocument();
});

test("signup mode renders a confirm-password input", () => {
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  expect(screen.getByLabelText(t("auth.confirmPasswordLabel"))).toBeInTheDocument();
});

test("signup mode renders a terms-agreement checkbox", () => {
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  expect(screen.getByRole("checkbox", { name: t("auth.termsAgree") })).toBeInTheDocument();
});
