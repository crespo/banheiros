import { t } from "./i18n/i18n";

export default function MapScreen() {
  return (
    <>
      <button>{t("map.filterAll")}</button>
      <button>{t("map.filterPublic")}</button>
      <button>{t("map.filterInstore")}</button>
      <button>{t("map.filterPaid")}</button>
    </>
  );
}
