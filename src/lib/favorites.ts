import { supabase } from "./supabase";

export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const { data }: { data: { bathroom_id: string }[] | null } = await supabase
    .from("favorites")
    .select("bathroom_id")
    .eq("user_id", userId);
  return (data ?? []).map((r) => r.bathroom_id);
}

export async function addFavorite(userId: string, bathroomId: string) {
  await supabase.from("favorites").insert({ user_id: userId, bathroom_id: bathroomId });
}

export async function removeFavorite(userId: string, bathroomId: string) {
  await supabase.from("favorites").delete().eq("user_id", userId).eq("bathroom_id", bathroomId);
}
