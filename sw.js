const V="ep-v7",A=["./","index.html","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))));clients.claim()});
self.addEventListener("fetch",e=>{const r=e.request,u=new URL(r.url);if(r.method!="GET")return;const cdn=/(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)$/.test(u.host);if(u.origin!=location.origin&&!cdn)return;
if(u.pathname.endsWith("config.js")){e.respondWith(fetch(r).catch(()=>caches.match(r)));return}
e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(x=>x.put(r,cp));return res}).catch(()=>caches.match("index.html"))))});
