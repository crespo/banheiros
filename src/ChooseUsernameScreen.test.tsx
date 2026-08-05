import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { t } from "./i18n/i18n";
import ChooseUsernameScreen from "./ChooseUsernameScreen";
import { supabase } from "./lib/supabase";

vi.mock("./lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", email: "raul@gmail.com" } } }),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    from: vi.fn(),
  },
}));

test("ChooseUsernameScreen renders a username field", () => {
  render(<ChooseUsernameScreen onCreated={() => {}} />);
  expect(screen.getByLabelText(t("auth.usernameLabel"))).toBeInTheDocument();
});

test("prefills the username field with a suggestion based on the account email", async () => {
  vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: "raul", error: null } as never);
  render(<ChooseUsernameScreen onCreated={() => {}} />);
  expect(await screen.findByDisplayValue("raul")).toBeInTheDocument();
  expect(supabase.rpc).toHaveBeenCalledExactlyOnceWith("suggest_username", { email: "raul@gmail.com" });
});
