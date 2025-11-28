import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// 💡 FIX: Define the URL directly here since the config file is missing in this environment
const BACKEND_URL = 'https://callcenter-baclend.onrender.com';

// Utility function for dynamic class names (simple version)
const clsx = (...classes) => classes.filter(Boolean).join(' ');

// Inline SVG Icon for the header (Phone)
const PhoneIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

export default function App() { // Renamed export to App for single-file structure

    // 1. URL PARAMETERS (e.g., /dashboard/1)
    const { userId } = useParams();

    // 2. QUERY PARAMETERS (e.g., ?phoneNumber=...)
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const phoneNumber = queryParams.get('phoneNumber');

    const navigate = useNavigate();
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [subscriptionStatus] = useState('Premium'); // Mock subscription status

    // STATE FOR ADDRESS MANAGEMENT
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressFetchMessage, setAddressFetchMessage] = useState('Fetching addresses...');

    // EFFECT: Real-time clock timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // EFFECT: Fetch addresses on component mount using the userId
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!userId) {
                setAddressFetchMessage('Error: User ID not provided in route.');
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/call/address/${userId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch addresses: ${response.statusText}`);
                }

                const result = await response.json();
                // Ensure result structure is correct, expecting { addresses: [...] }
                const addresses = result.addresses || []; 

                if (addresses.length > 0) {
                    setUserAddresses(addresses);
                    // CRITICAL FIX: Auto-select the first address using its 'address_id'
                    setSelectedAddressId(addresses[0].address_id);
                    setAddressFetchMessage(`${addresses.length} addresses loaded.`);
                } else {
                    setAddressFetchMessage('No addresses found for this user.');
                    setUserAddresses([]);
                    setSelectedAddressId(null);
                }

            } catch (error) {
                console.error('Address Fetch Error:', error);
                setAddressFetchMessage(`❌ Failed to load addresses: ${error.message}`);
            }
        };

        fetchAddresses();
    }, [userId]);

    // --- NEW FUNCTION: Handle Ticket Creation, then Order Creation, then Navigation ---
    const handleCreateTicketAndOrder = async () => {
        if (!notes.trim()) {
            setSaveMessage('Error: Notes cannot be empty.');
            setTimeout(() => setSaveMessage(''), 3000);
            return;
        }

        if (!selectedAddressId) {
            setSaveMessage('Error: Please select an address.');
            setTimeout(() => setSaveMessage(''), 3000);
            return;
        }

        if (!phoneNumber) {
            setSaveMessage('Error: Call phone number is missing from the URL query.');
            setTimeout(() => setSaveMessage(''), 3000);
            return;
        }

        setIsSaving(true);
        setSaveMessage('Creating Ticket...');

        try {
            const actualPhoneNumber = phoneNumber;
            let ticketResult, orderResult;

            // --- STEP 1: CREATE TICKET ---
            const ticketResponse = await fetch(`${BACKEND_URL}/call/ticket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Agent-Id': 'AGENT_001',
                },
                body: JSON.stringify({
                    phoneNumber: actualPhoneNumber,
                    requestDetails: notes.trim(),
                }),
            });

            if (!ticketResponse.ok) {
                const errorText = await ticketResponse.text();
                throw new Error(`Ticket creation failed: ${ticketResponse.status}. Body: ${errorText.substring(0, 100)}...`);
            }
            ticketResult = await ticketResponse.json();
            const newTicketId = ticketResult.ticket_id;

            if (!newTicketId) {
                throw new Error("Ticket creation succeeded but returned no ticket_id.");
            }

            setSaveMessage(`Ticket ${newTicketId} created. Creating Order...`);

            // --- STEP 2: CREATE ORDER ---
            const orderResponse = await fetch(`${BACKEND_URL}/call/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: newTicketId,
                    userId: userId,
                    addressId: selectedAddressId,
                    requestDetails: notes.trim(),
                }),
            });

            if (!orderResponse.ok) {
                const errorText = await orderResponse.text();
                throw new Error(`Order creation failed: ${orderResponse.status}. Body: ${errorText.substring(0, 100)}...`);
            }
            orderResult = await orderResponse.json();
            const newOrderId = orderResult.order_id;

            if (!newOrderId) {
                throw new Error("Order creation succeeded but returned no order_id.");
            }

            setSaveMessage(`Order ${newOrderId} created. Navigating...`);
            console.log(`Ticket ${newTicketId} and Order ${newOrderId} successfully created. Navigating.`);

            // --- STEP 3: NAVIGATE with BOTH IDs ---
            navigate('/user/services', {
                state: {
                    ticketId: newTicketId,
                    orderId: newOrderId, // Now guaranteed to be a valid ID
                    requestDetails: notes.trim(),
                    selectedAddressId: selectedAddressId,
                    phoneNumber: actualPhoneNumber
                }
            });

        } catch (error) {
            console.error('Workflow Error:', error);
            setSaveMessage(`❌ Failed workflow step: ${error.message}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 5000);
        }
    };
    // --------------------------------------------------------

    const isButtonDisabled = isSaving || !phoneNumber || !selectedAddressId;

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-100">
            {/* HEADER */}
            <header className="h-16 bg-gray-900 text-white flex items-center justify-between px-6 shadow-xl z-20">
                <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
                    <PhoneIcon />
                    <span>CC Agent Console: Active Call</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="font-mono text-lg text-gray-400">{currentTime}</span>
                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold border-2 border-gray-600">
                        AG
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR - User/Call Info & Address Selection (Fixed Width on Desktop, full width on mobile) */}
                <aside className="w-full lg:w-96 bg-white border-r border-gray-200 p-6 flex flex-col gap-8 flex-shrink-0 overflow-y-auto">
                    {/* Customer Details Card */}
                    <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-md">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                            <span className="text-xl">☎️</span> Customer Details
                        </h3>

                        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                            <span className="text-sm text-gray-500">Calling Phone No.</span>
                            <span className="font-bold text-sm text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md font-mono">
                                {phoneNumber || 'N/A (Query Missing)'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-100">
                            <span className="text-sm text-gray-500">User ID</span>
                            <span className="text-sm font-bold text-gray-900">{userId}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm text-gray-500">Subscription Status</span>
                            <span className={clsx(
                                "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                subscriptionStatus === 'Premium' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            )}>
                                {subscriptionStatus}
                            </span>
                        </div>
                        <p className="mt-4 text-xs text-gray-400">*Details are for the verified calling party.</p>
                    </div>

                    {/* Address Selection Card */}
                    <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-md">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
                            <span className="text-xl">🏠</span> Select Address
                        </h3>
                        <p className="text-xs text-gray-500 mb-3 h-4">
                            {addressFetchMessage}
                        </p>
                        <div className="max-h-52 overflow-y-auto space-y-2">
                            {userAddresses.length > 0 ? (
                                userAddresses.map((address) => (
                                    <div
                                        key={address.address_id}
                                        className={clsx(
                                            "p-3 rounded-lg text-sm transition-all duration-200 cursor-pointer border",
                                            selectedAddressId === address.address_id
                                                ? 'bg-green-50 border-green-500 font-semibold text-green-800 shadow-sm ring-2 ring-green-500'
                                                : 'bg-white border-gray-300 hover:bg-gray-50'
                                        )}
                                        onClick={() => setSelectedAddressId(address.address_id)}
                                    >
                                        <p className="truncate">{address.address_line}</p>
                                        <p className="text-xs text-gray-500">{address.city}, {address.zip_code}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-red-500">
                                    No addresses found for selection.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Placeholder for History */}
                    <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-md flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                            Call History Summary
                        </h3>
                        <p className="text-sm text-gray-500">
                            *Implement history lookup here (e.g., last 3 tickets, products owned, recent activity logs).
                        </p>
                    </div>
                </aside>

                {/* CONTENT AREA - Note Taking */}
                <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6">📝 Active Call Notes</h2>

                    {/* Notes Input Card */}
                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-xl">
                        <textarea
                            className="w-full min-h-[400px] p-4 text-base border border-gray-300 rounded-lg resize-y focus:ring-4 focus:ring-green-500/50 focus:border-green-500 outline-none transition-shadow"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Start taking notes on the user's request, issues, or actions taken..."
                        />
                    </div>

                    {/* Action Bar */}
                    <div className="mt-6 flex justify-end items-center gap-4">
                        {saveMessage && (
                            <span className={clsx(
                                "text-sm font-semibold transition-opacity duration-300",
                                saveMessage.includes('Error') ? 'text-red-600' : 'text-green-700'
                            )}>
                                {saveMessage}
                            </span>
                        )}
                        <button
                            onClick={handleCreateTicketAndOrder}
                            disabled={isButtonDisabled}
                            className={clsx(
                                'px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg',
                                isButtonDisabled
                                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-green-500/50 text-white'
                            )}
                        >
                            {isSaving ? 'Processing Workflow...' : 'Save Notes & Select Service'}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
