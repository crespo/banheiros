import { t } from "./i18n/i18n";
import Icon from "./Icon";

export default function TermosScreen() {
  return (
    <div className="app-shell">
      <div className="screen-standalone screen-pad">
        <div className="composer-head">
          <a href="/">
            <Icon name="arrowLeft" />
            {t("common.back")}
          </a>
        </div>
        <div className="card">
          <h1 className="card-title">{t("auth.termsLinkText")}</h1>
          <p className="card-body">{t("legal.placeholder")}</p>
        </div>
      </div>
    </div>
  );
}
