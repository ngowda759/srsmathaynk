/**
 * Service Worker for Performance Optimization
 * - Asset caching
 * - Offline support
 * - Background sync
 */

const CACHE_NAME = 'srsmathaynk-v1'
const STATIC_CACHE = 'srsmathaynk-static-v1'
const DYNAMIC_CACHE = 'srsmathaynk-dynamic-v1'

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
]

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  cacheFirst: ['/static/', '.css', '.js', '.woff2', '.png', '.jpg', '.webp'],
  
  // Network first for API calls
  networkFirst: ['/api/'],
  
  // Stale while revalidate for pages
  staleWhileRevalidate: ['/events', '/sevas', '/announcements'],
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

// Fetch event - apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return

  // Apply caching strategy based on request type
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request))
  } else if (isNetworkFirst(url.pathname)) {
    event.respondWith(networkFirst(request))
  } else if (isStaleWhileRevalidate(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request))
  } else {
    event.respondWith(networkFirst(request))
  }
})

// Check if request is for static assets
function isStaticAsset(pathname) {
  return CACHE_STRATEGIES.cacheFirst.some(
    (pattern) => pathname.includes(pattern) || pathname.endsWith(pattern)
  )
}

// Check if request is for API
function isNetworkFirst(pathname) {
  return CACHE_STRATEGIES.networkFirst.some((pattern) => pathname.includes(pattern))
}

// Check if request should use stale-while-revalidate
function isStaleWhileRevalidate(pathname) {
  return CACHE_STRATEGIES.staleWhileRevalidate.some((pattern) => pathname.startsWith(pattern))
}

// Cache First Strategy
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // Return offline fallback if available
    return caches.match('/offline.html')
  }
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) return cached
    
    // Return offline response for API
    return new Response(
      JSON.stringify({ error: 'Offline', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)

  const fetchPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => null)

  return cached || fetchPromise
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-donations') {
    event.waitUntil(syncDonations())
  }
})

async function syncDonations() {
  // Get pending donations from IndexedDB and retry
  // This would be implemented with actual IndexedDB code
  console.log('Background sync: donations')
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: data.url,
      actions: data.actions || [],
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    )
  }
})
