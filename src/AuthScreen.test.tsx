import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { t } from "./i18n/i18n";
import AuthScreen from "./AuthScreen";
import { supabase } from "./lib/supabase";

vi.mock("./lib/supabase", () => ({
  supabase: { rpc: vi.fn().mockResolvedValue({ data: null, error: null }) },
}));

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

test("signup mode renders a create-account submit button", () => {
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  expect(screen.getByRole("button", { name: t("auth.signupButton") })).toBeInTheDocument();
});

test("signup submit is disabled when the password is shorter than 6 characters", () => {
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  fireEvent.change(screen.getByLabelText(t("auth.passwordLabel")), { target: { value: "12345" } });
  fireEvent.change(screen.getByLabelText(t("auth.confirmPasswordLabel")), { target: { value: "12345" } });
  fireEvent.click(screen.getByRole("checkbox", { name: t("auth.termsAgree") }));
  expect(screen.getByRole("button", { name: t("auth.signupButton") })).toBeDisabled();
});

test("signup submit is disabled when the terms are not accepted", () => {
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  fireEvent.change(screen.getByLabelText(t("auth.passwordLabel")), { target: { value: "123456" } });
  fireEvent.change(screen.getByLabelText(t("auth.confirmPasswordLabel")), { target: { value: "123456" } });
  expect(screen.getByRole("button", { name: t("auth.signupButton") })).toBeDisabled();
});

test("signup submit is disabled when the confirm password does not match", () => {
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  fireEvent.change(screen.getByLabelText(t("auth.passwordLabel")), { target: { value: "123456" } });
  fireEvent.change(screen.getByLabelText(t("auth.confirmPasswordLabel")), { target: { value: "654321" } });
  fireEvent.click(screen.getByRole("checkbox", { name: t("auth.termsAgree") }));
  expect(screen.getByRole("button", { name: t("auth.signupButton") })).toBeDisabled();
});

test("signup submit is enabled when password, confirm, and terms are all valid", () => {
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  fireEvent.change(screen.getByLabelText(t("auth.passwordLabel")), { target: { value: "123456" } });
  fireEvent.change(screen.getByLabelText(t("auth.confirmPasswordLabel")), { target: { value: "123456" } });
  fireEvent.click(screen.getByRole("checkbox", { name: t("auth.termsAgree") }));
  expect(screen.getByRole("button", { name: t("auth.signupButton") })).toBeEnabled();
});

test("entering an email in signup mode calls suggest_username once with that email", () => {
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  fireEvent.change(screen.getByLabelText(t("auth.emailLabel")), { target: { value: "raul@gmail.com" } });
  expect(supabase.rpc).toHaveBeenCalledExactlyOnceWith("suggest_username", { email: "raul@gmail.com" });
});

test("the username field fills with the suggestion returned by suggest_username", async () => {
  vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: "raul", error: null } as never);
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  fireEvent.change(screen.getByLabelText(t("auth.emailLabel")), { target: { value: "raul@gmail.com" } });
  expect(await screen.findByDisplayValue("raul")).toBeInTheDocument();
});

test("manually editing the username stops later email changes from overwriting it", async () => {
  vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: "raul", error: null } as never);
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  fireEvent.change(screen.getByLabelText(t("auth.emailLabel")), { target: { value: "raul@gmail.com" } });
  await screen.findByDisplayValue("raul");

  fireEvent.change(screen.getByLabelText(t("auth.usernameLabel")), { target: { value: "custom" } });

  vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: "newsuggestion", error: null } as never);
  fireEvent.change(screen.getByLabelText(t("auth.emailLabel")), { target: { value: "other@gmail.com" } });

  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(screen.getByLabelText(t("auth.usernameLabel"))).toHaveValue("custom");
  expect(supabase.rpc).toHaveBeenCalledTimes(2);
});

test("editing the username manually checks its availability via is_username_available", () => {
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  fireEvent.change(screen.getByLabelText(t("auth.usernameLabel")), { target: { value: "custom" } });
  expect(supabase.rpc).toHaveBeenCalledExactlyOnceWith("is_username_available", {
    check_username: "custom",
  });
});

test("shows the taken message when the typed username is unavailable", async () => {
  vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: false, error: null } as never);
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  fireEvent.change(screen.getByLabelText(t("auth.usernameLabel")), { target: { value: "taken" } });
  expect(await screen.findByText(t("auth.usernameTaken"))).toBeInTheDocument();
});

test("signup submit is disabled when the typed username is taken", async () => {
  vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: false, error: null } as never);
  render(<AuthScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("auth.createAccountLink") }));
  fireEvent.change(screen.getByLabelText(t("auth.passwordLabel")), { target: { value: "123456" } });
  fireEvent.change(screen.getByLabelText(t("auth.confirmPasswordLabel")), { target: { value: "123456" } });
  fireEvent.click(screen.getByRole("checkbox", { name: t("auth.termsAgree") }));
  fireEvent.change(screen.getByLabelText(t("auth.usernameLabel")), { target: { value: "taken" } });
  await screen.findByText(t("auth.usernameTaken"));
  expect(screen.getByRole("button", { name: t("auth.signupButton") })).toBeDisabled();
});
