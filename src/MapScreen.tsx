import { useState } from "react";
import { t } from "./i18n/i18n";

export default function MapScreen() {
  const [filter, setFilter] = useState("all");
  return (
    <>
      <button aria-pressed={filter === "all" ? "true" : "false"} onClick={() => setFilter("all")}>{t("map.filterAll")}</button>
      <button aria-pressed={filter === "public" ? "true" : "false"} onClick={() => setFilter("public")}>{t("map.filterPublic")}</button>
      <button aria-pressed={filter === "instore" ? "true" : "false"} onClick={() => setFilter("instore")}>{t("map.filterInstore")}</button>
      <button aria-pressed={filter === "paid" ? "true" : "false"} onClick={() => setFilter("paid")}>{t("map.filterPaid")}</button>
    </>
  );
}
