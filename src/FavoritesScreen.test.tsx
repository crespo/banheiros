import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { setLanguage, t } from "./i18n/i18n";
import FavoritesScreen from "./FavoritesScreen";
import { supabase } from "./lib/supabase";

vi.mock("./lib/supabase", () => ({
  supabase: { from: vi.fn(), auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) } },
}));

function mockFavoriteBathrooms(bathrooms: { id: string; name?: string; address?: string }[]) {
  vi.mocked(supabase.from).mockImplementation((table) => {
    if (table === "favorites") return { select: () => ({ eq: () => Promise.resolve({ data: bathrooms.map((b) => ({ bathroom_id: b.id })), error: null }) }) } as never;
    if (table === "bathrooms") return { select: () => ({ in: () => Promise.resolve({ data: bathrooms, error: null }) }) } as never;
    return { select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }) } as never;
  });
}

beforeEach(() => {
  setLanguage("pt");
  mockFavoriteBathrooms([]);
});

test("FavoritesScreen shows empty-state title when user has no favorites", async () => {
  render(<FavoritesScreen />);
  expect(await screen.findByText(t("favorites.emptyTitle"))).toBeInTheDocument();
});

test("shows the favorited bathroom's name", async () => {
  mockFavoriteBathrooms([{ id: "b1", name: "Banheiro Central" }]);
  render(<FavoritesScreen />);
  expect(await screen.findByText("Banheiro Central")).toBeInTheDocument();
});

test("shows the favorited bathroom's address", async () => {
  mockFavoriteBathrooms([{ id: "b1", address: "Rua das Flores, 42" }]);
  render(<FavoritesScreen />);
  expect(await screen.findByText("Rua das Flores, 42")).toBeInTheDocument();
});
