import { t } from "./i18n/i18n";

export default function ResetPasswordScreen() {
  return (
    <div>
      <label htmlFor="new-password">{t("auth.newPasswordLabel")}</label>
      <input id="new-password" type="password" />
      <label htmlFor="confirm-password">{t("auth.confirmPasswordLabel")}</label>
      <input id="confirm-password" type="password" />
      <button>{t("auth.resetPasswordButton")}</button>
    </div>
  );
}
