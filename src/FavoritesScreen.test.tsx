import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { setLanguage, t } from "./i18n/i18n";
import FavoritesScreen from "./FavoritesScreen";
import { supabase } from "./lib/supabase";

vi.mock("./lib/supabase", () => ({
  supabase: { from: vi.fn(), auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) } },
}));

function mockFavoriteBathrooms(bathrooms: { id: string; name?: string; address?: string; overall?: number; kind?: string; paid?: boolean }[]) {
  vi.mocked(supabase.from).mockImplementation((table) => {
    if (table === "favorites")
      return {
        select: () => ({ eq: () => Promise.resolve({ data: bathrooms.map((b) => ({ bathroom_id: b.id })), error: null }) }),
        insert: vi.fn().mockResolvedValue({}),
        delete: () => ({ eq: () => ({ eq: vi.fn().mockResolvedValue({}) }) }),
      } as never;
    if (table === "bathrooms")
      return {
        select: () => ({
          in: () => Promise.resolve({ data: bathrooms, error: null }),
          eq: () => ({ single: vi.fn().mockResolvedValue({ data: bathrooms[0] ?? null, error: null }) }),
        }),
      } as never;
    if (table === "bathroom_scores")
      return {
        select: () => ({
          in: () => Promise.resolve({ data: bathrooms.filter((b) => b.overall !== undefined).map((b) => ({ bathroom_id: b.id, overall: b.overall })), error: null }),
          eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        }),
      } as never;
    if (table === "reviews")
      return { select: () => ({ eq: () => ({ eq: () => ({ order: vi.fn().mockResolvedValue({ data: [], error: null }), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }) }) } as never;
    if (table === "profiles")
      return { select: () => ({ in: vi.fn().mockResolvedValue({ data: [], error: null }), eq: () => ({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }) } as never;
    if (table === "reports")
      return { insert: vi.fn().mockResolvedValue({ error: null }) } as never;
    return {} as never;
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

test("shows the favorited bathroom's overall score", async () => {
  mockFavoriteBathrooms([{ id: "b1", overall: 4.2 }]);
  render(<FavoritesScreen />);
  expect(await screen.findByText("4.2")).toBeInTheDocument();
});

test("shows the category icon for an instore bathroom", async () => {
  mockFavoriteBathrooms([{ id: "b1", name: "Loja X", kind: "instore", paid: false }]);
  const { container } = render(<FavoritesScreen />);
  await screen.findByText("Loja X");
  expect(container.querySelector('path[d="M3 9 4 4h16l1 5"]')).toBeInTheDocument();
});

test("clicking a card opens BathroomDetailSheet for that bathroom", async () => {
  mockFavoriteBathrooms([{ id: "b1", name: "Banheiro Central", address: "Rua A", kind: "public", paid: false }]);
  render(<FavoritesScreen />);
  fireEvent.click(await screen.findByText("Banheiro Central"));
  expect(await screen.findByRole("button", { name: t("common.close") })).toBeInTheDocument();
});

test("clicking unfavorite removes the card from the list", async () => {
  mockFavoriteBathrooms([{ id: "b1", name: "Banheiro A" }]);
  render(<FavoritesScreen />);
  await screen.findByText("Banheiro A");
  fireEvent.click(screen.getByRole("button", { name: t("bathroom.favorited") }));
  await waitFor(() => expect(screen.queryByText("Banheiro A")).not.toBeInTheDocument());
});

test("clicking unfavorite does not open the detail sheet", async () => {
  mockFavoriteBathrooms([{ id: "b1", name: "Banheiro A" }]);
  render(<FavoritesScreen />);
  await screen.findByText("Banheiro A");
  fireEvent.click(screen.getByRole("button", { name: t("bathroom.favorited") }));
  await screen.findByText(t("favorites.emptyTitle"));
  expect(screen.queryByRole("button", { name: t("common.close") })).not.toBeInTheDocument();
});
