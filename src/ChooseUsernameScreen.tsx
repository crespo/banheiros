import { useEffect, useState } from "react";
import { t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";

export default function ChooseUsernameScreen({ onCreated }: { onCreated: () => void }) {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      if (!data.user.email) return;
      supabase.rpc("suggest_username", { email: data.user.email }).then(({ data: suggestion }) => {
        setUsername(suggestion ?? "");
      });
    });
  }, []);

  function submit() {
    supabase
      .from("profiles")
      .insert({ user_id: userId, username })
      .then(({ error }) => {
        if (!error) onCreated();
      });
  }

  return (
    <div>
      <label htmlFor="username">{t("auth.usernameLabel")}</label>
      <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      <button onClick={submit}>{t("auth.continueButton")}</button>
    </div>
  );
}
