import { Apartment } from "@/lib/types";

export default function SuggestedApartmentsDisplay({ apartments }: { apartments: Apartment[] }) {

    return (
        <div className="mt-3 border-t border-gray-100 pt-3 space-y-4">
            {apartments.map((apt: Apartment, idx: number) => (
                <div
                    key={apt._id?.toString() ?? idx}
                    className="rounded-lg border border-gray-200 p-3"
                >
                    <h2 className="text-lg font-semibold">
                        {apt.projectName}
                    </h2>

                    <ul className="mt-2 text-sm text-gray-700 space-y-1">
                        <li><strong>City:</strong> {apt.city}</li>
                        <li><strong>Neighborhood:</strong> {apt.neighborhood}</li>
                        <li><strong>Total Area:</strong> {apt.totalArea} m²</li>
                        <li><strong>Rooms:</strong> {apt.rooms}</li>
                        <li><strong>Floor:</strong> {apt.floor}</li>
                        <li><strong>View:</strong> {apt.viewType}</li>

                        <li>
                            <strong>Balcony:</strong>{" "}
                            {apt.hasBalcony ? "Yes" : "No"}
                            {apt.balconySize && ` (${apt.balconySize} m²)`}
                        </li>

                        <li><strong>Total Price:</strong> ${apt.totalPrice?.toLocaleString()}</li>
                        <li><strong>Monthly Payment:</strong> ${apt.monthlyPayment}</li>
                        <li><strong>Min Initial Installment:</strong> ${apt.minInitialInstallment}</li>
                        <li><strong>Installment Duration:</strong> {apt.installmentDuration} months</li>

                        <li><strong>Status:</strong> {apt.availabilityStatus}</li>
                        <li><strong>Construction:</strong> {apt.constructionStatus}</li>

                        {apt.expectedCompletion && (
                            <li><strong>Expected Completion:</strong> {apt.expectedCompletion}</li>
                        )}

                        <li><strong>Developer:</strong> {apt.developerName}</li>
                    </ul>
                </div>
            ))}
        </div>



    )




}