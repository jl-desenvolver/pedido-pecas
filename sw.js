// Service worker: deixa o app abrir mais rápido e funcionar sem internet.
// Ao mudar qualquer arquivo do app, aumente o número da versão abaixo (ep-v13 -> ep-v14).
const V = "ep-v13";
const ARQUIVOS = [
  "./",
  "index.html",
  "manifest.json",
  "css/estilo.css",
  "dados/catalogo.js",
  "js/01-util.js",
  "js/02-estado.js",
  "js/03-nuvem.js",
  "js/04-navegacao.js",
  "js/10-pecas.js",
  "js/11-clientes.js",
  "js/12-pedido.js",
  "js/13-historico.js",
  "js/14-categorias.js",
  "js/15-usuarios.js",
  "js/16-inicio.js",
  "js/20-pdf.js",
  "js/99-iniciar.js",
  "img/logo.png",
  "img/simbolo.png",
  "img/icon-192.png",
  "img/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ARQUIVOS.map(u => new Request(u, { cache: "reload" })))));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x != V).map(x => caches.delete(x)))));
  clients.claim();
});

self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method != "GET") return;
  const mesmoSite = u.origin == location.origin;
  const biblioteca = /(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com)$/.test(u.host);
  if (!mesmoSite && !biblioteca) return;            // nunca guarda chamadas ao Supabase

  // fotos, imagens e bibliotecas: usa a cópia guardada primeiro (rápido)
  if (!mesmoSite || /\/(fotos|img)\//.test(u.pathname)) {
    e.respondWith(caches.match(r).then(c => c || fetch(r).then(res => {
      const cp = res.clone(); caches.open(V).then(x => x.put(r, cp)); return res;
    })));
    return;
  }
  // código do app: tenta a internet primeiro, para sempre pegar a versão nova
  e.respondWith(fetch(r).then(res => {
    const cp = res.clone(); caches.open(V).then(x => x.put(r, cp)); return res;
  }).catch(() => caches.match(r).then(c => c || caches.match("index.html"))));
});
