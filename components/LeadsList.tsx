import { ILead } from "@/lib/types";
import Lead from "./Lead/Lead";

type LeadStatus = 'new' | 'contacted' | 'intereseted' | 'closed';

const STATUSES: { key: LeadStatus; title: string }[] = [
  { key: 'new', title: 'New' },
  { key: 'contacted', title: 'Contacted' },
  { key: 'intereseted', title: 'Interested' },
  { key: 'closed', title: 'Closed' }
];

export default function LeadsList({ leads }: { leads: ILead[] }) {
  const grouped = STATUSES.reduce<Record<LeadStatus, ILead[]>>(
    (acc, status) => {
      acc[status.key] = [];
      return acc;
    },
    {} as Record<LeadStatus, ILead[]>
  );

  leads.forEach(lead => {
    grouped[lead.status]?.push(lead);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
      {STATUSES.map(({ key, title }) => (
        <div
          key={key}
          className="bg-gray-50 rounded-xl border border-gray-200 p-3 flex flex-col"
        >
          {/* Column header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">{title}</h2>
            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
              {grouped[key].length}
            </span>
          </div>

          {/* Leads */}
          <div className="space-y-3 overflow-y-auto">
            {grouped[key].length === 0 && (
              <div className="text-xs text-gray-400 text-center py-4">
                No leads
              </div>
            )}

            {grouped[key].map(lead => (
              <Lead key={lead._id.toString()} lead={lead} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
