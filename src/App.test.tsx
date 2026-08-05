import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import App from "./App";
import { t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";

vi.mock("./lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", email: "raul@gmail.com" } } }),
    },
    from: vi.fn().mockReturnValue({
      select: () => ({
        eq: () => ({
          single: vi
            .fn()
            .mockResolvedValue({ data: { username: "raul", language: "pt", default_show_username: false }, error: null }),
        }),
      }),
    }),
  },
}));

test("App renders AuthScreen when there is no session", async () => {
  render(<App />);
  expect(await screen.findByLabelText(t("auth.emailLabel"))).toBeInTheDocument();
});

test("App renders ProfileScreen when there is a session", async () => {
  vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
    data: { session: { user: { id: "u1" } } },
  } as never);
  render(<App />);
  expect(await screen.findByText("@raul")).toBeInTheDocument();
});

test("App renders ResetPasswordScreen when a PASSWORD_RECOVERY event fires", async () => {
  render(<App />);
  await screen.findByLabelText(t("auth.emailLabel"));
  const onAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0][0];
  onAuthStateChange("PASSWORD_RECOVERY", { user: { id: "u1" } } as never);
  expect(await screen.findByLabelText(t("auth.newPasswordLabel"))).toBeInTheDocument();
});
