import { useState } from "react";
import { t } from "./i18n/i18n";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div>
      <label htmlFor="email">{t("auth.emailLabel")}</label>
      <input id="email" type="email" />
      {mode === "signup" && (
        <>
          <label htmlFor="username">{t("auth.usernameLabel")}</label>
          <input id="username" type="text" />
        </>
      )}
      <label htmlFor="password">{t("auth.passwordLabel")}</label>
      <input id="password" type="password" />
      {mode === "signup" && (
        <>
          <label htmlFor="confirm">{t("auth.confirmPasswordLabel")}</label>
          <input id="confirm" type="password" />
          <label>
            <input type="checkbox" />
            {t("auth.termsAgree")}
          </label>
          <button>{t("auth.signupButton")}</button>
        </>
      )}
      {mode === "login" && (
        <>
          <button>{t("auth.loginButton")}</button>
          <button onClick={() => setMode("signup")}>{t("auth.createAccountLink")}</button>
        </>
      )}
    </div>
  );
}
