import { useEffect, useState } from "react";
import { t } from "./i18n/i18n";
import { fetchFavoriteIds } from "./lib/favorites";
import { supabase } from "./lib/supabase";

export default function FavoritesScreen() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [bathrooms, setBathrooms] = useState<{ id: string; name: string | null }[]>([]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) fetchFavoriteIds(user.id).then(setFavoriteIds);
    });
  }, []);
  useEffect(() => {
    if (favoriteIds.length === 0) return;
    supabase.from("bathrooms").select().in("id", favoriteIds).then(({ data }) => setBathrooms(data ?? []));
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
        <p key={b.id}>{b.name}</p>
      ))}
    </div>
  );
}
