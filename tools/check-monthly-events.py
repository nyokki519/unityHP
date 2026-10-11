"""Mock only the event feed; no live applications or tracking records are created."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from datetime import datetime,timezone
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)));Thread(target=server.serve_forever,daemon=True).start()
state={'month':'2026-10','failure':False}
def response(route):
 if state['failure']:route.fulfill(status=503,json={'error':'events_unavailable'},headers={'Access-Control-Allow-Origin':'*'});return
 month=state['month'];route.fulfill(json={'version':1,'month':month,'events':[{'id':'one','title':'カフェ会 <script>private</script>','startsAt':month+'-05T01:00:00Z','endsAt':month+'-05T02:30:00Z','category':'カフェ会','location':'品川','url':'https://tunagate.com/event/123'},{'id':'two','title':'交流会','startsAt':month+'-20T05:00:00Z','category':'交流会','url':None}]},headers={'Access-Control-Allow-Origin':'*'})
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context(reduced_motion='reduce');c.route('https://unity-analytics.vercel.app/api/public/events',response);page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.clock.install(time=datetime(2026,10,15,tzinfo=timezone.utc))
  for width in (1440,768,390,375):
   page.set_viewport_size({'width':width,'height':844});page.goto(f'http://127.0.0.1:{server.server_port}/');page.wait_for_function('document.querySelectorAll(".monthly-event").length===2');page.wait_for_function('!document.documentElement.classList.contains("intro-pending")');links=page.locator('#event-list .text-link');assert links.count()==3
   for i in range(3):
    assert links.nth(i).get_attribute('href')=='#monthly-events';assert links.nth(i).inner_text().startswith('今月のイベント一覧');links.nth(i).locator('span').click();assert page.evaluate('location.hash')=='#monthly-events'
   assert '10:00〜11:30' in page.locator('.monthly-event').first.inner_text();assert '品川' in page.locator('.monthly-event').first.inner_text();assert page.locator('.monthly-event a').count()==1;assert '申込先は準備中' in page.locator('.monthly-event').last.inner_text();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');assert page.locator('.monthly-event script').count()==0
  state['month']='2026-11';page.clock.set_system_time(datetime(2026,10,31,15,tzinfo=timezone.utc));page.evaluate('document.dispatchEvent(new Event("visibilitychange"))');page.wait_for_function('document.querySelector("#monthly-label").textContent.includes("2026年11月")');page.wait_for_function('document.querySelector(".monthly-event time").dateTime.includes("2026-11")')
  state['failure']=True;page.clock.set_system_time(datetime(2026,10,31,15,10,tzinfo=timezone.utc));page.evaluate('document.dispatchEvent(new Event("visibilitychange"))');page.wait_for_function('document.querySelector("#event-feed-status").textContent.includes("取得できません")');assert page.locator('.monthly-event').count()==0;assert page.locator('#event-list .event-card').count()==3;assert not errors,errors;b.close()
 print('PASS monthly browser: 4 widths, three text/arrow anchors, JST times, correct links/no invented link, safe text, month rollover, API failure')
finally:server.shutdown();server.server_close()
