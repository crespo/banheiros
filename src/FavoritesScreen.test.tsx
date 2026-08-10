import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { setLanguage, t } from "./i18n/i18n";
import FavoritesScreen from "./FavoritesScreen";
import { supabase } from "./lib/supabase";

vi.mock("./lib/supabase", () => ({
  supabase: { from: vi.fn(), auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) } },
}));

beforeEach(() => {
  setLanguage("pt");
  vi.mocked(supabase.from).mockImplementation((table) => {
    if (table === "favorites") return { select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) } as never;
    return { select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }) } as never;
  });
});

test("FavoritesScreen shows empty-state title when user has no favorites", async () => {
  render(<FavoritesScreen />);
  expect(await screen.findByText(t("favorites.emptyTitle"))).toBeInTheDocument();
});

test("shows the favorited bathroom's name", async () => {
  vi.mocked(supabase.from).mockImplementation((table) => {
    if (table === "favorites") return { select: () => ({ eq: () => Promise.resolve({ data: [{ bathroom_id: "b1" }], error: null }) }) } as never;
    if (table === "bathrooms") return { select: () => ({ in: () => Promise.resolve({ data: [{ id: "b1", name: "Banheiro Central" }], error: null }) }) } as never;
    return { select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }) } as never;
  });
  render(<FavoritesScreen />);
  expect(await screen.findByText("Banheiro Central")).toBeInTheDocument();
});
