// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CLOCK_SETTINGS_STORAGE_KEY } from "../../lib/settings/settingsPersistence";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

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

  it("loads saved settings from local storage", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      CLOCK_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        showSecondHand: true,
        sceneId: "fantasia",
        chime: {
          enabled: true,
          scheduleMode: "exactTimes",
          timesPerDay: 4,
          exactTargetTimes: ["06:30"],
          leadTimeMinutes: 12,
          songId: "shoujyouji-xf",
        },
      }),
    );

    render(<AppShell />);

    await user.click(screen.getByRole("button", { name: "Settings" }));

    expect((screen.getByRole("checkbox", { name: "Enabled" }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("combobox", { name: "Schedule" }) as HTMLSelectElement).value).toBe("exactTimes");
    expect((screen.getByRole("spinbutton", { name: "Lead time" }) as HTMLInputElement).value).toBe("12");
    expect((screen.getByRole("combobox", { name: "Song" }) as HTMLSelectElement).value).toBe("shoujyouji-xf");
    expect((screen.getByLabelText("Exact target time 1") as HTMLInputElement).value).toBe("06:30");
  });

  it("saves changed settings to local storage", async () => {
    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Song" }), "open-your-hand");

    const savedSettings = JSON.parse(localStorage.getItem(CLOCK_SETTINGS_STORAGE_KEY) ?? "{}") as {
      chime?: {
        songId?: string;
      };
    };

    expect(savedSettings.chime?.songId).toBe("open-your-hand");
  });
});
