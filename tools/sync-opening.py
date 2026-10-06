#!/usr/bin/env python3
"""Embed the opening's CSS, runtime and exact supplied logo into the initial HTML."""
import base64
import re
from pathlib import Path
root = Path(__file__).resolve().parents[1]
p = root / 'index.html'
html = p.read_text()
start, end = '<!-- UNITY_OPENING_START -->', '<!-- UNITY_OPENING_END -->'
block = start + '\n<style id="unity-opening-style">\n' + (root / 'opening.css').read_text() + '\n</style>\n<script id="unity-opening-runtime">\n' + (root / 'intro.js').read_text() + '\n</script>\n' + end
html = re.sub(re.escape(start) + r'.*?' + re.escape(end), lambda _: block, html, flags=re.S)
data = 'data:image/webp;base64,' + base64.b64encode((root / 'assets/images/unity-logo-396.webp').read_bytes()).decode()
html, count = re.subn(r'(class="intro-mark"\s+src=")[^"]+(".*?alt="")', lambda m: m[1] + data + m[2], html, count=1, flags=re.S)
assert count == 1
p.write_text(html)
print('Embedded opening CSS, runtime and logo into index.html')
