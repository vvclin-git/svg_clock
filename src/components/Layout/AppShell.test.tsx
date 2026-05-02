// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders the branded top bar with a persistent digital time display", () => {
    render(<AppShell />);

    expect(screen.getByAltText("SEIKO FANTASIA")).not.toBeNull();
    expect(screen.getByLabelText("Digital time")).not.toBeNull();
    expect(screen.queryByRole("button", { name: /Digital/i })).toBeNull();
  });

  it("opens chiming settings and updates schedule controls", async () => {
    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("region", { name: "Clock settings" })).not.toBeNull();
    expect((screen.getByRole("combobox", { name: "Schedule" }) as HTMLSelectElement).value).toBe("hourly");
    expect(screen.getByRole("combobox", { name: "Song" })).not.toBeNull();
    expect(screen.getByRole("option", { name: "No song registered" })).not.toBeNull();

    await user.selectOptions(screen.getByRole("combobox", { name: "Schedule" }), "intervalCount");
    fireEvent.change(screen.getByRole("spinbutton", { name: "Times per day" }), { target: { value: "8" } });

    expect((screen.getByRole("combobox", { name: "Schedule" }) as HTMLSelectElement).value).toBe("intervalCount");
    expect((screen.getByRole("spinbutton", { name: "Times per day" }) as HTMLInputElement).value).toBe("8");
  });
});
