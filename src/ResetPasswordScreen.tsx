import { t } from "./i18n/i18n";

export default function ResetPasswordScreen() {
  return (
    <div>
      <label htmlFor="new-password">{t("auth.newPasswordLabel")}</label>
      <input id="new-password" type="password" />
    </div>
  );
}
