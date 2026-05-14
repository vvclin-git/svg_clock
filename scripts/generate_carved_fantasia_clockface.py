import math
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
CLOCKFACE_PATH = ROOT / "src/assets/fantasia/clockface/clockface_scaled_edited_noback.png"
NUMERAL_DIR = ROOT / "src/assets/fantasia/numeral"
CARVED_OUTPUT_PATH = ROOT / "src/assets/fantasia/clockface/clockface_scaled_edited_carved_noback.png"
PREVIEW_OUTPUT_PATH = ROOT / "src/assets/fantasia/clockface/clockface_scaled_edited_carved_preview.png"

VIEWBOX_SIZE = 100.0
CLOCKFACE_X = 50.0
CLOCKFACE_Y = 50.5
CLOCKFACE_WIDTH = 100.0
CLOCKFACE_HEIGHT = 100.0
CLOCKFACE_ANCHOR_X = 0.5
CLOCKFACE_ANCHOR_Y = 0.5

NUMERAL_RADIUS = 32.0
NUMERAL_SIZE = 15.2
MASK_EXPAND_PX = 2
MASK_PADDING_PX = 8


def clock_polar_to_point(angle: float, radius: float, center_x: float = 50.0, center_y: float = 50.0) -> tuple[float, float]:
    radians = ((angle - 90.0) * math.pi) / 180.0
    return center_x + radius * math.cos(radians), center_y + radius * math.sin(radians)


def iter_numerals() -> Iterable[tuple[int, Path]]:
    for hour_index in range(1, 13):
        yield hour_index, NUMERAL_DIR / f"numeral_{hour_index}_noback.png"


def svg_to_clockface_pixels(svg_x: float, svg_y: float, image_width: int, image_height: int) -> tuple[float, float]:
    left = CLOCKFACE_X - CLOCKFACE_WIDTH * CLOCKFACE_ANCHOR_X
    top = CLOCKFACE_Y - CLOCKFACE_HEIGHT * CLOCKFACE_ANCHOR_Y
    return ((svg_x - left) / CLOCKFACE_WIDTH) * image_width, ((svg_y - top) / CLOCKFACE_HEIGHT) * image_height


def resize_numeral(numeral: Image.Image, rendered_size_px: int) -> Image.Image:
    return numeral.resize((rendered_size_px, rendered_size_px), Image.Resampling.LANCZOS)


def expanded_alpha(numeral: Image.Image) -> Image.Image:
    alpha = numeral.getchannel("A")
    if MASK_PADDING_PX > 0:
        padded_alpha = Image.new("L", (alpha.width + MASK_PADDING_PX * 2, alpha.height + MASK_PADDING_PX * 2), 0)
        padded_alpha.paste(alpha, (MASK_PADDING_PX, MASK_PADDING_PX))
        alpha = padded_alpha

    if MASK_EXPAND_PX <= 0:
        return alpha

    return alpha.filter(ImageFilter.MaxFilter(MASK_EXPAND_PX * 2 + 1))


def main() -> None:
    clockface = Image.open(CLOCKFACE_PATH).convert("RGBA")
    width, height = clockface.size
    rendered_numeral_size_px = round((NUMERAL_SIZE / VIEWBOX_SIZE) * width)
    combined_mask = Image.new("L", clockface.size, 0)
    resized_numerals: list[tuple[Image.Image, tuple[int, int]]] = []

    for hour_index, numeral_path in iter_numerals():
        numeral = resize_numeral(Image.open(numeral_path).convert("RGBA"), rendered_numeral_size_px)
        center_svg = clock_polar_to_point(hour_index * 30.0, NUMERAL_RADIUS)
        center_px = svg_to_clockface_pixels(center_svg[0], center_svg[1], width, height)
        top_left = (round(center_px[0] - rendered_numeral_size_px / 2), round(center_px[1] - rendered_numeral_size_px / 2))
        mask = expanded_alpha(numeral)
        mask_top_left = (top_left[0] - MASK_PADDING_PX, top_left[1] - MASK_PADDING_PX)
        mask_box = (*mask_top_left, mask_top_left[0] + mask.width, mask_top_left[1] + mask.height)
        combined_mask.paste(ImageChops.lighter(combined_mask.crop(mask_box), mask), mask_top_left)
        resized_numerals.append((numeral, top_left))

    carved = clockface.copy()
    carved_alpha = carved.getchannel("A")
    carved.putalpha(ImageChops.subtract(carved_alpha, combined_mask))
    carved.save(CARVED_OUTPUT_PATH)

    preview = carved.copy()
    for numeral, top_left in resized_numerals:
        preview.alpha_composite(numeral, dest=top_left)
    preview.save(PREVIEW_OUTPUT_PATH)

    print(f"wrote {CARVED_OUTPUT_PATH}")
    print(f"wrote {PREVIEW_OUTPUT_PATH}")
    print(f"size={width}x{height} mode={carved.mode} numeral_size_px={rendered_numeral_size_px}")


if __name__ == "__main__":
    main()
