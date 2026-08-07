import { useState } from "react";
import { t } from "./i18n/i18n";

const CATS = ["accessibility", "lighting", "odor", "maintenance", "cleanliness"] as const;

type Props = {
  bathroomId: string;
  existingReview: null;
  defaultShowUsername: boolean;
  onCancel: () => void;
  onApproved: () => void;
  onPending: () => void;
};

export default function ReviewComposer(_props: Props) {
  const [ratings, setRatings] = useState<Partial<Record<typeof CATS[number], number>>>({});
  const [comment, setComment] = useState("");

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
              onChange={() => setRatings((prev) => ({ ...prev, [cat]: n }))}
            />
          ))}
        </fieldset>
      ))}
      <label htmlFor="comment">{t("review.commentLabel")}</label>
      <textarea id="comment" onChange={(e) => setComment(e.target.value)} />
      <button disabled={!CATS.every((cat) => ratings[cat] !== undefined) || comment.trim() === ""}>{t("review.submit")}</button>
    </>
  );
}
