import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import ProfileScreen from "./ProfileScreen";
import { supabase } from "./lib/supabase";
import { setLanguage, t } from "./i18n/i18n";

beforeEach(() => {
  setLanguage("pt");
});

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
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
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

test("ProfileScreen renders a checked radio for the loaded language", async () => {
  mockProfileLoad({ username: "raul", language: "en", default_show_username: false });
  render(<ProfileScreen />);
  expect(await screen.findByRole("radio", { name: "EN" })).toBeChecked();
});

test("ProfileScreen activates the loaded profile's language on mount", async () => {
  localStorage.setItem("banheiros_lang", "pt");
  mockProfileLoad({ username: "raul", language: "en", default_show_username: false });
  render(<ProfileScreen />);
  await screen.findByText("@raul");
  expect(localStorage.getItem("banheiros_lang")).toBe("en");
});

test("selecting a language persists it to the profile", async () => {
  mockProfileLoad({ username: "raul", language: "pt", default_show_username: false });
  render(<ProfileScreen />);
  fireEvent.click(await screen.findByRole("radio", { name: "EN" }));
  expect(updateMock).toHaveBeenCalledExactlyOnceWith({ language: "en" });
});

test("clicking logout calls supabase.auth.signOut", async () => {
  mockProfileLoad({ username: "raul", language: "pt", default_show_username: false });
  render(<ProfileScreen />);
  fireEvent.click(await screen.findByRole("button", { name: t("profile.logout") }));
  expect(supabase.auth.signOut).toHaveBeenCalledOnce();
});

test("clicking delete account shows a confirmation prompt", async () => {
  mockProfileLoad({ username: "raul", language: "pt", default_show_username: false });
  render(<ProfileScreen />);
  fireEvent.click(await screen.findByRole("button", { name: t("profile.deleteAccount") }));
  expect(screen.getByText(t("profile.deleteAccountConfirm"))).toBeInTheDocument();
});

test("confirming delete account invokes the delete-account edge function", async () => {
  mockProfileLoad({ username: "raul", language: "pt", default_show_username: false });
  render(<ProfileScreen />);
  fireEvent.click(await screen.findByRole("button", { name: t("profile.deleteAccount") }));
  fireEvent.click(screen.getByRole("button", { name: t("profile.deleteAccountConfirmButton") }));
  expect(supabase.functions.invoke).toHaveBeenCalledExactlyOnceWith("delete-account");
});
