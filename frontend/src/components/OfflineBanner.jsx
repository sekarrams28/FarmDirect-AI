import React from 'react';
import { WifiOff, RefreshCw, CloudUpload } from 'lucide-react';
import { useOffline } from '../offline/OfflineContext.jsx';

function formatTime(ts) {
  if (!ts) return 'never';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Always mounted (see App.jsx). Shows nothing extra when online with no
// pending items, so it never adds noise to the normal, connected flow —
// but the moment the device drops offline, or there are queued changes
// waiting to sync, this is visible on every page.
export default function OfflineBanner() {
  const { isOnline, lastSyncedAt, pendingCount, syncing, syncNow } = useOffline();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`w-full text-xs sm:text-sm px-4 py-2 flex items-center justify-center gap-2 text-center ${
        isOnline ? 'bg-amber-100 text-amber-900' : 'bg-ink text-white'
      }`}
      role="status"
    >
      {!isOnline && (
        <>
          <WifiOff size={14} />
          <span className="font-semibold">OFFLINE MODE ACTIVE</span>
          <span className="opacity-80">— Last synchronized: {formatTime(lastSyncedAt)}</span>
          {pendingCount > 0 && (
            <span className="opacity-80">· {pendingCount} change{pendingCount === 1 ? '' : 's'} queued</span>
          )}
        </>
      )}
      {isOnline && pendingCount > 0 && (
        <>
          <CloudUpload size={14} />
          <span>
            {syncing ? 'Syncing…' : `${pendingCount} offline change${pendingCount === 1 ? '' : 's'} waiting to sync`}
          </span>
          {!syncing && (
            <button onClick={syncNow} className="inline-flex items-center gap-1 underline font-medium">
              <RefreshCw size={12} /> Sync now
            </button>
          )}
        </>
      )}
    </div>
  );
}
