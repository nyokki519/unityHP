#!/usr/bin/env python3
"""Bundle the static site and its photos into a single downloadable HTML file."""
import argparse
import base64
import re
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('output', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
html = (root / 'index.html').read_text()
content = (root / 'content.js').read_text()

def embed(match):
    return 'data:image/webp;base64,' + base64.b64encode((root / match.group(0)).read_bytes()).decode()

content = re.sub(r'assets/images/[A-Za-z0-9-]+\.webp', embed, content)
script = (root / 'script.js').read_text()
css = (root / 'style.css').read_text()
css = re.sub(r'assets/fonts/[A-Za-z0-9-]+\.woff2', lambda m: 'data:font/woff2;base64,' + base64.b64encode((root / m.group(0)).read_bytes()).decode(), css)
html = re.sub(r'<link\s+rel="stylesheet"\s+href="style\.css(?:\?[^"\s]+)?"\s*/?>', lambda _: '<style>' + css + '</style>', html)
for name in ('content.js', 'event-feed.js', 'script.js', 'intro.js'):
    html = re.sub(r'<script src="' + re.escape(name) + r'(?:\?[^"\s]+)?" (?:defer|async)></script>', '', html)
html = html.replace('</body>', '<script>' + content + '</script><script>' + (root / 'event-feed.js').read_text() + '</script><script>' + script + '</script><script>' + (root / 'intro.js').read_text() + '</script></body>')
html = re.sub(r'assets/images/[A-Za-z0-9-]+\.webp', embed, html)
notices = ['assets/fonts/Cormorant-Garamond-LICENSE.txt', 'assets/images/PHOTO-CREDITS.md', 'assets/licenses/Flutter-Gallery-Assets-LICENSE.txt', 'assets/licenses/Ivan-Fonin-CC0.txt']
html = html.replace('</head>', '\n'.join('<!--\n' + (root / name).read_text().replace('-->', '-- >') + '\n-->' for name in notices) + '\n</head>')
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(html)
print(f'Created {args.output} ({args.output.stat().st_size} bytes)')
