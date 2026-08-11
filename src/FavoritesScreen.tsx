import { useEffect, useState } from "react";
import { t } from "./i18n/i18n";
import { fetchFavoriteIds, removeFavorite } from "./lib/favorites";
import { categorizeBathroom } from "./lib/bathroomCategory";
import { supabase } from "./lib/supabase";
import Icon from "./Icon";
import BathroomDetailSheet from "./BathroomDetailSheet";

export default function FavoritesScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [bathrooms, setBathrooms] = useState<{ id: string; name: string | null; address: string; kind: string; paid: boolean }[]>([]);
  const [scores, setScores] = useState<{ bathroom_id: string; overall: number }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchFavoriteIds(user.id).then(setFavoriteIds);
      }
    });
  }, []);
  useEffect(() => {
    if (favoriteIds.length === 0) return;
    supabase.from("bathrooms").select().in("id", favoriteIds).then(({ data }) => setBathrooms(data ?? []));
    supabase.from("bathroom_scores").select().in("bathroom_id", favoriteIds).then(({ data }) => setScores(data ?? []));
  }, [favoriteIds]);
  return (
    <div className="screen screen-pad">
      <h2>{t("favorites.title")}</h2>
      {favoriteIds.length === 0 && (
        <div>
          <p>{t("favorites.emptyTitle")}</p>
          <p>{t("favorites.emptySubtitle")}</p>
        </div>
      )}
      {bathrooms.map((b) => (
        <div key={b.id} role="button" tabIndex={0} onClick={() => setSelectedId(b.id)} onKeyDown={(e) => { if (e.key === "Enter") setSelectedId(b.id); }}>
          <Icon name={categorizeBathroom(b.kind, b.paid).icon} />
          <p>{b.name}</p>
          <p>{b.address}</p>
          <p>{scores.find((s) => s.bathroom_id === b.id)?.overall}</p>
          <button
            aria-label={t("bathroom.favorited")}
            onClick={(e) => {
              e.stopPropagation();
              if (!userId) return;
              removeFavorite(userId, b.id);
              setFavoriteIds((ids) => ids.filter((id) => id !== b.id));
              setBathrooms((bs) => bs.filter((x) => x.id !== b.id));
            }}
          />
        </div>
      ))}
      {selectedId && <BathroomDetailSheet bathroomId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
