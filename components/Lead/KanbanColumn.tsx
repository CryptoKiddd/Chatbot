'use client';

import { useDroppable } from '@dnd-kit/core';
import { ILead } from '@/lib/types';
import DraggableLead from './DraggableLead';

export default function KanbanColumn({
  status,
  title,
  leads
}: {
  status: string;
  title: string;
  leads: ILead[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border p-3 bg-gray-50 transition ${
        isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''
      }`}
    >
      <div className="flex justify-between mb-3">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-xs bg-gray-200 px-2 rounded-full">{leads.length}</span>
      </div>

      <div className="space-y-3">
        {leads.map(lead => (
          <DraggableLead key={lead._id.toString()} lead={lead} />
        ))}
      </div>
    </div>
  );
}
