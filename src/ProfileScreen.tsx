import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type Profile = { username: string; language: string; default_show_username: boolean };

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
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
    </div>
  );
}
