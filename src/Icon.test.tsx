import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import Icon from "./Icon";

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
])('Icon renders the correct svg paths for "%s"', (name, selector) => {
  const { container } = render(<Icon name={name as Parameters<typeof Icon>[0]["name"]} />);
  expect(container.querySelector(selector)).toBeInTheDocument();
});
