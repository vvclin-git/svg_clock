// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders the branded top bar with a persistent digital time display", () => {
    render(<AppShell />);

    expect(screen.getByAltText("SEIKO FANTASIA")).not.toBeNull();
    expect(screen.getByLabelText("Digital time")).not.toBeNull();
    expect(screen.queryByRole("button", { name: /Digital/i })).toBeNull();
  });
});
