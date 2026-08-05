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
      <button>{t("auth.loginButton")}</button>
      <button onClick={() => setMode("signup")}>{t("auth.createAccountLink")}</button>
    </div>
  );
}
