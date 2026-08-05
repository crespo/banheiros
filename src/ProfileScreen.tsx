import { useEffect, useState } from "react";
import { dicts, Lang, setLanguage, t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";

type Profile = { username: string; language: string; default_show_username: boolean };

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email ?? null);
      setUserId(data.user.id);
      supabase
        .from("profiles")
        .select("username, language, default_show_username")
        .eq("user_id", data.user.id)
        .single()
        .then(({ data: row }) => {
          if (!row) return;
          setProfile(row);
          setLanguage(row.language as Lang);
        });
    });
  }, []);

  function toggleDefaultVisibility(value: boolean) {
    setProfile((prev) => (prev ? { ...prev, default_show_username: value } : prev));
    supabase.from("profiles").update({ default_show_username: value }).eq("user_id", userId);
  }

  function logout() {
    supabase.auth.signOut();
  }

  function deleteAccount() {
    supabase.functions.invoke("delete-account");
  }

  function changeLanguage(lang: Lang) {
    setLanguage(lang);
    supabase.from("profiles").update({ language: lang }).eq("user_id", userId);
  }

  if (!profile) return null;

  return (
    <div>
      <p>@{profile.username}</p>
      <p>{email}</p>
      <label>
        <input
          type="checkbox"
          checked={profile.default_show_username}
          onChange={(e) => toggleDefaultVisibility(e.target.checked)}
        />
        {t("profile.defaultVisibilityLabel")}
      </label>
      {Object.keys(dicts).map((lang) => (
        <label key={lang}>
          <input
            type="radio"
            name="lang"
            checked={profile.language === lang}
            onChange={() => changeLanguage(lang as Lang)}
          />
          {lang.toUpperCase()}
        </label>
      ))}
      <button onClick={logout}>{t("profile.logout")}</button>
      <button onClick={() => setConfirmingDelete(true)}>{t("profile.deleteAccount")}</button>
      {confirmingDelete && (
        <p>
          {t("profile.deleteAccountConfirm")}
          <button onClick={deleteAccount}>{t("profile.deleteAccountConfirmButton")}</button>
        </p>
      )}
    </div>
  );
}
