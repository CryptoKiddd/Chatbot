import { UserPreferences } from '@/lib/types';
import {
  Home,
  DollarSign,
  Layers,
  Globe,
  Phone,
  User
} from 'lucide-react';

export default function PreferencesDisplay({
  preferences
}: {
  preferences: UserPreferences;
}) {
  if (!preferences || Object.keys(preferences).length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-gray-600 text-sm mt-2">

      {/* Name */}
      {preferences.name && (
        <div className="flex items-center space-x-1 col-span-2 sm:col-span-3">
          <User size={14} />
          <span>{preferences.name}</span>
        </div>
      )}

      {/* Phone */}
      {preferences.phone && (
        <div className="flex items-center space-x-1 col-span-2 sm:col-span-3">
          <Phone size={14} />
          <span>{preferences.phone}</span>
        </div>
      )}

      {/* Location */}
      {preferences.city && (
        <div className="flex items-center space-x-1">
          <Home size={14} />
          <span>Location: {preferences.city}</span>
        </div>
      )}

      {/* Language */}
      {preferences.language && (
        <div className="flex items-center space-x-1">
          <Globe size={14} />
          <span>Language: {preferences.language}</span>
        </div>
      )}

      {/* Max Budget */}
      {(preferences.maxBudget ?? preferences.budgetMax) && (
        <div className="flex items-center space-x-1">
          <DollarSign size={14} />
          <span>
            Budget: $
            {(preferences.maxBudget ?? preferences.budgetMax)!.toLocaleString()}
          </span>
        </div>
      )}

      {/* Monthly Payment */}
      {preferences.monthlyPayment && (
        <div className="flex items-center space-x-1">
          <DollarSign size={14} />
          <span>
            Monthly: ${preferences.monthlyPayment.toLocaleString()}
          </span>
        </div>
      )}

      {/* Down Payment */}
      {preferences.downPayment && (
        <div className="flex items-center space-x-1">
          <DollarSign size={14} />
          <span>
            Down Payment: ${preferences.downPayment.toLocaleString()}
          </span>
        </div>
      )}

      {/* Rooms */}
      {preferences.rooms && (
        <div className="flex items-center space-x-1">
          <Layers size={14} />
          <span>{preferences.rooms} rooms</span>
        </div>
      )}

      {/* Size Range */}
      {(preferences.minSize || preferences.maxSize) && (
        <div className="flex items-center space-x-1">
          <Layers size={14} />
          <span>
            Size:{' '}
            {preferences.minSize ? `${preferences.minSize} m²` : '—'} –{' '}
            {preferences.maxSize ? `${preferences.maxSize} m²` : '—'}
          </span>
        </div>
      )}

      {/* Floor Range */}
      {(preferences.minFloor || preferences.maxFloor) && (
        <div className="flex items-center space-x-1">
          <Layers size={14} />
          <span>
            Floor:{' '}
            {preferences.minFloor ?? '—'} – {preferences.maxFloor ?? '—'}
          </span>
        </div>
      )}

      {/* View Type */}
      {preferences.viewType && (
        <div className="flex items-center space-x-1">
          <Globe size={14} />
          <span>{preferences.viewType} view</span>
        </div>
      )}

      {/* Balcony */}
      {preferences.requiresBalcony !== undefined && (
        <div className="flex items-center space-x-1">
          <Home size={14} />
          <span>
            {preferences.requiresBalcony
              ? 'Balcony required'
              : 'Balcony not required'}
          </span>
        </div>
      )}

      {/* Construction Status */}
      { preferences?.constructionStatus && preferences?.constructionStatus?.length > 0 && (
        <div className="flex items-center space-x-1 col-span-2 sm:col-span-3">
          <Layers size={14} />
          <span>
            Construction:{' '}
            {preferences?.constructionStatus}
          </span>
        </div>
      )}
    </div>
  );
}
