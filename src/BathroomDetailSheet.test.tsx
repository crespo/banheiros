import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import BathroomDetailSheet from "./BathroomDetailSheet";
import { supabase } from "./lib/supabase";
import { t } from "./i18n/i18n";

vi.mock("./lib/supabase", () => ({ supabase: { from: vi.fn() } }));

test("renders the bathroom's address once the query resolves", async () => {
  const single = vi.fn().mockResolvedValue({
    data: { id: "b1", address: "Rua das Flores, 42" },
    error: null,
  });
  const eq = vi.fn().mockReturnValue({ single });
  vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq }) } as never);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText("Rua das Flores, 42")).toBeInTheDocument();
});

test("falls back to translated label when bathroom name is null", async () => {
  const single = vi.fn().mockResolvedValue({ data: { name: null }, error: null });
  const eq = vi.fn().mockReturnValue({ single });
  vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq }) } as never);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("bathroom.unnamed"))).toBeInTheDocument();
});

test("renders the category tag for a public, unpaid bathroom", async () => {
  const single = vi.fn().mockResolvedValue({ data: { kind: "public", paid: false }, error: null });
  const eq = vi.fn().mockReturnValue({ single });
  vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq }) } as never);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("category.public"))).toBeInTheDocument();
});

test("renders the paid tag when the bathroom is paid", async () => {
  const single = vi.fn().mockResolvedValue({ data: { paid: true }, error: null });
  const eq = vi.fn().mockReturnValue({ single });
  vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq }) } as never);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("common.paid"))).toBeInTheDocument();
});

test("renders the free tag when the bathroom is not paid", async () => {
  const single = vi.fn().mockResolvedValue({ data: { paid: false }, error: null });
  const eq = vi.fn().mockReturnValue({ single });
  vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq }) } as never);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("common.free"))).toBeInTheDocument();
});

test("shows unknown hours label when open_time is null", async () => {
  const single = vi.fn().mockResolvedValue({ data: { open_time: null }, error: null });
  const eq = vi.fn().mockReturnValue({ single });
  vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq }) } as never);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("bathroom.hoursUnknown"))).toBeInTheDocument();
});

test("renders the formatted time range when open_time and close_time are both present", async () => {
  const single = vi.fn().mockResolvedValue({ data: { open_time: "06:00", close_time: "22:00" }, error: null });
  const eq = vi.fn().mockReturnValue({ single });
  vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq }) } as never);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText("06:00 – 22:00")).toBeInTheDocument();
});

test("renders open-now pill when isOpenNow resolves true", async () => {
  const single = vi.fn().mockResolvedValue({ data: { open_time: "22:00", close_time: "06:00" }, error: null });
  const eq = vi.fn().mockReturnValue({ single });
  vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq }) } as never);

  render(<BathroomDetailSheet bathroomId="b1" />);

  expect(await screen.findByText(t("bathroom.openNow"))).toBeInTheDocument();
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
    const single = vi.fn().mockResolvedValue({
      data: { open_time: "06:00", close_time: "22:00" },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ single });
    vi.mocked(supabase.from).mockReturnValue({ select: () => ({ eq }) } as never);

    render(<BathroomDetailSheet bathroomId="b1" />);

    expect(await screen.findByText(t("bathroom.closedNow"))).toBeInTheDocument();
  });
});
