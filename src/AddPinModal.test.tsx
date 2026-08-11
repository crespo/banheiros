import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import AddPinModal from "./AddPinModal";
import { t } from "./i18n/i18n";

vi.mock("./lib/supabase", () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
  },
}));

test("renders a name text field", () => {
  render(<AddPinModal onClose={vi.fn()} />);
  expect(screen.getByRole("textbox", { name: t("addPin.nameLabel") })).toBeInTheDocument();
});

test("renders an address text field", () => {
  render(<AddPinModal onClose={vi.fn()} />);
  expect(screen.getByRole("textbox", { name: t("addPin.addressLabel") })).toBeInTheDocument();
});
