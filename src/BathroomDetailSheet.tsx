import { useEffect, useState, Fragment } from "react";
import { supabase } from "./lib/supabase";
import { bathroomDisplayName } from "./lib/bathroomName";
import { categorizeBathroom } from "./lib/bathroomCategory";
import { t } from "./i18n/i18n";
import { isOpenNow } from "./lib/bathroomHours";
import Icon from "./Icon";

type Bathroom = { name: string | null; address: string; kind: string; paid: boolean; open_time: string | null; close_time: string };

const CATS = ["accessibility", "lighting", "odor", "maintenance", "cleanliness"] as const;
const CAT_ICON = { accessibility: "accessibility", lighting: "lightbulb", odor: "wind", maintenance: "wrench", cleanliness: "sparkles" } as const;

export default function BathroomDetailSheet({ bathroomId, onClose }: { bathroomId: string; onClose?: () => void }) {
  const [bathroom, setBathroom] = useState<Bathroom | null>(null);
  const [score, setScore] = useState<({ overall: number } & Partial<Record<typeof CATS[number], number>>) | null>(null);
  const [reviews, setReviews] = useState<{ comment: string; show_username: boolean; user_id: string | null }[]>([]);
  const [profiles, setProfiles] = useState<{ user_id: string; username: string }[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  useEffect(() => {
    supabase.from("bathrooms").select().eq("id", bathroomId).single().then(({ data }: { data: Bathroom | null }) => setBathroom(data));
  }, [bathroomId]);
  useEffect(() => {
    supabase.from("bathroom_scores").select().eq("bathroom_id", bathroomId).maybeSingle().then(({ data }) => setScore(data));
  }, [bathroomId]);
  useEffect(() => {
    supabase.from("reviews").select().eq("bathroom_id", bathroomId).eq("status", "approved").order("created_at", { ascending: false }).then(({ data }) => setReviews(data ?? []));
  }, [bathroomId]);
  useEffect(() => {
    const ids = reviews.map(r => r.user_id);
    supabase.from("profiles").select("user_id, username").in("user_id", ids).then(({ data }) => setProfiles(data ?? []));
  }, [reviews]);
  if (!bathroom) return null;
  return (
    <div className="sheet-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <button aria-label={t("common.close")} onClick={() => onClose?.()} />
      <span>{bathroomDisplayName(bathroom.name, t("bathroom.unnamed"))}</span>
      <span>{bathroom.address}</span>
      <span>{t(`category.${categorizeBathroom(bathroom.kind, bathroom.paid).id}`)}</span>
      <span>{bathroom.paid ? t("common.paid") : t("common.free")}</span>
      {!bathroom.open_time && <span>{t("bathroom.hoursUnknown")}</span>}
      {bathroom.open_time && <><span>{`${bathroom.open_time} – ${bathroom.close_time}`}</span>{isOpenNow(bathroom.open_time, bathroom.close_time, new Date()) ? <span>{t("bathroom.openNow")}</span> : <span>{t("bathroom.closedNow")}</span>}</>}
      {score ? <span>{score.overall}</span> : <span>{t("bathroom.noReviews")}</span>}
      {CATS.map((cat) => <span key={cat}>{t(`ratingCat.${cat}`)}<Icon name={CAT_ICON[cat]} />{[1,2,3].map((n) => <span key={n} className={`dot${n <= Math.round(score?.[cat] ?? NaN) ? " filled" : ""}`} />)}</span>)}
      {reviews.length === 0 ? <p>{t("bathroom.noReviews")}</p> : reviews.map((r, i) => <Fragment key={i}><p>{r.show_username && r.user_id ? `@${profiles.find(p => p.user_id === r.user_id)?.username}` : t("common.anonymous")}</p><p>{r.comment}</p></Fragment>)}
      {reportOpen ? <><textarea /><button>{t("bathroom.reportSubmit")}</button></> : <button onClick={() => setReportOpen(true)}>{t("bathroom.reportIssue")}</button>}
    </div>
  );
}
