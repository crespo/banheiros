import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import Icon, { GoogleLogo } from "./Icon";

test.each([
  ["search", 'circle[cx="11"][cy="11"][r="8"]'],
  ["filter", "polygon"],
  ["plus", 'path[d="M5 12h14"]'],
  ["dollarSign", 'line[x1="12"][x2="12"][y1="2"][y2="22"]'],
  ["star", 'path[d^="M11.525 2.295"]'],
  ["building2", 'path[d^="M6 22V4"]'],
  ["store", 'path[d="M3 9 4 4h16l1 5"]'],
  ["mapPin", 'circle[cx="12"][cy="10"][r="3"]'],
  ["user", 'circle[cx="12"][cy="11"][r="4"]'],
  ["x", 'path[d="M18 6 6 18"]'],
  ["arrowLeft", 'path[d="m12 19-7-7 7-7"]'],
  ["check", 'path[d="M20 6 9 17l-5-5"]'],
  ["eye", 'circle[cx="12"][cy="12"][r="3"]'],
  ["eyeOff", 'path[d="m2 2 20 20"]'],
  ["flag", 'line[x1="4"][x2="4"][y1="22"][y2="15"]'],
  ["clock", 'polyline[points="12 6 12 12 16 14"]'],
  ["logOut", 'polyline[points="16 17 21 12 16 7"]'],
  ["alertTriangle", 'path[d^="m21.73 18"]'],
])('Icon renders the correct svg paths for "%s"', (name, selector) => {
  const { container } = render(<Icon name={name as Parameters<typeof Icon>[0]["name"]} />);
  expect(container.querySelector(selector)).toBeInTheDocument();
});

test("GoogleLogo renders a 4-color SVG mark", () => {
  const { container } = render(<GoogleLogo />);
  expect(container.querySelectorAll("path")).toHaveLength(4);
});
