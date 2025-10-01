// Empty service worker to override any cached service workers
// This ensures no service worker functionality is active

// Immediately unregister this service worker
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
  // Unregister itself
  self.registration.unregister().then(() => {
    console.log('Service worker unregistered itself');
  });
});

// Block all fetch events
self.addEventListener('fetch', (event) => {
  // Do nothing - let the browser handle requests normally
});

// Block all message events
self.addEventListener('message', (event) => {
  // Ignore all messages
});

// Block all sync events
self.addEventListener('sync', (event) => {
  // Do nothing
});

// Block all push events
self.addEventListener('push', (event) => {
  // Do nothing
});