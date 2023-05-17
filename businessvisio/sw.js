

//from https://developers.google.com/web/fundamentals/codelabs/your-first-pwapp/
// and https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/

/////////////////////////
// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'visio'//'biblio';//'executive'
//var dbname = 'dwhbibliovox';//'mexecutive';
/////////////////////////

// CODELAB: Add list of files to cache here.
/*const FILES_TO_CACHE = [
  'css/maincss.css',
  'index.html',
  'js/app.js',
  'manifest.json',
  'https://unpkg.com/onsenui/css/onsenui.min.css',
  'https://unpkg.com/onsenui/css/onsen-css-components.min.css',
  'https://unpkg.com/onsenui/css/ionicons/css/ionicons.min.css',
  'https://unpkg.com/onsenui/css/material-design-iconic-font/css/material-design-iconic-font.min.css',
  'https://unpkg.com/onsenui/css/font_awesome/css/all.min.css',
  'https://unpkg.com/onsenui/css/font_awesome/css/v4-shims.min.css',
  'https://unpkg.com/onsenui/js/onsenui.min.js',
  'js/jquery-1.11.3.min.js',
  'https://d3js.org/d3.v5.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/he/1.1.1/he.js',
  'https://bookshelfmgr.scholarvis.io/js?accesskey=bCgtxN3626KgydlOhJ435NaEgqbaLhblgl4yBMFV',
  'https://dmaster-d25.staging-cyberlibris.com/data/dwh/' + dbname + 'entrykeys1.json',
  'https://dmaster-d25.staging-cyberlibris.com/data/dwh/' + dbname + 'preview.json'
];
*/

const MIN_FILES_TO_CACHE = ['indexoffline.html'];

// INSTALL
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  self.skipWaiting();

  // CODELAB: Precache static resources here.
  evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[ServiceWorker] Pre-caching offline page');
        return cache.addAll(MIN_FILES_TO_CACHE);
        /* 
        A RETIRER POUR OFFLINE STRATEGY
        return cache.addAll(FILES_TO_CACHE);
        /A RETIRER POUR OFFLINE STRATEGY 
        */
      })
  );


});

// VALIDATE
self.addEventListener('activate', function(event) {
  console.log('[ServiceWorker] Activate');
  event.waitUntil( 
    // DELETE OLD CACHE IF ANY
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName != CACHE_NAME;
          // Return true if you want to remove this cache,
          // but remember that caches are shared across
          // the whole origin
        }).map(function(cacheName) {
          console.log('[ServiceWorker] Removing old cache', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );

  // FORCE RELOAD INDEX, CSS AND JS FOR UPDATES -- marche pas trop j'ai l'impression - pas sûr
  /*event.waitUntil(  
    caches.open(CACHE_NAME).then(function(cache) {
        if(navigator.onLine == true){
          ['index.html', 'js/app.js', 'css/maincss.css'].map(function(request){
            console.log(request);
            fetch(request)
              .then(function(networkResponse) {
                console.log(networkResponse);
                cache.put(request, networkResponse.clone());
              })            
          });
        };
    })
  );*/

  // Permet de s'assurer que le SW nvellement activé soit bien utilisé par le navigateur
  self.clients.claim()
});


// FETCH STRATEGY 1
// https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/
// "Cache, falling back to network" strategy
// Cache only if in the cache and network only if not cached
// Ne fonctionne pas offline car ONSEN télécharge des liens indirectement. Il faudrait les ajouter dans le cache statique initial
  
/* 
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        console.log(response);
        var fetchPromise = fetch(event.request).then(function(networkResponse) {
          //cache.put(event.request, networkResponse.clone());
          return networkResponse;
        })
        return response || fetchPromise;
      })
    })
  );
});
*/

// FETCH STRATEGY 2
// https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/
// "Stale-while-revalidate" strategy
// Use what's in the cache if cached and also update the cache (if online) with the last version of the fetched answer (which will be used next time it is asked)



self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        var fetchPromise = fetch(event.request)
          .then(function(networkResponse) {
            //console.log(event.request.url);
            //console.log(event.request.url.startsWith('https://unpkg'));
            
            /* 
            A RETIRER POUR OFFLINE STRATEGY
            if(event.request.url.startsWith('https://unpkg')) {
              cache.put(event.request, networkResponse.clone());
            }
            /A RETIRER POUR OFFLINE STRATEGY 
            */
            
            return networkResponse;
          })
          .catch(function () {
            return caches.match('indexoffline.html');
          });
        return response || fetchPromise;
      })
    })
  );
});


// PUSH NOTIFICATIONS

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');

  console.log(event.data.json());
  var datapushed = event.data.json();

  const title = datapushed.title;
  const options = {
    body: datapushed.body,
    icon: 'img/icon96.png',
    badge: 'img/transparent/icon144.png',
    data: datapushed.body,
    image: datapushed.image,
    vibrate: [200, 200, 1000]

  };

  event.waitUntil(self.registration.showNotification(title, options));
  });



self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event.notification.tag);
  
  event.notification.close();

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(function(clientList) {
    console.log(clientList);
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url == '/' && 'focus' in client)
        return client.focus();
    }
    if (clients.openWindow)
      return clients.openWindow('index.html', '_self');
  }));
});