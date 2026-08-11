import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as maplibregl from "maplibre-gl";
import { setLanguage, t } from "./i18n/i18n";
import MapScreen from "./MapScreen";
import { supabase } from "./lib/supabase";
import { MACEIO_CENTER } from "./lib/mapCoverage";

vi.mock("maplibre-gl", () => ({
  Map: vi.fn(),
  Marker: vi.fn().mockImplementation(function (options: { element: HTMLElement }) {
    const marker = { setLngLat: vi.fn(), addTo: vi.fn(), remove: vi.fn(), getElement: () => options.element };
    marker.setLngLat.mockReturnValue(marker);
    marker.addTo.mockReturnValue(marker);
    return marker;
  }),
}));

type MapStyle = { sources?: Record<string, { tiles?: string[]; attribution?: string }>; layers?: unknown[] };
vi.mock("./lib/supabase", () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } } }));

beforeEach(() => {
  setLanguage("pt");
  mockBathrooms([]);
});

function mockBathrooms(rows: unknown[], detail: unknown = rows[0] ?? null) {
  const single = vi.fn().mockResolvedValue({ data: detail, error: null });
  const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const order = vi.fn().mockResolvedValue({ data: [], error: null });
  const inFn = vi.fn().mockResolvedValue({ data: [], error: null });
  const eq: ReturnType<typeof vi.fn> = vi.fn();
  eq.mockReturnValue({
    then: (resolve: (v: { data: unknown[]; error: null }) => void) => resolve({ data: rows, error: null }),
    single,
    maybeSingle,
    order,
    eq,
    in: inFn,
  });
  vi.mocked(supabase.from).mockReturnValue({
    select: () => ({ eq, in: inFn }),
  } as never);
  return eq;
}

function markerFor(bathroomName: string) {
  const results = vi.mocked(maplibregl.Marker).mock.results;
  for (let i = results.length - 1; i >= 0; i--) {
    const marker = results[i].value as { getElement: () => HTMLElement; remove: () => void; setLngLat: (v: [number, number]) => unknown };
    if (marker.getElement().getAttribute("aria-label") === bathroomName) return marker;
  }
  return undefined;
}

function markerElementFor(bathroomName: string) {
  return markerFor(bathroomName)?.getElement();
}

function mockPreciseGeolocation() {
  Object.defineProperty(navigator, "geolocation", {
    value: { getCurrentPosition: vi.fn(ok => ok({ coords: { latitude: 0, longitude: 0, accuracy: 10 } })) },
    configurable: true,
  });
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

test('clicking "Público" chip removes the instore bathroom marker', async () => {
  mockBathrooms([
    { id: "pub1", name: "Public One", address: "Rua A", kind: "public",  paid: false, lat: -9.58, lon: -35.73 },
    { id: "inst1", name: "Instore One", address: "Rua B", kind: "instore", paid: false, lat: -9.59, lon: -35.74 },
  ]);
  render(<MapScreen />);
  await waitFor(() => expect(markerFor("Instore One")).toBeTruthy());
  const instoreMarker = markerFor("Instore One")!;
  fireEvent.click(screen.getByRole("button", { name: t("map.filterPublic") }));
  await waitFor(() => expect(instoreMarker.remove).toHaveBeenCalled());
});

test("marker uses a generic label when bathroom name is null", async () => {
  mockBathrooms([{ id: "b2", name: null, address: "Rua B", kind: "public", paid: false, lat: -9.58, lon: -35.73 }]);
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor(t("bathroom.unnamed"))).toBeTruthy());
});

test("paid bathroom marker shows dollar-sign badge; free bathroom marker does not", async () => {
  mockBathrooms([{ id: "b3", name: "P", address: "Rua C", kind: "public", paid: true, lat: -9.58, lon: -35.73 }]);
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor("P")).toBeTruthy());
  expect(markerElementFor("P")!.querySelector(".pin-sub")).toBeTruthy();

  mockBathrooms([{ id: "b4", name: "F", address: "Rua D", kind: "public", paid: false, lat: -9.58, lon: -35.73 }]);
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor("F")).toBeTruthy());
  expect(markerElementFor("F")!.querySelector(".pin-sub")).toBeNull();
});

describe("user location marker", () => {
  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", { value: undefined, configurable: true });
  });

  test("renders user location marker when geolocation succeeds", () => {
    mockPreciseGeolocation();
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

  test("precise mode marker contains a circle with class location-dot", () => {
    mockPreciseGeolocation();
    render(<MapScreen />);
    const marker = screen.getByRole("img", { name: t("map.legendYou") });
    expect(marker.querySelector("circle.location-dot")).not.toBeNull();
  });

  test("precise mode marker contains a circle with class location-halo", () => {
    mockPreciseGeolocation();
    render(<MapScreen />);
    const marker = screen.getByRole("img", { name: t("map.legendYou") });
    expect(marker.querySelector("circle.location-halo")).not.toBeNull();
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
  const style = opts?.style as MapStyle | undefined;
  expect(style?.sources?.osm?.tiles).toEqual(["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]);
});

test("Map style includes OSM attribution", () => {
  render(<MapScreen />);
  const opts = vi.mocked(maplibregl.Map).mock.calls[0][0];
  const style = opts?.style as MapStyle | undefined;
  expect(style?.sources?.osm?.attribution).toEqual(expect.stringContaining("OpenStreetMap"));
});

test("Map style includes a raster layer referencing the osm source", () => {
  render(<MapScreen />);
  const opts = vi.mocked(maplibregl.Map).mock.calls[0][0];
  const style = opts?.style as MapStyle | undefined;
  expect(style?.layers).toEqual(expect.arrayContaining([expect.objectContaining({ type: "raster", source: "osm" })]));
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

test("MapScreen filters bathrooms query by status=approved", () => {
  const eq = mockBathrooms([]);
  render(<MapScreen />);
  expect(eq).toHaveBeenCalledWith("status", "approved");
});

test("MapScreen creates a marker positioned at the bathroom's [lon, lat]", async () => {
  mockBathrooms([{ id: "b1", name: "Banheiro Central", address: "Rua A", kind: "public", paid: false, lat: -9.58, lon: -35.73 }]);
  render(<MapScreen />);
  await waitFor(() => expect(maplibregl.Marker).toHaveBeenCalledOnce());
  const marker = vi.mocked(maplibregl.Marker).mock.results[0].value;
  expect(marker.setLngLat).toHaveBeenCalledWith([-35.73, -9.58]);
});

test("unmounting MapScreen removes all markers", async () => {
  mockBathrooms([{ id: "b1", name: "Banheiro Central", address: "Rua A", kind: "public", paid: false, lat: -9.58, lon: -35.73 }]);
  const { unmount } = render(<MapScreen />);
  await waitFor(() => expect(markerFor("Banheiro Central")).toBeTruthy());
  const marker = markerFor("Banheiro Central")!;
  unmount();
  expect(marker.remove).toHaveBeenCalled();
});

test("bathroom with null lat/lon is skipped without creating a marker", async () => {
  mockBathrooms([
    { id: "b9", name: "No Coords", address: "Rua Z", kind: "public", paid: false, lat: null, lon: null },
    { id: "b10", name: "Has Coords", address: "Rua Y", kind: "public", paid: false, lat: -9.58, lon: -35.73 },
  ]);
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor("Has Coords")).toBeTruthy());
  expect(markerElementFor("No Coords")).toBeUndefined();
});

test("marker renders building2 icon for public bathroom and store icon for instore bathroom", async () => {
  mockBathrooms([{ id: "b5", name: "P", address: "Rua E", kind: "public", paid: false, lat: -9.58, lon: -35.73 }]);
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor("P")).toBeTruthy());
  expect(markerElementFor("P")!.querySelector('path[d^="M6 22V4"]')).toBeTruthy();

  mockBathrooms([{ id: "b6", name: "I", address: "Rua F", kind: "instore", paid: false, lat: -9.58, lon: -35.73 }]);
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor("I")).toBeTruthy());
  expect(markerElementFor("I")!.querySelector('path[d="M3 9 4 4h16l1 5"]')).toBeTruthy();
});

test("marker's pin-badge tone class matches the bathroom category", async () => {
  mockBathrooms([{ id: "b7", name: "P2", address: "Rua G", kind: "public", paid: false, lat: -9.58, lon: -35.73 }]);
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor("P2")).toBeTruthy());
  expect(markerElementFor("P2")!.querySelector(".pin-badge")).toHaveClass("tone-accent");

  mockBathrooms([{ id: "b8", name: "I2", address: "Rua H", kind: "instore", paid: false, lat: -9.58, lon: -35.73 }]);
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor("I2")).toBeTruthy());
  expect(markerElementFor("I2")!.querySelector(".pin-badge")).toHaveClass("tone-accent2");
});

test("clicking a marker's button marks it selected", async () => {
  mockBathrooms([{ id: "b1", name: "Banheiro Central", address: "Rua A", kind: "public", paid: false, lat: -9.58, lon: -35.73 }]);
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor("Banheiro Central")).toBeTruthy());
  expect(markerElementFor("Banheiro Central")).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(markerElementFor("Banheiro Central")!);
  await waitFor(() => expect(markerElementFor("Banheiro Central")).toHaveAttribute("aria-pressed", "true"));
});

test("clicking a marker's button opens the detail sheet for the selected bathroom", async () => {
  mockBathrooms([{ id: "b1", name: "Banheiro Central", address: "Rua A", kind: "public", paid: false, lat: -9.58, lon: -35.73 }]);
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor("Banheiro Central")).toBeTruthy());
  fireEvent.click(markerElementFor("Banheiro Central")!);
  expect(await screen.findByText("Rua A")).toBeInTheDocument();
});

test("selecting a marker deselects the previously selected one", async () => {
  mockBathrooms([
    { id: "b1", name: "A", address: "Rua A", kind: "public", paid: false, lat: -9.58, lon: -35.73 },
    { id: "b2", name: "B", address: "Rua B", kind: "public", paid: false, lat: -9.59, lon: -35.74 },
  ]);
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor("B")).toBeTruthy());
  fireEvent.click(markerElementFor("A")!);
  await waitFor(() => expect(markerElementFor("A")).toHaveAttribute("aria-pressed", "true"));
  fireEvent.click(markerElementFor("B")!);
  await waitFor(() => expect(markerElementFor("B")).toHaveAttribute("aria-pressed", "true"));
  expect(markerElementFor("A")).toHaveAttribute("aria-pressed", "false");
});

test("MapScreen renders a legend toggle button", () => {
  render(<MapScreen />);
  expect(screen.getByRole("button", { name: t("map.legendTitle") })).toBeInTheDocument();
});

test("clicking the legend toggle shows the legend rows", () => {
  render(<MapScreen />);
  expect(screen.queryByText(t("map.legendPublic"))).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: t("map.legendTitle") }));
  expect(screen.getByText(t("map.legendPublic"))).toBeInTheDocument();
  expect(screen.getByText(t("map.legendInstore"))).toBeInTheDocument();
  expect(screen.getByText(t("map.legendPaid"))).toBeInTheDocument();
  expect(screen.getByText(t("map.legendFavorite"))).toBeInTheDocument();
  expect(screen.getByText(t("map.legendYou"))).toBeInTheDocument();
});

test("clicking the legend toggle again hides the legend rows", () => {
  render(<MapScreen />);
  const toggle = screen.getByRole("button", { name: t("map.legendTitle") });
  fireEvent.click(toggle);
  fireEvent.click(toggle);
  expect(screen.queryByText(t("map.legendPublic"))).not.toBeInTheDocument();
});

test("clicking the add-bathroom FAB calls onAddBathroom", () => {
  const onAddBathroom = vi.fn();
  render(<MapScreen onAddBathroom={onAddBathroom} />);
  fireEvent.click(screen.getByRole("button", { name: t("map.addBathroom") }));
  expect(onAddBathroom).toHaveBeenCalledOnce();
});

test("MapScreen renders an address search input", () => {
  render(<MapScreen />);
  expect(screen.getByPlaceholderText(t("map.searchPlaceholder"))).toBeInTheDocument();
});

describe("address search geocoding", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve([]) }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("debounces the Nominatim request while the user types", async () => {
    render(<MapScreen />);
    fireEvent.change(screen.getByPlaceholderText(t("map.searchPlaceholder")), { target: { value: "Praça" } });
    expect(fetch).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(400);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("nominatim.openstreetmap.org"));
  });

  test("selecting the first geocoding result recenters the map", async () => {
    const setCenter = vi.fn();
    vi.mocked(maplibregl.Map).mockImplementation(function () { return { setCenter } as never; });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve([{ lat: "-9.6", lon: "-35.7" }]) }));
    render(<MapScreen />);
    fireEvent.change(screen.getByPlaceholderText(t("map.searchPlaceholder")), { target: { value: "Praça" } });
    await vi.advanceTimersByTimeAsync(400);
    expect(setCenter).toHaveBeenCalledWith([-35.7, -9.6]);
  });
});

test("MapScreen shows Nominatim attribution near the search input", () => {
  render(<MapScreen />);
  expect(screen.getByText(/Nominatim/)).toBeInTheDocument();
});

test("favorited bathroom marker shows star badge", async () => {
  vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({ data: { user: { id: "u1" } } } as never);
  const fav = { id: "b1", name: "P", address: "Rua A", kind: "public", paid: false, lat: -9.58, lon: -35.73 };
  vi.mocked(supabase.from).mockImplementation((table: string) => {
    if (table === "favorites") return { select: () => ({ eq: () => ({ then: (resolve: (v: unknown) => void) => resolve({ data: [{ bathroom_id: "b1" }], error: null }) }) }) } as never;
    return { select: () => ({ eq: () => ({ then: (resolve: (v: unknown) => void) => resolve({ data: [fav], error: null }) }) }) } as never;
  });
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor("P")?.querySelector(".pin-fav")).toBeTruthy());
});

test("MapScreen queries the favorites table on mount when a user is authenticated", async () => {
  vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({ data: { user: { id: "u1" } } } as never);
  render(<MapScreen />);
  await waitFor(() => expect(vi.mocked(supabase.from)).toHaveBeenCalledWith("favorites"));
});

test("unfavorited bathroom marker shows no star badge", async () => {
  vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: { id: "u1" } } } as never);
  const notFav = { id: "b2", name: "Q", address: "Rua B", kind: "public", paid: false, lat: -9.58, lon: -35.73 };
  vi.mocked(supabase.from).mockImplementation((table: string) => {
    if (table === "favorites") return { select: () => ({ eq: () => ({ then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }) }) }) } as never;
    return { select: () => ({ eq: () => ({ then: (resolve: (v: unknown) => void) => resolve({ data: [notFav], error: null }) }) }) } as never;
  });
  render(<MapScreen />);
  await waitFor(() => expect(markerElementFor("Q")).toBeTruthy());
  expect(markerElementFor("Q")!.querySelector(".pin-fav")).toBeNull();
});
