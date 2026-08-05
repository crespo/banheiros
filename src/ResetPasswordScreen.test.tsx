import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { t } from "./i18n/i18n";
import ResetPasswordScreen from "./ResetPasswordScreen";

test("ResetPasswordScreen renders a new-password input", () => {
  render(<ResetPasswordScreen />);
  expect(screen.getByLabelText(t("auth.newPasswordLabel"))).toBeInTheDocument();
});
