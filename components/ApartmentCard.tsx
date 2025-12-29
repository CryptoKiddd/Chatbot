import { Apartment } from '@/lib/types';

interface ApartmentCardProps {
  apartment: Apartment;
}

export default function ApartmentCard({ apartment }: ApartmentCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-2 text-sm">
      <div className="font-semibold text-gray-900 mb-2">
        {apartment.projectName}
      </div>
      <div className="text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Location:</span>
          <span className="font-medium text-gray-900">
            {apartment.city}, {apartment.neighborhood}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Size:</span>
          <span className="font-medium text-gray-900">
            {apartment.totalArea}m² • {apartment.rooms} rooms • Floor {apartment.floor}
          </span>
        </div>
        <div className="flex justify-between">
          <span>View:</span>
          <span className="font-medium text-gray-900">{apartment.viewType}</span>
        </div>
        {apartment.hasBalcony && (
          <div className="flex justify-between">
            <span>Balcony:</span>
            <span className="font-medium text-gray-900">{apartment.balconySize}m²</span>
          </div>
        )}
        <div className="border-t border-gray-300 my-2 pt-2">
          <div className="flex justify-between font-semibold">
            <span>Price:</span>
            <span className="text-gray-900">
              ${apartment.totalPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Down payment:</span>
            <span className="text-gray-900">
              ${apartment.minInitialInstallment.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Monthly:</span>
            <span className="text-gray-900">
              ${apartment.monthlyPayment} × {apartment.installmentDuration} months
            </span>
          </div>
        </div>
        <div className="flex justify-between text-xs pt-1">
          <span>Status:</span>
          <span className="font-medium text-gray-900">
            {apartment.constructionStatus === 'completed' ? 'Ready to move' : 
             apartment.constructionStatus === 'under-construction' ? 'Under construction' : 
             'Off-plan'}
            {apartment.expectedCompletion && ` • ${apartment.expectedCompletion}`}
          </span>
        </div>
      </div>
    </div>
  );
}