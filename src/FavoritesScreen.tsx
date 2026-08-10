import { useEffect, useState } from "react";
import { t } from "./i18n/i18n";
import { fetchFavoriteIds } from "./lib/favorites";
import { supabase } from "./lib/supabase";

export default function FavoritesScreen() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [bathrooms, setBathrooms] = useState<{ id: string; name: string | null; address: string }[]>([]);
  const [scores, setScores] = useState<{ bathroom_id: string; overall: number }[]>([]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) fetchFavoriteIds(user.id).then(setFavoriteIds);
    });
  }, []);
  useEffect(() => {
    if (favoriteIds.length === 0) return;
    supabase.from("bathrooms").select().in("id", favoriteIds).then(({ data }) => setBathrooms(data ?? []));
    supabase.from("bathroom_scores").select().in("bathroom_id", favoriteIds).then(({ data }) => setScores(data ?? []));
  }, [favoriteIds]);
  return (
    <div>
      <h2>{t("favorites.title")}</h2>
      {favoriteIds.length === 0 && (
        <div>
          <p>{t("favorites.emptyTitle")}</p>
          <p>{t("favorites.emptySubtitle")}</p>
        </div>
      )}
      {bathrooms.map((b) => (
        <div key={b.id}>
          <p>{b.name}</p>
          <p>{b.address}</p>
          <p>{scores.find((s) => s.bathroom_id === b.id)?.overall}</p>
        </div>
      ))}
    </div>
  );
}
