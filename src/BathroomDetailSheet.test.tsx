import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import BathroomDetailSheet from "./BathroomDetailSheet";
import { supabase } from "./lib/supabase";
import { t } from "./i18n/i18n";

vi.mock("./lib/supabase", () => ({ supabase: { from: vi.fn() } }));

function mockSupabase(bathroomData: object | null, scoreData: object | null = null) {
  const single = vi.fn().mockResolvedValue({ data: bathroomData, error: null });
  const maybeSingle = vi.fn().mockResolvedValue({ data: scoreData, error: null });
  const eq = vi.fn().mockReturnValue({ single, maybeSingle });
  vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq }) } as never);
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
