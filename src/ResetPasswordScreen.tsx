import { useState } from "react";
import { t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";
import Icon from "./Icon";

export default function ResetPasswordScreen({ onComplete }: { onComplete?: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function submit() {
    supabase.auth.updateUser({ password }).then(({ error }) => {
      if (error) setError(true);
      else setSuccess(true);
    });
  }

  return (
    <div>
      <label htmlFor="new-password">{t("auth.newPasswordLabel")}</label>
      <div className="pw-field">
        <input id="new-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button
          type="button"
          aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
          onClick={() => setShowPassword(!showPassword)}
        >
          <Icon name={showPassword ? "eyeOff" : "eye"} />
        </button>
      </div>
      <label htmlFor="confirm-password">{t("auth.confirmPasswordLabel")}</label>
      <div className="pw-field">
        <input id="confirm-password" type={showConfirmPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button
          type="button"
          aria-label={showConfirmPassword ? t("auth.hidePassword") : t("auth.showPassword")}
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Icon name={showConfirmPassword ? "eyeOff" : "eye"} />
        </button>
      </div>
      <button disabled={password.length < 6 || password !== confirm} onClick={submit}>
        {t("auth.resetPasswordButton")}
      </button>
      {success && (
        <>
          <p>{t("auth.resetPasswordSuccess")}</p>
          <button onClick={onComplete}>{t("auth.continueButton")}</button>
        </>
      )}
      {error && <p>{t("auth.resetPasswordError")}</p>}
    </div>
  );
}
