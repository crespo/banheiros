import { useEffect, useState } from "react";
import { dicts, Lang, setLanguage, t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";
import Icon from "./Icon";

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
    setProfile((prev) => (prev ? { ...prev, language: lang } : prev));
    supabase.from("profiles").update({ language: lang }).eq("user_id", userId);
  }

  if (!profile) return null;

  return (
    <div className="screen screen-pad">
      <div className="profile-header">
        <div className="avatar">{profile.username.charAt(0).toUpperCase()}</div>
        <div>
          <p>@{profile.username}</p>
          <p>{email}</p>
        </div>
      </div>
      <div className="settings-row">
        <span className="label">{t("profile.defaultVisibilityLabel")}</span>
        <button
          role="switch"
          aria-checked={profile.default_show_username}
          aria-label={t("profile.defaultVisibilityLabel")}
          className={"switch" + (profile.default_show_username ? " on" : "")}
          onClick={() => toggleDefaultVisibility(!profile.default_show_username)}
        >
          <span className="thumb" />
        </button>
      </div>
      <div className="settings-row">
        <span className="label">{t("profile.languageSection")}</span>
        <div className="seg">
          {Object.keys(dicts).map((lang) => (
            <label key={lang} className="seg-opt">
              <input
                type="radio"
                name="lang"
                checked={profile.language === lang}
                onChange={() => changeLanguage(lang as Lang)}
              />
              {lang.toUpperCase()}
            </label>
          ))}
        </div>
      </div>
      <button className="btn btn-secondary" onClick={logout}><Icon name="logOut" />{t("profile.logout")}</button>
      <button className="btn btn-ghost" onClick={() => setConfirmingDelete(true)}>{t("profile.deleteAccount")}</button>
      {confirmingDelete && (
        <p>
          {t("profile.deleteAccountConfirm")}
          <button className="btn btn-primary" onClick={deleteAccount}>{t("profile.deleteAccountConfirmButton")}</button>
        </p>
      )}
      <a href="/termos">{t("auth.termsLinkText")}</a>
      <a href="/privacidade">{t("auth.privacyLinkText")}</a>
    </div>
  );
}
