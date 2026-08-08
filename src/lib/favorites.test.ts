import { expect, test, vi } from "vitest";
import { fetchFavoriteIds } from "./favorites";
import { supabase } from "./supabase";

vi.mock("./supabase", () => ({ supabase: { from: vi.fn() } }));

function mockFavorites(rows: { bathroom_id: string }[]) {
  const eq = vi.fn().mockResolvedValue({ data: rows });
  vi.mocked(supabase.from).mockReturnValue({
    select: () => ({ eq }),
  } as never);
  return eq;
}

test("fetchFavoriteIds returns the array of bathroom IDs the user has favorited", async () => {
  mockFavorites([{ bathroom_id: "b1" }, { bathroom_id: "b2" }]);
  const result = await fetchFavoriteIds("user-1");
  expect(result).toEqual(["b1", "b2"]);
});

test('fetchFavoriteIds filters by eq("user_id", userId)', async () => {
  const eq = mockFavorites([]);
  await fetchFavoriteIds("user-1");
  expect(eq).toHaveBeenCalledWith("user_id", "user-1");
});
