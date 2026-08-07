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
  return (
    <>
      {CATS.map((cat) => (
        <fieldset key={cat}>
          <legend>{t(`ratingCat.${cat}`)}</legend>
          <input type="radio" aria-label={`${t(`ratingCat.${cat}`)} 1`} />
          <input type="radio" aria-label={`${t(`ratingCat.${cat}`)} 2`} />
          <input type="radio" aria-label={`${t(`ratingCat.${cat}`)} 3`} />
        </fieldset>
      ))}
      <label htmlFor="comment">{t("review.commentLabel")}</label>
      <textarea id="comment" />
      <button disabled>{t("review.submit")}</button>
    </>
  );
}
