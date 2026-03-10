// Service Worker for Taskal PWA
const CACHE_NAME = 'taskal-v1';

// インストール時にキャッシュするアセット
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// インストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// アクティベート（古いキャッシュを削除）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// フェッチ: ネットワーク優先、失敗時はキャッシュにフォールバック
self.addEventListener('fetch', (event) => {
  // GETリクエスト以外はスキップ
  if (event.request.method !== 'GET') return;
  // chrome-extension はスキップ
  if (event.request.url.startsWith('chrome-extension')) return;
  // Supabase API はネットワークのみ（キャッシュしない）
  if (
    event.request.url.includes('supabase.co') ||
    event.request.url.includes('/api/')
  ) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
