import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type Profile = { username: string; language: string; default_show_username: boolean };

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email ?? null);
      supabase
        .from("profiles")
        .select("username, language, default_show_username")
        .eq("user_id", data.user.id)
        .single()
        .then(({ data: row }) => setProfile(row));
    });
  }, []);

  if (!profile) return null;

  return (
    <div>
      <p>@{profile.username}</p>
      <p>{email}</p>
    </div>
  );
}
