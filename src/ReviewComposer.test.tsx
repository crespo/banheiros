import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import ReviewComposer from "./ReviewComposer";
import { t } from "./i18n/i18n";

vi.mock("./lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
  },
}));

test("renders a comment textarea", () => {
  render(
    <ReviewComposer
      bathroomId="b1"
      existingReview={null}
      defaultShowUsername={false}
      onCancel={vi.fn()}
      onApproved={vi.fn()}
      onPending={vi.fn()}
    />,
  );

  expect(screen.getByRole("textbox", { name: t("review.commentLabel") })).toBeInTheDocument();
});

test("submit button is disabled when the form opens empty", () => {
  render(
    <ReviewComposer
      bathroomId="b1"
      existingReview={null}
      defaultShowUsername={false}
      onCancel={vi.fn()}
      onApproved={vi.fn()}
      onPending={vi.fn()}
    />,
  );

  expect(screen.getByRole("button", { name: t("review.submit") })).toBeDisabled();
});
