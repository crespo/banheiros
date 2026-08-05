import { useEffect, useState } from "react";
import AuthScreen from "./AuthScreen";
import ProfileScreen from "./ProfileScreen";
import ResetPasswordScreen from "./ResetPasswordScreen";
import { supabase } from "./lib/supabase";

export default function App() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(data.session !== null));
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        return;
      }
      setHasSession(session !== null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  if (passwordRecovery) return <ResetPasswordScreen />;
  if (hasSession === null) return null;
  if (!hasSession) return <AuthScreen />;
  return <ProfileScreen />;
}
