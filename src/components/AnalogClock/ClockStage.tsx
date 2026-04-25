import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { UseClockEngineResult } from "../../hooks/useClockEngine";
import type { ClockSettings } from "../../types/settings";
import type {
  BaseAssetElement,
  ClockElementSlot,
  ElementAnimationConfig,
  ElementAnimationTrigger,
  HandElement,
} from "../../types/scene";
import { sceneRegistry } from "../../lib/assets/sceneRegistry";
import { clockPolarToPoint } from "../../lib/geometry/polar";
import { HandHitArea } from "./HandHitArea";
import styles from "./ClockStage.module.css";

type ClockStageProps = {
  clock: UseClockEngineResult;
  settings: ClockSettings;
};

type AnimationEpochs = Record<Exclude<ElementAnimationTrigger, "always" | "manual">, number>;

function getAnimationClassName(animation?: ElementAnimationConfig) {
  if (!animation?.enabled || animation.kind === "none") {
    return undefined;
  }

  return `${styles.animated} ${styles[animation.kind]}`;
}

function getAnimationStyle(animation?: ElementAnimationConfig): CSSProperties | undefined {
  if (!animation?.enabled || animation.kind === "none") {
    return undefined;
  }

  return {
    animationDuration: `${animation.durationMs ?? 400}ms`,
    animationDelay: `${animation.delayMs ?? 0}ms`,
    animationTimingFunction: animation.easing ?? "ease-out",
    animationIterationCount: animation.trigger === "always" ? String(animation.iterationCount ?? "infinite") : "1",
    animationFillMode: animation.trigger === "always" ? "both" : "none",
  };
}

function getElementEpoch(animation: ElementAnimationConfig | undefined, epochs: AnimationEpochs) {
  if (!animation?.enabled) {
    return 0;
  }

  switch (animation.trigger) {
    case "always":
    case "manual":
      return 0;
    case "onLiveTick":
      return epochs.onLiveTick;
    case "onMinuteChange":
      return epochs.onMinuteChange;
    case "onHourChange":
      return epochs.onHourChange;
    case "onPointerDown":
      return epochs.onPointerDown;
    case "onPointerUp":
      return epochs.onPointerUp;
  }
}

function getBaseRotation(element: BaseAssetElement) {
  return element.rotation ?? 0;
}

function getAnchorX(element: BaseAssetElement) {
  return element.anchorX ?? 0.5;
}

function getAnchorY(element: BaseAssetElement) {
  return element.anchorY ?? 0.5;
}

function getElementPosition(element: BaseAssetElement) {
  if (!element.polar) {
    return { x: element.x, y: element.y };
  }

  return clockPolarToPoint(element.polar.angle, element.polar.radius, element.polar.centerX ?? 50, element.polar.centerY ?? 50);
}

function getHandAngle(hand: HandElement, clock: UseClockEngineResult) {
  if (hand.motion?.sweep !== "tick") {
    return clock.angles[hand.handType];
  }

  const { hours, minutes, seconds } = clock.displayedTime;

  switch (hand.handType) {
    case "hour":
      return ((hours % 12) + minutes / 60) * 30;
    case "minute":
      return minutes * 6;
    case "second":
      return seconds * 6;
  }
}

function useAnimationEpochs(clock: UseClockEngineResult): AnimationEpochs {
  const [epochs, setEpochs] = useState<AnimationEpochs>({
    onLiveTick: 0,
    onMinuteChange: 0,
    onHourChange: 0,
    onPointerDown: 0,
    onPointerUp: 0,
  });
  const previousRef = useRef({
    seconds: clock.displayedTime.seconds,
    minutes: clock.displayedTime.minutes,
    hours: clock.displayedTime.hours,
    isDragging: clock.dragState.isDragging,
    mode: clock.mode,
  });

  useEffect(() => {
    setEpochs((current) => {
      const next = { ...current };
      const previous = previousRef.current;

      if (clock.mode === "live" && previous.mode === "live" && clock.displayedTime.seconds !== previous.seconds) {
        next.onLiveTick += 1;
      }

      if (clock.displayedTime.minutes !== previous.minutes) {
        next.onMinuteChange += 1;
      }

      if (clock.displayedTime.hours !== previous.hours) {
        next.onHourChange += 1;
      }

      if (!previous.isDragging && clock.dragState.isDragging) {
        next.onPointerDown += 1;
      }

      if (previous.isDragging && !clock.dragState.isDragging) {
        next.onPointerUp += 1;
      }

      previousRef.current = {
        seconds: clock.displayedTime.seconds,
        minutes: clock.displayedTime.minutes,
        hours: clock.displayedTime.hours,
        isDragging: clock.dragState.isDragging,
        mode: clock.mode,
      };

      return next;
    });
  }, [clock.displayedTime.hours, clock.displayedTime.minutes, clock.displayedTime.seconds, clock.dragState.isDragging, clock.mode]);

  return epochs;
}

type SceneImageProps = {
  element: BaseAssetElement;
  extraRotation?: number;
  epochs: AnimationEpochs;
};

function SceneImage({ element, extraRotation = 0, epochs }: SceneImageProps) {
  if (element.visible === false) {
    return null;
  }

  const position = getElementPosition(element);
  const anchorX = getAnchorX(element);
  const anchorY = getAnchorY(element);
  const epoch = getElementEpoch(element.animation, epochs);
  const className = getAnimationClassName(element.animation);
  const animationStyle = getAnimationStyle(element.animation);

  return (
    <g
      data-element-id={element.id}
      data-z-slot={element.zSlot}
      transform={`translate(${position.x} ${position.y}) rotate(${getBaseRotation(element) + extraRotation})`}
      opacity={element.opacity ?? 1}
    >
      <g key={`${element.id}-${epoch}`} className={className} style={animationStyle}>
        <image
          href={element.src}
          x={-element.width * anchorX}
          y={-element.height * anchorY}
          width={element.width}
          height={element.height}
          preserveAspectRatio={element.preserveAspectRatio ?? "xMidYMid meet"}
          transform={element.scale && element.scale !== 1 ? `scale(${element.scale})` : undefined}
        />
      </g>
    </g>
  );
}

type LayerProps = {
  elements: BaseAssetElement[];
  slot: ClockElementSlot;
  clock: UseClockEngineResult;
  showSecondHand: boolean;
  epochs: AnimationEpochs;
};

function SceneLayer({ elements, slot, clock, showSecondHand, epochs }: LayerProps) {
  return (
    <g data-layer={slot}>
      {elements.map((element) => {
        if (element.visible === false) {
          return null;
        }

        if (slot === "hands") {
          const hand = element as HandElement;

          if (hand.handType === "second" && !showSecondHand) {
            return null;
          }

          const interaction = hand.interaction;
          const dragProps = interaction?.draggable ? clock.getHandDragProps(hand.handType) : null;
          const position = getElementPosition(hand);

          return (
            <g key={hand.id}>
              <SceneImage element={hand} extraRotation={getHandAngle(hand, clock)} epochs={epochs} />
              {interaction?.draggable && dragProps ? (
                <HandHitArea
                  hand={hand.handType}
                  x={position.x}
                  y={position.y}
                  angle={getHandAngle(hand, clock) + getBaseRotation(hand)}
                  length={interaction.hitLength}
                  strokeWidth={interaction.hitWidth}
                  offsetX={interaction.offsetX}
                  offsetY={interaction.offsetY}
                  {...dragProps}
                />
              ) : null}
            </g>
          );
        }

        return <SceneImage key={element.id} element={element} epochs={epochs} />;
      })}
    </g>
  );
}

export function ClockStage({ clock, settings }: ClockStageProps) {
  const scene = sceneRegistry[settings.sceneId];
  const epochs = useAnimationEpochs(clock);
  const decorationLayers = useMemo(
    () => ({
      decorations: scene.decorations.filter((element) => element.zSlot === "decorations"),
      centerCap: scene.decorations.filter((element) => element.zSlot === "center-cap"),
    }),
    [scene.decorations],
  );

  return (
    <div className={styles.stage}>
      <svg className={styles.svg} viewBox="0 0 100 100" role="img" aria-label={clock.formattedTime}>
        <SceneLayer elements={scene.clockface} slot="clockface" clock={clock} showSecondHand={settings.showSecondHand} epochs={epochs} />
        <SceneLayer elements={scene.numerals} slot="numerals" clock={clock} showSecondHand={settings.showSecondHand} epochs={epochs} />
        <SceneLayer
          elements={decorationLayers.decorations}
          slot="decorations"
          clock={clock}
          showSecondHand={settings.showSecondHand}
          epochs={epochs}
        />
        <SceneLayer elements={scene.hands} slot="hands" clock={clock} showSecondHand={settings.showSecondHand} epochs={epochs} />
        <SceneLayer
          elements={decorationLayers.centerCap}
          slot="center-cap"
          clock={clock}
          showSecondHand={settings.showSecondHand}
          epochs={epochs}
        />
      </svg>
    </div>
  );
}
