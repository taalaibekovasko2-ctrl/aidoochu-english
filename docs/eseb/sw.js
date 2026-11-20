var C="jolesep-v39",A=["./","index.html","core.js?v=38","app.js?v=38","manifest.json","icon-192.png","icon-512.png"];
/* reader libraries (PDF.js, OCR, Excel) come from the CDN: kept in their own cache so statements are read without internet after the first time */
var LIB="jolesep-lib-1",CDN="https://cdn.jsdelivr.net/npm/",PRE=[CDN+"pdfjs-dist@3.11.174/build/pdf.min.js",CDN+"pdfjs-dist@3.11.174/build/pdf.worker.min.js"];
function libGet(u){return fetch(new Request(u,{mode:"cors",credentials:"omit"})).then(function(r){if(r.ok){var c=r.clone();caches.open(LIB).then(function(x){x.put(u,c)})}return r})}
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(A)}).then(function(){return Promise.all(PRE.map(function(u){return caches.match(u).then(function(r){return r||libGet(u)}).catch(function(){})}))}));self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x.indexOf("jolesep-")===0&&x!==C&&x!==LIB}).map(function(x){return caches.delete(x)}))}));self.clients.claim()});
self.addEventListener("fetch",function(e){var u=new URL(e.request.url);if(e.request.method!=="GET")return;
 if(u.href.indexOf(CDN)===0){e.respondWith(caches.open(LIB).then(function(x){return x.match(u.href)}).then(function(r){return r||libGet(u.href)}));return}
 if(u.origin!==location.origin||u.pathname.indexOf("/eseb/")<0)return;
 e.respondWith(fetch(e.request).then(function(r){var c=r.clone();caches.open(C).then(function(x){x.put(e.request,c)});return r}).catch(function(){return caches.match(e.request).then(function(r){return r||caches.match("index.html")})}))});
