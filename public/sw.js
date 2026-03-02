// Basic service worker for PWA installability
// This enables the app to be installable without any caching functionality yet
const CACHE_NAME = 'match-diary-v1';

// Install event
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event  
self.addEventListener('activate', (event) => {
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Fetch event - for now just pass through requests
self.addEventListener('fetch', (event) => {
  // For now, just pass through all requests without caching
  // Caching functionality can be added later
  event.respondWith(fetch(event.request));
});