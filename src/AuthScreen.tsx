import { useState } from "react";
import { t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";
import { validateUsernameFormat } from "./lib/username";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [usernameAlternative, setUsernameAlternative] = useState<string | null>(null);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const usernameFormatError = usernameTouched ? validateUsernameFormat(username) : null;

  function handleEmailChange(email: string) {
    setEmail(email);
    if (mode === "signup" && !usernameTouched) {
      supabase.rpc("suggest_username", { email }).then(({ data }) => {
        setUsername(data ?? "");
      });
    }
  }

  function submitSignup() {
    supabase.auth.signUp({ email, password, options: { data: { username } } });
  }

  function loginWithGoogle() {
    supabase.auth.signInWithOAuth({ provider: "google" });
  }

  function forgotPassword() {
    supabase.auth.resetPasswordForEmail(email);
    setResetEmailSent(true);
  }

  function resendConfirmation() {
    supabase.auth.resend({ type: "signup", email });
  }

  function submitLogin() {
    supabase.auth.signInWithPassword({ email, password }).then(({ error }) => {
      setEmailNotConfirmed(error?.code === "email_not_confirmed");
    });
  }

  return (
    <div>
      <label htmlFor="email">{t("auth.emailLabel")}</label>
      <input id="email" type="email" value={email} onChange={(e) => handleEmailChange(e.target.value)} />
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
                if (data === false) {
                  supabase.rpc("suggest_username", { email: e.target.value }).then(({ data: alt }) => {
                    setUsernameAlternative(alt ?? null);
                  });
                }
              });
            }}
          />
          {usernameFormatError && <p>{t(usernameFormatError)}</p>}
          {usernameTaken && (
            <p>
              {t("auth.usernameTaken")}
              {usernameAlternative && (
                <button
                  onClick={() => {
                    setUsername(usernameAlternative);
                    setUsernameTaken(false);
                  }}
                >
                  {t("auth.usernameUseSuggestion", { name: usernameAlternative })}
                </button>
              )}
            </p>
          )}
        </>
      )}
      <label htmlFor="password">{t("auth.passwordLabel")}</label>
      <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={loginWithGoogle}>{t("auth.googleButton")}</button>
      {mode === "signup" && (
        <>
          <label htmlFor="confirm">{t("auth.confirmPasswordLabel")}</label>
          <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <label>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            {t("auth.termsAgreePrefix")}
            <a href="/termos" target="_blank" rel="noopener noreferrer">{t("auth.termsLinkText")}</a>
            {t("auth.termsAgreeMiddle")}
            <a href="/privacidade" target="_blank" rel="noopener noreferrer">{t("auth.privacyLinkText")}</a>
          </label>
          <button
            disabled={
              password.length < 6 ||
              password !== confirm ||
              !agree ||
              usernameTaken ||
              Boolean(usernameFormatError)
            }
            onClick={submitSignup}
          >
            {t("auth.signupButton")}
          </button>
          <button onClick={() => setMode("login")}>{t("auth.loginLink")}</button>
        </>
      )}
      {mode === "login" && (
        <>
          <button onClick={submitLogin}>{t("auth.loginButton")}</button>
          <button onClick={forgotPassword}>{t("auth.forgotPassword")}</button>
          {resetEmailSent && <p>{t("auth.resetEmailSent")}</p>}
          {emailNotConfirmed && (
            <p>
              {t("auth.emailNotConfirmed")}
              <button onClick={resendConfirmation}>{t("auth.resendConfirmation")}</button>
            </p>
          )}
          <button onClick={() => setMode("signup")}>{t("auth.createAccountLink")}</button>
        </>
      )}
    </div>
  );
}
