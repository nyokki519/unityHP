#!/usr/bin/env python3
"""GitHub-runner public SEO checks; this environment may have a restrictive proxy."""
import argparse,hashlib,json,re,time
from datetime import datetime,timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree as ET
BASE='https://nyokki519.github.io/unityHP/'
class Text(HTMLParser):
 def __init__(self):super().__init__();self.parts=[];self.skip=0
 def handle_starttag(self,t,a):
  if t in ('script','style'):self.skip+=1
 def handle_endtag(self,t):
  if t in ('script','style'):self.skip=max(0,self.skip-1)
 def handle_data(self,s):
  if not self.skip and s.strip():self.parts.append(s.strip())
def get(url):
 try:
  with urlopen(Request(url,headers={'User-Agent':'UnitySEO/1.0'}),timeout=25) as r:return r.status,dict(r.headers),r.read(2_000_000).decode('utf-8','replace')
 except HTTPError as e:return e.code,dict(e.headers),''
def main():
 p=argparse.ArgumentParser();p.add_argument('--output',default='docs/seo/public-audit.json');p.add_argument('--max-wait',type=int,default=240);a=p.parse_args();deadline=time.time()+a.max_wait
 expected='東京・品川の20代カフェ会・社会人コミュニティ｜Unity';home=''
 while True:
  try:status,headers,home=get(BASE+'?seo-check='+str(int(time.time())))
  except Exception:status,headers=0,{}
  if status==200 and expected in home:break
  if time.time()>deadline:raise SystemExit('published_homepage_version_not_verified')
  time.sleep(10)
 report={'checkedAt':datetime.now(timezone.utc).isoformat(),'homepage':{'httpStatus':status,'canonical':BASE,'initialHtmlMembers':all(x in home.split('<body>',1)[-1] for x in ['やぶ（矢吹）','さやか','にょっき','みちか','いけちゃん']),'googleIndexStatus':'unknown','xRobotsTag':headers.get('X-Robots-Tag')},'resources':[],'officialResearch':[],'limitations':['HTTP and markup checks do not prove Google indexing or field Core Web Vitals.','GSC and Instagram account settings require authenticated access.']}
 assert report['homepage']['initialHtmlMembers'],'members_not_static'
 assert re.search(r'<link\b[^>]*rel="canonical"[^>]*href="'+re.escape(BASE)+r'"',home),'canonical_mismatch'
 assert 'noindex' not in headers.get('X-Robots-Tag','').lower(),'header_noindex'
 assert not re.search(r'<meta\b[^>]*name="(?:robots|googlebot)"[^>]*content="[^"]*noindex',home,re.I),'meta_noindex'
 for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>',home,re.S):json.loads(block)
 assert '"@type":"Organization"' in home,'organization_missing'
 for path in ['cafe-community/','sitemap.xml','robots.txt','googledd387772a63fca83.html','assets/images/gallery-1-1400.webp']:
  st,h,text=get(BASE+path);assert st==200,('resource_unavailable',path,st)
  item={'url':BASE+path,'httpStatus':st}
  if path=='sitemap.xml':
   doc=ET.fromstring(text);item['urls']=[x.text for x in doc.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')];assert BASE in item['urls'] and BASE+'cafe-community/' in item['urls']
  if path.startswith('google'):assert text.strip()=='google-site-verification: '+path,'verification_mismatch'
  if path=='cafe-community/':assert '参加費' in text and '一人' in text
  report['resources'].append(item)
 root='https://nyokki519.github.io/robots.txt';st,h,text=get(root)
 rp=RobotFileParser();rp.parse(text.splitlines());report['originRobots']={'url':root,'httpStatus':st,'googlebotAllowed':True if st==404 else rp.can_fetch('Googlebot',BASE) if st==200 else None}
 assert report['originRobots']['googlebotAllowed'] is not False,'origin_robots_blocks_site'
 sources=[
  ('Google Search Analytics API','https://developers.google.com/webmaster-tools/v1/searchanalytics/query',['dataState','rowLimit','25000','50,000']),
  ('Google URL Inspection API','https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect',['indexed','inspectionUrl','siteUrl']),
  ('Google Search Central JavaScript SEO','https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics',['render','HTML']),
  ('Instagram official search engine visibility','https://help.instagram.com/147542625391305/',['professional','18','public','search engine']),
  ('Instagram Login Insights','https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/insights/',['insights','permissions','professional']),
  ('Facebook Login Insights','https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/insights/',['insights','permissions','professional'])
 ]
 for name,url,terms in sources:
  try:
   st,h,source=get(url);parser=Text();parser.feed(source);plain=' '.join(parser.parts)
   excerpts=[]
   for term in terms:
    i=plain.lower().find(term.lower())
    if i>=0:excerpts.append(plain[max(0,i-100):i+500])
   report['officialResearch'].append({'name':name,'url':url,'httpStatus':st,'status':'retrieved' if st==200 and excerpts else 'not_verified','sha256':hashlib.sha256(source.encode()).hexdigest(),'excerpts':excerpts})
  except Exception:report['officialResearch'].append({'name':name,'url':url,'status':'connection_unavailable'})
 try:
  st,h,body=get('https://unity-analytics.vercel.app/api/seo/reports')
  report['analyticsPrivateApi']={'httpStatus':st,'unauthenticatedDenied':st==401,'cacheControl':h.get('Cache-Control'),'status':'verified' if st==401 else 'deployment_or_configuration_pending'}
  assert st!=200,'analytics_report_publicly_accessible'
 except AssertionError:raise
 except Exception:report['analyticsPrivateApi']={'status':'connection_unavailable'}
 out=Path(a.output);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print('PASS published Pages, static content, guide, JSON-LD, sitemap, ownership, images and origin robots')
if __name__=='__main__':main()
