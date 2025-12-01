import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EmployeeHelpDeskPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Retrieve data passed from the incoming call socket event (via navigation state)
  const { callerNumber, dispatchData, customerName } = location.state || {};

  // If accessed directly without state, we might want to handle that
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!callerNumber && !dispatchData) {
      // Optional: Redirect back to home if no data is present
      // navigate('/');
    }
  }, [callerNumber, dispatchData, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-600">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Employee Help Desk</h1>
            <p className="text-gray-500">Dispatch Record Detected</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{callerNumber || "Unknown Number"}</div>
            <div className="text-sm font-medium text-gray-600">{customerName || "Valued Customer"}</div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Dispatch Details (From Employee DB) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Active Dispatch Record
              </h2>
              
              {dispatchData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-md">
                    <span className="block text-xs text-blue-500 uppercase font-bold">Order ID</span>
                    <span className="text-lg font-medium text-gray-800">{dispatchData.order_id}</span>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-md">
                    <span className="block text-xs text-purple-500 uppercase font-bold">Category</span>
                    <span className="text-lg font-medium text-gray-800">{dispatchData.category}</span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-md">
                    <span className="block text-xs text-yellow-600 uppercase font-bold">Order Status</span>
                    <span className="text-lg font-medium text-gray-800">{dispatchData.order_status}</span>
                  </div>
                  <div className="p-3 bg-green-50 rounded-md">
                    <span className="block text-xs text-green-600 uppercase font-bold">Assigned Serviceman ID</span>
                    <span className="text-lg font-medium text-gray-800">{dispatchData.user_id}</span>
                  </div>
                  <div className="md:col-span-2 p-3 bg-gray-50 rounded-md">
                    <span className="block text-xs text-gray-500 uppercase font-bold">Service Address</span>
                    <span className="text-md text-gray-700">{dispatchData.request_address}</span>
                  </div>
                  <div className="md:col-span-2 p-3 bg-gray-50 rounded-md">
                    <span className="block text-xs text-gray-500 uppercase font-bold">Customer Request</span>
                    <p className="text-md text-gray-700 italic">"{dispatchData.order_request}"</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Loading dispatch details...
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition">
                Open Full Order Details
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition">
                Contact Serviceman
              </button>
            </div>
          </div>

          {/* Right Column: Quick Actions / Notes */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Ticket Status</h3>
              <div className="p-4 border rounded-lg bg-gray-50 text-center">
                 <p className="text-sm text-gray-500">Associated Ticket ID</p>
                 <p className="font-mono font-bold text-gray-800">{dispatchData?.ticket_id || "N/A"}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
               <h3 className="font-semibold text-gray-800 mb-4">Quick Notes</h3>
               <textarea 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  rows="6"
                  placeholder="Enter call notes here..."
               ></textarea>
               <button className="mt-2 w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900">
                 Save Note
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmployeeHelpDeskPage;
