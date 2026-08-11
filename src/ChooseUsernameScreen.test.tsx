import { fireEvent, render, screen } from "@testing-library/react";
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

test("renders a continue button", () => {
  render(<ChooseUsernameScreen onCreated={() => {}} />);
  expect(screen.getByRole("button", { name: t("auth.continueButton") })).toBeInTheDocument();
});

test("clicking continue inserts the profile row and calls onCreated", async () => {
  vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: "raul", error: null } as never);
  const insertMock = vi.fn().mockResolvedValue({ error: null });
  vi.mocked(supabase.from).mockReturnValue({ insert: insertMock } as never);
  const onCreated = vi.fn();
  render(<ChooseUsernameScreen onCreated={onCreated} />);
  await screen.findByDisplayValue("raul");
  fireEvent.click(screen.getByRole("button", { name: t("auth.continueButton") }));
  expect(insertMock).toHaveBeenCalledExactlyOnceWith({ user_id: "u1", username: "raul" });
  await vi.waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
});

test("shows an error message and does not call onCreated when the profile insert fails", async () => {
  vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: "raul", error: null } as never);
  const insertMock = vi.fn().mockResolvedValue({ error: { code: "23514", message: "check constraint violated" } });
  vi.mocked(supabase.from).mockReturnValue({ insert: insertMock } as never);
  const onCreated = vi.fn();
  render(<ChooseUsernameScreen onCreated={onCreated} />);
  await screen.findByDisplayValue("raul");
  fireEvent.click(screen.getByRole("button", { name: t("auth.continueButton") }));
  expect(await screen.findByText(t("auth.chooseUsernameError"))).toBeInTheDocument();
  expect(onCreated).not.toHaveBeenCalled();
});
