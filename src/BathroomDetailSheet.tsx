import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { bathroomDisplayName } from "./lib/bathroomName";
import { categorizeBathroom } from "./lib/bathroomCategory";
import { t } from "./i18n/i18n";
import { isOpenNow } from "./lib/bathroomHours";

type Bathroom = { name: string | null; address: string; kind: string; paid: boolean; open_time: string | null; close_time: string };

const CATS = ["accessibility", "lighting", "odor", "maintenance"] as const;

export default function BathroomDetailSheet({ bathroomId }: { bathroomId: string }) {
  const [bathroom, setBathroom] = useState<Bathroom | null>(null);
  const [score, setScore] = useState<{ overall: number } | null>(null);
  useEffect(() => {
    supabase.from("bathrooms").select().eq("id", bathroomId).single().then(({ data }: { data: Bathroom | null }) => setBathroom(data));
  }, [bathroomId]);
  useEffect(() => {
    supabase.from("bathroom_scores").select().eq("bathroom_id", bathroomId).maybeSingle().then(({ data }) => setScore(data));
  }, [bathroomId]);
  if (!bathroom) return null;
  return (
    <>
      <span>{bathroomDisplayName(bathroom.name, t("bathroom.unnamed"))}</span>
      <span>{bathroom.address}</span>
      <span>{t(`category.${categorizeBathroom(bathroom.kind, bathroom.paid).id}`)}</span>
      <span>{bathroom.paid ? t("common.paid") : t("common.free")}</span>
      {!bathroom.open_time && <span>{t("bathroom.hoursUnknown")}</span>}
      {bathroom.open_time && <><span>{`${bathroom.open_time} – ${bathroom.close_time}`}</span>{isOpenNow(bathroom.open_time, bathroom.close_time, new Date()) ? <span>{t("bathroom.openNow")}</span> : <span>{t("bathroom.closedNow")}</span>}</>}
      {score && <span>{score.overall}</span>}
      {CATS.map((cat) => <span key={cat}>{t(`ratingCat.${cat}`)}</span>)}
    </>
  );
}
