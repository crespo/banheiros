import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { t } from "./i18n/i18n";
import ChooseUsernameScreen from "./ChooseUsernameScreen";

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
