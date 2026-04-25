import dualRingFace from "../../assets/faces/dual-ring-face.svg";
import barHour from "../../assets/hands/bar/hour.svg";
import barMinute from "../../assets/hands/bar/minute.svg";
import barSecond from "../../assets/hands/bar/second.svg";
import fantasiaClockface from "../../assets/fantasia/clockface/clockface_scaled_edited_noback.png";
import fantasiaHour from "../../assets/fantasia/hands/hands_hour_noback.png";
import fantasiaMinute from "../../assets/fantasia/hands/hands_minute_noback.png";
import fantasiaSecond from "../../assets/fantasia/hands/hands_second_noback.png";
import fantasiaNumeral1 from "../../assets/fantasia/numeral/numeral_1_noback.png";
import fantasiaNumeral2 from "../../assets/fantasia/numeral/numeral_2_noback.png";
import fantasiaNumeral3 from "../../assets/fantasia/numeral/numeral_3_noback.png";
import fantasiaNumeral4 from "../../assets/fantasia/numeral/numeral_4_noback.png";
import fantasiaNumeral5 from "../../assets/fantasia/numeral/numeral_5_noback.png";
import fantasiaNumeral6 from "../../assets/fantasia/numeral/numeral_6_noback.png";
import fantasiaNumeral7 from "../../assets/fantasia/numeral/numeral_7_noback.png";
import fantasiaNumeral8 from "../../assets/fantasia/numeral/numeral_8_noback.png";
import fantasiaNumeral9 from "../../assets/fantasia/numeral/numeral_9_noback.png";
import fantasiaNumeral10 from "../../assets/fantasia/numeral/numeral_10_noback.png";
import fantasiaNumeral11 from "../../assets/fantasia/numeral/numeral_11_noback.png";
import fantasiaNumeral12 from "../../assets/fantasia/numeral/numeral_12_noback.png";
import type { ClockSceneDefinition, ClockSceneId } from "../../types/scene";

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const centerCapAsset = svgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="29" fill="#153243" />
    <circle cx="32" cy="32" r="10.5" fill="#fffaf1" fill-opacity="0.82" />
    <circle cx="32" cy="32" r="31" fill="none" stroke="#0b1114" stroke-opacity="0.45" stroke-width="2" />
  </svg>
`);

const fantasiaNumerals = [
  fantasiaNumeral1,
  fantasiaNumeral2,
  fantasiaNumeral3,
  fantasiaNumeral4,
  fantasiaNumeral5,
  fantasiaNumeral6,
  fantasiaNumeral7,
  fantasiaNumeral8,
  fantasiaNumeral9,
  fantasiaNumeral10,
  fantasiaNumeral11,
  fantasiaNumeral12,
];

const FANTASIA_NUMERAL_RADIUS = 32;
const FANTASIA_NUMERAL_SIZE = 15.2;

function createFantasiaNumerals() {
  return fantasiaNumerals.map((src, index) => {
    const hourIndex = index + 1;

    return {
      id: `fantasia-numeral-${hourIndex}`,
      src,
      hourIndex,
      x: 50,
      y: 50,
      polar: {
        angle: hourIndex * 30,
        radius: FANTASIA_NUMERAL_RADIUS,
      },
      width: FANTASIA_NUMERAL_SIZE,
      height: FANTASIA_NUMERAL_SIZE,
      anchorX: 0.5,
      anchorY: 0.5,
      zSlot: "numerals" as const,
    };
  });
}

export const sceneRegistry: Record<ClockSceneId, ClockSceneDefinition> = {
  default: {
    id: "default",
    label: "Dual Ring",
    clockface: [
      {
        id: "dual-ring-face",
        src: dualRingFace,
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        anchorX: 0.5,
        anchorY: 0.5,
        zSlot: "clockface",
      },
    ],
    numerals: [],
    decorations: [
      {
        id: "center-cap",
        src: centerCapAsset,
        x: 50,
        y: 50,
        width: 6.4,
        height: 6.4,
        anchorX: 0.5,
        anchorY: 0.5,
        zSlot: "center-cap",
        decorationType: "center-cap",
      },
    ],
    hands: [
      {
        id: "bar-hour",
        src: barHour,
        handType: "hour",
        x: 50,
        y: 50,
        width: 12,
        height: 26,
        anchorX: 0.5,
        anchorY: 0.885,
        zSlot: "hands",
        interaction: {
          draggable: true,
          hitLength: 24,
          hitWidth: 13,
          offsetY: 3,
        },
        motion: {
          sweep: "smooth",
        },
        animation: {
          enabled: false,
          kind: "none",
          trigger: "manual",
        },
      },
      {
        id: "bar-minute",
        src: barMinute,
        handType: "minute",
        x: 50,
        y: 50,
        width: 8,
        height: 37,
        anchorX: 0.5,
        anchorY: 0.919,
        zSlot: "hands",
        interaction: {
          draggable: true,
          hitLength: 37,
          hitWidth: 11,
          offsetY: 3,
        },
        motion: {
          sweep: "smooth",
        },
        animation: {
          enabled: true,
          kind: "pulse",
          trigger: "onLiveTick",
          durationMs: 180,
          easing: "ease-out",
        },
      },
      {
        id: "bar-second",
        src: barSecond,
        handType: "second",
        x: 50,
        y: 50,
        width: 4,
        height: 39,
        anchorX: 0.5,
        anchorY: 0.923,
        zSlot: "hands",
        interaction: {
          draggable: false,
          hitLength: 39,
          hitWidth: 0,
          offsetY: 3,
        },
        motion: {
          sweep: "smooth",
        },
        animation: {
          enabled: true,
          kind: "rotate",
          trigger: "always",
          durationMs: 1000,
          easing: "linear",
          iterationCount: "infinite",
        },
      },
    ],
  },
  fantasia: {
    id: "fantasia",
    label: "Fantasia",
    clockface: [
      {
        id: "fantasia-clockface",
        src: fantasiaClockface,
        x: 50,
        y: 50.5,
        width: 100,
        height: 100,
        anchorX: 0.5,
        anchorY: 0.5,
        zSlot: "clockface",
      },
    ],
    numerals: createFantasiaNumerals(),
    decorations: [],
    hands: [
      {
        id: "fantasia-hour",
        src: fantasiaHour,
        handType: "hour",
        x: 50,
        y: 50,
        width: 6.4,
        height: 18,
        anchorX: 0.5,
        anchorY: 0.876,
        zSlot: "hands",
        interaction: {
          draggable: true,
          hitLength: 24,
          hitWidth: 12,
        },
        motion: {
          sweep: "smooth",
        },
        animation: {
          enabled: false,
          kind: "none",
          trigger: "manual",
        },
      },
      {
        id: "fantasia-minute",
        src: fantasiaMinute,
        handType: "minute",
        x: 50,
        y: 50,
        width: 6.4,
        height: 25,
        anchorX: 0.5,
        anchorY: 0.908,
        zSlot: "hands",
        interaction: {
          draggable: true,
          hitLength: 34,
          hitWidth: 10,
        },
        motion: {
          sweep: "smooth",
        },
        animation: {
          enabled: false,
          kind: "pulse",
          trigger: "onLiveTick",
          durationMs: 180,
          easing: "ease-out",
        },
      },
      {
        id: "fantasia-second",
        src: fantasiaSecond,
        handType: "second",
        x: 50.08,
        y: 50.13,
        width: 2.5,
        height: 20,
        anchorX: 0.5,
        anchorY: 0.775,
        zSlot: "hands",
        interaction: {
          draggable: false,
          hitLength: 29.5,
          hitWidth: 0,
        },
        motion: {
          sweep: "smooth",
        },
        animation: {
          enabled: false,
          kind: "pulse",
          trigger: "always",
          durationMs: 1000,
          easing: "linear",
          iterationCount: "infinite",
        },
      },
    ],
  },
};
