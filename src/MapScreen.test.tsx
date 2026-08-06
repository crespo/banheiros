import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { setLanguage, t } from "./i18n/i18n";
import MapScreen from "./MapScreen";

beforeEach(() => {
  setLanguage("pt");
});

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

test('clicking "Público" chip hides instore bathroom pins', () => {
  render(<MapScreen bathrooms={[
    { id: "pub1", name: "Public One", address: "Rua A", kind: "public",  paid: false },
    { id: "inst1", name: "Instore One", address: "Rua B", kind: "instore", paid: false },
  ]} />);
  fireEvent.click(screen.getByRole("button", { name: t("map.filterPublic") }));
  expect(screen.queryByRole("button", { name: "Instore One" })).not.toBeInTheDocument();
});

test("MapScreen renders a pin button for a bathroom with a name", () => {
  const bathrooms = [{ id: "b1", name: "Banheiro Central", address: "Rua A", kind: "public", paid: false }];
  render(<MapScreen bathrooms={bathrooms} />);
  expect(screen.getByRole("button", { name: "Banheiro Central" })).toBeInTheDocument();
});

test("MapScreen renders a pin button using a generic label when bathroom name is null", () => {
  const bathrooms = [{ id: "b2", name: null, address: "Rua B", kind: "public", paid: false }];
  render(<MapScreen bathrooms={bathrooms} />);
  expect(screen.getByRole("button", { name: t("bathroom.unnamed") })).toBeInTheDocument();
});

test("paid bathroom pin shows dollar-sign badge; free bathroom pin does not", () => {
  const paid = { id: "b3", name: "P", address: "Rua C", kind: "public", paid: true };
  const free = { id: "b4", name: "F", address: "Rua D", kind: "public", paid: false };
  const { container: paidContainer } = render(<MapScreen bathrooms={[paid]} />);
  const { container: freeContainer } = render(<MapScreen bathrooms={[free]} />);
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
    render(<MapScreen bathrooms={[]} />);
    expect(screen.getByRole("img", { name: t("map.legendYou") })).toBeInTheDocument();
  });

  test("renders user location marker when geolocation errors", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn((_ok, err) => err?.({ code: 1, message: "User denied Geolocation" })) },
      configurable: true,
    });
    render(<MapScreen bathrooms={[]} />);
    expect(screen.getByRole("img", { name: t("map.legendYou") })).toBeInTheDocument();
  });

  test("approximate mode marker contains no circle dot child", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn((_ok, err) => err?.({ code: 1, message: "User denied Geolocation" })) },
      configurable: true,
    });
    render(<MapScreen bathrooms={[]} />);
    const marker = screen.getByRole("img", { name: t("map.legendYou") });
    expect(marker.querySelector("circle")).toBeNull();
  });

  test("precise mode marker contains a circle dot child", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn(ok => ok({ coords: { latitude: 0, longitude: 0, accuracy: 10 } })) },
      configurable: true,
    });
    render(<MapScreen bathrooms={[]} />);
    const marker = screen.getByRole("img", { name: t("map.legendYou") });
    expect(marker.querySelector("circle")).not.toBeNull();
  });
});

test("pin renders building2 icon for public bathroom and store icon for instore bathroom", () => {
  const pub  = { id: "b5", name: "P", address: "Rua E", kind: "public",  paid: false };
  const inst = { id: "b6", name: "I", address: "Rua F", kind: "instore", paid: false };
  const { container: publicContainer }  = render(<MapScreen bathrooms={[pub]} />);
  const { container: instoreContainer } = render(<MapScreen bathrooms={[inst]} />);
  expect(publicContainer.querySelector('path[d^="M6 22V4"]')).toBeInTheDocument();
  expect(publicContainer.querySelector('path[d="M3 9 4 4h16l1 5"]')).not.toBeInTheDocument();
  expect(instoreContainer.querySelector('path[d="M3 9 4 4h16l1 5"]')).toBeInTheDocument();
  expect(instoreContainer.querySelector('path[d^="M6 22V4"]')).not.toBeInTheDocument();
});
