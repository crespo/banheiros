import { useEffect, useState } from "react";
import { t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";

export default function ChooseUsernameScreen({ onCreated }: { onCreated: () => void }) {
  void onCreated;
  const [username, setUsername] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user?.email) return;
      supabase.rpc("suggest_username", { email: data.user.email }).then(({ data: suggestion }) => {
        setUsername(suggestion ?? "");
      });
    });
  }, []);

  return (
    <div>
      <label htmlFor="username">{t("auth.usernameLabel")}</label>
      <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
    </div>
  );
}
