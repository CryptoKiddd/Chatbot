export const LEAD_STATUSES = [
  { key: 'new', title: 'New' },
  { key: 'contacted', title: 'Contacted' },
  { key: 'intereseted', title: 'Interested' },
  { key: 'closed', title: 'Closed' }
] as const;

export type LeadStatus = typeof LEAD_STATUSES[number]['key'];