import React, { useState } from 'react';
import { MessageSquareOff, MessageSquare } from 'lucide-react';
import { updateNotificationPreferences } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

// Plan: "Add a notification/settings area where users can optionally
// enable or disable non-critical SMS notifications if desired."
export default function SmsPreferenceToggle() {
  const { user, setUser } = useAuth();
  const [smsOptOut, setSmsOptOut] = useState(Boolean(user?.smsOptOut));
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !smsOptOut;
    setSmsOptOut(next); // optimistic
    setSaving(true);
    try {
      const data = await updateNotificationPreferences({ smsOptOut: next });
      if (setUser && data?.user) setUser(data.user);
    } catch {
      setSmsOptOut(!next); // revert on failure
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-inkSoft hover:text-ink transition-colors disabled:opacity-50"
      title={smsOptOut ? 'SMS notifications are off' : 'SMS notifications are on'}
    >
      {smsOptOut ? <MessageSquareOff size={14} /> : <MessageSquare size={14} />}
      {smsOptOut ? 'SMS notifications off' : 'SMS notifications on'}
    </button>
  );
}
