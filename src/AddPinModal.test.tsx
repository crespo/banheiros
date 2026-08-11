import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import AddPinModal from "./AddPinModal";
import { t } from "./i18n/i18n";
import { supabase } from "./lib/supabase";

vi.mock("./lib/supabase", () => ({
  supabase: {
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
  },
}));

function fillValidForm() {
  fireEvent.change(screen.getByRole("textbox", { name: t("addPin.nameLabel") }), { target: { value: "Padaria Bom Pão" } });
  fireEvent.change(screen.getByRole("textbox", { name: t("addPin.addressLabel") }), { target: { value: "Rua das Flores, 123" } });
}

test("renders a name text field", () => {
  render(<AddPinModal onClose={vi.fn()} />);
  expect(screen.getByRole("textbox", { name: t("addPin.nameLabel") })).toBeInTheDocument();
});

test("renders an address text field", () => {
  render(<AddPinModal onClose={vi.fn()} />);
  expect(screen.getByRole("textbox", { name: t("addPin.addressLabel") })).toBeInTheDocument();
});

test("category radio group defaults to public selected", () => {
  render(<AddPinModal onClose={vi.fn()} />);
  const group = screen.getByRole("group", { name: t("addPin.categoryLabel") });
  expect(within(group).getByRole("radio", { name: t("category.public") })).toBeChecked();
});

test("hours fields default to 08:00 open and 18:00 close", () => {
  const { container } = render(<AddPinModal onClose={vi.fn()} />);
  expect(container.querySelector('input[name="addpin-open"]')).toHaveValue("08:00");
  expect(container.querySelector('input[name="addpin-close"]')).toHaveValue("18:00");
});

test("submit button is disabled when the form opens empty", () => {
  render(<AddPinModal onClose={vi.fn()} />);
  expect(screen.getByRole("button", { name: t("addPin.submit") })).toBeDisabled();
});

test("submit button becomes enabled once name and address pass the length thresholds", () => {
  render(<AddPinModal onClose={vi.fn()} />);
  fillValidForm();
  expect(screen.getByRole("button", { name: t("addPin.submit") })).toBeEnabled();
});

test("clicking submit geocodes the address then calls moderate-submit with the resulting coordinates", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve([{ lat: "-9.6", lon: "-35.7" }]) }));
  render(<AddPinModal onClose={vi.fn()} />);
  fillValidForm();
  fireEvent.click(screen.getByRole("button", { name: t("addPin.submit") }));

  await vi.waitFor(() =>
    expect(vi.mocked(supabase.functions.invoke)).toHaveBeenCalledExactlyOnceWith("moderate-submit", {
      body: {
        type: "pin",
        name: "Padaria Bom Pão",
        address: "Rua das Flores, 123",
        kind: "public",
        paid: false,
        open_time: "08:00",
        close_time: "18:00",
        lat: -9.6,
        lon: -35.7,
      },
    }),
  );
  vi.unstubAllGlobals();
});

test("shows a geocode error and does not call moderate-submit when the address has no geocoding result", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) }));
  render(<AddPinModal onClose={vi.fn()} />);
  fillValidForm();
  fireEvent.click(screen.getByRole("button", { name: t("addPin.submit") }));

  expect(await screen.findByText(t("addPin.geocodeError"))).toBeInTheDocument();
  expect(supabase.functions.invoke).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

test("shows the success banner when moderate-submit responds with an approved verdict", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve([{ lat: "-9.6", lon: "-35.7" }]) }));
  vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({ data: { verdict: "approved", reason: null }, error: null });
  render(<AddPinModal onClose={vi.fn()} />);
  fillValidForm();
  fireEvent.click(screen.getByRole("button", { name: t("addPin.submit") }));

  expect(await screen.findByText(t("addPin.successNote"))).toBeInTheDocument();
  vi.unstubAllGlobals();
});
