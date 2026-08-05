import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { t } from "./i18n/i18n";
import ResetPasswordScreen from "./ResetPasswordScreen";
import { supabase } from "./lib/supabase";

vi.mock("./lib/supabase", () => ({
  supabase: {
    auth: {
      updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}));

test("ResetPasswordScreen renders a new-password input", () => {
  render(<ResetPasswordScreen />);
  expect(screen.getByLabelText(t("auth.newPasswordLabel"))).toBeInTheDocument();
});

test("ResetPasswordScreen renders a confirm-password input", () => {
  render(<ResetPasswordScreen />);
  expect(screen.getByLabelText(t("auth.confirmPasswordLabel"))).toBeInTheDocument();
});

test("ResetPasswordScreen renders a submit button", () => {
  render(<ResetPasswordScreen />);
  expect(screen.getByRole("button", { name: t("auth.resetPasswordButton") })).toBeInTheDocument();
});

test("submit is disabled when the new password is shorter than 6 characters", () => {
  render(<ResetPasswordScreen />);
  fireEvent.change(screen.getByLabelText(t("auth.newPasswordLabel")), { target: { value: "12345" } });
  fireEvent.change(screen.getByLabelText(t("auth.confirmPasswordLabel")), { target: { value: "12345" } });
  expect(screen.getByRole("button", { name: t("auth.resetPasswordButton") })).toBeDisabled();
});

test("submit is disabled when the confirm password does not match", () => {
  render(<ResetPasswordScreen />);
  fireEvent.change(screen.getByLabelText(t("auth.newPasswordLabel")), { target: { value: "123456" } });
  fireEvent.change(screen.getByLabelText(t("auth.confirmPasswordLabel")), { target: { value: "654321" } });
  expect(screen.getByRole("button", { name: t("auth.resetPasswordButton") })).toBeDisabled();
});

test("submit is enabled when the new password and confirm match and are long enough", () => {
  render(<ResetPasswordScreen />);
  fireEvent.change(screen.getByLabelText(t("auth.newPasswordLabel")), { target: { value: "123456" } });
  fireEvent.change(screen.getByLabelText(t("auth.confirmPasswordLabel")), { target: { value: "123456" } });
  expect(screen.getByRole("button", { name: t("auth.resetPasswordButton") })).toBeEnabled();
});

test("clicking submit calls supabase.auth.updateUser with the new password", () => {
  render(<ResetPasswordScreen />);
  fireEvent.change(screen.getByLabelText(t("auth.newPasswordLabel")), { target: { value: "123456" } });
  fireEvent.change(screen.getByLabelText(t("auth.confirmPasswordLabel")), { target: { value: "123456" } });
  fireEvent.click(screen.getByRole("button", { name: t("auth.resetPasswordButton") }));
  expect(supabase.auth.updateUser).toHaveBeenCalledExactlyOnceWith({ password: "123456" });
});
