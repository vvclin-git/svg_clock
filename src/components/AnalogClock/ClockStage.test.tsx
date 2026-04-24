// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClockStage } from "./ClockStage";
import { useClockEngine } from "../../hooks/useClockEngine";
import type { ClockSettings } from "../../types/settings";
import type { ClockSceneDefinition } from "../../types/scene";
import { DEFAULT_CLOCK_SETTINGS } from "../../constants/clock";
import { sceneRegistry } from "../../lib/assets/sceneRegistry";

const rasterPixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sfpnWgAAAAASUVORK5CYII=";
const defaultSceneSettings: ClockSettings = { ...DEFAULT_CLOCK_SETTINGS, sceneId: "default" };

function EngineHarness({ settings }: { settings: ClockSettings }) {
  const clock = useClockEngine(settings);

  return (
    <>
      <output data-testid="mode">{clock.mode}</output>
      <output data-testid="time">{clock.formattedTime}</output>
      <ClockStage clock={clock} settings={settings} />
    </>
  );
}

describe("ClockStage", () => {
  it("renders all fixed layers in order", () => {
    const { container } = render(<EngineHarness settings={DEFAULT_CLOCK_SETTINGS} />);
    const layers = Array.from(container.querySelectorAll("[data-layer]")).map((node) => node.getAttribute("data-layer"));

    expect(layers).toEqual(["clockface", "numerals", "decorations", "hands", "center-cap"]);
  });

  it("can render a scene with raster assets in every category", () => {
    const testScene: ClockSceneDefinition = {
      id: "default",
      label: "Raster Test",
      clockface: [
        {
          id: "face",
          src: rasterPixel,
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          anchorX: 0.5,
          anchorY: 0.5,
          zSlot: "clockface",
        },
      ],
      numerals: [
        {
          id: "numeral-1",
          src: rasterPixel,
          hourIndex: 1,
          x: 50,
          y: 16,
          width: 8,
          height: 8,
          anchorX: 0.5,
          anchorY: 0.5,
          zSlot: "numerals",
        },
      ],
      decorations: [
        {
          id: "decoration-1",
          src: rasterPixel,
          x: 50,
          y: 30,
          width: 10,
          height: 5,
          anchorX: 0.5,
          anchorY: 0.5,
          zSlot: "decorations",
          decorationType: "logo",
        },
        {
          id: "center-cap",
          src: rasterPixel,
          x: 50,
          y: 50,
          width: 4,
          height: 4,
          anchorX: 0.5,
          anchorY: 0.5,
          zSlot: "center-cap",
          decorationType: "center-cap",
        },
      ],
      hands: [
        {
          id: "hour",
          src: rasterPixel,
          handType: "hour",
          x: 50,
          y: 50,
          width: 8,
          height: 24,
          anchorX: 0.5,
          anchorY: 0.85,
          zSlot: "hands",
          interaction: {
            draggable: true,
            hitLength: 20,
            hitWidth: 12,
          },
        },
      ],
    };

    const originalScene = sceneRegistry.default;
    sceneRegistry.default = testScene;

    try {
      const { container } = render(<EngineHarness settings={defaultSceneSettings} />);
      const images = container.querySelectorAll("image");

      expect(images).toHaveLength(5);
      expect(container.querySelector("[data-element-id='numeral-1']")).not.toBeNull();
      expect(container.querySelector("[data-element-id='decoration-1']")).not.toBeNull();
      expect(container.querySelector("[data-element-id='hour']")).not.toBeNull();
    } finally {
      sceneRegistry.default = originalScene;
    }
  });

  it("omits hidden elements", () => {
    const originalScene = sceneRegistry.default;
    sceneRegistry.default = {
      ...originalScene,
      numerals: [
        {
          id: "hidden-numeral",
          src: rasterPixel,
          hourIndex: 12,
          x: 50,
          y: 12,
          width: 8,
          height: 8,
          anchorX: 0.5,
          anchorY: 0.5,
          zSlot: "numerals",
          visible: false,
        },
      ],
    };

    try {
      const { container } = render(<EngineHarness settings={defaultSceneSettings} />);

      expect(container.querySelector("[data-element-id='hidden-numeral']")).toBeNull();
    } finally {
      sceneRegistry.default = originalScene;
    }
  });

  it("supports polar coordinates for positioned elements", () => {
    const originalScene = sceneRegistry.default;
    sceneRegistry.default = {
      ...originalScene,
      numerals: [
        {
          id: "polar-numeral",
          src: rasterPixel,
          hourIndex: 12,
          x: 0,
          y: 0,
          polar: {
            angle: 0,
            radius: 40,
          },
          width: 8,
          height: 8,
          anchorX: 0.5,
          anchorY: 0.5,
          zSlot: "numerals",
        },
      ],
      decorations: [
        ...originalScene.decorations,
        {
          id: "polar-logo",
          src: rasterPixel,
          x: 0,
          y: 0,
          polar: {
            angle: 90,
            radius: 20,
          },
          width: 10,
          height: 5,
          anchorX: 0.5,
          anchorY: 0.5,
          zSlot: "decorations",
          decorationType: "logo",
        },
      ],
    };

    try {
      const { container } = render(<EngineHarness settings={defaultSceneSettings} />);
      const numeral = container.querySelector("[data-element-id='polar-numeral']");
      const decoration = container.querySelector("[data-element-id='polar-logo']");

      expect(numeral?.getAttribute("transform")).toContain("translate(50 10)");
      expect(decoration?.getAttribute("transform")).toContain("translate(70 50)");
    } finally {
      sceneRegistry.default = originalScene;
    }
  });

  it("switches to manual mode when a draggable hand is dragged", async () => {
    const user = userEvent.setup();
    const { container } = render(<EngineHarness settings={DEFAULT_CLOCK_SETTINGS} />);
    const svg = container.querySelector("svg");
    const minuteHitArea = container.querySelector("[data-hand-hit-area='minute']");

    expect(svg).not.toBeNull();
    expect(minuteHitArea).not.toBeNull();

    vi.spyOn(svg as SVGSVGElement, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      top: 0,
      left: 0,
      right: 200,
      bottom: 200,
      toJSON: () => ({}),
    });

    await user.pointer([{ target: minuteHitArea as Element, coords: { clientX: 100, clientY: 20 }, keys: "[MouseLeft>]" }]);

    expect(screen.getByTestId("mode").textContent).toBe("manual");
  });
});
