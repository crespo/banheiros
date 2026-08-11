import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddPinModal from "./AddPinModal";
import AuthScreen from "./AuthScreen";
import ChooseUsernameScreen from "./ChooseUsernameScreen";
import FavoritesScreen from "./FavoritesScreen";
import MapScreen from "./MapScreen";
import PrivacidadeScreen from "./PrivacidadeScreen";
import ProfileScreen from "./ProfileScreen";
import ResetPasswordScreen from "./ResetPasswordScreen";
import TermosScreen from "./TermosScreen";
import { t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/termos" element={<TermosScreen />} />
        <Route path="/privacidade" element={<PrivacidadeScreen />} />
        <Route path="*" element={<Gated />} />
      </Routes>
    </BrowserRouter>
  );
}

function Gated() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [tab, setTab] = useState<"map" | "favorites" | "profile">("map");
  const [showAddPinModal, setShowAddPinModal] = useState(false);

  function checkSession(session: { user: { id: string } } | null) {
    setHasSession(session !== null);
    if (!session) {
      setProfileExists(null);
      return;
    }
    supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setProfileExists(data !== null));
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => checkSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        return;
      }
      checkSession(session);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  if (passwordRecovery) return <ResetPasswordScreen />;
  if (hasSession === null) return null;
  if (!hasSession) return <AuthScreen />;
  if (profileExists === null) return null;
  if (!profileExists) return <ChooseUsernameScreen onCreated={() => setProfileExists(true)} />;
  return (
    <>
      {tab === "map" && <MapScreen onAddBathroom={() => setShowAddPinModal(true)} />}
      {tab === "favorites" && <FavoritesScreen />}
      {tab === "profile" && <ProfileScreen />}
      {showAddPinModal && <AddPinModal onClose={() => setShowAddPinModal(false)} />}
      <nav>
        <button onClick={() => setTab("map")}>{t("nav.map")}</button>
        <button onClick={() => setTab("favorites")}>{t("nav.favorites")}</button>
        <button onClick={() => setTab("profile")}>{t("nav.profile")}</button>
      </nav>
    </>
  );
}
