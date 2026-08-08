import { supabase } from "./supabase";

export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const { data }: { data: { bathroom_id: string }[] | null } = await supabase
    .from("favorites")
    .select("bathroom_id")
    .eq("user_id", userId);
  return (data ?? []).map((r) => r.bathroom_id);
}
