import { useState } from "react";
import { supabase } from "./lib/supabase";
import { t } from "./i18n/i18n";
import Icon from "./Icon";

const CATS = ["accessibility", "lighting", "odor", "maintenance", "cleanliness"] as const;
const CAT_ICON = { accessibility: "accessibility", lighting: "lightbulb", odor: "wind", maintenance: "wrench", cleanliness: "sparkles" } as const;

type Props = {
  bathroomId: string;
  existingReview: { accessibility: number; lighting: number; odor: number; maintenance: number; cleanliness: number; comment: string; show_username: boolean } | null;
  defaultShowUsername: boolean;
  onCancel: () => void;
  onApproved: () => void;
  onPending: () => void;
};

export default function ReviewComposer({ bathroomId, defaultShowUsername, existingReview, onCancel, onApproved, onPending }: Props) {
  const [ratings, setRatings] = useState<Partial<Record<typeof CATS[number], number>>>(
    existingReview ? { accessibility: existingReview.accessibility, lighting: existingReview.lighting, odor: existingReview.odor, maintenance: existingReview.maintenance, cleanliness: existingReview.cleanliness } : {}
  );
  const [comment, setComment] = useState(existingReview ? existingReview.comment : "");
  const [showUsername, setShowUsername] = useState(existingReview ? existingReview.show_username : defaultShowUsername);
  const [rejected, setRejected] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  return (
    <>
      <div className="composer-head">
        <button onClick={onCancel}><Icon name="arrowLeft" />{t("common.back")}</button>
        <h2>{t("review.title")}</h2>
      </div>
      {CATS.map((cat) => (
        <div className="composer-cat" key={cat}>
          <fieldset>
            <legend className="composer-cat-label"><Icon name={CAT_ICON[cat]} />{t(`ratingCat.${cat}`)}</legend>
            <div className="rating-dots pick">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={ratings[cat] === n}
                  aria-label={`${t(`ratingCat.${cat}`)} ${n}`}
                  className={"dot" + (ratings[cat] === n ? " filled" : "")}
                  onClick={() => setRatings((prev) => ({ ...prev, [cat]: n }))}
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      ))}
      <fieldset className="visibility-card">
        <legend>{t("review.usernameVisibility")}</legend>
        <label className="visibility-opt">
          <input type="radio" aria-label={t("review.hideUsername")} checked={!showUsername} onChange={() => setShowUsername(false)} />
          {t("review.hideUsername")}
        </label>
        <label className="visibility-opt">
          <input type="radio" aria-label={t("review.showUsername")} checked={showUsername} onChange={() => setShowUsername(true)} />
          {t("review.showUsername")}
        </label>
      </fieldset>
      <label htmlFor="comment">{t("review.commentLabel")}</label>
      <textarea id="comment" className="input" value={comment} onChange={(e) => setComment(e.target.value)} />
      {rejected && <p className="mod-warning"><Icon name="alertTriangle" />{t("review.moderationWarning")}</p>}
      {submitError && <p>{t("review.submitError")}</p>}
      <button
        className="btn btn-primary btn-block"
        disabled={!CATS.every((cat) => ratings[cat] !== undefined) || comment.trim() === ""}
        onClick={() => supabase.functions.invoke("moderate-submit", { body: { type: "review", bathroom_id: bathroomId, accessibility: ratings.accessibility, lighting: ratings.lighting, odor: ratings.odor, maintenance: ratings.maintenance, cleanliness: ratings.cleanliness, comment, show_username: showUsername } }).then(({ data, error }) => { if (error) setSubmitError(true); else if (data?.verdict === "approved") onApproved(); else if (data?.verdict === "rejected") setRejected(true); else if (data?.verdict === "pending") onPending(); })}
      >{t("review.submit")}</button>
    </>
  );
}
