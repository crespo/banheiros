import { useEffect, useState, Fragment, useRef } from "react";
import { supabase } from "./lib/supabase";
import { shouldCloseOnDrag } from "./lib/shouldCloseOnDrag";
import { bathroomDisplayName } from "./lib/bathroomName";
import { categorizeBathroom } from "./lib/bathroomCategory";
import { t } from "./i18n/i18n";
import { isOpenNow } from "./lib/bathroomHours";
import Icon from "./Icon";
import ReviewComposer from "./ReviewComposer";
import { fetchFavoriteIds } from "./lib/favorites";

type Bathroom = { name: string | null; address: string; kind: string; paid: boolean; open_time: string | null; close_time: string };

const CATS = ["accessibility", "lighting", "odor", "maintenance", "cleanliness"] as const;
const CAT_ICON = { accessibility: "accessibility", lighting: "lightbulb", odor: "wind", maintenance: "wrench", cleanliness: "sparkles" } as const;

export default function BathroomDetailSheet({ bathroomId, onClose }: { bathroomId: string; onClose?: () => void }) {
  const [bathroom, setBathroom] = useState<Bathroom | null>(null);
  const [score, setScore] = useState<({ overall: number } & Partial<Record<typeof CATS[number], number>>) | null>(null);
  const [reviews, setReviews] = useState<{ comment: string; show_username: boolean; user_id: string | null }[]>([]);
  const [profiles, setProfiles] = useState<{ user_id: string; username: string }[]>([]);
  const [view, setView] = useState<"detail" | "review">("detail");
  const [ownReview, setOwnReview] = useState<{ accessibility: number; lighting: number; odor: number; maintenance: number; cleanliness: number; comment: string; show_username: boolean } | null>(null);
  const [defaultShowUsername, setDefaultShowUsername] = useState(false);
  const [approvedBanner, setApprovedBanner] = useState(false);
  const [pendingBanner, setPendingBanner] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportComment, setReportComment] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const dragStartY = useRef(0);
  const dragCurrentY = useRef(0);
  useEffect(() => {
    supabase.from("bathrooms").select().eq("id", bathroomId).single().then(({ data }: { data: Bathroom | null }) => setBathroom(data));
  }, [bathroomId]);
  useEffect(() => {
    supabase.from("bathroom_scores").select().eq("bathroom_id", bathroomId).maybeSingle().then(({ data }) => setScore(data));
  }, [bathroomId, refreshKey]);
  useEffect(() => {
    supabase.from("reviews").select().eq("bathroom_id", bathroomId).eq("status", "approved").order("created_at", { ascending: false }).then(({ data }) => setReviews(data ?? []));
  }, [bathroomId, refreshKey]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("reviews").select().eq("bathroom_id", bathroomId).eq("user_id", data.user.id).maybeSingle().then(({ data: row }) => setOwnReview(row));
      supabase.from("profiles").select("default_show_username").eq("user_id", data.user.id).single().then(({ data: row }) => setDefaultShowUsername(row?.default_show_username ?? false));
    });
  }, [bathroomId]);
  useEffect(() => {
    const ids = reviews.map(r => r.user_id);
    supabase.from("profiles").select("user_id, username").in("user_id", ids).then(({ data }) => setProfiles(data ?? []));
  }, [reviews]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      fetchFavoriteIds(data.user.id).then((ids) => setIsFavorite(ids.includes(bathroomId)));
    });
  }, [bathroomId]);
  function submitReport() {
    supabase.auth.getUser().then(({ data }) => {
      supabase.from("reports").insert({ bathroom_id: bathroomId, user_id: data.user?.id ?? null, comment: reportComment }).then(() => setReportSent(true));
    });
  }
  if (!bathroom) return null;
  if (view === "review") return <ReviewComposer bathroomId={bathroomId} existingReview={ownReview} defaultShowUsername={defaultShowUsername} onCancel={() => setView("detail")} onApproved={() => { setView("detail"); setApprovedBanner(true); setRefreshKey((k) => k + 1); }} onPending={() => { setView("detail"); setPendingBanner(true); }} />;
  return (
    <div className="sheet-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="sheet-handle" onPointerDown={(e) => { dragStartY.current = e.clientY; dragCurrentY.current = e.clientY; }} onPointerMove={(e) => { dragCurrentY.current = e.clientY; }} onPointerUp={() => { if (shouldCloseOnDrag(dragCurrentY.current - dragStartY.current)) onClose?.(); }} />
      <button aria-label={t("common.close")} onClick={() => onClose?.()} />
      <span>{bathroomDisplayName(bathroom.name, t("bathroom.unnamed"))}</span>
      <span>{bathroom.address}</span>
      <span>{t(`category.${categorizeBathroom(bathroom.kind, bathroom.paid).id}`)}</span>
      <span>{bathroom.paid ? t("common.paid") : t("common.free")}</span>
      {!bathroom.open_time && <span>{t("bathroom.hoursUnknown")}</span>}
      {bathroom.open_time && <><span>{`${bathroom.open_time} – ${bathroom.close_time}`}</span>{isOpenNow(bathroom.open_time, bathroom.close_time, new Date()) ? <span>{t("bathroom.openNow")}</span> : <span>{t("bathroom.closedNow")}</span>}</>}
      {score ? <span>{score.overall}</span> : <span>{t("bathroom.noReviews")}</span>}
      {CATS.map((cat) => <span key={cat}>{t(`ratingCat.${cat}`)}<Icon name={CAT_ICON[cat]} />{[1,2,3].map((n) => <span key={n} className={`dot${n <= Math.round(score?.[cat] ?? NaN) ? " filled" : ""}`} />)}</span>)}
      <button aria-pressed={isFavorite ? "true" : "false"} aria-label={t("bathroom.favorite")} onClick={() => setIsFavorite(!isFavorite)} />
      {approvedBanner && <p className="success-banner">{t("review.successMessage")}</p>}
      {pendingBanner && <p>{t("review.pendingMessage")}</p>}
      <button onClick={() => setView("review")}>{t("bathroom.writeReview")}</button>
      {reviews.length === 0 ? <p>{t("bathroom.noReviews")}</p> : reviews.map((r, i) => <Fragment key={i}><p>{r.show_username && r.user_id ? `@${profiles.find(p => p.user_id === r.user_id)?.username}` : t("common.anonymous")}</p><p>{r.comment}</p></Fragment>)}
      {reportSent ? <p className="success-banner">{t("bathroom.reportSuccess")}</p> : reportOpen ? <><textarea value={reportComment} onChange={(e) => setReportComment(e.target.value)} /><button onClick={submitReport}>{t("bathroom.reportSubmit")}</button></> : <button onClick={() => setReportOpen(true)}>{t("bathroom.reportIssue")}</button>}
    </div>
  );
}
