import { LeadStatus } from "@/lib/leadStatus";
import { ILead, LeadBase } from "@/lib/types";
import { create } from "zustand";





interface LeadsState {
  leads: ILead[];
  setLeads: (leads: ILead[]) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
}

export const useLeadsStore = create<LeadsState>((set) => ({
  leads: [],

  setLeads: (leads) => set({ leads }),

  updateLeadStatus: (id, status) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead._id.toString() === id ? { ...lead, status } : lead
      ),
    })),
}));
