import React, { useState, useEffect } from 'react';

// --- MOCKING CONTEXT & ENVIRONMENT VARIABLES ---

// Since 'react-router-dom' and 'useParams' are unavailable in this environment,
// we simulate fetching the phone number either from the URL or a mock value.
const getPhoneNumber = () => {
  const path = window.location.pathname;
  // This attempts to extract a 10+ digit number from the path (e.g., /user/dashboard/5551234567)
  const match = path.match(/\/(\d{10,})\/?$/);
  return match ? match[1] : '555-867-5309'; // Default mock number if path not found
};

// Assuming the root path for API calls based on your original structure.
// NOTE: This URL is kept as a constant for demonstration, but must be configured
// for real-world backend access.
const BACKEND_URL = "https://callcenter-baclend.onrender.com/"; 

/**
 * Main application component for the Call Center Agent Dashboard.
 * Allows agents to log request details and redirects upon successful save.
 */
const App = () => {
    // State for live clock and phone number derivation
    const phoneNumber = getPhoneNumber();
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    
    // Form state
    const [notes, setNotes] = useState("");
    const [category, setCategory] = useState("support");
    const [isSaving, setIsSaving] = useState(false); // For button loading state
    const [error, setError] = useState(null); // For custom error notification

    // Set up live clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Sends data to backend with robust error handling for empty/malformed responses
    const handleSaveNotes = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        
        if (!notes.trim()) {
            setError("Please enter detailed notes before saving the request log.");
            return;
        }

        setIsSaving(true);

        // Simple exponential backoff retry mechanism for API calls
        const maxRetries = 3;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await fetch(`${BACKEND_URL}api/logs/save`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        phone: phoneNumber,
                        category: category,
                        notes: notes,
                        agentName: "Agent JD" // Hardcoded Agent Name
                    })
                });

                // 1. Check for non-200 status codes
                if (!response.ok) {
                    const errorDetail = await response.text();
                    const errorMessage = errorDetail ? errorDetail.substring(0, 100) : "No error details provided.";
                    throw new Error(`Server Error (${response.status}): ${errorMessage}...`);
                }

                // 2. Safely handle JSON parsing or empty body
                let result;
                const text = await response.text();

                if (!text) {
                    result = { success: true, message: "No content returned, assuming successful save." };
                } else {
                    try {
                        result = JSON.parse(text);
                    } catch (e) {
                        throw new Error(`Invalid JSON format in response: ${e.message}`);
                    }
                }
                
                // 3. Check for application-level success flag
                if (result.success) {
                    console.log("Request logged successfully. Navigating to services page.");
                    const encodedNotes = encodeURIComponent(notes);
                    // SUCCESS ACTION: Redirect to the new User Services page
                    window.location.href = `/user/services/${phoneNumber}?category=${category}&notes=${encodedNotes}`;
                    return; // Exit the loop on success
                } else {
                    console.error("Failed to save log:", result.message);
                    setError("❌ Failed to save log: " + (result.message || "Unknown error occurred."));
                    break; // Stop retrying on application failure
                }
            } catch (err) {
                console.error(`Attempt ${attempt + 1} failed:`, err.message);
                if (attempt === maxRetries - 1) {
                    setError(`❌ Failed to save after ${maxRetries} attempts: ${err.message}`);
                } else {
                    // Implement exponential backoff delay (1s, 2s, 4s)
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        } // end for loop
        
        setIsSaving(false);
    };


    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-inter">
            {/* HEADER */}
            <header className="h-16 bg-gray-800 text-white flex items-center justify-between px-6 shadow-xl z-10">
                <div className="text-xl font-bold tracking-tight flex items-center gap-2">
                    {/* Phone Icon (lucide-react) */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>CC Agent Console</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="font-mono text-lg text-gray-400">{currentTime}</span>
                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold border-2 border-gray-600">
                        JD
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-auto p-8 gap-8">
                {/* LEFT PANEL: INTAKE FORM (Takes remaining width) */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">📝 New Request Intake</h2>
                            <div className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {/* Check Icon (lucide-react) */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span>Verified Subscriber</span>
                            </div>
                        </div>
                        <div className="p-6">
                            {error && (
                                <div className="mb-5 p-3 rounded-lg border border-red-300 bg-red-50 text-red-600 text-sm">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSaveNotes}>
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Request Category</label>
                                    <select
                                        className="w-full py-2.5 px-3 rounded-lg border border-gray-300 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="support">Technical Support</option>
                                        <option value="billing">Billing Inquiry</option>
                                        <option value="upgrade">Plan Upgrade</option>
                                        <option value="cancellation">Cancellation Request</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Call Notes & Request Details</label>
                                    <textarea
                                        className="w-full p-3 rounded-lg border border-gray-300 text-base min-h-[250px] resize-y focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
                                        placeholder="Type detailed notes about the customer's request here..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold transition duration-200 ease-in-out shadow-md
                                        ${isSaving 
                                            ? 'bg-blue-400 cursor-not-allowed text-white opacity-75' 
                                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                        }
                                    `}
                                >
                                    {isSaving ? (
                                        <span className="flex items-center justify-center">
                                            {/* Simple spinner SVG */}
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : "Save Request Log & Select Service"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: USER DETAILS & HISTORY (Fixed width for desktop) */}
                <div className="w-[380px] flex flex-col gap-6 flex-shrink-0">
                    {/* CUSTOMER PROFILE CARD */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800">Customer Profile</h2>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-center mb-3 text-sm">
                                <span className="text-gray-500">Phone Number</span>
                                <span className="font-semibold text-gray-900">{phoneNumber}</span>
                            </div>
                            <div className="flex justify-between items-center mb-3 text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className="font-bold text-emerald-600">Active</span>
                            </div>
                            <div className="flex justify-between items-center mb-3 text-sm">
                                <span className="text-gray-500">Member Since</span>
                                <span className="font-semibold text-gray-900">Jan 2024</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Current Plan</span>
                                <span className="font-semibold text-gray-900">Premium</span>
                            </div>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY CARD */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800">Recent History</h2>
                        </div>
                        <div className="p-5">
                            {/* Mock Activity Items */}
                            <div className="py-3 border-b border-gray-100 last:border-b-0 text-sm">
                                <div className="text-xs text-gray-400 mb-1">Today, 10:30 AM</div>
                                <div><strong className="text-indigo-600">System Check:</strong> Auto-verified subscription status via IVR.</div>
                            </div>
                            <div className="py-3 border-b border-gray-100 last:border-b-0 text-sm">
                                <div className="text-xs text-gray-400 mb-1">Yesterday</div>
                                <div><strong className="text-orange-600">Billing:</strong> Invoice #4492 generated.</div>
                            </div>
                            <div className="py-3 border-b border-gray-100 last:border-b-0 text-sm">
                                <div className="text-xs text-gray-400 mb-1">2 days ago</div>
                                <div><strong className="text-green-600">Login:</strong> Successful web login.</div>
                            </div>
                            <div className="py-3 text-sm">
                                <div className="text-xs text-gray-400 mb-1">3 days ago</div>
                                <div><strong className="text-red-600">Support:</strong> High-priority ticket opened - Internet Slow.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
