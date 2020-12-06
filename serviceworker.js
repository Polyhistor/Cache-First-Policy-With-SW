// we are not caching the files, we are caching the routes
const precacheList = [
  '/',
  'mission.html',
  'resources.html',
  'tours.html',
  'app.js',
  'weather.js',
  'offline.json',
  '_css/fonts.css',
  '_css/main.css',
  '_css/mobile.css',
  '_css/tablet.css',
  '_images/back_bug.gif',
  '_images/desert_desc_bug.gif',
  '_images/nature_desc_bug.gif',
  '_images/backpack_bug.gif',
  '_images/flag.jpg',
  '_images/snow_desc_bug.gif',
  '_images/calm_bug.gif',
  '_images/home_page_back.jpg',
  '_images/springs_desc_bug.gif',
  '_images/calm_desc_bug.gif',
  '_images/kids_desc_bug.gif',
  '_images/star_bullet.gif',
  '_images/cycle_desc_bug.gif',
  '_images/logo.gif',
  '_images/taste_bug.gif',
  '_images/cycle_logo.png',
  '_images/looking.jpg',
  '_images/taste_desc_bug.gif',
  '_images/desert_bug.gif',
  '_images/mission_look.jpg',
  '_images/tour_badge.png',
];

// waiting till caches complete
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open('california-assets-v2')
      .then((cache) => {
        return cache.addAll(precacheList);
      })
      .catch((e) => {
        console.info(e);
      })
  );
});

// runnin our whitelist check once the service worker is activated
self.addEventListener('activate', (event) => {
  // creating a whitelist
  const cacheWhiteList = ['california-assets-v2', 'california-fonts-v1'];
  event.waitUntil(
    caches.keys().then((names) => {
      Promise.all(
        names.map((cacheKey) => {
          if (cacheWhiteList.indexOf(cacheKey) === -1) {
            // we don't need this cache key
            return caches.delete(cacheKey);
          }
        })
      );
    })
  );
});

const allertPagesUpdate = () => {
  clients
    .matchAll({
      // we do not want to push clients that are not under the control of the service worker
      includeUncontrolled: false,
      // we want to push to all the open client tabs
      type: 'window',
    })
    .then((clients) => {
      // broadcasting through message protocol to all window based clients (basically browser tabs)
      clients.forEach((client) => {
        const clientId = client.id;
        const type = client.type;
        const url = client.url;

        client.postMessage({
          action: 'resources-updated',
        });
      });
    });
};

// receiving the message through message protocol
self.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.action) {
    case 'update-resouces':
      caches
        .open('california-assets-v2')
        .then((cache) => {
          return cache.addAll(precacheList).then(() => {
            allertPagesUpdate();
          });
        })
        .catch((e) => {
          console.info(e);
        });
      break;
  }
});

// listening for sync events
self.addEventListener('sync', (event) => {
  console.log(event);
  if (event.tag.substring(0, 4) == 'vote') {
    const tourId = event.tag.substring(5);
    fetch(`/vote.json?id=${tourId}`)
      .then((r) => r.json())
      .then((voted) => {
        console.log('sync: voted!');
      });
  }
});

// sniffing on network requests
self.addEventListener('fetch', (event) => {
  const parsedUrl = new URL(event.request.url);

  // proxying requests from the API
  if (parsedUrl.host == 'jsonplaceholder.typicode.com' && !navigator.onLine) {
    event.respondWith(fetch('offline.json'));
  } else if (parsedUrl.pathname.match(/^\/_css*/)) {
    // Network-first policy
    // event.respondWith(
    //   fetch(event.request).catch((e) => caches.match(event.request))
    // );
    // Stale while revalidate
    event.respondWith(
      caches.match(event.request).then((response) => {
        const networkFetch = fetch(event.request).then((networkResponse) => {
          return caches.open('california-assets-v2').then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });

        return response || networkFetch;
      })
    );
  } else {
    // Cache-first Policy
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response; // the URL is cached
        } else {
          if (parsedUrl.pathname.match(/^\/_fonts*/)) {
            const fetchRequest = fetch(event.request).then(
              (networkResponse) => {
                return caches.open('california-fonts-v1').then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
              }
            );

            return fetchRequest;
          } else {
            return fetch(event.request); // we go to the actual network
          }
        }
      })
    );
  }
});
