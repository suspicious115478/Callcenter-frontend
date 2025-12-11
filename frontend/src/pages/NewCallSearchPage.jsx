import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Using the placeholder URL
import { BACKEND_URL } from '../config';

export default function NewCallSearchPage() {

    // 1. QUERY PARAMETERS (Get Phone Number)
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const callerPhoneNumber = queryParams.get('caller'); 

    const navigate = useNavigate();

    // 2. STATE MANAGEMENT
    const [userId, setUserId] = useState(null); // 🟢 New State for extracted User ID
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [notes, setNotes] = useState('');
    
    // Address State (Exact same structure as UserDashboard)
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressFetchMessage, setAddressFetchMessage] = useState('Waiting for User ID...');

    // Service State
    const [services, setServices] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState(null);

    // Clock Timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);


    // ---------------------------------------------------------
    // 🚀 STEP 1: EXTRACT USER ID FROM PHONE NUMBER
    // ---------------------------------------------------------
    useEffect(() => {
        const fetchUserId = async () => {
            if (!callerPhoneNumber) return;

            setAddressFetchMessage('Looking up User ID...');
            try {
                // We assume an endpoint exists to get ID from Phone
                const response = await fetch(`${BACKEND_URL}/call/user/lookup?phoneNumber=${callerPhoneNumber}`);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.userId) {
                        setUserId(data.userId); // 🟢 Set the ID to trigger Step 2
                    } else {
                        setAddressFetchMessage('User ID not found for this number.');
                    }
                } else {
                    setAddressFetchMessage('Failed to look up User ID.');
                }
            } catch (error) {
                console.error("User Lookup Error:", error);
                setAddressFetchMessage('Error looking up user.');
            }
        };

        fetchUserId();
    }, [callerPhoneNumber]);


    // ---------------------------------------------------------
    // 🚀 STEP 2: FETCH ADDRESSES (LOGIC SAME AS USER DASHBOARD)
    // ---------------------------------------------------------
    useEffect(() => {
        const fetchAddresses = async () => {
            // Only run this if we successfully extracted a userId in Step 1
            if (!userId) {
                return;
            }

            setAddressFetchMessage('Fetching addresses...');

            try {
                // 🟢 Exact same endpoint logic as UserDashboard
                const response = await fetch(`${BACKEND_URL}/call/address/${userId}`); 

                if (!response.ok) {
                    throw new Error(`Failed to fetch addresses: ${response.statusText}`);
                }

                const result = await response.json();
                const addresses = result.addresses;

                if (addresses.length > 0) {
                    setUserAddresses(addresses);
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
    }, [userId]); // Dependency is userId, so this runs immediately after Step 1 finishes


    // ---------------------------------------------------------
    // LOAD SERVICES (Mock Data)
    // ---------------------------------------------------------
    useEffect(() => {
        setServices([
            { id: 'EMS_ALS', name: 'ALS Ambulance', type: 'Critical Care', eta: '8 mins' },
            { id: 'EMS_BLS', name: 'BLS Ambulance', type: 'Basic Transport', eta: '12 mins' },
            { id: 'FIRE', name: 'Fire Rescue', type: 'Emergency', eta: '5 mins' },
            { id: 'POLICE', name: 'Police Dispatch', type: 'Security', eta: '10 mins' },
        ]);
    }, []);


    // HANDLE DISPATCH
    const handleDispatch = () => {
        if (!selectedAddressId || !selectedServiceId) return;

        const selectedAddress = userAddresses.find(a => a.address_id === selectedAddressId);
        const selectedService = services.find(s => s.id === selectedServiceId);

        navigate('/dispatch/confirm', {
            state: {
                userId: userId,
                phoneNumber: callerPhoneNumber,
                address: selectedAddress,
                service: selectedService,
                notes: notes
            }
        });
    };

    // --- STYLES (MATCHING USER DASHBOARD) ---
    const styles = {
        container: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: '"Inter", sans-serif', backgroundColor: '#f3f4f6', color: '#111827' },
        header: { height: '64px', backgroundColor: '#1f2937', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 20 },
        brand: { fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' },
        headerRight: { display: 'flex', alignItems: 'center', gap: '24px' },
        clock: { fontFamily: 'monospace', color: '#9ca3af', fontSize: '0.95rem' },
        avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', border: '2px solid #4b5563' },
        
        main: { display: 'flex', flex: 1, overflow: 'hidden' },
        sidebar: { width: '320px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flexShrink: 0, overflowY: 'auto' },
        contentArea: { flex: 1, padding: '32px', backgroundColor: '#f3f4f6', overflowY: 'auto' },
        
        card: { padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '10px' },
        userInfoTitle: { fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' },
        title: { fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '24px' },
        
        addressItem: { padding: '10px', margin: '8px 0', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: 'background-color 0.2s' },
        addressSelected: { backgroundColor: '#dcfce7', borderColor: '#10b981', fontWeight: '700' },
        
        notesTextarea: { width: '100%', minHeight: '120px', padding: '16px', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit' },
        
        // Service Grid Styles
        serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px', marginTop: '15px' },
        serviceCard: { padding: '15px', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fff', transition: '0.2s' },
        serviceSelected: { backgroundColor: '#fee2e2', borderColor: '#ef4444', transform: 'scale(1.02)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },

        dispatchBtn: { padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', backgroundColor: '#dc2626', color: 'white', marginTop: '20px', width: '100%' },
        phoneNumberDisplay: { fontWeight: '700', color: '#dc2626', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' },
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.brand}>
                    <span>🚨 Unverified Call Intake</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.clock}>{currentTime}</span>
                    <div style={styles.avatar}>AG</div>
                </div>
            </header>

            <div style={styles.main}>
                {/* SIDEBAR */}
                <aside style={styles.sidebar}>
                    {/* User Info Card */}
                    <div style={styles.card}>
                        <div style={styles.userInfoTitle}>☎️ Caller Details</div>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                            <span style={{fontSize: '0.85rem', color: '#6b7280'}}>Incoming No.</span>
                            <span style={styles.phoneNumberDisplay}>{callerPhoneNumber || 'Unknown'}</span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span style={{fontSize: '0.85rem', color: '#6b7280'}}>Extracted User ID:</span>
                            <span style={{fontWeight: 'bold', fontSize: '0.9rem'}}>
                                {userId ? userId : <span style={{color: '#9ca3af'}}>Searching...</span>}
                            </span>
                        </div>
                    </div>

                    {/* Address Selection Card */}
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
                                        <div style={{fontWeight: '600', marginBottom:'4px'}}>{address.type || 'Home'}</div>
                                        {address.address_line}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>
                                {userId ? "User found, but no addresses linked." : "Waiting for User ID to fetch addresses..."}
                            </p>
                        )}
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main style={styles.contentArea}>
                    <h2 style={styles.title}>🚑 Emergency Dispatch Config</h2>

                    {/* 1. Incident Notes */}
                    <div style={styles.card}>
                        <label style={{display:'block', marginBottom: '8px', fontWeight: '600'}}>Incident Notes / Description</label>
                        <textarea
                            style={styles.notesTextarea}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Describe the nature of the call..."
                        />
                    </div>

                    {/* 2. Medical Services */}
                    <div style={styles.card}>
                        <div style={styles.userInfoTitle}>🏥 Select Medical Service</div>
                        <div style={styles.serviceGrid}>
                            {services.map((service) => (
                                <div 
                                    key={service.id}
                                    style={{
                                        ...styles.serviceCard,
                                        ...(selectedServiceId === service.id ? styles.serviceSelected : {})
                                    }}
                                    onClick={() => setSelectedServiceId(service.id)}
                                >
                                    <div style={{fontWeight: '700', marginBottom: '5px'}}>{service.name}</div>
                                    <div style={{fontSize: '0.85rem', color: '#6b7280'}}>{service.type}</div>
                                    <div style={{fontSize: '0.85rem', fontWeight: '600', color: '#dc2626', marginTop: '5px'}}>ETA: {service.eta}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Dispatch Button */}
                    <div style={{textAlign: 'right'}}>
                        <button 
                            style={{
                                ...styles.dispatchBtn, 
                                opacity: (selectedAddressId && selectedServiceId) ? 1 : 0.5,
                                cursor: (selectedAddressId && selectedServiceId) ? 'pointer' : 'not-allowed'
                            }}
                            onClick={handleDispatch}
                            disabled={!selectedAddressId || !selectedServiceId}
                        >
                            Review & Dispatch ➔
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

