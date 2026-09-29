import React, { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { useOffline } from '../offline/OfflineContext.jsx';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const { isOnline } = useOffline();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  async function load() {
    if (!isOnline) return; // notifications are a live/online feature, not cached
    try {
      const data = await listNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setLoaded(true);
    } catch {
      // fail quietly — the bell just won't show a badge this session
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000); // light polling, no websockets needed for this project
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && !loaded) load();
  }

  async function handleMarkRead(id) {
    setNotifications((list) => list.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markNotificationRead(id);
    } catch {
      /* best effort */
    }
  }

  async function handleMarkAllRead() {
    setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      /* best effort */
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative inline-flex p-2 rounded-full text-inkSoft hover:text-ink hover:bg-paperDeep transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-ink/10 rounded-xl shadow-softHover py-1.5 text-sm z-50">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-ink/10">
            <p className="font-semibold text-ink text-xs uppercase tracking-wide">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-leaf font-medium hover:text-leafDeep">
                Mark all read
              </button>
            )}
          </div>

          {!isOnline && (
            <p className="px-3.5 py-4 text-xs text-inkSoft">Notifications need a connection — reconnect to check for updates.</p>
          )}

          {isOnline && notifications.length === 0 && (
            <p className="px-3.5 py-4 text-xs text-inkSoft">No notifications yet.</p>
          )}

          {isOnline &&
            notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => !n.isRead && handleMarkRead(n._id)}
                className={`w-full text-left px-3.5 py-2.5 border-b border-ink/5 last:border-0 hover:bg-paperDeep transition-colors ${
                  n.isRead ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-leaf mt-1.5 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink truncate">{n.title}</p>
                    <p className="text-xs text-inkSoft mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-inkSoft/70 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
