import { useEffect, useState } from "react";
import { t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";

type Profile = { username: string; language: string; default_show_username: boolean };

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
        .then(({ data: row }) => setProfile(row));
    });
  }, []);

  function toggleDefaultVisibility(value: boolean) {
    setProfile((prev) => (prev ? { ...prev, default_show_username: value } : prev));
    supabase.from("profiles").update({ default_show_username: value }).eq("user_id", userId);
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
    </div>
  );
}
