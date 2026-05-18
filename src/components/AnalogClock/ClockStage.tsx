import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { UseClockEngineResult } from "../../hooks/useClockEngine";
import type { ClockSettings } from "../../types/settings";
import type {
  BaseAssetElement,
  ClockElementSlot,
  ElementAnimationConfig,
  ElementAnimationTrigger,
  HandElement,
  NumeralElement,
} from "../../types/scene";
import { sceneRegistry } from "../../lib/assets/sceneRegistry";
import { clockPolarToPoint } from "../../lib/geometry/polar";
import { HandHitArea } from "./HandHitArea";
import styles from "./ClockStage.module.css";

type ClockStageProps = {
  clock: UseClockEngineResult;
  settings: ClockSettings;
  visualActionEpoch?: number;
};

type AnimationEpochs = Record<Exclude<ElementAnimationTrigger, "always" | "manual">, number>;

const FANTASIA_REVEAL_DURATION_MS = 60000;
const FANTASIA_REVEAL_PLATE_DURATION_MS = 18000;
const FANTASIA_REVEAL_ORDER = [12, 11, 1, 10, 2, 9, 3, 8, 4, 7, 5, 6];
const FANTASIA_REVEAL_STAGGER_MS = (FANTASIA_REVEAL_DURATION_MS - FANTASIA_REVEAL_PLATE_DURATION_MS) / (FANTASIA_REVEAL_ORDER.length - 1);
const FANTASIA_REVEAL_DELAY_BY_HOUR = new Map(
  FANTASIA_REVEAL_ORDER.map((hourIndex, orderIndex) => [hourIndex, orderIndex * FANTASIA_REVEAL_STAGGER_MS]),
);
const FANTASIA_NUMERAL_REVEAL_CLIP_RADIUS = 8;
const FANTASIA_NUMERAL_REVEAL_TANGENTIAL_TRAVEL = 17;
const FANTASIA_NUMERAL_REVEAL_RADIAL_TRAVEL = 2.2;

type FantasiaRevealTransform = {
  transform: string;
  opacity?: number;
};

const loadedSceneAssetSrcs = new Set<string>();

function getSceneAssetSrcs(scene: (typeof sceneRegistry)[ClockSettings["sceneId"]]) {
  return [
    ...scene.clockfaceBottom,
    ...scene.characters,
    ...scene.numerals,
    ...scene.clockface,
    ...scene.decorations,
    ...scene.hands,
  ]
    .filter((element) => element.visible !== false)
    .map((element) => element.src);
}

function loadSceneAsset(src: string) {
  if (loadedSceneAssetSrcs.has(src)) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const image = new Image();

    const finish = () => {
      loadedSceneAssetSrcs.add(src);
      resolve();
    };

    image.onload = () => {
      if (!image.decode) {
        finish();
        return;
      }

      image.decode().then(finish, finish);
    };
    image.onerror = finish;
    image.src = src;
  });
}

function useSceneAssetsReady(scene: (typeof sceneRegistry)[ClockSettings["sceneId"]]) {
  const assetSrcs = useMemo(() => Array.from(new Set(getSceneAssetSrcs(scene))), [scene]);
  const [ready, setReady] = useState(() => assetSrcs.every((src) => loadedSceneAssetSrcs.has(src)));

  useEffect(() => {
    let isMounted = true;

    if (assetSrcs.length === 0 || assetSrcs.every((src) => loadedSceneAssetSrcs.has(src))) {
      setReady(true);
      return () => {
        isMounted = false;
      };
    }

    setReady(false);

    Promise.all(assetSrcs.map(loadSceneAsset)).then(() => {
      if (isMounted) {
        setReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [assetSrcs]);

  return ready;
}

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

function clampProgress(value: number) {
  return Math.max(0, Math.min(1, value));
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function getFantasiaRevealTransform(element: NumeralElement, progressMs: number): FantasiaRevealTransform | undefined {
  const delayMs = FANTASIA_REVEAL_DELAY_BY_HOUR.get(element.hourIndex) ?? 0;
  const localProgress = clampProgress((progressMs - delayMs) / FANTASIA_REVEAL_PLATE_DURATION_MS);

  if (localProgress <= 0 || localProgress >= 1) {
    return undefined;
  }

  const revealProgress = easeInOutCubic(Math.sin(localProgress * Math.PI));
  const angleRadians = ((element.polar?.angle ?? element.hourIndex * 30) - 90) * (Math.PI / 180);
  const direction = element.hourIndex <= 6 ? 1 : -1;
  const tangentX = -Math.sin(angleRadians) * direction;
  const tangentY = Math.cos(angleRadians) * direction;
  const radialX = Math.cos(angleRadians);
  const radialY = Math.sin(angleRadians);
  const translateX =
    (tangentX * FANTASIA_NUMERAL_REVEAL_TANGENTIAL_TRAVEL + radialX * FANTASIA_NUMERAL_REVEAL_RADIAL_TRAVEL) * revealProgress;
  const translateY =
    (tangentY * FANTASIA_NUMERAL_REVEAL_TANGENTIAL_TRAVEL + radialY * FANTASIA_NUMERAL_REVEAL_RADIAL_TRAVEL) * revealProgress;
  const rotate = direction * 10 * revealProgress;

  return {
    transform: `translate(${translateX} ${translateY}) rotate(${rotate})`,
  };
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
  extraTransform?: string;
  extraOpacity?: number;
  clipRadius?: number;
  epochs: AnimationEpochs;
};

function SceneImage({ element, extraRotation = 0, extraTransform, extraOpacity = 1, clipRadius, epochs }: SceneImageProps) {
  if (element.visible === false) {
    return null;
  }

  const position = getElementPosition(element);
  const anchorX = getAnchorX(element);
  const anchorY = getAnchorY(element);
  const epoch = getElementEpoch(element.animation, epochs);
  const className = getAnimationClassName(element.animation);
  const animationStyle = getAnimationStyle(element.animation);
  const clipPathId = element.zSlot === "characters" || clipRadius ? `${element.id}-clip` : undefined;
  const resolvedClipRadius = clipRadius ?? Math.min(element.width, element.height) / 2;

  return (
    <g
      data-element-id={element.id}
      data-z-slot={element.zSlot}
      transform={`translate(${position.x} ${position.y}) rotate(${getBaseRotation(element) + extraRotation})`}
      opacity={(element.opacity ?? 1) * extraOpacity}
    >
      {clipPathId ? (
        <defs>
          <clipPath id={clipPathId}>
            <circle cx="0" cy="0" r={resolvedClipRadius} />
          </clipPath>
        </defs>
      ) : null}
      <g clipPath={clipPathId ? `url(#${clipPathId})` : undefined}>
        <g key={`${element.id}-${epoch}`} transform={extraTransform} className={className} style={animationStyle}>
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
    </g>
  );
}

type LayerProps = {
  elements: BaseAssetElement[];
  slot: ClockElementSlot;
  clock: UseClockEngineResult;
  showSecondHand: boolean;
  epochs: AnimationEpochs;
  revealProgressMs: number | null;
};

function SceneLayer({ elements, slot, clock, showSecondHand, epochs, revealProgressMs }: LayerProps) {
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

        if (slot === "numerals" && revealProgressMs !== null && "hourIndex" in element) {
          const revealTransform = getFantasiaRevealTransform(element as NumeralElement, revealProgressMs);

          return (
            <SceneImage
              key={element.id}
              element={element}
              epochs={epochs}
              extraTransform={revealTransform?.transform}
              extraOpacity={revealTransform?.opacity}
              clipRadius={FANTASIA_NUMERAL_REVEAL_CLIP_RADIUS}
            />
          );
        }

        return <SceneImage key={element.id} element={element} epochs={epochs} />;
      })}
    </g>
  );
}

function useFantasiaRevealProgress(sceneId: string, visualActionEpoch: number) {
  const [progressMs, setProgressMs] = useState<number | null>(null);

  useEffect(() => {
    if (sceneId !== "fantasia" || visualActionEpoch <= 0) {
      setProgressMs(null);
      return undefined;
    }

    let animationFrame = 0;
    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      startTime ??= timestamp;
      const elapsedMs = timestamp - startTime;

      if (elapsedMs >= FANTASIA_REVEAL_DURATION_MS) {
        setProgressMs(null);
        return;
      }

      setProgressMs(elapsedMs);
      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [sceneId, visualActionEpoch]);

  return progressMs;
}

export function ClockStage({ clock, settings, visualActionEpoch = 0 }: ClockStageProps) {
  const scene = sceneRegistry[settings.sceneId];
  const epochs = useAnimationEpochs(clock);
  const revealProgressMs = useFantasiaRevealProgress(settings.sceneId, visualActionEpoch);
  const sceneAssetsReady = useSceneAssetsReady(scene);
  const decorationLayers = useMemo(
    () => ({
      decorations: scene.decorations.filter((element) => element.zSlot === "decorations"),
      centerCap: scene.decorations.filter((element) => element.zSlot === "center-cap"),
    }),
    [scene.decorations],
  );

  return (
    <div className={styles.stage} data-scene-assets-ready={sceneAssetsReady}>
      <svg className={styles.svg} viewBox="0 0 100 100" role="img" aria-label={clock.formattedTime}>
        <SceneLayer
          elements={scene.clockfaceBottom}
          slot="clockface-bottom"
          clock={clock}
          showSecondHand={settings.showSecondHand}
          epochs={epochs}
          revealProgressMs={revealProgressMs}
        />
        <SceneLayer
          elements={scene.characters}
          slot="characters"
          clock={clock}
          showSecondHand={settings.showSecondHand}
          epochs={epochs}
          revealProgressMs={revealProgressMs}
        />
        <SceneLayer
          elements={scene.numerals}
          slot="numerals"
          clock={clock}
          showSecondHand={settings.showSecondHand}
          epochs={epochs}
          revealProgressMs={revealProgressMs}
        />
        <SceneLayer
          elements={scene.clockface}
          slot="clockface"
          clock={clock}
          showSecondHand={settings.showSecondHand}
          epochs={epochs}
          revealProgressMs={revealProgressMs}
        />
        <SceneLayer
          elements={decorationLayers.decorations}
          slot="decorations"
          clock={clock}
          showSecondHand={settings.showSecondHand}
          epochs={epochs}
          revealProgressMs={revealProgressMs}
        />
        <SceneLayer
          elements={scene.hands}
          slot="hands"
          clock={clock}
          showSecondHand={settings.showSecondHand}
          epochs={epochs}
          revealProgressMs={revealProgressMs}
        />
        <SceneLayer
          elements={decorationLayers.centerCap}
          slot="center-cap"
          clock={clock}
          showSecondHand={settings.showSecondHand}
          epochs={epochs}
          revealProgressMs={revealProgressMs}
        />
      </svg>
    </div>
  );
}
