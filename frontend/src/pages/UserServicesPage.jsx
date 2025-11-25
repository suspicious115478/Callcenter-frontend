import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- INLINE SVG ICONS (Replaces lucide-react) ---
const WrenchIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94-7.94l-3.76 3.76a1 1 0 0 0 0 1.4l2.22 2.22"></path><path d="m20.7 15.3-2.2-2.2a1 1 0 0 0-1.4 0l-1.6 1.6a1 1 0 0 0 0 1.4l3.77 3.77a6 6 0 0 0 7.94-7.94l-3.76-3.76"></path></svg>
);
const DropletsIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.68 12.68a2 2 0 0 0-2.83 0L7 15.5l-4.5 4.5A2 2 0 0 0 5 22h14a2 2 0 0 0 2-2L19 15.5l-2.83-2.82a2 2 0 0 0 0-2.83Z"></path><path d="M16 8h.01"></path><path d="M8 8h.01"></path><path d="M12 4h.01"></path></svg>
);
const LeafIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.87 5.25c-.08-.34-.1-.7-.15-1.05A21.1 21.1 0 0 0 4.15 4c-1.37.15-2.06 1.76-1.39 2.87A11.4 11.4 0 0 0 12 20Z"></path><path d="M18.8 11.2a12.8 12.8 0 0 0-4.6-7.8c-1.35-.9-3.07-.6-4.14.73A15 15 0 0 0 7 6.4c1.2.66 2.37 1.47 3.49 2.4l.65.57 3.2 2.83c1.07.94 2.2 1.8 3.3 2.5a3.6 3.6 0 0 0 2.92.2 2.6 2.6 0 0 0 1.25-1.48c.37-1.3-.87-2.3-2.17-2.7Z"></path><path d="M12 20c-1.3 0-2.58-.45-3.6-1.37"></path><path d="M16.96 15.96a2.6 2.6 0 0 0 1.14-.9c.4-.64.7-1.3.88-2"></path></svg>
);
const HammerIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.2 14.8-6.94 6.94a2 2 0 0 1-2.83 0L3 21a2 2 0 0 0 2.83 0l6.94-6.94a2 2 0 0 0 0-2.83l-6.94-6.94a2 2 0 0 1 0-2.83L14.8 1.2a2 2 0 0 0-2.83-2.83L4 12.8a2 2 0 0 1 0 2.83l6.94 6.94"></path><path d="M14.8 10.2a2 2 0 0 0 2.83 0l6.94-6.94a2 2 0 0 0 0-2.83L14.8 1.2a2 2 0 0 1 0-2.83l6.94-6.94"></path></svg>
);
// --- END ICONS ---

// Define the services available for the user
const SERVICES = [
  // Icon components replaced
  { name: 'Electrician', icon: WrenchIcon, color: 'bg-yellow-500', iconColor: 'text-yellow-800', description: 'Wiring, circuit repairs, and fixture installation.' },
  { name: 'Plumber', icon: DropletsIcon, color: 'bg-blue-500', iconColor: 'text-blue-800', description: 'Leaky pipes, drain cleaning, and water system fixes.' },
  { name: 'Gardener', icon: LeafIcon, color: 'bg-green-500', iconColor: 'text-green-800', description: 'Lawn care, planting, and landscape maintenance.' },
  { name: 'Carpenter', icon: HammerIcon, color: 'bg-amber-600', iconColor: 'text-amber-900', description: 'Woodworking, furniture repair, and structural framing.' },
  // Re-used icons
  { name: 'Appliance Repair', icon: WrenchIcon, color: 'bg-red-500', iconColor: 'text-red-800', description: 'Fixing household appliances like washing machines and refrigerators.' },
  { name: 'HVAC Technician', icon: DropletsIcon, color: 'bg-sky-500', iconColor: 'text-sky-800', description: 'Heating, ventilation, and air conditioning services.' },
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
      {/* Dynamic icon component */}
      <service.icon className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-1">{service.name}</h3>
    <p className="text-sm text-gray-600">{service.description}</p>
  </div>
);


export default function UserServicesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  
  const { ticketId, requestDetails } = state;
  // State for showing the confirmation message (replaces alert())
  const [confirmationMessage, setConfirmationMessage] = useState(null);

  // Handle case where required data is missing
  if (!ticketId || !requestDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-8">
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
    // Replaced alert() with a state-based message box
    const message = `Service Confirmed: ${service.name}. Ticket ${ticketId} is now assigned. Dispatching...`;
    setConfirmationMessage(message);

    console.log(`Service '${service.name}' selected for Ticket ID: ${ticketId}`);
    
    // Simulate navigation/clearing call after a delay for the message to be seen
    setTimeout(() => {
        setConfirmationMessage(null);
        // Navigate back to the agent dashboard after confirmation
        navigate('/agent/dashboard'); 
    }, 3000); 
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-inter">
      
      {/* Confirmation Message Box */}
      {confirmationMessage && (
        <div className="fixed inset-x-0 top-0 flex justify-center z-50 p-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-xl shadow-2xl transition duration-300 transform scale-100 opacity-100 font-semibold animate-pulse">
            {confirmationMessage}
          </div>
        </div>
      )}

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
