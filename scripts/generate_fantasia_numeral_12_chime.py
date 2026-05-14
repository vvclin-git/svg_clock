from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "assets" / "fantasia" / "numeral" / "numeral_12_noback.png"
OUT_DIR = ROOT / "src" / "assets" / "fantasia" / "chime" / "numeral_12"
FRAME_COUNT = 8
SIZE = 255


def ellipse_mask(size: int, inset: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((inset, inset, size - inset - 1, size - inset - 1), fill=255)
    return mask


def draw_stage_backdrop() -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse((18, 18, 237, 237), fill=(22, 50, 58, 255))
    draw.ellipse((27, 27, 228, 228), fill=(30, 75, 82, 255))
    draw.pieslice((27, 27, 228, 228), 200, 340, fill=(16, 43, 52, 255))
    draw.arc((24, 24, 231, 231), 0, 360, fill=(226, 213, 181, 255), width=5)
    draw.arc((34, 34, 221, 221), 0, 360, fill=(112, 89, 58, 180), width=2)

    for x, y, r, color in [
        (72, 58, 6, (244, 207, 107, 210)),
        (184, 62, 5, (244, 207, 107, 190)),
        (58, 169, 4, (244, 207, 107, 150)),
        (201, 171, 4, (244, 207, 107, 150)),
    ]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)

    stage_mask = ellipse_mask(SIZE, 18)
    img.putalpha(Image.composite(img.getchannel("A"), Image.new("L", (SIZE, SIZE), 0), stage_mask))
    return img


def draw_dancer(frame_index: int, reveal: float) -> Image.Image:
    scale = 4
    canvas = Image.new("RGBA", (SIZE * scale, SIZE * scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    sway = [-4, -2, 0, 3, 5, 2, -3, 0][frame_index] * scale
    cx = 128 * scale + sway
    base_y = 181 * scale
    head_y = 84 * scale - int(4 * reveal * scale)
    green = (19, 115, 79, 255)
    gold = (230, 197, 114, 255)
    cream = (250, 238, 211, 255)
    rose = (191, 82, 94, 255)
    dark = (27, 39, 42, 255)

    # Soft oval shadow keeps the cutout grounded on the miniature stage.
    draw.ellipse((cx - 47 * scale, base_y - 5 * scale, cx + 47 * scale, base_y + 9 * scale), fill=(0, 0, 0, 68))

    leg_shift = int((frame_index % 3 - 1) * 5 * scale)
    draw.line((cx - 13 * scale, base_y - 47 * scale, cx - 26 * scale - leg_shift, base_y - 2 * scale), fill=dark, width=5 * scale)
    draw.line((cx + 13 * scale, base_y - 47 * scale, cx + 28 * scale + leg_shift, base_y - 5 * scale), fill=dark, width=5 * scale)
    draw.ellipse((cx - 34 * scale - leg_shift, base_y - 4 * scale, cx - 17 * scale - leg_shift, base_y + 4 * scale), fill=gold)
    draw.ellipse((cx + 21 * scale + leg_shift, base_y - 8 * scale, cx + 38 * scale + leg_shift, base_y), fill=gold)

    bodice = [
        (cx - 17 * scale, head_y + 39 * scale),
        (cx + 17 * scale, head_y + 39 * scale),
        (cx + 31 * scale, base_y - 45 * scale),
        (cx - 32 * scale, base_y - 45 * scale),
    ]
    skirt = [
        (cx - 32 * scale, base_y - 45 * scale),
        (cx + 31 * scale, base_y - 45 * scale),
        (cx + 49 * scale, base_y - 14 * scale),
        (cx - 51 * scale, base_y - 14 * scale),
    ]
    draw.polygon(skirt, fill=green)
    draw.line(skirt + [skirt[0]], fill=gold, width=3 * scale)
    draw.polygon(bodice, fill=rose)
    draw.line((cx - 16 * scale, head_y + 42 * scale, cx + 16 * scale, head_y + 42 * scale), fill=gold, width=3 * scale)

    arm_raise = [12, 24, 34, 42, 35, 22, 14, 28][frame_index] * scale
    draw.line((cx - 17 * scale, head_y + 45 * scale, cx - 54 * scale, head_y + 71 * scale - arm_raise), fill=cream, width=5 * scale)
    draw.line((cx + 17 * scale, head_y + 45 * scale, cx + 55 * scale, head_y + 70 * scale - arm_raise), fill=cream, width=5 * scale)
    draw.ellipse((cx - 60 * scale, head_y + 66 * scale - arm_raise, cx - 50 * scale, head_y + 76 * scale - arm_raise), fill=cream)
    draw.ellipse((cx + 50 * scale, head_y + 65 * scale - arm_raise, cx + 60 * scale, head_y + 75 * scale - arm_raise), fill=cream)

    draw.ellipse((cx - 18 * scale, head_y + 4 * scale, cx + 18 * scale, head_y + 40 * scale), fill=cream)
    draw.pieslice((cx - 21 * scale, head_y - 1 * scale, cx + 21 * scale, head_y + 34 * scale), 178, 360, fill=dark)
    draw.polygon(
        [
            (cx - 13 * scale, head_y + 1 * scale),
            (cx, head_y - 14 * scale),
            (cx + 13 * scale, head_y + 1 * scale),
        ],
        fill=gold,
    )
    draw.ellipse((cx - 4 * scale, head_y - 18 * scale, cx + 4 * scale, head_y - 10 * scale), fill=gold)

    for dx, dy in [(-62, 29), (61, 24)]:
        sx = cx + dx * scale
        sy = head_y + dy * scale - arm_raise
        draw.line((sx - 6 * scale, sy, sx + 6 * scale, sy), fill=gold, width=2 * scale)
        draw.line((sx, sy - 6 * scale, sx, sy + 6 * scale), fill=gold, width=2 * scale)

    dancer = canvas.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    alpha = dancer.getchannel("A").point(lambda value: int(value * reveal))
    dancer.putalpha(alpha)
    return dancer


def make_upward_plate(source: Image.Image, amount: float) -> Image.Image:
    compressed_height = max(42, round(SIZE * (1 - 0.62 * amount)))
    plate = source.resize((SIZE, compressed_height), Image.Resampling.BICUBIC)

    shadow = Image.new("RGBA", plate.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.line((22, plate.height - 2, SIZE - 22, plate.height - 2), fill=(0, 0, 0, round(145 * amount)), width=8)
    shadow = shadow.filter(ImageFilter.GaussianBlur(1.8))

    plate = Image.alpha_composite(shadow, plate)
    angle = -amount * 4
    return plate.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)


def compose_open_frame(source: Image.Image, frame_index: int, amount: float, reveal: float) -> Image.Image:
    frame = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    frame.alpha_composite(draw_stage_backdrop())
    frame.alpha_composite(draw_dancer(frame_index, reveal))

    plate = make_upward_plate(source, amount)
    x = (SIZE - plate.width) // 2
    y = round(-amount * 61)
    frame.alpha_composite(plate, (x, y))

    return frame


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGBA")

    frame_paths = []
    frame_0 = OUT_DIR / "frame_00_closed.png"
    shutil.copyfile(SOURCE, frame_0)
    frame_paths.append(frame_0)

    states = [
        (0.18, 0.14),
        (0.35, 0.30),
        (0.52, 0.48),
        (0.68, 0.70),
        (0.78, 0.88),
        (0.84, 1.00),
        (0.88, 1.00),
    ]
    for index, (amount, reveal) in enumerate(states, start=1):
        frame = compose_open_frame(source, index, amount, reveal)
        path = OUT_DIR / f"frame_{index:02d}_open.png"
        frame.save(path)
        frame_paths.append(path)

    sprite = Image.new("RGBA", (SIZE * FRAME_COUNT, SIZE), (0, 0, 0, 0))
    for index, path in enumerate(frame_paths):
        sprite.alpha_composite(Image.open(path).convert("RGBA"), (index * SIZE, 0))
    sprite.save(OUT_DIR / "numeral_12_chime_spritesheet.png")


if __name__ == "__main__":
    main()
