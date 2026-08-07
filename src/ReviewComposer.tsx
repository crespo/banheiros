import { t } from "./i18n/i18n";

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
      <label htmlFor="comment">{t("review.commentLabel")}</label>
      <textarea id="comment" />
      <button disabled>{t("review.submit")}</button>
    </>
  );
}
