import * as maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import BathroomDetailSheet from "./BathroomDetailSheet";
import Icon from "./Icon";
import { t } from "./i18n/i18n";
import { categorizeBathroom } from "./lib/bathroomCategory";
import { filterBathrooms } from "./lib/bathroomFilters";
import { bathroomDisplayName } from "./lib/bathroomName";
import { fetchFavoriteIds } from "./lib/favorites";
import { resolveLocationMode } from "./lib/locationMode";
import { COVERAGE_BOUNDS, isWithinCoverage, MACEIO_CENTER } from "./lib/mapCoverage";
import { supabase } from "./lib/supabase";

type Bathroom = { id: string; name: string | null; address: string; kind: string; paid: boolean };

export default function MapScreen({ onAddBathroom }: { onAddBathroom?: () => void } = {}) {
  const [filter, setFilter] = useState("all");
  const [locationMode, setLocationMode] = useState<"precise" | "approximate" | null>(null);
  const [outOfCoverage, setOutOfCoverage] = useState(false);
  const [bathrooms, setBathrooms] = useState<Bathroom[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  useEffect(() => {
    supabase.from("bathrooms").select().eq("status", "approved").then(({ data }: { data: Bathroom[] | null }) => setBathrooms(data ?? []));
  }, []);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) fetchFavoriteIds(user.id).then(setFavoriteIds);
    });
  }, []);
  useEffect(() => {
    mapInstanceRef.current = new maplibregl.Map({
      container: mapRef.current!,
      center: MACEIO_CENTER,
      zoom: 13,
      style: {
        version: 8,
        sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], attribution: "© OpenStreetMap contributors" } },
        layers: [{ id: "osm-tiles", type: "raster", source: "osm" }],
      },
    });
  }, []);
  useEffect(() => {
    if (!query) return;
    const timeout = setTimeout(() => {
      const viewbox = `${COVERAGE_BOUNDS.minLng},${COVERAGE_BOUNDS.maxLat},${COVERAGE_BOUNDS.maxLng},${COVERAGE_BOUNDS.minLat}`;
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=0`)
        .then((res) => res.json())
        .then((results: { lat: string; lon: string }[]) => {
          const first = results[0];
          if (first) mapInstanceRef.current?.setCenter([parseFloat(first.lon), parseFloat(first.lat)]);
        });
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationMode(resolveLocationMode("success"));
        const withinCoverage = isWithinCoverage(pos.coords.latitude, pos.coords.longitude);
        setOutOfCoverage(!withinCoverage);
        if (withinCoverage) mapInstanceRef.current?.setCenter([pos.coords.longitude, pos.coords.latitude]);
      },
      () => setLocationMode(resolveLocationMode("error")),
    );
  }, []);
  return (
    <div className="map-screen">
      <div className="map-topbar">
        <div className="search-row">
          <div className="search-box">
            <Icon name="search" />
            <input placeholder={t("map.searchPlaceholder")} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button className="icon-btn-float" aria-label={t("map.legendTitle")} onClick={() => setLegendOpen(!legendOpen)}><Icon name="filter" /></button>
        </div>
        <div className="chip-row">
          <button className={"chip" + (filter === "all" ? " active" : "")} aria-pressed={filter === "all" ? "true" : "false"} onClick={() => setFilter("all")}>{t("map.filterAll")}</button>
          <button className={"chip" + (filter === "public" ? " active" : "")} aria-pressed={filter === "public" ? "true" : "false"} onClick={() => setFilter("public")}>{t("map.filterPublic")}</button>
          <button className={"chip" + (filter === "instore" ? " active" : "")} aria-pressed={filter === "instore" ? "true" : "false"} onClick={() => setFilter("instore")}>{t("map.filterInstore")}</button>
          <button className={"chip" + (filter === "paid" ? " active" : "")} aria-pressed={filter === "paid" ? "true" : "false"} onClick={() => setFilter("paid")}>{t("map.filterPaid")}</button>
        </div>
      </div>
      <small>Search by Nominatim, © OpenStreetMap contributors</small>
      {legendOpen && (
        <div className="legend-pop">
          <div className="legend-row"><span className="legend-dot tone-accent" />{t("map.legendPublic")}</div>
          <div className="legend-row"><span className="legend-dot tone-accent2" />{t("map.legendInstore")}</div>
          <div className="legend-row"><span className="legend-dot paid" />{t("map.legendPaid")}</div>
          <div className="legend-row"><span className="legend-dot fav" />{t("map.legendFavorite")}</div>
          <div className="legend-row"><span className="legend-dot you" />{t("map.legendYou")}</div>
        </div>
      )}
      <div className="map-canvas-wrap">
        <div className="map-canvas" ref={mapRef} />
      </div>
      {locationMode !== null && (
        <span role="img" aria-label={t("map.legendYou")} className={"user-location" + (locationMode === "approximate" ? " approximate" : "")}>
          {locationMode === "precise" && (
            <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
              <circle className="location-halo user-location-halo" cx="8" cy="8" r="8" />
              <circle className="location-dot user-location-dot" cx="8" cy="8" r="5" />
            </svg>
          )}
        </span>
      )}
      {outOfCoverage && <div role="alert">{t("map.outOfCoverage")}</div>}
      {filterBathrooms(bathrooms, filter).map(b => { const category = categorizeBathroom(b.kind, b.paid); return <button key={b.id} className={`pin--${category.tone}`} aria-pressed={b.id === selectedId ? "true" : "false"} onClick={() => setSelectedId(b.id)}><Icon name={category.icon} />{bathroomDisplayName(b.name, t("bathroom.unnamed"))}{b.paid && <Icon name="dollarSign" />}{favoriteIds.includes(b.id) && <Icon name="star" />}</button>; })}
      <button className="fab" aria-label={t("map.addBathroom")} onClick={onAddBathroom}><Icon name="plus" /></button>
      {selectedId && <BathroomDetailSheet bathroomId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
