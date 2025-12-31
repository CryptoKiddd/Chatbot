import { ILead, LeadBase } from "../types";

export function serializeLead(lead: ILead) {
  return {
    ...lead,
    _id: lead._id.toString(),
    timestamp: lead.timestamp,
   

    suggestedApartments: lead.suggestedApartments?.map((apt: any) => ({
      ...apt,
      _id: apt._id?.toString?.()
    }))
  };
}
