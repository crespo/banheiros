import { useEffect, useState } from "react";
import { t } from "./i18n/i18n";
import { fetchFavoriteIds } from "./lib/favorites";
import { supabase } from "./lib/supabase";

export default function FavoritesScreen() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) fetchFavoriteIds(user.id).then(setFavoriteIds);
    });
  }, []);
  return (
    <div>
      <h2>{t("favorites.title")}</h2>
      {favoriteIds.length === 0 && (
        <div>
          <p>{t("favorites.emptyTitle")}</p>
          <p>{t("favorites.emptySubtitle")}</p>
        </div>
      )}
    </div>
  );
}
