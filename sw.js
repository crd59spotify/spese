var CACHE='spese-v8';
var FILES=['./','index.html','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==CACHE}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}))});
function netFirst(req){
  return new Promise(function(res){
    var done=false;
    var t=setTimeout(function(){caches.match(req,{ignoreSearch:true}).then(function(h){if(h&&!done){done=true;res(h)}})},3000);
    fetch(req).then(function(r){
      clearTimeout(t);
      if(r&&r.ok){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(req,cp)})}
      if(!done){done=true;res(r)}
    }).catch(function(){
      clearTimeout(t);
      caches.match(req,{ignoreSearch:true}).then(function(h){if(!done){done=true;res(h||Response.error())}});
    });
  });
}
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){e.respondWith(netFirst(e.request));return}
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(function(hit){
    var net=fetch(e.request).then(function(r){if(r&&r.ok){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,cp)})}return r}).catch(function(){return hit});
    return hit||net;
  }));
});
