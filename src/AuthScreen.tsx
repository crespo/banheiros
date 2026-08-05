import { useState } from "react";
import { t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState(false);

  function handleEmailChange(email: string) {
    if (mode === "signup" && !usernameTouched) {
      supabase.rpc("suggest_username", { email }).then(({ data }) => {
        setUsername(data ?? "");
      });
    }
  }

  return (
    <div>
      <label htmlFor="email">{t("auth.emailLabel")}</label>
      <input id="email" type="email" onChange={(e) => handleEmailChange(e.target.value)} />
      {mode === "signup" && (
        <>
          <label htmlFor="username">{t("auth.usernameLabel")}</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsernameTouched(true);
              setUsername(e.target.value);
              supabase.rpc("is_username_available", { check_username: e.target.value }).then(({ data }) => {
                setUsernameTaken(data === false);
              });
            }}
          />
          {usernameTaken && <p>{t("auth.usernameTaken")}</p>}
        </>
      )}
      <label htmlFor="password">{t("auth.passwordLabel")}</label>
      <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {mode === "signup" && (
        <>
          <label htmlFor="confirm">{t("auth.confirmPasswordLabel")}</label>
          <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <label>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            {t("auth.termsAgree")}
          </label>
          <button disabled={password.length < 6 || password !== confirm || !agree || usernameTaken}>
            {t("auth.signupButton")}
          </button>
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
