import { Clock, Globe, Mail, Phone } from "lucide-react";
import PreferencesDisplay from "./PreferenceDisplay";
import LeadStatusBadge from "./LeadStatusBadge";
import SuggestedApartmentsDisplay from "./SuggestedApartmentsDisplay";
import ChatHistory from "./ChatHistory";
import  { ILead } from "@/lib/types";

export default function Lead({lead}:{lead:ILead}) {
    return (
        <div
            key={lead._id?.toString()}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start px-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                    <p className="text-gray-500 flex items-center space-x-2 mt-1">
                        <Phone size={16} />
                        <span>{lead.phone}</span>
                    </p>
                    {lead.email && (
                        <p className="text-gray-500 flex items-center space-x-2 mt-1">
                            <Mail size={16} />
                            <span>{lead.email}</span>
                        </p>
                    )}
                    <p className="text-gray-500 flex items-center space-x-2 mt-1">
                        <Globe size={16} />
                        <span>{lead.language}</span>
                    </p>


                    <PreferencesDisplay preferences={lead.preferences} />
                </div>
                <LeadStatusBadge leadId={lead._id.toString()} initialStatus={lead.status} />
            </div>

            {/* Suggested Apartments */}
            {/* {lead.suggestedApartments.length > 0 && <SuggestedApartmentsDisplay apartments={lead.suggestedApartments} />} */}



            {/* Chat History */}
            {lead.chatHistory.length > 0 && <ChatHistory messages={lead.chatHistory} />}

            {lead.timestamp && (
                <p className="text-gray-400 text-xs mt-2 flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{new Date(lead.timestamp).toLocaleString()}</span>
                </p>
            )}
        </div>
    )
}