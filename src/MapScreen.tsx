import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { t } from "./i18n/i18n";
import { categorizeBathroom } from "./lib/bathroomCategory";
import { filterBathrooms } from "./lib/bathroomFilters";
import { bathroomDisplayName } from "./lib/bathroomName";
import { isWithinCoverage } from "./lib/mapCoverage";

type Bathroom = { id: string; name: string | null; address: string; kind: string; paid: boolean };

export default function MapScreen({ bathrooms = [] }: { bathrooms?: Bathroom[] }) {
  const [filter, setFilter] = useState("all");
  const [locationMode, setLocationMode] = useState<"precise" | "approximate" | null>(null);
  const [outOfCoverage, setOutOfCoverage] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    new maplibregl.Map({
      container: mapRef.current!,
      style: {
        version: 8,
        sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"] } },
        layers: [],
      },
    });
  }, []);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationMode("precise");
        setOutOfCoverage(!isWithinCoverage(pos.coords.latitude, pos.coords.longitude));
      },
      () => setLocationMode("approximate"),
    );
  }, []);
  return (
    <>
      <button aria-pressed={filter === "all" ? "true" : "false"} onClick={() => setFilter("all")}>{t("map.filterAll")}</button>
      <button aria-pressed={filter === "public" ? "true" : "false"} onClick={() => setFilter("public")}>{t("map.filterPublic")}</button>
      <button aria-pressed={filter === "instore" ? "true" : "false"} onClick={() => setFilter("instore")}>{t("map.filterInstore")}</button>
      <button aria-pressed={filter === "paid" ? "true" : "false"} onClick={() => setFilter("paid")}>{t("map.filterPaid")}</button>
      <div ref={mapRef} />
      {locationMode !== null && <span role="img" aria-label={t("map.legendYou")}>{locationMode === "precise" && <svg aria-hidden="true"><circle /></svg>}</span>}
      {outOfCoverage && <div role="alert">{t("map.outOfCoverage")}</div>}
      {filterBathrooms(bathrooms, filter).map(b => { const category = categorizeBathroom(b.kind, b.paid); return <button key={b.id}><Icon name={category.icon} />{bathroomDisplayName(b.name, t("bathroom.unnamed"))}{b.paid && <Icon name="dollarSign" />}</button>; })}
    </>
  );
}
