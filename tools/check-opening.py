#!/usr/bin/env python3
"""Mobile opening regressions: delayed CSS/app scripts and Safari decode behavior."""
import argparse
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from time import sleep
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--case', action='append', default=[])
args = parser.parse_args()
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
            ('preload-handler-blocked', 390, 844, {}, 'new MutationObserver(function(){var s=document.getElementById("site-styles");if(s)s.onload=null}).observe(document,{subtree:true,childList:true})', False),
            ('slow-css', 390, 844, {'style.css': 5}, '', False),
            ('safari-decode-rejected', 390, 844, {}, 'HTMLImageElement.prototype.decode = function(){return Promise.reject(new DOMException("decode failed", "EncodingError"))}', False),
            ('decode-unavailable', 390, 844, {}, 'HTMLImageElement.prototype.decode = undefined', False),
            ('line-anchor', 390, 844, {}, '', False),
            ('line-hidden-start', 390, 844, {}, 'window.__hidden=true;Object.defineProperty(document,"hidden",{get:function(){return window.__hidden}})', False),
            ('line-visibility-return', 390, 844, {}, 'window.__hidden=false;Object.defineProperty(document,"hidden",{get:function(){return window.__hidden}})', False),
            ('line-restore', 390, 844, {}, '', False),
            ('blocked-external-intro', 390, 844, {}, '', False),
            ('legacy-motion-api', 390, 844, {}, 'window.matchMedia = function(){return {matches:false,addListener:function(){},removeListener:function(){}}}', False),
            ('reduced-motion', 390, 844, {}, '', True),
        ]:
            if args.case and name not in args.case:
                continue
            delays.clear()
            delays.update(delay)
            context = browser.new_context(viewport={'width': width, 'height': height}, is_mobile=True, has_touch=True, user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Line/15.12.0' if name.startswith('line-') else None, reduced_motion='reduce' if reduced else 'no-preference')
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.route('https://unity-analytics.vercel.app/api/public/events', lambda r: r.fulfill(status=503, json={}))
            page.add_init_script('window.__introVisible=false;new MutationObserver(()=>{if(document.querySelector(".intro-screen.is-ready"))window.__introVisible=true}).observe(document,{subtree:true,attributes:true,attributeFilter:["class"]})')
            if init:
                page.add_init_script(init)
            page.route('**/intro.js*', lambda r: r.abort())
            page.goto(url + ('#organizer' if name == 'line-anchor' else ''), wait_until='commit')
            if name == 'line-hidden-start':
                page.wait_for_load_state('domcontentloaded')
                page.wait_for_timeout(1000)
                assert page.locator('.intro-screen.is-ready').count() == 0
                page.evaluate('window.__hidden=false;document.dispatchEvent(new Event("visibilitychange"))')
            page.wait_for_function('document.querySelector(".intro-screen")?.classList.contains("is-ready")', timeout=8000)
            if name == 'slow-css':
                assert page.evaluate('document.getElementById("site-styles").rel') == 'preload', 'Logo must display before site CSS loads'
            ready_at = page.evaluate('performance.now()')
            page.evaluate('window.__crossfade=false;window.__fadeCheck=setInterval(function(){var s=document.querySelector(".intro-screen.is-leaving");if(s){var o=Number(getComputedStyle(s).opacity);if(o>0&&o<1)window.__crossfade=true}},50)')
            box = page.locator('.intro-screen').bounding_box()
            assert box['width'] == width and box['height'] == height, box
            assert page.locator('.intro-mark').evaluate('(e)=>e.naturalWidth>0')
            assert page.locator('main').evaluate('(e)=>e.inert')
            if name == 'slow-app':
                assert page.evaluate('typeof UNITY_CONTENT') == 'undefined', 'Opening must start before delayed app scripts'
            if reduced:
                assert page.locator('.intro-mark').evaluate('(e)=>getComputedStyle(e).transform') == 'none'
                page.wait_for_timeout(350)
                assert float(page.locator('.intro-mark').evaluate('(e)=>getComputedStyle(e).opacity')) > 0
            else:
                page.wait_for_timeout(350)
                opacity = float(page.locator('.intro-mark').evaluate('(e)=>getComputedStyle(e).opacity'))
                assert 0 < opacity < 1, f'Logo must fade visibly: {opacity}'
            page.screenshot(path=str(artifacts / f'opening-mobile-{name}.png'))
            page.wait_for_function('!document.documentElement.classList.contains("intro-pending")', timeout=12000)
            assert page.evaluate('window.__introVisible'), name
            assert page.evaluate('performance.now()') - ready_at > 4400, 'Mobile opening must last about five seconds'
            assert page.evaluate('window.__crossfade'), 'Site must be revealed with a gradual crossfade'
            page.evaluate('clearInterval(window.__fadeCheck)')
            assert not page.locator('main').evaluate('(e)=>e.inert')
            page.wait_for_load_state('domcontentloaded')
            assert not errors, errors
            assert page.locator('.hero-photo img').count() == 1
            if name == 'line-visibility-return':
                page.evaluate('window.__hidden=true;document.dispatchEvent(new Event("visibilitychange"));window.__hidden=false;document.dispatchEvent(new Event("visibilitychange"))')
                page.wait_for_function('document.querySelector(".intro-screen")?.classList.contains("is-ready")')
                page.wait_for_function('!document.documentElement.classList.contains("intro-pending")', timeout=7500)
            if name == 'line-restore':
                page.evaluate('dispatchEvent(new PageTransitionEvent("pageshow",{persisted:true}))')
                page.wait_for_function('document.querySelector(".intro-screen")?.classList.contains("is-ready")')
                assert page.locator('main').evaluate('(e)=>e.inert')
                page.wait_for_function('!document.documentElement.classList.contains("intro-pending")', timeout=7500)
            print(f'PASS mobile {name}: visible opening, full viewport, content restored', flush=True)
            context.close()
        browser.close()
finally:
    server.shutdown()
