import { render, screen, fireEvent, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import BathroomDetailSheet from "./BathroomDetailSheet";
import { supabase } from "./lib/supabase";
import { t } from "./i18n/i18n";

vi.mock("./lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
  },
}));

function mockSupabase(bathroomData: object | null, scoreData: object | null = null, reviewsData: object[] | null = null, profilesData: object[] | null = null, ownReviewData: object | null = null, profileDefaultData: object | null = null) {
  const single = vi.fn().mockResolvedValue({ data: bathroomData, error: null });
  const maybeSingle = vi.fn().mockResolvedValue({ data: scoreData, error: null });
  const ownReviewMaybeSingle = vi.fn().mockResolvedValue({ data: ownReviewData, error: null });
  const order = vi.fn().mockResolvedValue({ data: reviewsData, error: null });
  const inFn = vi.fn().mockResolvedValue({ data: profilesData, error: null });
  const profileDefaultSingle = vi.fn().mockResolvedValue({ data: profileDefaultData, error: null });
  const insert = vi.fn().mockResolvedValue({ error: null });
  // dispatch by table name: each table can have its own query shapes without colliding
  // with the same terminal method (.single/.maybeSingle) used by another table's query
  vi.mocked(supabase.from).mockImplementation((table: string) => {
    if (table === "bathrooms") return { select: () => ({ eq: () => ({ single }) }) } as never;
    if (table === "bathroom_scores") return { select: () => ({ eq: () => ({ maybeSingle }) }) } as never;
    if (table === "reviews") return { select: () => ({ eq: () => ({ eq: () => ({ order, maybeSingle: ownReviewMaybeSingle }) }) }) } as never;
    if (table === "profiles") return { select: () => ({ in: inFn, eq: () => ({ single: profileDefaultSingle }) }) } as never;
    if (table === "reports") return { insert } as never;
    return {} as never;
  });
  return { single, maybeSingle, ownReviewMaybeSingle, order, in: inFn, profileDefaultSingle, insert };
}

test("renders the bathroom's address once the query resolves", async () => {
  mockSupabase({ id: "b1", address: "Rua das Flores, 42" });

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText("Rua das Flores, 42")).toBeInTheDocument();
});

test("falls back to translated label when bathroom name is null", async () => {
  mockSupabase({ name: null });

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("bathroom.unnamed"))).toBeInTheDocument();
});

test("renders the category tag for a public, unpaid bathroom", async () => {
  mockSupabase({ kind: "public", paid: false });

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("category.public"))).toBeInTheDocument();
});

test("renders the paid tag when the bathroom is paid", async () => {
  mockSupabase({ paid: true });

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("common.paid"))).toBeInTheDocument();
});

test("renders the free tag when the bathroom is not paid", async () => {
  mockSupabase({ paid: false });

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("common.free"))).toBeInTheDocument();
});

test("shows unknown hours label when open_time is null", async () => {
  mockSupabase({ open_time: null });

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("bathroom.hoursUnknown"))).toBeInTheDocument();
});

test("renders the formatted time range when open_time and close_time are both present", async () => {
  mockSupabase({ open_time: "06:00", close_time: "22:00" });

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText("06:00 – 22:00")).toBeInTheDocument();
});

test("renders open-now pill when isOpenNow resolves true", async () => {
  mockSupabase({ open_time: "22:00", close_time: "06:00" });

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("bathroom.openNow"))).toBeInTheDocument();
});

test("renders the overall score from bathroom_scores", async () => {
  mockSupabase({}, { overall: 4.2 });

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText("4.2")).toBeInTheDocument();
});

test("renders the accessibility criterion label", async () => {
  mockSupabase({}, {});

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("ratingCat.accessibility"))).toBeInTheDocument();
});

test("renders the lighting criterion label", async () => {
  mockSupabase({}, {});

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("ratingCat.lighting"))).toBeInTheDocument();
});

test("renders the odor criterion label", async () => {
  mockSupabase({}, {});

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("ratingCat.odor"))).toBeInTheDocument();
});

test("renders the maintenance criterion label", async () => {
  mockSupabase({}, {});

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("ratingCat.maintenance"))).toBeInTheDocument();
});

test("renders the cleanliness criterion label", async () => {
  mockSupabase({}, {});

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("ratingCat.cleanliness"))).toBeInTheDocument();
});

test("renders 2 filled dots when accessibility score is 2", async () => {
  mockSupabase({}, { accessibility: 2 });

  const { container } = render(<BathroomDetailSheet bathroomId="b1" />);

  await screen.findByText(t("ratingCat.accessibility"));

  expect(container.querySelectorAll('.dot.filled')).toHaveLength(2);
});

test("rounds the score to determine filled dot count", async () => {
  mockSupabase({}, { accessibility: 2.6 });

  const { container } = render(<BathroomDetailSheet bathroomId="b1" />);

  await screen.findByText(t("ratingCat.accessibility"));

  expect(container.querySelectorAll('.dot.filled')).toHaveLength(3);
});

test("shows the no-reviews empty state when bathroom_scores returns no row", async () => {
  mockSupabase({}, null, [{ comment: "Bom banheiro" }]);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("bathroom.noReviews"))).toBeInTheDocument();
});

test("renders the accessibility icon", async () => {
  mockSupabase({}, {});
  const { container } = render(<BathroomDetailSheet bathroomId="b1" />);
  await screen.findByText(t("ratingCat.accessibility"));
  expect(container.querySelector('circle[cx="16"][cy="4"][r="1"]')).toBeInTheDocument();
});

test("renders the lighting icon", async () => {
  mockSupabase({}, {});
  const { container } = render(<BathroomDetailSheet bathroomId="b1" />);
  await screen.findByText(t("ratingCat.lighting"));
  expect(container.querySelector('path[d^="M9 18h6"]')).toBeInTheDocument();
});

test("renders the odor icon", async () => {
  mockSupabase({}, {});
  const { container } = render(<BathroomDetailSheet bathroomId="b1" />);
  await screen.findByText(t("ratingCat.odor"));
  expect(container.querySelector('path[d^="M9.8 4.4"]')).toBeInTheDocument();
});

test("renders the maintenance icon", async () => {
  mockSupabase({}, {});
  const { container } = render(<BathroomDetailSheet bathroomId="b1" />);
  await screen.findByText(t("ratingCat.maintenance"));
  expect(container.querySelector('path[d^="M14.7 6.3"]')).toBeInTheDocument();
});

test("renders the cleanliness icon", async () => {
  mockSupabase({}, {});
  const { container } = render(<BathroomDetailSheet bathroomId="b1" />);
  await screen.findByText(t("ratingCat.cleanliness"));
  expect(container.querySelector('path[d^="M9.937 15.5"]')).toBeInTheDocument();
});

describe("closed-now pill", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2025-01-15T23:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders closed-now pill when current time is outside the open window", async () => {
    mockSupabase({ open_time: "06:00", close_time: "22:00" });

    render(<BathroomDetailSheet bathroomId="b1" />);

    expect(await screen.findByText(t("bathroom.closedNow"))).toBeInTheDocument();
  });
});

test("renders one approved review's comment", async () => {
  mockSupabase({}, null, [{ comment: "Bom banheiro" }]);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText("Bom banheiro")).toBeInTheDocument();
});

test("shows the no-reviews message in the list area when there are no reviews", async () => {
  mockSupabase({}, { overall: 4.5 }, []);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("bathroom.noReviews"))).toBeInTheDocument();
});

test("renders anonymous author when show_username is false", async () => {
  mockSupabase({}, null, [{ comment: "Clean place", show_username: false, user_id: "u1" }]);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("common.anonymous"))).toBeInTheDocument();
});

test("renders @username when show_username is true", async () => {
  mockSupabase({}, null, [{ comment: "Clean", show_username: true, user_id: "u1" }], [{ user_id: "u1", username: "alice" }]);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText("@alice")).toBeInTheDocument();
});

test("renders anonymous author when user_id is null despite show_username true", async () => {
  mockSupabase({}, null, [{ comment: "x", show_username: true, user_id: null }], []);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("common.anonymous"))).toBeInTheDocument();
});

test("orders reviews by created_at descending", async () => {
  const { order } = mockSupabase({}, null, []);

  render(<BathroomDetailSheet bathroomId="b1" />);

  await screen.findByText(t("bathroom.unnamed"));

  expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
});

test("calls onClose when the backdrop is clicked", async () => {
  mockSupabase({ address: "x" });
  const onClose = vi.fn();
  const { container } = render(<BathroomDetailSheet bathroomId="b1" onClose={onClose} />);
  await screen.findByText("x");
  fireEvent.click(container.querySelector('.sheet-backdrop')!);
  expect(onClose).toHaveBeenCalledOnce();
});

test("calls onClose when the X button is clicked", async () => {
  const onClose = vi.fn();
  mockSupabase({ id: "b1" });

  render(<BathroomDetailSheet bathroomId="b1" onClose={onClose} />);

  await screen.findByText(t("bathroom.unnamed"));
  fireEvent.click(screen.getByRole("button", { name: t("common.close") }));

  expect(onClose).toHaveBeenCalledOnce();
});

test("does not call onClose when a child element is clicked", async () => {
  mockSupabase({ address: "Rua das Flores, 42" });
  const onClose = vi.fn();
  render(<BathroomDetailSheet bathroomId="b1" onClose={onClose} />);
  await screen.findByText("Rua das Flores, 42");
  fireEvent.click(screen.getByText("Rua das Flores, 42"));
  expect(onClose).not.toHaveBeenCalled();
});

test("calls onClose when handle is dragged past 110px threshold", async () => {
  mockSupabase({ address: "x" });
  const onClose = vi.fn();
  const { container } = render(<BathroomDetailSheet bathroomId="b1" onClose={onClose} />);
  await screen.findByText("x");
  const handle = container.querySelector('.sheet-handle')!;
  fireEvent.pointerDown(handle, { clientY: 0 });
  fireEvent.pointerMove(handle, { clientY: 111 });
  fireEvent.pointerUp(handle);
  expect(onClose).toHaveBeenCalledOnce();
});

test("does not call onClose when drag crosses threshold transiently but releases below it", async () => {
  mockSupabase({ address: "x" });
  const onClose = vi.fn();
  const { container } = render(<BathroomDetailSheet bathroomId="b1" onClose={onClose} />);
  await screen.findByText("x");
  const handle = container.querySelector('.sheet-handle')!;
  fireEvent.pointerDown(handle, { clientY: 0 });
  fireEvent.pointerMove(handle, { clientY: 120 });
  fireEvent.pointerMove(handle, { clientY: 50 });
  fireEvent.pointerUp(handle, { clientY: 50 });
  expect(onClose).not.toHaveBeenCalled();
});

test("does not close on a tap that follows an earlier sub-threshold drag", async () => {
  mockSupabase({ address: "x" });
  const onClose = vi.fn();
  const { container } = render(<BathroomDetailSheet bathroomId="b1" onClose={onClose} />);
  await screen.findByText("x");
  const handle = container.querySelector('.sheet-handle')!;
  fireEvent.pointerDown(handle, { clientY: 100 });
  fireEvent.pointerMove(handle, { clientY: 150 });
  fireEvent.pointerUp(handle);
  onClose.mockClear();
  fireEvent.pointerDown(handle, { clientY: 30 });
  fireEvent.pointerUp(handle);
  expect(onClose).not.toHaveBeenCalled();
});

test("clicking write-review switches the sheet to ReviewComposer view", async () => {
  mockSupabase({});

  render(<BathroomDetailSheet bathroomId="b1" />);
  fireEvent.click(await screen.findByRole("button", { name: t("bathroom.writeReview") }));

  expect(screen.getByRole("button", { name: t("review.submit") })).toBeInTheDocument();
});

test("clicking the composer's back button returns the sheet to the detail view", async () => {
  mockSupabase({ address: "Rua das Flores, 42" });

  render(<BathroomDetailSheet bathroomId="b1" />);
  fireEvent.click(await screen.findByRole("button", { name: t("bathroom.writeReview") }));
  fireEvent.click(screen.getByRole("button", { name: t("common.back") }));

  expect(await screen.findByText("Rua das Flores, 42")).toBeInTheDocument();
});

test("renders a disabled favorite placeholder button", async () => {
  mockSupabase({});

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByRole("button", { name: t("bathroom.favorite") })).toBeDisabled();
});

test("renders a report-issue button", async () => {
  mockSupabase({});

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByRole("button", { name: t("bathroom.reportIssue") })).toBeInTheDocument();
});

test("clicking the report-issue button reveals a comment field", async () => {
  mockSupabase({});

  render(<BathroomDetailSheet bathroomId="b1" />);
  fireEvent.click(await screen.findByRole("button", { name: t("bathroom.reportIssue") }));

  expect(screen.getByRole("textbox")).toBeInTheDocument();
});

test("clicking the report-issue button reveals a submit button", async () => {
  mockSupabase({});

  render(<BathroomDetailSheet bathroomId="b1" />);
  fireEvent.click(await screen.findByRole("button", { name: t("bathroom.reportIssue") }));

  expect(screen.getByRole("button", { name: t("bathroom.reportSubmit") })).toBeInTheDocument();
});

test("submitting the report inserts into reports with bathroom_id, user_id and comment", async () => {
  const { insert } = mockSupabase({});

  render(<BathroomDetailSheet bathroomId="b1" />);
  fireEvent.click(await screen.findByRole("button", { name: t("bathroom.reportIssue") }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Sem papel" } });
  fireEvent.click(screen.getByRole("button", { name: t("bathroom.reportSubmit") }));

  await vi.waitFor(() => expect(insert).toHaveBeenCalledExactlyOnceWith({ bathroom_id: "b1", user_id: "u1", comment: "Sem papel" }));
});

test("shows a success confirmation after submitting the report", async () => {
  mockSupabase({});

  render(<BathroomDetailSheet bathroomId="b1" />);
  fireEvent.click(await screen.findByRole("button", { name: t("bathroom.reportIssue") }));
  fireEvent.click(screen.getByRole("button", { name: t("bathroom.reportSubmit") }));

  expect(await screen.findByText(t("bathroom.reportSuccess"))).toBeInTheDocument();
});

test("opening the composer pre-fills the form when the user already reviewed this bathroom", async () => {
  mockSupabase({}, null, null, null, { accessibility: 3, lighting: 2, odor: 1, maintenance: 2, cleanliness: 3, comment: "muito limpo", show_username: true });

  render(<BathroomDetailSheet bathroomId="b1" />);
  fireEvent.click(await screen.findByRole("button", { name: t("bathroom.writeReview") }));

  expect(await screen.findByDisplayValue("muito limpo")).toBeInTheDocument();
});

test("composer defaultShowUsername reflects profiles.default_show_username when there is no existing review", async () => {
  mockSupabase({}, null, null, null, null, { default_show_username: true });

  render(<BathroomDetailSheet bathroomId="b1" />);
  fireEvent.click(await screen.findByRole("button", { name: t("bathroom.writeReview") }));

  expect(await screen.findByRole("radio", { name: t("review.showUsername") })).toBeChecked();
});

test("after approved submission shows the success banner", async () => {
  mockSupabase({}, {}, []);
  vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({ data: { verdict: "approved", reason: null }, error: null });

  render(<BathroomDetailSheet bathroomId="b1" />);
  fireEvent.click(await screen.findByRole("button", { name: t("bathroom.writeReview") }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.accessibility")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.lighting")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.odor")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.maintenance")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.cleanliness")} 2` }));
  fireEvent.change(screen.getByRole("textbox", { name: t("review.commentLabel") }), { target: { value: "bom" } });
  fireEvent.click(screen.getByRole("button", { name: t("review.submit") }));

  expect(await screen.findByText(t("review.successMessage"))).toBeInTheDocument();
});

test("after approved submission refetches bathroom_scores and reviews", async () => {
  const { maybeSingle, order } = mockSupabase({}, {}, []);
  vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({ data: { verdict: "approved", reason: null }, error: null });

  render(<BathroomDetailSheet bathroomId="b1" />);
  fireEvent.click(await screen.findByRole("button", { name: t("bathroom.writeReview") }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.accessibility")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.lighting")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.odor")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.maintenance")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.cleanliness")} 2` }));
  fireEvent.change(screen.getByRole("textbox", { name: t("review.commentLabel") }), { target: { value: "bom" } });
  fireEvent.click(screen.getByRole("button", { name: t("review.submit") }));

  await vi.waitFor(() => expect(maybeSingle).toHaveBeenCalledTimes(2));
  await vi.waitFor(() => expect(order).toHaveBeenCalledTimes(2));
});

test("after pending submission shows the pending message", async () => {
  mockSupabase({}, {}, []);
  vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({ data: { verdict: "pending", reason: null }, error: null });

  render(<BathroomDetailSheet bathroomId="b1" />);
  fireEvent.click(await screen.findByRole("button", { name: t("bathroom.writeReview") }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.accessibility")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.lighting")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.odor")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.maintenance")} 2` }));
  fireEvent.click(screen.getByRole("radio", { name: `${t("ratingCat.cleanliness")} 2` }));
  fireEvent.change(screen.getByRole("textbox", { name: t("review.commentLabel") }), { target: { value: "bom" } });
  fireEvent.click(screen.getByRole("button", { name: t("review.submit") }));

  expect(await screen.findByText(t("review.pendingMessage"))).toBeInTheDocument();
});
