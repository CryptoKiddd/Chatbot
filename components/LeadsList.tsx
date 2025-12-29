// components/LeadsList.tsx
import { Lead, UserPreferences, Message } from '@/lib/types';
import { Phone, Mail, Globe, Clock, Home, DollarSign, Layers } from 'lucide-react';

interface LeadsListProps {
  leads: Lead[];
}

function PreferencesDisplay({ preferences }: { preferences: UserPreferences }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-gray-600 text-sm mt-2">
      {preferences.location && (
        <div className="flex items-center space-x-1">
          <Home size={14} /> <span> ლოკაცია {preferences.location}</span>
        </div>
      )}
      {preferences.maxBudget && (
        <div className="flex items-center space-x-1">
          <DollarSign size={14} /> <span>${preferences.maxBudget.toLocaleString()}</span>
        </div>
      )}
      {preferences.monthlyPayment && (
        <div className="flex items-center space-x-1">
          <DollarSign size={14} /> <span>Monthly: ${preferences.monthlyPayment.toLocaleString()}</span>
        </div>
      )}
      {preferences.rooms && (
        <div className="flex items-center space-x-1">
          <Layers size={14} /> <span>{preferences.rooms} rooms</span>
        </div>
      )}
      {preferences.minSize && (
        <div className="flex items-center space-x-1">
          <Layers size={14} /> <span>Min {preferences.minSize} m²</span>
        </div>
      )}
      {preferences.maxSize && (
        <div className="flex items-center space-x-1">
          <Layers size={14} /> <span>Max {preferences.maxSize} m²</span>
        </div>
      )}
      {preferences.viewType && (
        <div className="flex items-center space-x-1">
          <Globe size={14} /> <span>{preferences.viewType} view</span>
        </div>
      )}
      {preferences.requiresBalcony !== undefined && (
        <div className="flex items-center space-x-1">
          <Home size={14} /> <span>{preferences.requiresBalcony ? 'Balcony required' : 'No balcony'}</span>
        </div>
      )}
      {preferences.constructionStatus && preferences.constructionStatus.length > 0 && (
        <div className="flex items-center space-x-1 col-span-2 sm:col-span-3">
          <Layers size={14} /> <span>Status: {preferences.constructionStatus.join(', ')}</span>
        </div>
      )}
    </div>
  );
}

export default function LeadsList({ leads }: LeadsListProps) {
  return (
    <div className="p-4 space-y-4">
      {leads.length === 0 && (
        <div className="text-center text-gray-500">No leads found</div>
      )}

      {leads.map((lead) => (
        <div
          key={lead._id?.toString()}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
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

              {/* User Preferences */}
              <h1>aq unda iyos</h1>
              <PreferencesDisplay preferences={lead.preferences} />
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                lead.status === 'new'
                  ? 'bg-blue-100 text-blue-800'
                  : lead.status === 'contacted'
                  ? 'bg-yellow-100 text-yellow-800'
                  : lead.status === 'qualified'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {lead.status}
            </span>
          </div>

          {/* Suggested Apartments */}
          {lead.suggestedApartments.length > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="text-gray-700 font-medium">Suggested Apartments:</p>
              <ul className="list-disc list-inside text-gray-600">
                {lead.suggestedApartments.map((apt, idx) => (
                  <li key={idx}>{apt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Conversation Summary */}
          {lead.conversationSummary && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="text-gray-700 font-medium">Conversation Summary:</p>
              <p className="text-gray-600 text-sm">{lead.conversationSummary}</p>
            </div>
          )}

          {/* Chat History */}
          {lead.chatHistory.length > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="text-gray-700 font-medium">Chat History:</p>
              <div className="max-h-40 overflow-y-auto text-gray-600 text-sm space-y-1 mt-1">
                {lead.chatHistory?.map((msg, idx) => (
                  <div key={idx}>
                    <span className="font-semibold">{msg.role}:</span> {msg.content}
                  </div>
                ))}
              </div>
            </div>
          )}

          {lead.timestamp && (
            <p className="text-gray-400 text-xs mt-2 flex items-center space-x-1">
              <Clock size={12} />
              <span>{new Date(lead.timestamp).toLocaleString()}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
