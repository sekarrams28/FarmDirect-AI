import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { kvGet, kvSet, queueAdd, queueGetAll, queueRemove, queueCount } from './db.js';
import { createProduce as apiCreateProduce } from '../services/api.js';

const OfflineContext = createContext(null);

const LAST_SYNC_KEY = 'lastSyncedAt';

// Maps a queued item's `type` to the API call that replays it once the
// device is back online. Add a new entry here whenever a new kind of
// offline-capable write is introduced.
const REPLAY_HANDLERS = {
  createProduce: (payload) => apiCreateProduce(payload),
};

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    try {
      setPendingCount(await queueCount());
    } catch {
      // IndexedDB unavailable (e.g. private browsing) — degrade silently,
      // the app just won't have an offline queue this session.
    }
  }, []);

  const markSynced = useCallback(async () => {
    const now = Date.now();
    setLastSyncedAt(now);
    try {
      await kvSet(LAST_SYNC_KEY, now);
    } catch {
      /* best effort */
    }
  }, []);

  // Replay every queued offline write, in the order it was created.
  // Items that still fail (e.g. the listing was deleted meanwhile) are
  // dropped after a failed attempt is logged, rather than retried forever.
  const syncQueue = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const items = await queueGetAll();
      const sorted = items.sort((a, b) => a.createdAt - b.createdAt);
      for (const item of sorted) {
        const handler = REPLAY_HANDLERS[item.type];
        try {
          if (handler) await handler(item.payload);
          await queueRemove(item.id);
        } catch (err) {
          console.error('Failed to sync queued item, will retry later:', item, err);
          // Leave it in the queue for the next sync attempt.
        }
      }
      await refreshPendingCount();
      await markSynced();
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [markSynced, refreshPendingCount]);

  useEffect(() => {
    kvGet(LAST_SYNC_KEY).then((v) => {
      if (v) setLastSyncedAt(v);
    });
    refreshPendingCount();

    function handleOnline() {
      setIsOnline(true);
      syncQueue();
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // If we're already online at load time, try a sync in case there's a
    // leftover queue from a previous offline session.
    if (navigator.onLine) syncQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Queue a write made while offline; returns a placeholder so the UI can
  // optimistically show something immediately.
  const enqueue = useCallback(
    async (type, payload) => {
      await queueAdd({ type, payload });
      await refreshPendingCount();
    },
    [refreshPendingCount]
  );

  return (
    <OfflineContext.Provider
      value={{ isOnline, lastSyncedAt, pendingCount, syncing, enqueue, syncNow: syncQueue, markSynced }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
}
