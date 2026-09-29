import React from 'react';
import { CheckCircle2, Circle, XCircle, MessageSquare } from 'lucide-react';

// Mirrors the plan's "Order Timeline" stages. Cancellation is handled as
// its own terminal state rather than a stage on this line.
const STAGES = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Farmer Confirmed' },
  { key: 'collecting', label: 'Collecting Produce' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

const SMS_BADGE = {
  sent: { label: 'SMS Sent', className: 'badge-success' },
  pending: { label: 'SMS Pending', className: 'badge-warning' },
  failed: { label: 'SMS Failed', className: 'badge-danger' },
  skipped: { label: 'SMS Skipped', className: 'badge-neutral' },
};

export function SmsStatusBadge({ status }) {
  if (!status || !SMS_BADGE[status]) return null;
  const { label, className } = SMS_BADGE[status];
  return (
    <span className={`badge ${className} inline-flex items-center gap-1 text-[10px]`}>
      <MessageSquare size={10} /> {label}
    </span>
  );
}

export default function OrderTimeline({ order }) {
  if (order.status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-sm text-danger">
        <XCircle size={16} />
        <span className="font-medium">Order cancelled</span>
      </div>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.key === order.status);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {STAGES.map((stage, i) => {
        const done = i <= currentIndex;
        return (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center gap-1 min-w-[76px]">
              {done ? (
                <CheckCircle2 size={16} className="text-leaf" />
              ) : (
                <Circle size={16} className="text-ink/20" />
              )}
              <span className={`text-[10px] text-center leading-tight ${done ? 'text-ink font-medium' : 'text-inkSoft'}`}>
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`h-px flex-1 min-w-[16px] ${i < currentIndex ? 'bg-leaf' : 'bg-ink/10'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
