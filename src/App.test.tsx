import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import App from "./App";
import { t } from "./i18n/i18n";

vi.mock("./lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

test("App renders AuthScreen when there is no session", async () => {
  render(<App />);
  expect(await screen.findByLabelText(t("auth.emailLabel"))).toBeInTheDocument();
});
