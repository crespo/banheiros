import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import maplibregl from "maplibre-gl";
import { setLanguage, t } from "./i18n/i18n";
import MapScreen from "./MapScreen";
import { supabase } from "./lib/supabase";
import { MACEIO_CENTER } from "./lib/mapCoverage";

vi.mock("maplibre-gl", () => ({ default: { Map: vi.fn() } }));
vi.mock("./lib/supabase", () => ({ supabase: { from: vi.fn() } }));

beforeEach(() => {
  setLanguage("pt");
  mockBathrooms([]);
});

function mockBathrooms(rows: unknown[]) {
  vi.mocked(supabase.from).mockReturnValue({ select: () => Promise.resolve({ data: rows, error: null }) } as never);
}

test.each([
  ["map.filterAll"],
  ["map.filterPublic"],
  ["map.filterInstore"],
  ["map.filterPaid"],
])('MapScreen renders a button for filter chip "%s"', (key) => {
  render(<MapScreen />);
  expect(screen.getByRole("button", { name: t(key as Parameters<typeof t>[0]) })).toBeInTheDocument();
});

test('the "all" filter chip is pressed by default', () => {
  render(<MapScreen />);
  expect(screen.getByRole("button", { name: t("map.filterAll") })).toHaveAttribute("aria-pressed", "true");
});

test('clicking the "Público" chip selects it and deselects "Todos"', () => {
  render(<MapScreen />);
  fireEvent.click(screen.getByRole("button", { name: t("map.filterPublic") }));
  expect(screen.getByRole("button", { name: t("map.filterPublic") })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: t("map.filterAll") })).toHaveAttribute("aria-pressed", "false");
});

test('clicking "Público" chip hides instore bathroom pins', async () => {
  mockBathrooms([
    { id: "pub1", name: "Public One", address: "Rua A", kind: "public",  paid: false },
    { id: "inst1", name: "Instore One", address: "Rua B", kind: "instore", paid: false },
  ]);
  render(<MapScreen />);
  await screen.findByRole("button", { name: "Instore One" });
  fireEvent.click(screen.getByRole("button", { name: t("map.filterPublic") }));
  expect(screen.queryByRole("button", { name: "Instore One" })).not.toBeInTheDocument();
});

test("MapScreen renders a pin button using a generic label when bathroom name is null", async () => {
  mockBathrooms([{ id: "b2", name: null, address: "Rua B", kind: "public", paid: false }]);
  render(<MapScreen />);
  expect(await screen.findByRole("button", { name: t("bathroom.unnamed") })).toBeInTheDocument();
});

test("paid bathroom pin shows dollar-sign badge; free bathroom pin does not", async () => {
  const paid = { id: "b3", name: "P", address: "Rua C", kind: "public", paid: true };
  const free = { id: "b4", name: "F", address: "Rua D", kind: "public", paid: false };
  mockBathrooms([paid]);
  const { container: paidContainer } = render(<MapScreen />);
  await within(paidContainer).findByRole("button", { name: "P" });
  mockBathrooms([free]);
  const { container: freeContainer } = render(<MapScreen />);
  await within(freeContainer).findByRole("button", { name: "F" });
  expect(paidContainer.querySelector('line[x1="12"][x2="12"][y1="2"][y2="22"]')).toBeInTheDocument();
  expect(freeContainer.querySelector('line[x1="12"][x2="12"][y1="2"][y2="22"]')).not.toBeInTheDocument();
});

describe("user location marker", () => {
  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", { value: undefined, configurable: true });
  });

  test("renders user location marker when geolocation succeeds", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn(ok => ok({ coords: { latitude: 0, longitude: 0, accuracy: 10 } })) },
      configurable: true,
    });
    render(<MapScreen />);
    expect(screen.getByRole("img", { name: t("map.legendYou") })).toBeInTheDocument();
  });

  test("renders user location marker when geolocation errors", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn((_ok, err) => err?.({ code: 1, message: "User denied Geolocation" })) },
      configurable: true,
    });
    render(<MapScreen />);
    expect(screen.getByRole("img", { name: t("map.legendYou") })).toBeInTheDocument();
  });

  test("approximate mode marker contains no circle dot child", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn((_ok, err) => err?.({ code: 1, message: "User denied Geolocation" })) },
      configurable: true,
    });
    render(<MapScreen />);
    const marker = screen.getByRole("img", { name: t("map.legendYou") });
    expect(marker.querySelector("circle")).toBeNull();
  });

  test("precise mode marker contains a circle dot child", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn(ok => ok({ coords: { latitude: 0, longitude: 0, accuracy: 10 } })) },
      configurable: true,
    });
    render(<MapScreen />);
    const marker = screen.getByRole("img", { name: t("map.legendYou") });
    expect(marker.querySelector("circle")).not.toBeNull();
  });
});

describe("map recentering", () => {
  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", { value: undefined, configurable: true });
  });

  test("recenters the map to the user's exact coordinates when geolocation succeeds inside coverage", () => {
    const setCenter = vi.fn();
    vi.mocked(maplibregl.Map).mockImplementation(function () { return { setCenter } as never; });
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn(ok => ok({ coords: { latitude: -9.58, longitude: -35.73, accuracy: 10 } })) },
      configurable: true,
    });
    render(<MapScreen />);
    expect(setCenter).toHaveBeenCalledWith([-35.73, -9.58]);
  });
});

describe("coverage warning", () => {
  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", { value: undefined, configurable: true });
  });

  test("shows alert when geolocation succeeds outside coverage area", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn(ok => ok({ coords: { latitude: -23.5, longitude: -46.6, accuracy: 10 } })) },
      configurable: true,
    });
    render(<MapScreen />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

test("MapScreen constructs a maplibregl.Map on mount", () => {
  render(<MapScreen />);
  expect(maplibregl.Map).toHaveBeenCalledOnce();
});

test("Map is constructed with OSM raster tile source", () => {
  render(<MapScreen />);
  const opts = vi.mocked(maplibregl.Map).mock.calls[0][0];
  expect(opts?.style?.sources?.osm?.tiles).toEqual(["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]);
});

test("Map style includes OSM attribution", () => {
  render(<MapScreen />);
  const opts = vi.mocked(maplibregl.Map).mock.calls[0][0];
  expect(opts?.style?.sources?.osm?.attribution).toEqual(expect.stringContaining("OpenStreetMap"));
});

test("Map style includes a raster layer referencing the osm source", () => {
  render(<MapScreen />);
  const opts = vi.mocked(maplibregl.Map).mock.calls[0][0];
  expect(opts?.style?.layers).toEqual(expect.arrayContaining([expect.objectContaining({ type: "raster", source: "osm" })]));
});

test("Map is constructed centered on the default Maceió region", () => {
  render(<MapScreen />);
  const opts = vi.mocked(maplibregl.Map).mock.calls[0][0];
  expect(opts?.center).toEqual(MACEIO_CENTER);
});

test("MapScreen queries the bathrooms table on mount", () => {
  render(<MapScreen />);
  expect(vi.mocked(supabase.from)).toHaveBeenCalledWith("bathrooms");
});

test("MapScreen renders a pin button for a bathroom returned by the fetch", async () => {
  mockBathrooms([{ id: "b1", name: "Banheiro Central", address: "Rua A", kind: "public", paid: false }]);
  render(<MapScreen />);
  expect(await screen.findByRole("button", { name: "Banheiro Central" })).toBeInTheDocument();
});

test("pin renders building2 icon for public bathroom and store icon for instore bathroom", async () => {
  const pub  = { id: "b5", name: "P", address: "Rua E", kind: "public",  paid: false };
  const inst = { id: "b6", name: "I", address: "Rua F", kind: "instore", paid: false };
  mockBathrooms([pub]);
  const { container: publicContainer } = render(<MapScreen />);
  await within(publicContainer).findByRole("button", { name: "P" });
  mockBathrooms([inst]);
  const { container: instoreContainer } = render(<MapScreen />);
  await within(instoreContainer).findByRole("button", { name: "I" });
  expect(publicContainer.querySelector('path[d^="M6 22V4"]')).toBeInTheDocument();
  expect(publicContainer.querySelector('path[d="M3 9 4 4h16l1 5"]')).not.toBeInTheDocument();
  expect(instoreContainer.querySelector('path[d="M3 9 4 4h16l1 5"]')).toBeInTheDocument();
  expect(instoreContainer.querySelector('path[d^="M6 22V4"]')).not.toBeInTheDocument();
});

test("clicking a pin marks it selected", async () => {
  mockBathrooms([{ id: "b1", name: "Banheiro Central", address: "Rua A", kind: "public", paid: false }]);
  render(<MapScreen />);
  const pin = await screen.findByRole("button", { name: "Banheiro Central" });
  expect(pin).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(pin);
  expect(pin).toHaveAttribute("aria-pressed", "true");
});

test("selecting a pin deselects the previously selected pin", async () => {
  mockBathrooms([
    { id: "b1", name: "A", address: "Rua A", kind: "public", paid: false },
    { id: "b2", name: "B", address: "Rua B", kind: "public", paid: false },
  ]);
  render(<MapScreen />);
  const pinA = await screen.findByRole("button", { name: "A" });
  const pinB = screen.getByRole("button", { name: "B" });
  fireEvent.click(pinA);
  fireEvent.click(pinB);
  expect(pinA).toHaveAttribute("aria-pressed", "false");
  expect(pinB).toHaveAttribute("aria-pressed", "true");
});
