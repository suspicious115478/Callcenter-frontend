import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth'; 
import { app } from '../config'; 

const API_BASE_URL = 'https://callcenter-baclend.onrender.com';
const auth = getAuth(app);

// Icons
const CalendarIcon = () => <span style={{ fontSize: '1.25rem' }}>📅</span>;
const ClockIcon = () => <span>⏰</span>;

// --- HELPERS ---

const generateUniqueOrderId = () => {
    const now = new Date();
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomPart = Math.floor(Math.random() * 9000) + 1000;
    return `ORD-${datePart}-${timePart}-${randomPart}`;
};

const fetchAgentAdminId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const url = `${API_BASE_URL}/agent/adminid/${firebaseUid}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        const data = await response.json();
        return data.admin_id;
    } catch (error) {
        console.error("[AGENT ADMIN ID ERROR]", error);
        return 'Error Fetching Admin ID';
    }
};

/**
 * 🔥 UPDATED: Fetches member_id AND customer_name using the new backend endpoint
 */
const fetchMemberIdAndName = async (phoneNumber) => {
    if (!phoneNumber) return { memberId: null, customerName: null };
    const url = `${API_BASE_URL}/call/memberid/lookup`;
    
    console.log(`[MEMBER ID & NAME FETCH] Requesting for phone: ${phoneNumber}`);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber })
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                console.warn("[MEMBER ID & NAME] Not found - New customer");
                return { memberId: 'Not Found', customerName: 'New Customer' };
            }
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("[MEMBER ID & NAME SUCCESS]", data);
        
        // Extract both member_id and customer_name from response
        return { 
            memberId: data.member_id || 'Not Found', 
            customerName: data.customer_name || 'Unknown Customer' 
        };
        
    } catch (error) {
        console.error("[MEMBER ID & NAME ERROR]", error);
        return { memberId: 'Error', customerName: 'Error Fetching Name' };
    }
};

// --- STYLES ---
const styles = {
    container: {
        display: 'flex', flexDirection: 'column', minHeight: '100vh', 
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f3f4f6', color: '#111827',
    },
    header: {
        height: '64px', backgroundColor: '#1f2937', color: 'white', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', padding: '0 24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 20,
    },
    brand: { fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '10px' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '24px' },
    clock: { fontFamily: 'monospace', color: '#9ca3af', fontSize: '0.95rem' },
    avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: '600', border: '2px solid #4b5563' },
    mainContent: { maxWidth: '1280px', margin: '0 auto', padding: '32px 16px', flex: 1, width: '100%', display: 'flex', gap: '32px', flexDirection: window.innerWidth > 1024 ? 'row' : 'column' },
    card: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', height: 'fit-content' },
    timeSlotGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginTop: '16px' },
    timeSlot: { padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'white', transition: 'all 0.2s' },
    timeSlotSelected: { backgroundColor: '#4f46e5', color: 'white', borderColor: '#4f46e5', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)' },
    inputDate: { padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', fontSize: '1rem', marginTop: '8px', fontFamily: 'inherit' },
};

const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM'
];

export default function SchedulingPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // 1. Extract State
    const { 
        ticketId, 
        requestDetails, 
        selectedAddressId, 
        serviceName, 
        phoneNumber,
        request_address
    } = location.state || {};

    // 2. Local State
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [orderId, setOrderId] = useState(null);
    const [adminId, setAdminId] = useState('Fetching...');
    const [memberId, setMemberId] = useState('Searching...');
    const [customerName, setCustomerName] = useState('Searching...'); 
    const [fetchedAddressLine, setFetchedAddressLine] = useState(request_address || 'Loading address...');
    
    // Scheduling State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);

    // 3. Effects

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Generate Order ID
    useEffect(() => {
        const newOrderId = generateUniqueOrderId();
        setOrderId(newOrderId);
        console.log(`[ORDER CREATION] Generated unique Order ID: ${newOrderId}`);
    }, []);

    // Fetch Admin ID
    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setAdminId('Loading...');
            fetchAgentAdminId(user.uid).then(id => setAdminId(id));
        } else {
            setAdminId('N/A - Agent not logged in.');
        }
    }, []);

    // 🔥 FIXED: Fetch Member ID AND Customer Name together
    useEffect(() => {
        if (phoneNumber) {
            setMemberId('Searching...');
            setCustomerName('Searching...');
            
            fetchMemberIdAndName(phoneNumber).then(({ memberId, customerName }) => {
                console.log(`[SCHEDULING PAGE] Fetched - Member ID: ${memberId}, Name: ${customerName}`);
                setMemberId(memberId);
                setCustomerName(customerName);
            });
        } else {
            setMemberId('N/A');
            setCustomerName('N/A');
        }
    }, [phoneNumber]);

    // Fetch Address Details
    useEffect(() => {
        if (selectedAddressId && !request_address) {
            const fetchAddress = async () => {
                const fullUrl = `${API_BASE_URL}/call/address/lookup/${selectedAddressId}`;
                setFetchedAddressLine('Fetching address details...');
                try {
                    const response = await fetch(fullUrl);
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                    const data = await response.json();
                    setFetchedAddressLine(data.address_line);
                } catch (error) {
                    console.error("Error fetching address:", error);
                    setFetchedAddressLine(`Error loading address.`);
                }
            };
            fetchAddress();
        } else if (request_address) {
            setFetchedAddressLine(request_address);
        }
    }, [selectedAddressId, request_address]);

    // 4. Handle Confirm Schedule
    const handleConfirmSchedule = async () => {
        if (!selectedDate || !selectedTime) {
            setStatusMessage('❗️ Please select both a Date and a Time.');
            return;
        }
        if (!orderId || adminId.startsWith('Error') || adminId.startsWith('N/A') || adminId.startsWith('Loading')) {
            setStatusMessage('❌ Error: Missing Order ID or Admin ID.');
            return;
        }
        if (customerName.includes('Error') || customerName.includes('Searching')) {
            setStatusMessage('❌ Error: Customer name is still being fetched or an error occurred.');
            return;
        }

        setStatusMessage('Scheduling appointment...');
        
        const scheduledDateTime = `${selectedDate} ${selectedTime}`;
        
        // 🔥 FIXED: Include customer_name in the payload
        const scheduleData = {
            user_id: null, // No serviceman assigned yet
            category: serviceName,
            request_address: fetchedAddressLine,
            order_status: 'Scheduled',
            order_request: requestDetails,
            order_id: orderId,
            ticket_id: ticketId,
            phone_number: phoneNumber,
            admin_id: adminId,
            scheduled_time: scheduledDateTime,
            previous_order_id: null,
            customer_name: customerName, // ⭐ Customer name is now correctly fetched
        };

        console.log("[SCHEDULING] Payload being sent:", scheduleData);

        try {
            const response = await fetch(`${API_BASE_URL}/call/dispatch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scheduleData),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorBody.message || response.statusText);
            }

            setStatusMessage(`✅ SCHEDULED SUCCESSFUL: Order ID ${orderId}`);
            
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (error) {
            console.error("SCHEDULING ERROR:", error);
            setStatusMessage(`❌ SCHEDULING FAILED: ${error.message}`);
        }
    };

    if (!serviceName) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ color: '#ef4444' }}>Error: Context Missing</h1>
                <button onClick={() => navigate('/')} style={{ padding: '10px 20px', marginTop: '10px' }}>Go Dashboard</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.brand}>
                    <CalendarIcon />
                    <span>CC Agent Console: Appointment Scheduling</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.clock}>{currentTime}</span>
                    <div style={styles.avatar}>AG</div>
                </div>
            </header>

            <div style={styles.mainContent}>
                
                {/* Left Column: Context */}
                <div style={{ width: window.innerWidth > 1024 ? '35%' : '100%' }}>
                    <div style={styles.card}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                            📋 Request Context
                        </h2>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>Service</label>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>{serviceName}</div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '4px' }}>
                                **Ticket ID:** <span style={{ fontWeight: '600', backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '4px' }}>{ticketId}</span>
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '4px' }}>
                                **New Order ID:** <span style={{ fontWeight: '600', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: '#4f46e5' }}>{orderId || '...'}</span>
                            </p>
                        </div>

                        <div style={{ marginBottom: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                            <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '4px' }}>
                                **Customer Phone:** <span style={{ fontWeight: '600' }}>{phoneNumber}</span>
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '4px' }}>
                                **Name:** <span style={{ 
                                    fontWeight: '600', 
                                    color: customerName === 'Searching...' ? '#9ca3af' : 
                                           customerName.includes('Error') ? '#ef4444' : 
                                           customerName === 'New Customer' ? '#f59e0b' : '#10b981' 
                                }}>
                                    {customerName}
                                </span>
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '4px' }}>
                                **Member ID:** <span style={{ fontWeight: '600', color: memberId === 'Not Found' ? '#ef4444' : '#4f46e5' }}>{memberId}</span>
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '4px' }}>
                                **Admin ID:** <span style={{ fontWeight: '600' }}>{adminId}</span>
                            </p>
                        </div>

                        <div style={{ marginBottom: '16px', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>Address</label>
                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{fetchedAddressLine}</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>Customer Note</label>
                            <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{requestDetails}"</div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Scheduling Inputs */}
                <div style={{ width: window.innerWidth > 1024 ? '65%' : '100%' }}>
                    <div style={styles.card}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                            Select Appointment Slot
                        </h1>

                        {/* Date Input */}
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#374151' }}>
                                <CalendarIcon /> Pick a Date
                            </label>
                            <input 
                                type="date" 
                                style={styles.inputDate}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {/* Time Slots */}
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#374151' }}>
                                <ClockIcon /> Pick a Time Slot
                            </label>
                            <div style={styles.timeSlotGrid}>
                                {TIME_SLOTS.map(time => (
                                    <div 
                                        key={time}
                                        style={selectedTime === time ? { ...styles.timeSlot, ...styles.timeSlotSelected } : styles.timeSlot}
                                        onClick={() => setSelectedTime(time)}
                                    >
                                        {time}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status Message */}
                        {statusMessage && (
                            <div style={{ 
                                padding: '12px', 
                                borderRadius: '8px', 
                                marginBottom: '20px', 
                                fontWeight: '600',
                                backgroundColor: statusMessage.includes('SUCCESS') ? '#ecfdf5' : '#fef2f2',
                                color: statusMessage.includes('SUCCESS') ? '#047857' : '#b91c1c',
                                border: `1px solid ${statusMessage.includes('SUCCESS') ? '#10b981' : '#ef4444'}`
                            }}>
                                {statusMessage}
                            </div>
                        )}

                        {/* Confirm Button */}
                        <button 
                            onClick={handleConfirmSchedule}
                            disabled={!selectedDate || !selectedTime || statusMessage?.includes('Scheduling') || statusMessage?.includes('SUCCESS')}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '1.1rem',
                                cursor: (!selectedDate || !selectedTime) ? 'not-allowed' : 'pointer',
                                backgroundColor: (!selectedDate || !selectedTime) ? '#9ca3af' : '#4f46e5',
                                color: 'white',
                                transition: 'background-color 0.3s',
                                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
                            }}
                        >
                            {statusMessage?.includes('Scheduling') ? 'Creating Appointment...' : 'Confirm Schedule (No Dispatch)'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
