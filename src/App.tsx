import { useEffect, useState } from "react";
import AuthScreen from "./AuthScreen";
import ProfileScreen from "./ProfileScreen";
import { supabase } from "./lib/supabase";

export default function App() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(data.session !== null));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(session !== null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  if (hasSession === null) return null;
  if (!hasSession) return <AuthScreen />;
  return <ProfileScreen />;
}
