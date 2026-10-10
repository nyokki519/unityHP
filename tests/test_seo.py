import json,re,unittest
from pathlib import Path
from xml.etree import ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
class SeoTest(unittest.TestCase):
 def test_initial_html_has_real_members_photos_and_links(self):
  s=(ROOT/'index.html').read_text();body=s.split('<body>',1)[1]
  for text in ['やぶ（矢吹）','さやか','にょっき','みちか','いけちゃん','年間300店舗以上']:self.assertTrue(text in body,text+" absent from initial HTML")
  self.assertRegex(body,r'<img[^>]+alt="カフェのテーブルを囲み')
  self.assertRegex(body,r'<a[^>]+href="https://www.instagram.com/unity_up9/')
  self.assertIn('https://tunagate.com/circle/93279',body)
 def test_jsonld_has_true_organization_and_no_fake_events(self):
  s=(ROOT/'index.html').read_text();blocks=re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)
  self.assertTrue(blocks);graph=json.loads(blocks[0])['@graph'];org=next(x for x in graph if x['@type']=='Organization')
  self.assertEqual(org['name'],'Unity');self.assertIn('https://www.instagram.com/unity_up9/',org['sameAs']);self.assertFalse(any(x['@type']=='Event' for x in graph))
 def test_useful_guide_and_existing_verification(self):
  p=ROOT/'cafe-community/index.html';self.assertTrue(p.exists());s=p.read_text();self.assertIn('参加費',s);self.assertIn('一人',s)
  xml=ET.parse(ROOT/'sitemap.xml');loc=[n.text for n in xml.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
  self.assertIn('https://nyokki519.github.io/unityHP/cafe-community/',loc)
  self.assertEqual((ROOT/'googledd387772a63fca83.html').read_text().strip(),'google-site-verification: googledd387772a63fca83.html')
 def test_canonical_and_noindex(self):
  s=(ROOT/'index.html').read_text();self.assertIn('href="https://nyokki519.github.io/unityHP/"',s);self.assertNotIn('noindex',s.lower())
