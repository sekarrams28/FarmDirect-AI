// Minimal promise-based wrapper around the native IndexedDB API.
// No extra dependency is needed for this — the browser's built-in
// IndexedDB is more than enough for the offline-first requirements
// (cached marketplace data, drafts, and a sync queue).
//
// Object stores:
//   - keyval        generic key/value store (profile, last sync time, etc.)
//   - produceCache   cached marketplace / "my produce" listings
//   - orderCache     cached recent orders
//   - aiCache        cached AI results (price prediction, buyer matches, ...)
//   - syncQueue      changes made while offline, waiting to be replayed

const DB_NAME = 'farmdirect_offline';
const DB_VERSION = 1;

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('keyval')) {
        db.createObjectStore('keyval', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('produceCache')) {
        db.createObjectStore('produceCache', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('orderCache')) {
        db.createObjectStore('orderCache', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('aiCache')) {
        db.createObjectStore('aiCache', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        const store = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        store.createIndex('createdAt', 'createdAt');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function withStore(storeName, mode, callback) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = callback(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ---- Generic key/value helpers (used for profile snapshot, last-sync time, language cache) ----

export async function kvSet(key, value) {
  return withStore('keyval', 'readwrite', (store) => store.put({ key, value }));
}

export async function kvGet(key) {
  const db = await openDB();
  const tx = db.transaction('keyval', 'readonly');
  const result = await requestToPromise(tx.objectStore('keyval').get(key));
  return result ? result.value : undefined;
}

// ---- Cache helpers (produce / orders / AI results) ----

export async function cachePutAll(storeName, items) {
  return withStore(storeName, 'readwrite', (store) => {
    items.forEach((item) => store.put(item));
  });
}

export async function cacheGetAll(storeName) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  return requestToPromise(tx.objectStore(storeName).getAll());
}

export async function aiCacheSet(key, value) {
  return withStore('aiCache', 'readwrite', (store) => store.put({ key, value, cachedAt: Date.now() }));
}

export async function aiCacheGet(key) {
  const db = await openDB();
  const tx = db.transaction('aiCache', 'readonly');
  const result = await requestToPromise(tx.objectStore('aiCache').get(key));
  return result ? result.value : undefined;
}

// ---- Sync queue (offline writes waiting to be replayed) ----

// item: { type: 'createProduce' | ..., payload, createdAt }
export async function queueAdd(item) {
  return withStore('syncQueue', 'readwrite', (store) => store.add({ ...item, createdAt: Date.now() }));
}

export async function queueGetAll() {
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readonly');
  return requestToPromise(tx.objectStore('syncQueue').getAll());
}

export async function queueRemove(id) {
  return withStore('syncQueue', 'readwrite', (store) => store.delete(id));
}

export async function queueCount() {
  const items = await queueGetAll();
  return items.length;
}
