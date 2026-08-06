import { useState } from "react";
import Icon from "./Icon";
import { t } from "./i18n/i18n";
import { categorizeBathroom } from "./lib/bathroomCategory";
import { filterBathrooms } from "./lib/bathroomFilters";
import { bathroomDisplayName } from "./lib/bathroomName";

type Bathroom = { id: string; name: string | null; address: string; kind: string; paid: boolean };

export default function MapScreen({ bathrooms = [] }: { bathrooms?: Bathroom[] }) {
  const [filter, setFilter] = useState("all");
  return (
    <>
      <button aria-pressed={filter === "all" ? "true" : "false"} onClick={() => setFilter("all")}>{t("map.filterAll")}</button>
      <button aria-pressed={filter === "public" ? "true" : "false"} onClick={() => setFilter("public")}>{t("map.filterPublic")}</button>
      <button aria-pressed={filter === "instore" ? "true" : "false"} onClick={() => setFilter("instore")}>{t("map.filterInstore")}</button>
      <button aria-pressed={filter === "paid" ? "true" : "false"} onClick={() => setFilter("paid")}>{t("map.filterPaid")}</button>
      {filterBathrooms(bathrooms, filter).map(b => { const category = categorizeBathroom(b.kind, b.paid); return <button key={b.id}><Icon name={category.icon} />{bathroomDisplayName(b.name, t("bathroom.unnamed"))}{b.paid && <Icon name="dollarSign" />}</button>; })}
    </>
  );
}
