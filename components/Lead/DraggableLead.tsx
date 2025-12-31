'use client';

import { useDraggable } from '@dnd-kit/core';
import Lead from './Lead';
import { ILead } from '@/lib/types';

export default function DraggableLead({ lead }: { lead: ILead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead._id.toString()
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`rounded-xl transition-all ${
        isDragging ? 'opacity-50 scale-105 shadow-xl' : 'shadow-sm hover:shadow-md'
      }`}
    >
      <Lead lead={lead} />
    </div>
  );
}
