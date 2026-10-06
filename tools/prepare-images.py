#!/usr/bin/env python3
"""Create responsive WebP copies, preserve originals, and print a content.js entry."""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageOps

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('images', nargs='+', type=Path)
parser.add_argument('--alt', default='', help='写真の内容を説明する日本語')
parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1] / 'assets/images')
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
for path in args.images:
    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        widths = sorted({min(width, image.width) for width in (480, 960, 1400)})
        variants = []
        for width in widths:
            target = args.output / f'{path.stem}-{width}.webp'
            resized = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
            resized.save(target, 'WEBP', quality=82, method=6)
            variants.append((width, target))
        largest = variants[-1]
        print(json.dumps({
            'src': f'assets/images/{largest[1].name}',
            'srcset': ', '.join(f'assets/images/{target.name} {width}w' for width, target in variants),
            'width': largest[0], 'height': round(image.height * largest[0] / image.width),
            'alt': args.alt, 'position': '50% 50%'
        }, ensure_ascii=False, indent=2))
