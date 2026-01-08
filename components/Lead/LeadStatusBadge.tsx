'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { LeadStatus } from '@/lib/types';
import { useLeadsStore } from '@/store/leads/leadStore';

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  intereseted: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800'
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  intereseted: 'Interested',
  closed: 'Closed'
};

export default function LeadStatusBadge({
  leadId,
  initialStatus
}: {
  leadId: string;
  initialStatus: LeadStatus;
}) {
  const updateLeadStatus = useLeadsStore(state => state.updateLeadStatus);

  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  async function updateStatus(newStatus: LeadStatus) {
    if (newStatus === status) return;

    setLoading(true);
    setStatus(newStatus);
    setOpen(false);

    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      updateLeadStatus(leadId, newStatus);
    } catch (err) {
      console.error(err);
      setStatus(initialStatus); // rollback
      alert('Failed to update lead status');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        onClick={() => !loading && setOpen(prev => !prev)}
        disabled={loading}
        className={`
          flex items-center gap-1.5
          px-3 py-1.5
          rounded-full text-sm font-medium
          ${STATUS_STYLES[status]}
          hover:shadow-sm
          transition-all
        `}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {STATUS_LABELS[status]}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div
          className="
            absolute z-30 mt-2 w-44
            rounded-xl
            border border-gray-200
            bg-white/90 backdrop-blur
            shadow-lg
            overflow-hidden
          "
        >
          {Object.keys(STATUS_LABELS).map(key => {
            const st = key as LeadStatus;
            return (
              <button
                key={st}
                onClick={() => updateStatus(st)}
                className="
                  flex w-full items-center gap-2
                  px-4 py-2 text-sm text-left
                  hover:bg-gray-100
                  transition
                "
              >
                <span
                  className={`h-2 w-2 rounded-full ${STATUS_STYLES[st]}`}
                />
                {STATUS_LABELS[st]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
