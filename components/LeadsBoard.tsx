'use client';

import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from '@dnd-kit/core';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState } from 'react';
import KanbanColumn from './Lead/KanbanColumn';
import Lead from './Lead/Lead';
import { ILead } from '@/lib/types';
import { LEAD_STATUSES, LeadStatus } from '@/lib/leadStatus';

export default function LeadsBoard({ leads }: { leads: ILead[] }) {
  const [items, setItems] = useState<ILead[]>(leads);
  const [activeLead, setActiveLead] = useState<ILead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const onDragStart = (event: DragStartEvent) => {
    const lead = items.find(l => l._id.toString() === event.active.id);
    if (lead) setActiveLead(lead);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id.toString();
    const newStatus = over.id as LeadStatus;

    setItems(prev =>
      prev.map(l => (l._id.toString() === leadId ? { ...l, status: newStatus } : l))
    );

    fetch(`/api/leads/${leadId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {LEAD_STATUSES.map(({ key, title }) => (
          <KanbanColumn
            key={key}
            status={key}
            title={title}
            leads={items.filter(l => l.status === key)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead && (
          <div className="scale-105 shadow-2xl rounded-xl opacity-95 pointer-events-none">
            <Lead lead={activeLead} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
