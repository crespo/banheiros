import { t } from "./i18n/i18n";

export default function AuthScreen() {
  return (
    <div>
      <label htmlFor="email">{t("auth.emailLabel")}</label>
      <input id="email" type="email" />
      <button>{t("auth.loginButton")}</button>
    </div>
  );
}
