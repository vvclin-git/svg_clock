// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("toggles the digital time display from the control bar", async () => {
    const user = userEvent.setup();

    render(<AppShell />);

    const toggle = screen.getByRole("button", { name: "Digital On" });
    expect(screen.getByLabelText("Digital time")).not.toBeNull();
    expect(toggle.getAttribute("aria-pressed")).toBe("true");

    await user.click(toggle);

    expect(screen.queryByLabelText("Digital time")).toBeNull();
    expect(screen.getByRole("button", { name: "Digital Off" }).getAttribute("aria-pressed")).toBe("false");

    await user.click(screen.getByRole("button", { name: "Digital Off" }));

    expect(screen.getByLabelText("Digital time")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Digital On" }).getAttribute("aria-pressed")).toBe("true");
  });
});
