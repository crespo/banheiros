import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
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
