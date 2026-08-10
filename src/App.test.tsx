import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import App from "./App";
import { t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";

vi.mock("maplibre-gl", () => ({ default: { Map: vi.fn() } }));

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
          maybeSingle: vi.fn().mockResolvedValue({ data: { username: "raul" }, error: null }),
          then: (resolve: (v: { data: unknown[]; error: null }) => void) => resolve({ data: [], error: null }),
        }),
      }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

test("App renders AuthScreen when there is no session", async () => {
  render(<App />);
  expect(await screen.findByLabelText(t("auth.emailLabel"))).toBeInTheDocument();
});

test("App renders the Map tab by default when there is a session", async () => {
  vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
    data: { session: { user: { id: "u1" } } },
  } as never);
  render(<App />);
  expect(await screen.findByRole("button", { name: t("nav.map") })).toBeInTheDocument();
});

test("App shows ProfileScreen when the Perfil tab is selected", async () => {
  vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
    data: { session: { user: { id: "u1" } } },
  } as never);
  render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: t("nav.profile") }));
  expect(await screen.findByText("@raul")).toBeInTheDocument();
});

test("App renders ChooseUsernameScreen when a session exists but no profile row does", async () => {
  vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
    data: { session: { user: { id: "u1" } } },
  } as never);
  vi.mocked(supabase.from).mockReturnValueOnce({
    select: () => ({ eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
  } as never);
  render(<App />);
  expect(await screen.findByLabelText(t("auth.usernameLabel"))).toBeInTheDocument();
});

test("App renders ResetPasswordScreen when a PASSWORD_RECOVERY event fires", async () => {
  render(<App />);
  await screen.findByLabelText(t("auth.emailLabel"));
  const onAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange).mock.calls[0][0];
  onAuthStateChange("PASSWORD_RECOVERY", { user: { id: "u1" } } as never);
  expect(await screen.findByLabelText(t("auth.newPasswordLabel"))).toBeInTheDocument();
});
