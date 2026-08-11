import { useState } from "react";
import { t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";
import { validateUsernameFormat } from "./lib/username";
import Icon, { GoogleLogo } from "./Icon";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div className="auth-form">
      <div className="field">
        <label htmlFor="email">{t("auth.emailLabel")}</label>
        <input id="email" className="input" type="email" value={email} onChange={(e) => handleEmailChange(e.target.value)} />
      </div>
      {mode === "signup" && (
        <>
          <div className="field">
            <label htmlFor="username">{t("auth.usernameLabel")}</label>
            <input
              id="username"
              className={"input" + (usernameTaken ? " taken" : "")}
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
          </div>
          {usernameFormatError && <p className="field-note warn">{t(usernameFormatError)}</p>}
          {usernameTaken && (
            <p className="field-note warn">
              {t("auth.usernameTaken")}
              {usernameAlternative && (
                <button
                  className="suggest-chip"
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
      <div className="field">
        <label htmlFor="password">{t("auth.passwordLabel")}</label>
        <div className="pw-field">
          <input id="password" className="input" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button
            type="button"
            className="pw-toggle"
            aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
            onClick={() => setShowPassword(!showPassword)}
          >
            <Icon name={showPassword ? "eyeOff" : "eye"} />
          </button>
        </div>
      </div>
      {mode === "signup" && (
        <>
          <div className="field">
            <label htmlFor="confirm">{t("auth.confirmPasswordLabel")}</label>
            <div className="pw-field">
              <input id="confirm" className="input" type={showConfirmPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              <button
                type="button"
                className="pw-toggle"
                aria-label={showConfirmPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon name={showConfirmPassword ? "eyeOff" : "eye"} />
              </button>
            </div>
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>
              {t("auth.termsAgreePrefix")}
              <a href="/termos" target="_blank" rel="noopener noreferrer">{t("auth.termsLinkText")}</a>
              {t("auth.termsAgreeMiddle")}
              <a href="/privacidade" target="_blank" rel="noopener noreferrer">{t("auth.privacyLinkText")}</a>
            </span>
          </label>
          <button
            className="btn btn-primary btn-block"
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
        </>
      )}
      {mode === "login" && (
        <>
          <button className="btn btn-primary btn-block" onClick={submitLogin}>{t("auth.loginButton")}</button>
          <div className="form-links">
            <button className="btn btn-ghost" onClick={forgotPassword}>{t("auth.forgotPassword")}</button>
          </div>
          {resetEmailSent && <p className="field-note">{t("auth.resetEmailSent")}</p>}
          {emailNotConfirmed && (
            <p className="field-note warn">
              {t("auth.emailNotConfirmed")}
              <button onClick={resendConfirmation}>{t("auth.resendConfirmation")}</button>
            </p>
          )}
        </>
      )}
      <div className="divider-row">
        <span className="line" />
        {t("auth.orDivider")}
        <span className="line" />
      </div>
      <button className="btn btn-secondary btn-block" onClick={loginWithGoogle}>
        <GoogleLogo />
        {t("auth.googleButton")}
      </button>
      <p className="switch-mode">
        {mode === "login" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
        <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? t("auth.createAccountLink") : t("auth.loginLink")}
        </button>
      </p>
    </div>
  );
}
