import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import ProfileScreen from "./ProfileScreen";
import { supabase } from "./lib/supabase";
import { t } from "./i18n/i18n";

type ProfileRow = { username: string; language: string; default_show_username: boolean };

const updateMock = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

function mockProfileLoad(row: ProfileRow) {
  vi.mocked(supabase.from).mockReturnValue({
    select: () => ({
      eq: () => ({ single: vi.fn().mockResolvedValue({ data: row, error: null }) }),
    }),
    update: updateMock,
  } as never);
}

vi.mock("./lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", email: "raul@gmail.com" } } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(),
  },
}));

test("ProfileScreen renders the username once the profile loads", async () => {
  mockProfileLoad({ username: "raul", language: "pt", default_show_username: false });
  render(<ProfileScreen />);
  expect(await screen.findByText("@raul")).toBeInTheDocument();
});

test("ProfileScreen renders the user's email", async () => {
  mockProfileLoad({ username: "raul", language: "pt", default_show_username: false });
  render(<ProfileScreen />);
  expect(await screen.findByText("raul@gmail.com")).toBeInTheDocument();
});

test("ProfileScreen renders the default-visibility toggle reflecting the loaded state", async () => {
  mockProfileLoad({ username: "raul", language: "pt", default_show_username: true });
  render(<ProfileScreen />);
  expect(await screen.findByRole("checkbox", { name: t("profile.defaultVisibilityLabel") })).toBeChecked();
});

test("toggling the default-visibility switch persists the new value", async () => {
  mockProfileLoad({ username: "raul", language: "pt", default_show_username: false });
  render(<ProfileScreen />);
  const toggle = await screen.findByRole("checkbox", { name: t("profile.defaultVisibilityLabel") });
  fireEvent.click(toggle);
  expect(updateMock).toHaveBeenCalledExactlyOnceWith({ default_show_username: true });
});

test("toggling the default-visibility switch updates its checked state", async () => {
  mockProfileLoad({ username: "raul", language: "pt", default_show_username: false });
  render(<ProfileScreen />);
  const toggle = await screen.findByRole("checkbox", { name: t("profile.defaultVisibilityLabel") });
  fireEvent.click(toggle);
  expect(toggle).toBeChecked();
});
