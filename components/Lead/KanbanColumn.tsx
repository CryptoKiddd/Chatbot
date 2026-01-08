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
      className={`rounded-xl shadow-sm border-b-amber-300 p-3 bg-gray-50 transition ${isOver ? 'ring-2 ring-amber-300  bg-amber-500 ' : ''
        }`}
    >
      <div className=" flex items-center justify-center gap-2 w-full mb-3 px-4 py-2 bg-white/80 backdrop-blur rounded-lg border border-amber-200 shadow-sm
">
        <h2 className="font-semibold text-gray-800">
          {title}
        </h2>

        <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full flex items-center justify-center
  ">
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
