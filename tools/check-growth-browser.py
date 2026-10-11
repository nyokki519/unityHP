from pathlib import Path
import json,mimetypes
from urllib.parse import urlsplit,parse_qs
from playwright.sync_api import sync_playwright
import argparse
args=argparse.ArgumentParser();args.add_argument('--form-root',type=Path,default=Path('../Unity_S'));args=args.parse_args()
hp=Path(__file__).resolve().parents[1];form=args.form_root.resolve();events=[];google_posts=[]
def route(r):
 u=urlsplit(r.request.url)
 if u.hostname=='unity-analytics.vercel.app':
  if u.path!='/api/public/growth':r.fulfill(status=503,body='unavailable');return
  if r.request.method=='OPTIONS':r.fulfill(status=204,headers={'Access-Control-Allow-Origin':'https://nyokki519.github.io','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST'});return
  events.append(json.loads(r.request.post_data));r.fulfill(status=202,body='{"ok":true}',headers={'Access-Control-Allow-Origin':'https://nyokki519.github.io','Content-Type':'application/json'});return
 if u.hostname=='docs.google.com':google_posts.append(parse_qs(r.request.post_data or ''));r.fulfill(status=200,body='simulated network receipt, not acceptance');return
 if u.hostname=='nyokki519.github.io':
  root=hp if u.path.startswith('/unityHP/') else form if u.path.startswith('/Unity_S/') else None
  if root:
   prefix='/unityHP/' if root==hp else '/Unity_S/';rel=u.path[len(prefix):] or 'index.html';p=(root/rel)
   if p.is_dir():p=p/'index.html'
   if u.path=='/Unity_S/tracking-config.js':r.fulfill(status=200,body="window.UnityGrowthConfig={formEntry:'entry.999'};",content_type='application/javascript');return
   if p.exists():r.fulfill(status=200,body=p.read_bytes(),content_type=mimetypes.guess_type(str(p))[0] or 'application/octet-stream');return
 r.abort()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':390,'height':844});c.route('**/*',route);page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('https://nyokki519.github.io/unityHP/?utm_source=instagram&q=private');page.wait_for_timeout(700)
 href=page.locator('[data-link="registration"]').first.get_attribute('href');assert 'unity_journey=' in href and 'unity_source=instagram' in href
 page.keyboard.press('Escape');page.locator('[data-link="registration"]').first.evaluate('(a)=>a.click()');page.wait_for_timeout(400)
 f=c.new_page();f.goto(href);f.wait_for_timeout(500);f.locator('#eventName').fill('Synthetic browser test');f.locator('#date').fill('2026-11-01');f.locator('#name').fill('Synthetic test person');f.locator('#submitBtn').click();f.wait_for_timeout(500)
 assert f.locator('#msg').inner_text()=='ご登録ありがとうございます。';assert google_posts;assert google_posts[0].get('entry.999')==[events[0]['journeyId']];assert 'unity_journey' not in f.url
 assert {'visit','registration_click','form_view','form_submit'} <= {e['stage'] for e in events}
 assert all(set(e)=={'journeyId','source','stage'} and e['source']=='instagram' for e in events),events
 assert len(set(e['journeyId'] for e in events))==1
 assert not any('confirmed' in e['stage'] for e in events)
 assert not errors,errors
 c.close();d=b.new_context();d.route('**/*',route);g=d.new_page();g.add_init_script('Object.defineProperty(navigator,"globalPrivacyControl",{get:()=>true});');n=len(events);g.goto('https://nyokki519.github.io/unityHP/');g.wait_for_timeout(500);assert len(events)==n;assert '?' not in g.locator('[data-link="registration"]').first.get_attribute('href');d.close();b.close()
 print('PASS mobile anonymous visit/click/form/send, exact cross-page UUID, no PII/completion fabrication, preserved form, GPC opt-out')
