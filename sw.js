const V="ep-v8",A=["./","index.html","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(A.map(u=>new Request(u,{cache:"reload"})))));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))));clients.claim()});
self.addEventListener("fetch",e=>{const r=e.request,u=new URL(r.url);if(r.method!="GET")return;
const same=u.origin==location.origin,cdn=/(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com)$/.test(u.host);if(!same&&!cdn)return;
if(same){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(x=>x.put(r,cp));return res}).catch(()=>caches.match(r).then(c=>c||caches.match("index.html"))));return}
e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(x=>x.put(r,cp));return res})))});
