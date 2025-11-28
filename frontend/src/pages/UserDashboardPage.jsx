import React, { useState, useEffect } from 'react';

// 🚀 NEW: Import useLocation to access query parameters

import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
// 💡 FIX: Define the URL directly here since the config file is missing in this environment
const BACKEND_URL = 'https://callcenter-baclend.onrender.com';
export default function UserDashboardPage() {
    // 1. URL PARAMETERS (e.g., /dashboard/1)
    const { userId } = useParams();
    // 2. QUERY PARAMETERS (e.g., ?phoneNumber=...)
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const phoneNumber = queryParams.get('phoneNumber'); // 🚀 FIX: Correctly reads '919812300001'
    const navigate = useNavigate();
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [subscriptionStatus] = useState('Premium');
    // STATE FOR ADDRESS MANAGEMENT
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressFetchMessage, setAddressFetchMessage] = useState('Fetching addresses...');
    useEffect(() => {
        // Clock timer for the header
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
                const addresses = result.addresses;
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

    // --- RESTORED FUNCTION: Save Notes to Backend as a Ticket and Navigate ---
    const saveNotesAsTicket = async () => {
        if (!notes.trim()) {
            setSaveMessage('Error: Notes cannot be empty.');
            setTimeout(() => setSaveMessage(''), 3000);
            return;
        }

        

        // CHECK: Require an address to be selected before proceeding

        if (!selectedAddressId && userAddresses.length > 0) {

            setSaveMessage('Error: Please select an address.');

            setTimeout(() => setSaveMessage(''), 3000);

            return;

        }



        // NEW CHECK: Ensure phone number is available

        if (!phoneNumber) {

            setSaveMessage('Error: Call phone number is missing from the URL query.');

            setTimeout(() => setSaveMessage(''), 3000);

            return;

        }



        setIsSaving(true);

        setSaveMessage('Saving...');



        try {

            // CRITICAL FIX: Use the 'phoneNumber' correctly extracted from query params

            const actualPhoneNumber = phoneNumber; 



            const response = await fetch(`${BACKEND_URL}/call/ticket`, {

                method: 'POST',

                headers: {

                    'Content-Type': 'application/json',

                    'X-Agent-Id': 'AGENT_001',

                },

                body: JSON.stringify({

                    // 🚀 USE ACTUAL PHONE NUMBER FROM QUERY PARAMS

                    phoneNumber: actualPhoneNumber,

                    requestDetails: notes.trim(),

                }),

            });



            if (!response.ok) {

                let errorData = {};

                try {

                    errorData = await response.json();

                } catch (e) {

                    const errorText = await response.text();

                    throw new Error(`Server responded with ${response.status}. Body: ${errorText.substring(0, 100)}...`);

                }

                throw new Error(errorData.message || 'Server error occurred.');

            }



            const result = await response.json();



            // CRITICAL NAVIGATION: Redirect to the new service selection page

            // 🚀 NEW: Expecting backend to return both ticket_id and order_id

            console.log(`Ticket ${result.ticket_id} and Order ${result.order_id} created. Navigating.`);



            // Navigate, passing the necessary data (ticketId, orderId, requestDetails, and selectedAddressId)

            navigate('/user/services', {

                state: {

                    ticketId: result.ticket_id,

                    orderId: result.order_id, // 🚀 NEW: Passing Order ID to next page

                    requestDetails: result.requestDetails || notes.trim(),

                    selectedAddressId: selectedAddressId,

                    phoneNumber: actualPhoneNumber 

                }

            });



        } catch (error) {

            console.error('API Error:', error);

            setSaveMessage(`❌ Failed to create ticket: ${error.message}`);

        } finally {

            setIsSaving(false);

            setTimeout(() => setSaveMessage(''), 5000);

        }

    };

    // --------------------------------------------------------



    // --- INLINE STYLES ADAPTED FOR COMPILATION ---

    const styles = {

        container: {

            display: 'flex',

            flexDirection: 'column',

            height: '100vh',

            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

            backgroundColor: '#f3f4f6',

            color: '#111827',

        },

        header: {

            height: '64px',

            backgroundColor: '#1f2937',

            color: 'white',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'space-between',

            padding: '0 24px',

            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',

            zIndex: 20,

        },

        brand: {

            fontSize: '1.25rem',

            fontWeight: '700',

            letterSpacing: '-0.025em',

            display: 'flex',

            alignItems: 'center',

            gap: '10px',

        },

        headerRight: {

            display: 'flex',

            alignItems: 'center',

            gap: '24px',

        },

        clock: {

            fontFamily: 'monospace',

            color: '#9ca3af',

            fontSize: '0.95rem',

        },

        avatar: {

            width: '36px',

            height: '36px',

            borderRadius: '50%',

            backgroundColor: '#374151',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            fontSize: '0.875rem',

            fontWeight: '600',

            border: '2px solid #4b5563',

        },

        main: {

            display: 'flex',

            flex: 1,

            overflow: 'hidden',

        },

        sidebar: {

            width: '300px',

            backgroundColor: 'white',

            borderRight: '1px solid #e5e7eb',

            padding: '24px',

            display: 'flex',

            flexDirection: 'column',

            gap: '32px',

            flexShrink: 0,

        },

        contentArea: {

            flex: 1,

            padding: '32px',

            backgroundColor: '#f3f4f6',

            overflowY: 'auto',

        },

        card: {

            padding: '20px',

            backgroundColor: 'white',

            borderRadius: '12px',

            border: '1px solid #e5e7eb',

            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

            marginBottom: '20px', // Added spacing between cards

        },

        title: {

            fontSize: '1.5rem',

            fontWeight: '700',

            color: '#111827',

            marginBottom: '24px',

        },

        notesTextarea: {

            width: '100%',

            minHeight: '400px',

            padding: '16px',

            fontSize: '1rem',

            border: '1px solid #d1d5db',

            borderRadius: '8px',

            resize: 'vertical',

            fontFamily: 'inherit',

            boxSizing: 'border-box',

        },

        userInfoBlock: {

            marginBottom: '24px',

        },

        userInfoTitle: {

            fontSize: '1.125rem',

            fontWeight: '600',

            color: '#111827',

            marginBottom: '12px',

            paddingBottom: '8px',

            borderBottom: '1px solid #e5e7eb',

        },

        infoRow: {

            display: 'flex',

            justifyContent: 'space-between',

            alignItems: 'center',

            padding: '10px 0',

            borderBottom: '1px dashed #f3f4f6',

        },

        infoKey: {

            fontSize: '0.875rem',

            color: '#6b7280',

        },

        infoVal: {

            fontSize: '0.875rem',

            fontWeight: '700',

            color: '#111827',

        },

        subscriptionBadge: {

            padding: '4px 10px',

            borderRadius: '9999px',

            fontSize: '0.75rem',

            fontWeight: '600',

            backgroundColor: subscriptionStatus === 'Premium' ? '#d1fae5' : '#fef9c3',

            color: subscriptionStatus === 'Premium' ? '#065f46' : '#a16207',

        },

        addressItem: {

            padding: '10px',

            margin: '8px 0',

            border: '1px solid #d1d5db',

            borderRadius: '6px',

            cursor: 'pointer',

            fontSize: '0.9rem',

            transition: 'background-color 0.2s',

        },

        addressSelected: {

            backgroundColor: '#dcfce7',

            borderColor: '#10b981',

            fontWeight: '700',

        },

        saveButton: {

            padding: '10px 20px',

            borderRadius: '8px',

            border: 'none',

            fontWeight: '600',

            fontSize: '0.875rem',

            cursor: isSaving || !phoneNumber ? 'default' : 'pointer', // Disable if no phone number

            backgroundColor: isSaving || !phoneNumber ? '#6b7280' : '#10b981',

            color: 'white',

            transition: 'background-color 0.3s',



            // Use Tailwind-like colors/shadows for better visual appeal

            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4), 0 2px 4px -2px rgba(16, 185, 129, 0.4)',

        },

        message: {

            marginRight: '15px',

            fontSize: '0.875rem',

            fontWeight: '600',

            color: saveMessage.includes('Error') ? '#ef4444' : '#047857',

        },

        phoneNumberDisplay: {

            fontWeight: '700',

            color: '#4f46e5',

            backgroundColor: '#eef2ff',

            padding: '2px 8px',

            borderRadius: '4px',

            fontFamily: 'monospace',

        }

    };

    // --------------------------------------------------------



    return (

        <div style={styles.container}>

            {/* HEADER */}

            <header style={styles.header}>

                <div style={styles.brand}>

                    {/* Inline SVG Phone Icon (replacement for lucide-react) */}

                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>

                    </svg>

                    <span>CC Agent Console: Active Call</span>

                </div>

                <div style={styles.headerRight}>

                    <span style={styles.clock}>{currentTime}</span>

                    <div style={styles.avatar}>AG</div>

                </div>

            </header>



            <div style={styles.main}>

                {/* SIDEBAR - Used to display User/Call Info */}

                <aside style={styles.sidebar}>

                    <div style={{ ...styles.card, ...styles.userInfoBlock }}>

                        <div style={styles.userInfoTitle}>☎️ Customer Details</div>



                        <div style={styles.infoRow}>

                            <span style={styles.infoKey}>Calling Phone No.</span>

                            {/* Display the phone number, or a message if missing */}

                            <span style={styles.phoneNumberDisplay}>

                                {phoneNumber || 'N/A (Query Missing)'}

                            </span>

                        </div>

                        

                        <div style={styles.infoRow}>

                            <span style={styles.infoKey}>User ID</span>

                            <span style={styles.infoVal}>{userId}</span>

                        </div>



                        <div style={styles.infoRow}>

                            <span style={styles.infoKey}>Subscription Status</span>

                            <span style={styles.subscriptionBadge}>{subscriptionStatus}</span>

                        </div>



                        <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#9ca3af' }}>
                            *Details are for the verified calling party.
                        </div>
                    </div>
                    {/* ADDRESS SELECTION CARD */}
                    <div style={styles.card}>
                        <div style={styles.userInfoTitle}>🏠 Select Address</div>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '10px' }}>
                            {addressFetchMessage}
                        </p>
                        {userAddresses.length > 0 ? (
                            <div>
                                {userAddresses.map((address) => (
                                    <div
                                        key={address.address_id}
                                        style={{
                                            ...styles.addressItem,
                                            ...(selectedAddressId === address.address_id ? styles.addressSelected : {})
                                        }}
                                        onClick={() => setSelectedAddressId(address.address_id)}
                                    >
                                        {address.address_line}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>
                                No addresses to select.
                            </p>
                        )}
                    </div>
                    <div style={{ ...styles.card, flex: 1 }}>
                        <div style={styles.userInfoTitle}>Call History Summary</div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            *Implement history lookup here (e.g., last 3 tickets, products owned).
                        </p>
                    </div>
                </aside>
                {/* CONTENT AREA - Used for Note Taking */}
                <main style={styles.contentArea}>
                    <h2 style={styles.title}>📝 Active Call Notes</h2>

                    <div style={styles.card}>
                        <textarea
                            style={styles.notesTextarea}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Start taking notes on the user's request, issues, or actions taken..."
                        />
                    </div>
                    <div style={{ marginTop: '20px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {saveMessage && (
                            <span style={styles.message}>{saveMessage}</span>
                        )}
                        <button
                            onClick={saveNotesAsTicket}
                            // Disable if saving, if address is missing, or if phone number is missing
                            disabled={isSaving || !phoneNumber || (userAddresses.length > 0 && !selectedAddressId)}
                            style={styles.saveButton}
                        >
                            {isSaving ? 'Saving...' : 'Save Notes & Select Service'}

                        </button>

                    </div>

                </main>

            </div>

        </div>

    );

}

