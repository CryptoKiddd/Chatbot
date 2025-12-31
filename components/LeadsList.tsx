// components/LeadsList.tsx
import type { ILead } from '@/lib/types';

import Lead from './Lead/Lead';

interface LeadsListProps {
  leads: ILead[];
}



export default function LeadsList({ leads }: LeadsListProps) {
  return (
    <div className="p-4 space-y-4">
      {leads.length === 0 && (
        <div className="text-center text-gray-500">No leads found</div>
      )}

      {leads.length > 0 && leads.map((lead:ILead) => <Lead lead={lead} />)}
    </div>
  );
}
