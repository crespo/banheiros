import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import BathroomDetailSheet from "./BathroomDetailSheet";
import { supabase } from "./lib/supabase";

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
