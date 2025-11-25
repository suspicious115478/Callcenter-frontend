import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LucideWrench, LucideDroplets, LucideLeaf, LucideHammer } from 'lucide-react';

// Define the services available for the user
const SERVICES = [
  { name: 'Electrician', icon: LucideWrench, color: 'bg-yellow-500', iconColor: 'text-yellow-800', description: 'Wiring, circuit repairs, and fixture installation.' },
  { name: 'Plumber', icon: LucideDroplets, color: 'bg-blue-500', iconColor: 'text-blue-800', description: 'Leaky pipes, drain cleaning, and water system fixes.' },
  { name: 'Gardener', icon: LucideLeaf, color: 'bg-green-500', iconColor: 'text-green-800', description: 'Lawn care, planting, and landscape maintenance.' },
  { name: 'Carpenter', icon: LucideHammer, color: 'bg-amber-600', iconColor: 'text-amber-900', description: 'Woodworking, furniture repair, and structural framing.' },
  // Add more services as needed
  { name: 'Appliance Repair', icon: LucideWrench, color: 'bg-red-500', iconColor: 'text-red-800', description: 'Fixing household appliances like washing machines and refrigerators.' },
  { name: 'HVAC Technician', icon: LucideDroplets, color: 'bg-sky-500', iconColor: 'text-sky-800', description: 'Heating, ventilation, and air conditioning services.' },
];

/**
 * Component for a single service card in the grid.
 */
const ServiceCard = ({ service, onClick }) => (
  <div 
    className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer ${service.color} bg-opacity-30 backdrop-blur-sm border border-white/20 transform hover:scale-[1.02]`}
    onClick={() => onClick(service)}
  >
    <div className={`p-3 rounded-full w-fit mb-4 ${service.iconColor} bg-white/80 shadow-md`}>
      <service.icon className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-1">{service.name}</h3>
    <p className="text-sm text-gray-600">{service.description}</p>
  </div>
);


export default function UserServicesPage() {
  const navigate = useNavigate();
  // Use useLocation to get the state passed from the previous page
  const location = useLocation();
  const state = location.state || {};
  
  const { ticketId, requestDetails } = state;

  // Handle case where required data is missing
  if (!ticketId || !requestDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error: Ticket Details Missing</h1>
        <p className="text-gray-600 mb-6">Please start the workflow from the User Dashboard.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const handleServiceSelect = (service) => {
    // In a real app, this would trigger a final API call to update the ticket
    // with the selected service and potentially trigger dispatch/notification logic.
    console.log(`Service '${service.name}' selected for Ticket ID: ${ticketId}`);
    
    // Simple confirmation message display
    alert(`Service Confirmed: ${service.name}. \nTicket ${ticketId} is now assigned.`);
    
    // Optionally redirect back to the main dashboard or clear the call slot
    navigate('/agent/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-inter">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Agent's Notes/Request Summary Card */}
        <div className="lg:w-1/3 w-full sticky top-8 h-fit">
          <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-indigo-600">
            <h2 className="text-2xl font-extrabold text-indigo-700 mb-3">
              Request Details
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Ticket ID: <span className="font-mono bg-indigo-100 px-2 py-0.5 rounded text-indigo-800">{ticketId}</span>
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {requestDetails}
              </p>
            </div>
            <p className="mt-4 text-xs text-gray-500">
                Review the notes and select the appropriate service below.
            </p>
          </div>
        </div>

        {/* Right Side: Service Selection Grid */}
        <div className="lg:w-2/3 w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
            Select Service Category
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.map((service) => (
              <ServiceCard 
                key={service.name} 
                service={service} 
                onClick={handleServiceSelect} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
