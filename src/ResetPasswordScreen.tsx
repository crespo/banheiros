import { useState } from "react";
import { t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function submit() {
    supabase.auth.updateUser({ password });
  }

  return (
    <div>
      <label htmlFor="new-password">{t("auth.newPasswordLabel")}</label>
      <input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <label htmlFor="confirm-password">{t("auth.confirmPasswordLabel")}</label>
      <input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <button disabled={password.length < 6 || password !== confirm} onClick={submit}>
        {t("auth.resetPasswordButton")}
      </button>
    </div>
  );
}
