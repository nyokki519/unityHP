#!/usr/bin/env python3
"""Browser checks for profiles, links, navigation, photos and responsive layout.
Requires Python Playwright and Chromium; no dependencies are needed to serve the site.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
import os
import shutil
from tempfile import TemporaryDirectory
import playwright
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
artifacts = Path('/workspace/scratch/unity-preview')
artifacts.mkdir(parents=True, exist_ok=True)
# Use the installed system FFmpeg for browser recordings, in an isolated cache.
# No browser downloads or writes to the user's home directory are required.
video_tools = TemporaryDirectory(prefix='unity-video-tools-')
os.environ['PLAYWRIGHT_BROWSERS_PATH'] = video_tools.name
metadata = json.loads((Path(playwright.__file__).parent / 'driver/package/browsers.json').read_text())
revision = next(item['revision'] for item in metadata['browsers'] if item['name'] == 'ffmpeg')
encoder = Path(video_tools.name) / f'ffmpeg-{revision}' / 'ffmpeg-linux'
encoder.parent.mkdir(parents=True)
encoder.symlink_to(shutil.which('ffmpeg') or '/usr/bin/ffmpeg')
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/'
try:
 with sync_playwright() as p:
  browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
  context = browser.new_context(reduced_motion='reduce')
  page = context.new_page()
  errors = []
  page.on('pageerror', lambda e: errors.append(str(e)))
  # The live Analytics API is not deployed/verified; test the real fallback UI.
  page.route('https://unity-analytics.vercel.app/api/public/events', lambda r: r.fulfill(status=503, json={'error': 'unavailable'}, headers={'Access-Control-Allow-Origin': '*'}))
  page.add_init_script('window.__cls=0; new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput) window.__cls+=e.value})).observe({type:"layout-shift",buffered:true})')
  for width in (1440, 1280, 768, 414, 393, 390, 375):
   page.set_viewport_size({'width': width, 'height': 950})
   page.goto(url, wait_until='networkidle')
   page.wait_for_function('!document.documentElement.classList.contains("intro-pending")', timeout=2500)
   assert page.locator('.intro-screen').count() == 0, 'Reduced-motion static opening finishes'
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), f'overflow at {width}'
   assert page.locator('#representative-name').inner_text() == 'やぶ（矢吹）'
   assert page.locator('#representative-role').inner_text() == 'Unity代表'
   assert '年間300店舗以上' in page.locator('#representative-message').inner_text()
   visual = page.locator('.representative-visual').bounding_box()
   copy = page.locator('.representative-copy').bounding_box()
   if width <= 600:
    assert copy['y'] >= visual['y'] + visual['height'] - 1, 'Mobile profile must stack photo and text'
   else:
    assert copy['x'] >= visual['x'] + visual['width'] - 1, 'Desktop profile must place photo beside text'
   assert page.locator('.host').count() == 4
   assert page.locator('.host-role').count() == 4
   assert page.locator('.host-name').all_text_contents() == ['さやか', 'にょっき', 'みちか', 'いけちゃん']
   assert page.locator('.host-photo.placeholder').count() == 0
   assert page.locator('.host-photo img[src*="hobby-"]').count() == 2
   assert page.locator('.host-photo-note').count() == 0
   assert '初めてでも、' in page.locator('#first-title').inner_text()
   assert '仮' not in page.locator('body').inner_text()
   assert '趣味のイメージ' not in page.locator('body').inner_text()
   for portrait in page.locator('.host-photo, .representative-photo').all():
    assert portrait.evaluate('(e)=>getComputedStyle(e).borderRadius') == '50%'
    box = portrait.bounding_box()
    assert abs(box['width'] - box['height']) < 1
   for host in page.locator('.host').all():
    summary = host.locator('summary')
    assert summary.bounding_box()['height'] >= 44
    summary.click()
    assert host.locator('details').get_attribute('open') is not None
    assert host.locator('.host-hobby').is_visible()
    summary.click()
   if width <= 900:
    page.evaluate('window.scrollTo(0,0)')
    page.locator('.menu-toggle').click()
    assert page.locator('#navigation').is_visible()
    page.keyboard.press('Escape')
    assert page.locator('#navigation').is_hidden()
    page.locator('.menu-toggle').click()
    page.locator('#navigation a[href="#organizer"]').click()
    assert page.evaluate('location.hash') == '#organizer'
    assert page.locator('#navigation').is_hidden()
   page.locator('.faq-list summary').first.click()
   assert page.locator('.faq-list details').first.get_attribute('open') is not None
   links = {'line': 'https://lin.ee/vRZi9Rf', 'registration': 'https://nyokki519.github.io/Unity_S/'}
   for key, value in links.items():
    for link in page.locator(f'[data-link="{key}"]').all():
     assert link.get_attribute('href') == value
   assert page.locator('[data-link="instagram"]').first.get_attribute('href').startswith('https://www.instagram.com/unity_up9')
   for href in page.locator('a[href^="#"]').evaluate_all('(es)=>es.map(e=>e.getAttribute("href"))'):
    assert page.locator(href).count() == 1, href
   assert page.locator('.event-card').count() == 3
   assert page.locator('.event-card time').count() == 0
   assert all('参加申込フォームへ' in label for label in page.locator('[data-link="registration"], .event-card>.text-link').all_text_contents())
   assert '最新の募集を見る' not in page.locator('body').inner_text()
   assert page.locator('.gallery-item').count() == 3
   assert page.locator('img[src*="latte-workshop"]').count() == 1
   assert page.locator('img[src*="latte-art"]').count() == 1
   assert page.locator('img[src*="community-gathering"]').count() == 1
   assert page.locator('img[src*="futsal"]').count() == 1
   activity_photos = page.locator('main .photo-frame img').evaluate_all('(es)=>es.filter(e=>!e.closest(".host,.message-grid")).map(e=>e.getAttribute("src"))')
   assert len(activity_photos) == len(set(activity_photos)), 'Activity photos must not repeat across sections'
   trigger = page.locator('.gallery-open').first
   trigger.click()
   assert page.locator('.gallery-dialog').is_visible()
   assert page.locator('.lightbox-caption').inner_text() == '初めましても、一緒に楽しむうちに。'
   page.keyboard.press('ArrowRight')
   assert page.locator('.lightbox-caption').inner_text() == '遊びの合間に、話が弾む。'
   page.keyboard.press('ArrowLeft')
   page.locator('[aria-label="前の写真"]').click()
   assert page.locator('.lightbox-caption').inner_text() == 'ボールを追いかけて、距離が縮まる。'
   page.keyboard.press('Escape')
   assert page.locator('.gallery-dialog').is_hidden()
   assert trigger.evaluate('(e)=>document.activeElement===e')
   page.wait_for_function('!document.body.classList.contains("lightbox-open")')
   assert page.locator('img[fetchpriority="high"]').count() == 1
   assert page.locator('img[loading="lazy"]').count() >= 10
   page.evaluate('Promise.all(Array.from(document.images).map(async i=>{i.loading="eager";await i.decode()}))')
   # Chromium may discard decoded off-screen images. Visit each section before
   # the full-page capture so the artifact also shows all lazy-loaded photos.
   for section in page.locator('main>section').all():
    section.scroll_into_view_if_needed()
   assert page.locator('img').evaluate_all('(es)=>es.every(i=>i.naturalWidth>0)')
   page.evaluate('window.scrollTo(0,0)')
   page.wait_for_timeout(150)
   page.screenshot(path=str(artifacts / f'layout-{width}.png'), full_page=True)
   if width in (1440,390):
    page.screenshot(path=str(artifacts / f'top-{width}.png'))
    page.locator('#organizer').screenshot(path=str(artifacts / f'people-{width}.png'), style='.site-header, .skip-link {visibility:hidden!important}')
   print(f'PASS {width}px: profiles, photos, links, menu, FAQ, no overflow; CLS {page.evaluate("window.__cls"):.4f}', flush=True)
  assert not errors, errors
  # Check the real timed transition separately from reduced-motion layout checks.
  for width in (1440, 390):
   opening_context = browser.new_context(viewport={'width': width, 'height': 950}, reduced_motion='no-preference', record_video_dir=str(artifacts / 'recordings'), record_video_size={'width': width, 'height': 950})
   opening = opening_context.new_page()
   # Record transient states: a screenshot can finish after a short transition.
   opening.add_init_script('window.__introStates=[];new MutationObserver(ms=>{for(const m of ms){if(m.target===document.documentElement)window.__introStates.push(document.documentElement.className)}}).observe(document,{subtree:true,attributes:true,attributeFilter:["class"]})')
   opening.on('pageerror', lambda e: errors.append(str(e)))
   opening.route('https://unity-analytics.vercel.app/api/public/events', lambda r: r.fulfill(status=503, json={'error': 'unavailable'}, headers={'Access-Control-Allow-Origin': '*'}))
   opening.goto(url, wait_until='domcontentloaded')
   opening.wait_for_function('document.querySelector(".intro-screen")?.classList.contains("is-ready")')
   assert opening.locator('main').evaluate('(e)=>e.inert')
   screen_box = opening.locator('.intro-screen').bounding_box()
   assert screen_box['width'] == width and screen_box['height'] == 950, screen_box
   opening.wait_for_timeout(900)
   assert float(opening.locator('.intro-mark').evaluate('(e)=>getComputedStyle(e).opacity')) > .99
   opening.screenshot(path=str(artifacts / f'opening-{width}.png'))
   opening.wait_for_function('window.__introStates.some(s=>s.includes("intro-revealing"))')
   opening.wait_for_timeout(300)
   opening.screenshot(path=str(artifacts / f'opening-transition-{width}.png'))
   opening.wait_for_function('!document.documentElement.classList.contains("intro-pending")', timeout=3500)
   assert opening.locator('.intro-screen').count() == 0
   assert not opening.locator('main').evaluate('(e)=>e.inert')
   assert opening.locator('main').evaluate('(e)=>getComputedStyle(e).opacity') == '1'
   assert opening.evaluate('document.documentElement.scrollWidth<=innerWidth')
   opening.locator('.hero-actions a[href="#events"]').click()
   assert opening.locator('.intro-screen').count() == 0, 'Anchor navigation must not replay'
   video = opening.video
   opening_context.close()
   video.save_as(str(artifacts / f'opening-{width}.webm'))
   print(f'PASS {width}px: fullscreen trademark, fade into site, interaction restored, no repeat; video saved', flush=True)
  normal = browser.new_context(reduced_motion='no-preference')
  guard = normal.new_page()
  guard.route('https://unity-analytics.vercel.app/api/public/events', lambda r: r.fulfill(status=503, json={}))
  guard.goto(url + '#organizer', wait_until='networkidle')
  assert guard.locator('.intro-screen').count() == 0, 'Direct section links skip the opening'
  guard.goto(url, wait_until='domcontentloaded')
  guard.keyboard.press('Escape')
  assert guard.locator('.intro-screen').count() == 0
  assert not guard.locator('main').evaluate('(e)=>e.inert')
  guard.goto(url, wait_until='domcontentloaded')
  guard.keyboard.press('Tab')
  assert guard.locator('.intro-screen').count() == 0
  assert guard.locator('.skip-link').evaluate('(e)=>document.activeElement===e')
  guard.goto(url, wait_until='domcontentloaded')
  guard.emulate_media(reduced_motion='reduce')
  guard.wait_for_function('!document.documentElement.classList.contains("intro-pending")')
  assert not guard.locator('main').evaluate('(e)=>e.inert')
  guard.emulate_media(reduced_motion='no-preference')
  guard.route('**/intro.js*', lambda r: r.abort())
  guard.goto(url, wait_until='domcontentloaded')
  guard.wait_for_function('!document.documentElement.classList.contains("intro-pending")', timeout=4500)
  assert guard.locator('main').evaluate('(e)=>getComputedStyle(e).opacity') == '1'
  normal.close()
  nojs = browser.new_context(java_script_enabled=False)
  plain = nojs.new_page()
  plain.goto(url, wait_until='load')
  assert plain.locator('.intro-screen').is_hidden()
  assert plain.locator('#hero-title').is_visible()
  nojs.close()
  assert not errors, errors
  print('PASS intro: deep link, Escape, keyboard focus, reduced motion, failed script and JavaScript disabled', flush=True)
  # Deleting / adding member data changes profiles without editing HTML.
  page.evaluate('UNITY_CONTENT.hosts.push({name:"追加メンバー",role:"主催",photo:"nyokki",initial:"A",hobby:"読書",message:"追加プロフィール"})')
  page.evaluate('document.querySelectorAll("[data-photo],[data-featured]").forEach(e=>e.replaceChildren());["event-list","gallery-list","host-list","voice-list","representative-photo"].forEach(id=>document.getElementById(id).replaceChildren()); const s=document.createElement("script");s.src="script.js?profile-update-check";document.body.append(s)')
  page.wait_for_function('document.querySelectorAll(".host").length===5')
  assert '追加メンバー' in page.locator('.host-name').last.inner_text()
  print('PASS data-only member addition and no JavaScript errors', flush=True)
  # Single-file download contains all runtime files and its photos.
  html = (artifacts / 'Unity.html').read_text()
  page.set_content(html, wait_until='networkidle')
  page.wait_for_function('document.querySelector(".hero-photo img").naturalWidth>0')
  assert page.locator('.host').count() == 4
  assert page.locator('script[src]').count() == 0
  assert page.locator('link[rel="stylesheet"]').count() == 0
  assert page.evaluate('getComputedStyle(document.body).backgroundColor') == 'rgb(245, 243, 237)'
  assert 'data:font/woff2;base64,' in html
  assert page.locator('.brand-logo').first.get_attribute('src').startswith('data:image/webp;base64,')
  print('PASS downloadable HTML with embedded photos, CSS, profiles and LINE', flush=True)
  browser.close()
finally:
 server.shutdown()
 server.server_close()
 video_tools.cleanup()
