# a few tips for service workers:

1. Navigation preload is a good approach for low-end devices, because it allows concurrent installation of the service worker and the request being sent from the browser

2. Do not overuse client's agents by running a website and installing a service worker concurrently. Check if the document has been rendered, and then install the service worker: 

window.addEventListener("load", () => {
    navigation.serviceWorker.register("sw.js")
})

3. Try swapping service workers, so to skip waiting, this ensures that the latest version of the service worker is always available. Here is how you achive that: 

self.addEventListener("install", e => {
    self.skipWaiting();
})
 
however by doing this, you remove the old service worker, and the new service worker does not automatically claim the clients. So you need to take care of this bit yourself as well, this is how that's achieved: 

self.addEventListener("activate", e => {
    event.waitUntill(
        self.clients.claim()
    )
})

one last thing, if your old service worker had a tight relation with your html pages; let's say there is a post message they send back and forth. Once you install the new one, and the new one does not support the same messaging, then you have a HTML page that tries to communicate something that does not exist, this is rare, but can possible happen! 