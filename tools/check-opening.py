#!/usr/bin/env python3
"""Mobile opening regressions: delayed CSS/app scripts and Safari decode behavior."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from time import sleep
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
artifacts = Path('/workspace/scratch/unity-preview')
delays = {}
class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass
    def do_GET(self):
        delay = delays.get(self.path.split('?')[0].lstrip('/'), 0)
        if delay:
            sleep(delay)
        super().do_GET()
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        for name, width, height, delay, init, reduced in [
            ('iphone', 390, 844, {}, '', False),
            ('android', 360, 800, {}, '', False),
            ('slow-app', 390, 844, {'content.js': 5}, '', False),
            ('slow-css', 390, 844, {'style.css': 5}, '', False),
            ('safari-decode-rejected', 390, 844, {}, 'HTMLImageElement.prototype.decode = function(){return Promise.reject(new DOMException("decode failed", "EncodingError"))}', False),
            ('decode-unavailable', 390, 844, {}, 'HTMLImageElement.prototype.decode = undefined', False),
            ('reduced-motion', 390, 844, {}, '', True),
        ]:
            delays.clear()
            delays.update(delay)
            context = browser.new_context(viewport={'width': width, 'height': height}, is_mobile=True, has_touch=True, reduced_motion='reduce' if reduced else 'no-preference')
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.route('https://unity-analytics.vercel.app/api/public/events', lambda r: r.fulfill(status=503, json={}))
            page.add_init_script('window.__introVisible=false;new MutationObserver(()=>{if(document.querySelector(".intro-screen.is-ready"))window.__introVisible=true}).observe(document,{subtree:true,attributes:true,attributeFilter:["class"]})')
            if init:
                page.add_init_script(init)
            page.goto(url, wait_until='commit')
            page.wait_for_function('document.querySelector(".intro-screen")?.classList.contains("is-ready")', timeout=8000)
            box = page.locator('.intro-screen').bounding_box()
            assert box['width'] == width and box['height'] == height, box
            assert page.locator('.intro-mark').evaluate('(e)=>e.naturalWidth>0')
            assert page.locator('main').evaluate('(e)=>e.inert')
            if name == 'slow-app':
                assert page.evaluate('typeof UNITY_CONTENT') == 'undefined', 'Opening must start before delayed app scripts'
            if reduced:
                assert page.locator('.intro-mark').evaluate('(e)=>getComputedStyle(e).transform') == 'none'
                assert page.locator('.intro-mark').evaluate('(e)=>getComputedStyle(e).opacity') == '1'
            else:
                page.wait_for_timeout(350)
                opacity = float(page.locator('.intro-mark').evaluate('(e)=>getComputedStyle(e).opacity'))
                assert 0 < opacity < 1, f'Logo must fade visibly: {opacity}'
            page.screenshot(path=str(artifacts / f'opening-mobile-{name}.png'))
            page.wait_for_function('!document.documentElement.classList.contains("intro-pending")', timeout=3500)
            assert page.evaluate('window.__introVisible'), name
            assert not page.locator('main').evaluate('(e)=>e.inert')
            page.wait_for_load_state('domcontentloaded')
            assert not errors, errors
            assert page.locator('.hero-photo img').count() == 1
            print(f'PASS mobile {name}: visible opening, full viewport, content restored', flush=True)
            context.close()
        browser.close()
finally:
    server.shutdown()
