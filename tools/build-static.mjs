import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
const box = {window: {}};
vm.runInNewContext(read('content.js'), box);
const c = box.window.UNITY_CONTENT;
const esc = x => String(x ?? '').replace(/[&<>"']/g, a => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a]));
const photo = (id, hero=false, sizes='(max-width: 600px) 90vw, 40vw') => {
 const p=c.photos[id]; if(!p?.src)return '';
 return `<img src="${esc(p.src)}" ${p.srcset?`srcset="${esc(p.srcset)}" sizes="${sizes}"`:''} width="${p.width}" height="${p.height}" alt="${esc(p.alt)}" loading="${hero?'eager':'lazy'}" decoding="async"${hero?' fetchpriority="high"':''}>`;
};
let html=read('index.html');
const fill=(key,pattern,value)=>{
 const a=`<!-- STATIC:${key}:START -->`,b=`<!-- STATIC:${key}:END -->`;
 if(html.includes(a)){const i=html.indexOf(a)+a.length,j=html.indexOf(b,i);html=html.slice(0,i)+value+html.slice(j);}
 else {let found=false;html=html.replace(pattern,(_,open,close)=>{found=true;return open+a+value+b+close});if(!found)throw Error(`slot_missing:${key}`);}
};
const id=(key,value)=>fill(key,new RegExp(`(<[a-z0-9]+\\b[^>]*\\bid="${key}"[^>]*>)(\\s*</[a-z0-9]+>)`),value);
for(const [slot,pid] of Object.entries(c.featured))fill(`featured-${slot}`,new RegExp(`(<div[^>]*data-featured="${slot}"[^>]*>)(\\s*</div>)`),photo(pid,slot==='hero',slot==='hero'?'100vw':'(max-width: 600px) 90vw, 55vw'));
for(const pid of ['venue','coffee'])fill(`photo-${pid}`,new RegExp(`(<div[^>]*data-photo="${pid}"[^>]*>)(\\s*</div>)`),photo(pid));
const r=c.representative;
id('representative-photo',photo(r.photo,false,'(max-width: 600px) 85vw, 40vw'));
for(const [key,value] of Object.entries({role:r.role,heading:r.heading.join('\n'),message:r.message,name:r.name,hobby:r.hobby}))id(`representative-${key}`,esc(value));
id('host-list',c.hosts.map((h,i)=>`<article class="host"><div class="host-photo photo-frame">${photo(h.photo,false,'(max-width: 900px) 42vw, 22vw')}</div><p class="host-role">${esc(h.role)}<span>${String(i+2).padStart(2,'0')}</span></p><h4 class="host-name">${esc(h.name)}</h4><p class="host-message">${esc(h.message)}</p><details class="host-details"><summary>好きなこと</summary><p class="host-hobby">${esc(h.hobby)}</p></details></article>`).join(''));
id('voice-list',c.voices.map(v=>`<figure><blockquote>${esc(v.quote)}</blockquote><figcaption>${esc(v.name)}<span>${esc(v.detail)}</span></figcaption></figure>`).join(''));
id('gallery-list',c.gallery.filter(s=>c.photos[s.photo]?.src).map((s,i)=>`<figure class="gallery-item ${s.layout}"><a class="gallery-open" href="${esc(c.photos[s.photo].src)}" aria-label="写真を拡大：${esc(s.caption)}"><div class="gallery-photo photo-frame">${photo(s.photo)}</div></a><figcaption><div>${esc(s.caption)}</div><span>${String(i+1).padStart(2,'0')}</span></figcaption></figure>`).join(''));
id('event-list',c.events.map((e,i)=>`<article class="event-card"><span class="event-index" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><div class="event-category"><span>${esc(e.category)}</span><span>開催案内</span></div><h3>${esc(e.title)}</h3><div class="event-meta"><span>日程はInstagram・公式LINEでご案内</span><span>${esc(e.location)}</span></div><p>${esc(e.description)}</p><a class="text-link" href="${esc(e.url||c.links.registration)}" target="_blank" rel="noopener noreferrer">参加申込フォームへ<span aria-hidden="true">↗</span></a></article>`).join(''));
html=html.replace(/<a\b[^>]*data-link="([^"]+)"[^>]*>/gs,(tag,key)=>{const url=c.links[key];if(!url||!/^https:\/\//.test(url))throw Error('link_invalid');return tag.replace(/\s+href="[^"]*"/g,'').replace('<a ',`<a href="${esc(url)}" `)});
// Static photo frames reserve dimensions and keep their original crop positions.
html=html.replace(/<div\b([^>]*(?:data-photo|data-featured|id="representative-photo")[^>]*)>/g,(_,attrs)=>`<div${attrs.replace(/class="([^"]*)"/,(_,cl)=>`class="${cl.split(' ').includes('photo-frame')?cl:cl+' photo-frame'}"`)}>`);
const base='https://nyokki519.github.io/unityHP/';
const graph={'@context':'https://schema.org','@graph':[
 {'@type':'Organization','@id':base+'#organization',name:'Unity',alternateName:'カフェコミュニティUnity',url:base,description:'東京・品川を中心に活動する20代中心のカフェコミュニティ。',logo:base+'assets/images/unity-logo-396.webp',sameAs:['https://www.instagram.com/unity_up9/','https://tunagate.com/circle/93279']},
 {'@type':'WebSite','@id':base+'#website',url:base,name:'カフェコミュニティUnity',inLanguage:'ja',publisher:{'@id':base+'#organization'}},
 {'@type':'WebPage','@id':base+'#webpage',url:base,name:'東京・品川の20代カフェコミュニティ Unity',inLanguage:'ja',isPartOf:{'@id':base+'#website'},about:{'@id':base+'#organization'}}
]};
const json=`<script type="application/ld+json">${JSON.stringify(graph).replace(/</g,'\\u003c')}</script>`;
html=html.includes('<!-- SEO_GRAPH -->')?html.replace(/<!-- SEO_GRAPH -->[\s\S]*?<!-- END_SEO_GRAPH -->/,`<!-- SEO_GRAPH -->${json}<!-- END_SEO_GRAPH -->`):html.replace('</head>',`<!-- SEO_GRAPH -->${json}<!-- END_SEO_GRAPH -->\n</head>`);
html=html.replace('<title>Unity | 東京の20代カフェコミュニティ</title>','<title>東京・品川の20代カフェ会・社会人コミュニティ｜Unity</title>');
if(!html.includes('<!-- SEO_GUIDE_LINK -->'))html=html.replace('<div class="intro-story">','<div class="intro-story"><p><!-- SEO_GUIDE_LINK --><a class="text-link" href="cafe-community/">カフェ会の参加ガイド <span aria-hidden="true">↗</span></a></p>');
if(!html.includes('data-link="tunagate"'))html=html.replace('<div class="social-links">','<div class="social-links"><a data-link="tunagate" href="https://tunagate.com/circle/93279" target="_blank" rel="noopener noreferrer">つなげーと <span aria-hidden="true">↗</span></a>');
html=html.replace(/<noscript\s*>\s*<div class="noscript-note">[\s\S]*?<\/div><\/noscript\s*>/, '<noscript><div class="noscript-note">開催日時・参加費は<a href="https://nyokki519.github.io/Unity_S/">参加申込フォーム</a>でご確認ください。お問い合わせは<a href="https://lin.ee/vRZi9Rf">公式LINE</a>へ。</div></noscript>');
fs.writeFileSync(new URL('index.html',root),html);
console.log('Built searchable static content, links and JSON-LD from content.js');
