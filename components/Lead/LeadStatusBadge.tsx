'use client';
import { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { LeadStatus } from '@/lib/types';
import { ObjectId } from 'mongodb';

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  intereseted: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800'
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  intereseted: 'Intereseted',
  closed: 'closed'
};

export default function LeadStatusBadge({
  leadId,
  initialStatus
}: {
  leadId: string;
  initialStatus: LeadStatus;
}) {
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function updateStatus(newStatus: LeadStatus) {
    if (newStatus === status) return;

    setLoading(true);
    setStatus(newStatus); // optimistic UI
    setOpen(false);

    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');
    } catch (err) {
      console.error(err);
      setStatus(initialStatus); // rollback
      alert('Failed to update lead status');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
          ${STATUS_STYLES[status]}
          hover:opacity-80 transition
        `}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {STATUS_LABELS[status]}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-40 rounded-lg border bg-white shadow-md">
          {Object.keys(STATUS_LABELS).map(s => (
            <button
              key={s}
              onClick={() => updateStatus(s as LeadStatus)}
              className="flex w-full px-3 py-2 text-sm hover:bg-gray-100 text-left"
            >
              {STATUS_LABELS[s as LeadStatus]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
