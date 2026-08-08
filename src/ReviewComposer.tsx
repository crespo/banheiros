import { useState } from "react";
import { supabase } from "./lib/supabase";
import { t } from "./i18n/i18n";

const CATS = ["accessibility", "lighting", "odor", "maintenance", "cleanliness"] as const;

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

  return (
    <>
      {CATS.map((cat) => (
        <fieldset key={cat}>
          <legend>{t(`ratingCat.${cat}`)}</legend>
          {[1, 2, 3].map((n) => (
            <input
              key={n}
              type="radio"
              aria-label={`${t(`ratingCat.${cat}`)} ${n}`}
              checked={ratings[cat] === n}
              onChange={() => setRatings((prev) => ({ ...prev, [cat]: n }))}
            />
          ))}
        </fieldset>
      ))}
      <fieldset>
        <legend>{t("review.usernameVisibility")}</legend>
        <input type="radio" aria-label={t("review.hideUsername")} checked={!showUsername} onChange={() => setShowUsername(false)} />
        <input type="radio" aria-label={t("review.showUsername")} checked={showUsername} onChange={() => setShowUsername(true)} />
      </fieldset>
      <label htmlFor="comment">{t("review.commentLabel")}</label>
      <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} />
      {rejected && <p>{t("review.moderationWarning")}</p>}
      <button onClick={onCancel}>{t("common.back")}</button>
      <button
        disabled={!CATS.every((cat) => ratings[cat] !== undefined) || comment.trim() === ""}
        onClick={() => supabase.functions.invoke("moderate-submit", { body: { type: "review", bathroom_id: bathroomId, accessibility: ratings.accessibility, lighting: ratings.lighting, odor: ratings.odor, maintenance: ratings.maintenance, cleanliness: ratings.cleanliness, comment, show_username: showUsername } }).then(({ data }) => { if (data?.verdict === "approved") onApproved(); else if (data?.verdict === "rejected") setRejected(true); else if (data?.verdict === "pending") onPending(); })}
      >{t("review.submit")}</button>
    </>
  );
}
