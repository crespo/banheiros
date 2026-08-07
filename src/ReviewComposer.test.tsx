import { render, screen, within, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";

const CATS = ["lighting", "odor", "maintenance", "cleanliness"] as const;
import ReviewComposer from "./ReviewComposer";
import { t } from "./i18n/i18n";

vi.mock("./lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
  },
}));

test("renders 3 labeled rating options for the accessibility category", () => {
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

  const group = screen.getByRole("group", { name: t("ratingCat.accessibility") });
  within(group).getByRole("radio", { name: `${t("ratingCat.accessibility")} 1` });
  within(group).getByRole("radio", { name: `${t("ratingCat.accessibility")} 2` });
  within(group).getByRole("radio", { name: `${t("ratingCat.accessibility")} 3` });
});

test.each(CATS)("renders a rating group for the %s category", (cat) => {
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

  expect(screen.getByRole("group", { name: t(`ratingCat.${cat}`) })).toBeInTheDocument();
});

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

test("selecting rating 2 for accessibility deselects rating 1", () => {
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

  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.accessibility")} 1` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.accessibility")} 2` }));

  expect(screen.getByRole("radio", { name: `${t("ratingCat.accessibility")} 1` })).not.toBeChecked();
});

test("submit stays disabled when only 4 of 5 ratings are filled", () => {
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

  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.accessibility")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.lighting")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.odor")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.maintenance")} 2` }));
  fireEvent.change(screen.getByRole("textbox", { name: t("review.commentLabel") }), { target: { value: "bom" } });

  expect(screen.getByRole("button", { name: t("review.submit") })).toBeDisabled();
});

test("submit stays disabled when all 5 ratings are filled but comment is empty", () => {
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

  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.accessibility")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.lighting")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.odor")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.maintenance")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.cleanliness")} 2` }));

  expect(screen.getByRole("button", { name: t("review.submit") })).toBeDisabled();
});

test("submit becomes enabled when all 5 ratings and a non-empty comment are filled", () => {
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

  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.accessibility")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.lighting")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.odor")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.maintenance")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.cleanliness")} 2` }));
  fireEvent.change(screen.getByRole("textbox", { name: t("review.commentLabel") }), { target: { value: "bom" } });

  expect(screen.getByRole("button", { name: t("review.submit") })).toBeEnabled();
});
