import { t } from "./i18n/i18n";

export default function AuthScreen() {
  return (
    <div>
      <label htmlFor="email">{t("auth.emailLabel")}</label>
      <input id="email" type="email" />
      <label htmlFor="password">{t("auth.passwordLabel")}</label>
      <input id="password" type="password" />
      <button>{t("auth.loginButton")}</button>
    </div>
  );
}
