import { t } from "./i18n/i18n";

export default function TermosScreen() {
  return (
    <div>
      <h1>{t("auth.termsLinkText")}</h1>
      <p>{t("legal.placeholder")}</p>
      <a href="/">{t("common.back")}</a>
    </div>
  );
}
