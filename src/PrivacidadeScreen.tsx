import { t } from "./i18n/i18n";

export default function PrivacidadeScreen() {
  return (
    <div>
      <h1>{t("auth.privacyLinkText")}</h1>
      <p>{t("legal.placeholder")}</p>
      <a href="/">{t("common.back")}</a>
    </div>
  );
}
