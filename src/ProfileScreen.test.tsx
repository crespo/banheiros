import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import ProfileScreen from "./ProfileScreen";
import { supabase } from "./lib/supabase";

function mockProfileRow(row: { username: string; language: string; default_show_username: boolean }) {
  return {
    single: vi.fn().mockResolvedValue({ data: row, error: null }),
  };
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
  vi.mocked(supabase.from).mockReturnValue({
    select: () => ({
      eq: () => mockProfileRow({ username: "raul", language: "pt", default_show_username: false }),
    }),
  } as never);
  render(<ProfileScreen />);
  expect(await screen.findByText("@raul")).toBeInTheDocument();
});

test("ProfileScreen renders the user's email", async () => {
  vi.mocked(supabase.from).mockReturnValue({
    select: () => ({
      eq: () => mockProfileRow({ username: "raul", language: "pt", default_show_username: false }),
    }),
  } as never);
  render(<ProfileScreen />);
  expect(await screen.findByText("raul@gmail.com")).toBeInTheDocument();
});
