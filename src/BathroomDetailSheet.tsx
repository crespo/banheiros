import { useEffect, useState, useRef } from "react";
import { supabase } from "./lib/supabase";
import { shouldCloseOnDrag } from "./lib/shouldCloseOnDrag";
import { bathroomDisplayName } from "./lib/bathroomName";
import { categorizeBathroom } from "./lib/bathroomCategory";
import { t } from "./i18n/i18n";
import { isOpenNow } from "./lib/bathroomHours";
import Icon from "./Icon";
import ReviewComposer from "./ReviewComposer";
import { fetchFavoriteIds, addFavorite, removeFavorite } from "./lib/favorites";

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
  const [userId, setUserId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
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
      setUserId(data.user.id);
      fetchFavoriteIds(data.user.id).then((ids) => setIsFavorite(ids.includes(bathroomId)));
    });
  }, [bathroomId]);
  function submitReport() {
    supabase.auth.getUser().then(({ data }) => {
      supabase.from("reports").insert({ bathroom_id: bathroomId, user_id: data.user?.id ?? null, comment: reportComment }).then(() => setReportSent(true));
    });
  }
  function handleFavoriteClick() {
    if (!userId) return;
    const prev = isFavorite;
    if (!isFavorite) addFavorite(userId, bathroomId).catch(() => setIsFavorite(prev));
    else removeFavorite(userId, bathroomId).catch(() => setIsFavorite(prev));
    setIsFavorite(!isFavorite);
  }
  if (!bathroom) return null;
  if (view === "review") return <ReviewComposer bathroomId={bathroomId} existingReview={ownReview} defaultShowUsername={defaultShowUsername} onCancel={() => setView("detail")} onApproved={() => { setView("detail"); setApprovedBanner(true); setRefreshKey((k) => k + 1); }} onPending={() => { setView("detail"); setPendingBanner(true); }} />;
  const category = categorizeBathroom(bathroom.kind, bathroom.paid);
  return (
    <div className="sheet-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={"sheet" + (dragging ? " dragging" : "")}>
        <div className="sheet-handle-area">
          <div
            className="sheet-handle"
            onPointerDown={(e) => { setDragging(true); dragStartY.current = e.clientY; dragCurrentY.current = e.clientY; }}
            onPointerMove={(e) => { dragCurrentY.current = e.clientY; }}
            onPointerUp={() => { setDragging(false); if (shouldCloseOnDrag(dragCurrentY.current - dragStartY.current)) onClose?.(); }}
          />
        </div>
        <div className="sheet-header">
          <button className="sheet-close" aria-label={t("common.close")} onClick={() => onClose?.()}><Icon name="x" /></button>
        </div>
        <div className="sheet-body">
          <div className="bh-title-row">
            <div className="bh-tags">
              <span className={`tag tag-${category.tone}`}>{t(`category.${category.id}`)}</span>
              <span className="tag tag-neutral">{bathroom.paid ? t("common.paid") : t("common.free")}</span>
            </div>
            <h2 className="bh-name">{bathroomDisplayName(bathroom.name, t("bathroom.unnamed"))}</h2>
          </div>
          <div className="info-row">
            <Icon name="mapPin" />
            <span>{bathroom.address}</span>
          </div>
          {!bathroom.open_time && (
            <div className="info-row">
              <Icon name="clock" />
              <span>{t("bathroom.hoursUnknown")}</span>
            </div>
          )}
          {bathroom.open_time && (
            <div className="info-row">
              <Icon name="clock" />
              <span>{`${bathroom.open_time} – ${bathroom.close_time}`}</span>
              {isOpenNow(bathroom.open_time, bathroom.close_time, new Date())
                ? <span className="status-pill open">{t("bathroom.openNow")}</span>
                : <span className="status-pill closed">{t("bathroom.closedNow")}</span>}
            </div>
          )}
          <div className="overall-card">
            {score ? <span className="overall-num">{score.overall}</span> : <span>{t("bathroom.noReviews")}</span>}
          </div>
          <div className="cat-rows">
            {CATS.map((cat) => (
              <div className="cat-row" key={cat}>
                <Icon name={CAT_ICON[cat]} />
                <span className="cat-label">{t(`ratingCat.${cat}`)}</span>
                <span className="rating-dots">
                  {[1, 2, 3].map((n) => <span key={n} className={`dot${n <= Math.round(score?.[cat] ?? NaN) ? " filled" : ""}`} />)}
                </span>
              </div>
            ))}
          </div>
          <div className="actions-row">
            <button className={"star-btn" + (isFavorite ? " active" : "")} aria-pressed={isFavorite ? "true" : "false"} aria-label={t("bathroom.favorite")} onClick={handleFavoriteClick} />
            <button className="btn btn-primary" onClick={() => setView("review")}>{t("bathroom.writeReview")}</button>
          </div>
          {approvedBanner && <p className="success-banner"><Icon name="check" />{t("review.successMessage")}</p>}
          {pendingBanner && <p>{t("review.pendingMessage")}</p>}
          <h4 className="section-title">{t("bathroom.reviewsTitle")}</h4>
          {reviews.length === 0
            ? <p className="empty-note">{t("bathroom.noReviews")}</p>
            : reviews.map((r, i) => (
                <div className="review-card" key={i}>
                  <div className="review-top">
                    <span className="review-author">{r.show_username && r.user_id ? `@${profiles.find(p => p.user_id === r.user_id)?.username}` : t("common.anonymous")}</span>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                </div>
              ))}
          {reportSent
            ? <p className="success-banner"><Icon name="check" />{t("bathroom.reportSuccess")}</p>
            : reportOpen
              ? <><textarea className="input" value={reportComment} onChange={(e) => setReportComment(e.target.value)} /><button className="btn btn-primary" onClick={submitReport}>{t("bathroom.reportSubmit")}</button></>
              : <button className="report-link" onClick={() => setReportOpen(true)}><Icon name="flag" />{t("bathroom.reportIssue")}</button>}
        </div>
      </div>
    </div>
  );
}
