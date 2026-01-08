'use client';

import { useDroppable } from '@dnd-kit/core';
import { ILead, LeadStatus } from '@/lib/types';
import DraggableLead from './DraggableLead';
const COLUMN_BG: Record<LeadStatus, string> = {
  new: 'bg-blue-50',
  contacted: 'bg-yellow-50',
  intereseted: 'bg-green-50',
  closed: 'bg-red-50'
};
const COLUMN_BORDER: Record<LeadStatus, string> = {
  new: 'border-blue-200',
  contacted: 'border-yellow-200',
  intereseted: 'border-green-200',
  closed: 'border-red-200'
};

const COLUMN_RING: Record<LeadStatus, string> = {
  new: 'ring-blue-300',
  contacted: 'ring-yellow-300',
  intereseted: 'ring-green-300',
  closed: 'ring-red-300'
};
const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  intereseted: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800'
};
export default function KanbanColumn({
  status,
  title,
  leads
}: {
  status: LeadStatus;
  title: string;
  leads: ILead[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`
    rounded-xl p-3 transition
 
    
    shadow-sm
    ${isOver ? `ring-2 ${COLUMN_RING[status]}` : ''}
  `}
    >
      <div
        className={`
      flex items-center justify-center gap-2
      w-full mb-3 px-4 py-2
      bg-white/80 backdrop-blur
      rounded-lg
      border
      ${COLUMN_BORDER[status]}
      shadow-sm
    `}
      >
        <h2 className="font-semibold text-gray-800">
          {title}
        </h2>

        <span
          className={`
        text-xs font-medium px-2.5 py-0.5
        rounded-full flex items-center justify-center
        ${STATUS_STYLES[status]}
      `}
        >
          {leads.length}
        </span>
      </div>



      <div className="space-y-3">
        {leads.map(lead => (
          <DraggableLead key={lead._id.toString()} lead={lead} />
        ))}
      </div>
    </div>
  );
}
