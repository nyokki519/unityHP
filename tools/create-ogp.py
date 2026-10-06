#!/usr/bin/env python3
"""Render the current site cover as a 1200 × 630 social preview.
Requires Python Playwright and system Chromium, like tools/check-site.py.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 1200, 'height': 630}, reduced_motion='reduce')
        page.route('https://unity-analytics.vercel.app/api/public/events', lambda r: r.fulfill(status=503, json={'error': 'unavailable'}))
        page.goto(f'http://127.0.0.1:{server.server_port}/', wait_until='networkidle')
        page.add_style_tag(content='''
            .hero {min-height:630px;height:630px}
            .hero-masthead {font-size:180px;top:94px}
            .hero-copy {bottom:65px;grid-template-columns:1fr 310px}
            .hero-brand {top:155px;width:125px}
            .hero-scroll {display:none}
            .hero-kicker {top:106px}
            .site-header {height:74px;padding-block:10px}
            .hero h1 {font-size:43px}
            .hero-description {font-size:12px}
            .skip-link {visibility:hidden}
        ''')
        page.evaluate('document.fonts.ready')
        page.locator('.hero-photo img').evaluate('(e)=>e.decode()')
        page.screenshot(path=str(root / 'assets/images/ogp.jpg'), type='jpeg', quality=90)
        browser.close()
        print('Created assets/images/ogp.jpg (1200 × 630)')
finally:
    server.shutdown()
    server.server_close()
