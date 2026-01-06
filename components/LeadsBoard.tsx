'use client';

import { DndContext, DragEndEvent, DragStartEvent, closestCenter, DragOverlay } from '@dnd-kit/core';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState } from 'react';
import KanbanColumn from './Lead/KanbanColumn';
import Lead from './Lead/Lead';
import { ILead } from '@/lib/types';
import { LEAD_STATUSES, LeadStatus } from '@/lib/leadStatus';
import { useLeadsStore } from '@/store/leads/leadStore';

export default function LeadsBoard() {
  const [activeLead, setActiveLead] = useState<ILead | null>(null);
  const zustandLeads = useLeadsStore(state=>state.leads)
  const updateLeadStatus = useLeadsStore(state=>state.updateLeadStatus)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const onDragStart = (event: DragStartEvent) => {
    const lead = zustandLeads.find(l => l._id.toString() === event.active.id);
    if (lead) setActiveLead(lead);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id.toString();
    const newStatus = over.id as LeadStatus;

    updateLeadStatus(leadId, newStatus);

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
            leads={zustandLeads.filter(l => l.status === key)}
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
