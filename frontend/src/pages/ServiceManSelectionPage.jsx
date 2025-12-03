import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// 🔥 NEW IMPORTS for Firebase Auth
import { getAuth } from 'firebase/auth'; 
import { app } from '../config'; 

const API_BASE_URL = 'https://callcenter-baclend.onrender.com';
const auth = getAuth(app); // Initialize Firebase Auth

// Placeholder for header icon
const PhoneIcon = () => <span style={{ fontSize: '1.25rem' }}>📞</span>;

// --- HELPER: Generate Unique Order ID ---
const generateUniqueOrderId = () => {
    const now = new Date();
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
    const randomPart = Math.floor(Math.random() * 9000) + 1000; // 4-digit random
    return `ORD-${datePart}-${timePart}-${randomPart}`;
};

// --- HELPER: Haversine Formula for Distance (Km) ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    
    return parseFloat(distance.toFixed(2)); // Return number with 2 decimals
};

// --- HELPER: Fetch Agent's Admin ID from Backend ---
const fetchAgentAdminId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const url = `${API_BASE_URL}/agent/adminid/${firebaseUid}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) return 'Admin Not Found';
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`[AGENT ADMIN ID SUCCESS] Found Admin ID: ${data.admin_id}`);
        return data.admin_id;
    } catch (error) {
        console.error("[AGENT ADMIN ID ERROR] Fetch failed:", error);
        return 'Error Fetching Admin ID';
    }
};

// --- INLINE STYLES (Unchanged) ---
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
    mainContent: { maxWidth: '1280px', margin: '0 auto', padding: '32px 16px', flex: 1, width: '100%', },
    card: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginBottom: '20px' },
    servicemanList: { display: 'flex', flexDirection: 'column', gap: '16px' },
    servicemanItem: { padding: '16px', border: '1px solid #d1d5db', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', },
    servicemanHover: { backgroundColor: '#f3f4f6', borderColor: '#9ca3af' },
    servicemanSelected: { backgroundColor: '#dcfce7', borderColor: '#10b981', fontWeight: '700', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' },
};

// Helper component for servicemen display
const ServicemanCard = ({ serviceman, isSelected, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const cardStyle = {
        ...styles.servicemanItem,
        ...(isSelected ? styles.servicemanSelected : {}),
        ...(isHovered && !isSelected ? styles.servicemanHover : {}),
    };

    return (
        <div
            style={cardStyle}
            onClick={() => onClick(serviceman)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' }}>
                    {serviceman.full_name || serviceman.name || 'Unknown Technician'}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {serviceman.category || serviceman.service || 'General'} Specialist | Vehicle: {serviceman.vehicle || 'Standard'}
                </p>
            </div>
            <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
                    ⭐ {serviceman.rating || 'New'}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', fontWeight: '600' }}>
                    {serviceman.calculatedDistance !== undefined 
                        ? `📍 ${serviceman.calculatedDistance} km away` 
                        : 'Checking distance...'}
                </p>
            </div>
        </div>
    );
};

// Geocode function (Nominatim)
const geocodeAddress = async (address) => {
    const encodedAddress = encodeURIComponent(address);
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
    
    console.log(`[GEOCODING START] Querying Nominatim for: ${address}`);
    
    try {
        const response = await fetch(geocodingUrl);
        if (!response.ok) {
            throw new Error(`Geocoding HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat).toFixed(4);
            const lon = parseFloat(data[0].lon).toFixed(4);
            console.log(`[GEOCODING SUCCESS] Found Lat: ${lat}, Lng: ${lon}`);
            return { lat, lon };
        } else {
            console.warn('[GEOCODING WARNING] No results found for address.');
            return null;
        }
    } catch (error) {
        console.error('[GEOCODING ERROR] Failed to geocode address:', error);
        return null;
    }
};

/**
 * Fetches available servicemen based on the service category.
 */
const fetchServicemenFromBackend = async (serviceName) => {
    const url = `${API_BASE_URL}/call/servicemen/available`;
    console.log(`[SERVICEMEN FETCH] Requesting: ${url} for service: ${serviceName}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service: serviceName })
        });

        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        console.log(`[SERVICEMEN SUCCESS] Received ${data.length} records.`);
        return data;
    } catch (error) {
        console.error("[SERVICEMEN ERROR] Fetch failed:", error);
        return [];
    }
};

/**
 * Fetches the member_id associated with a phone number.
 */
const fetchMemberId = async (phoneNumber) => {
    if (!phoneNumber) return null;
    const url = `${API_BASE_URL}/call/memberid/lookup`;
    
    console.log(`[MEMBER ID FETCH] Requesting: ${url} for phone: ${phoneNumber}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber })
        });

        if (!response.ok) {
             if (response.status === 404) return 'Not Found';
             throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.member_id;
    } catch (error) {
        console.error("[MEMBER ID ERROR] Fetch failed:", error);
        return 'Error';
    }
};


// --------------------------------------------------------------------------------
// ⚡ MAIN COMPONENT
// --------------------------------------------------------------------------------
export function ServiceManSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // ------------------------------------------------------------------
    // ⚡ INITIAL STATE FROM ROUTER
    // ------------------------------------------------------------------
    const { 
        // Normal Flow Props
        ticketId: paramTicketId, 
        requestDetails: paramRequestDetails, 
        selectedAddressId, 
        serviceName: paramServiceName, 
        phoneNumber: paramPhoneNumber,

        // Re-Dispatch/Cancellation Flow Props
        orderId: previousOrderId, // The cancelled ID
        cancellationReason,
        // Fallbacks
        callerNumber, 
        category, 
        request_address 
    } = location.state || {};
    
    // ------------------------------------------------------------------
    // ⚡ STATE VARIABLES
    // We use state now because we might update these values via API fetch 
    // if a previousOrderId is present.
    // ------------------------------------------------------------------
    const [activeTicketId, setActiveTicketId] = useState(paramTicketId || 'UNKNOWN_TKT');
    const [activePhoneNumber, setActivePhoneNumber] = useState(paramPhoneNumber || callerNumber);
    const [activeServiceName, setActiveServiceName] = useState(paramServiceName || category);
    const [activeRequest, setActiveRequest] = useState(
        paramRequestDetails || (cancellationReason ? `Re-dispatch after cancel: ${cancellationReason}` : 'Service Request')
    );
    const [fetchedAddressLine, setFetchedAddressLine] = useState(request_address || 'Loading address...');
    
    // Admin ID & Member ID
    const [adminId, setAdminId] = useState('Fetching...'); 
    const [memberId, setMemberId] = useState('Searching...');
    
    // Core Logic State
    const [orderId, setOrderId] = useState(null);
    const [userCoordinates, setUserCoordinates] = useState(null); 
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    
    // Servicemen Data
    const [rawServicemen, setRawServicemen] = useState([]);
    const [sortedServicemen, setSortedServicemen] = useState([]);
    const [selectedServiceman, setSelectedServiceman] = useState(null);
    const [dispatchStatus, setDispatchStatus] = useState(null);
    
    // Clock timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Generate NEW unique orderId (Even for re-dispatch, we create a new order row)
    useEffect(() => {
        const newOrderId = generateUniqueOrderId();
        setOrderId(newOrderId);
        console.log(`[ORDER CREATION] Generated unique Order ID: ${newOrderId}`);
    }, []); 
    
    // ------------------------------------------------------------------
    // ⚡ CRITICAL: FETCH DETAILS IF PREVIOUS ORDER ID EXISTS
    // ------------------------------------------------------------------
    useEffect(() => {
        if (previousOrderId) {
            console.log(`[RE-DISPATCH DETECTED] Fetching details for Source Order ID: ${previousOrderId}`);
            setDispatchStatus("Fetching details from cancelled order...");

            const fetchSourceOrderDetails = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/call/dispatch/details/${previousOrderId}`);
                    if (!response.ok) throw new Error("Failed to fetch source order details");
                    
                    const data = await response.json();
                    
                    if (data) {
                        console.log("[SOURCE DATA FETCHED]", data);
                        // Update State with DB data (Overwrites passed props)
                        if (data.ticket_id) setActiveTicketId(data.ticket_id);
                        if (data.phone_number) setActivePhoneNumber(data.phone_number);
                        if (data.admin_id) setAdminId(data.admin_id);
                        if (data.request_address) {
                            setFetchedAddressLine(data.request_address);
                            handleGeocoding(data.request_address); // Trigger geocode for fetched address
                        }
                        if (data.category) setActiveServiceName(data.category);
                        
                        // Append previous request info
                        const newRequestNote = data.order_request 
                            ? `${data.order_request} (Re-dispatch Reason: ${cancellationReason || 'Admin Action'})`
                            : `Re-dispatch Reason: ${cancellationReason}`;
                        setActiveRequest(newRequestNote);
                    }
                } catch (error) {
                    console.error("Error fetching source order details:", error);
                    setDispatchStatus("⚠️ Error loading previous order details.");
                }
            };

            fetchSourceOrderDetails();
        } 
        // If no previousOrderId, but we have an admin logged in via Firebase
        else {
             const user = auth.currentUser;
             if (user) {
                 setAdminId('Loading...');
                 fetchAgentAdminId(user.uid).then(id => setAdminId(id));
             } else {
                 setAdminId('N/A - Agent not logged in.');
             }
        }
    }, [previousOrderId, cancellationReason]);

// ------------------------------------------------------------------
    // 🔥 FIX: NEW useEffect to trigger serviceman fetch
    // This runs whenever the service name or coordinates are ready.
    // ------------------------------------------------------------------
    useEffect(() => {
        if (activeServiceName && userCoordinates) {
            setDispatchStatus(`Searching for ${activeServiceName} specialists...`);
            
            fetchServicemenFromBackend(activeServiceName)
                .then(data => {
                    setRawServicemen(data);

                    if (data.length === 0) {
                        setDispatchStatus(`⚠️ No active ${activeServiceName} specialists found.`);
                    } else {
                        // In a real scenario, you'd sort by distance/rating here
                        setSortedServicemen(data); 
                        setDispatchStatus(`Found ${data.length} available specialists. Select one to dispatch.`);
                    }
                })
                .catch(() => {
                    setDispatchStatus("Error fetching servicemen.");
                });
        } else if (activeServiceName && !userCoordinates) {
             setDispatchStatus("Waiting for address geocoding to determine distance...");
        }
    }, [activeServiceName, userCoordinates]); // Dependencies are key to re-triggering the fetch!
    
    // ------------------------------------------------------------------
    // ⚡ NORMAL ADDRESS LOGIC (If NOT Re-dispatch)
    // ------------------------------------------------------------------
    useEffect(() => {
        // Only run this if we DIDN'T just fetch the address from previousOrderId logic
        if (!previousOrderId && selectedAddressId) {
            const fetchAndGeocodeAddress = async () => {
                const fullUrl = `${API_BASE_URL}/call/address/lookup/${selectedAddressId}`;
                setFetchedAddressLine('Fetching address details...');
                
                try {
                    const response = await fetch(fullUrl);
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                    
                    const data = await response.json();
                    const addressLine = data.address_line; 
                    setFetchedAddressLine(addressLine); 
                    handleGeocoding(addressLine);
                } catch (error) {
                    console.error("Error during fetch/geocode:", error);
                    setFetchedAddressLine(`Error loading address.`);
                }
            };
            fetchAndGeocodeAddress();
        } 
        else if (!previousOrderId && request_address) {
            // Fallback for passed address string without ID
            setFetchedAddressLine(request_address);
            handleGeocoding(request_address);
        }
    }, [selectedAddressId, request_address, previousOrderId]); 

    // Helper to process geocoding
    const handleGeocoding = async (rawAddress) => {
        const simplifiedAddress = rawAddress
            .replace(/Flat \d+,\s*/i, '') 
            .replace(/Rosewood Apartments,\s*/i, '')
            .trim();

        if (simplifiedAddress) {
            const coords = await geocodeAddress(simplifiedAddress);
            setUserCoordinates(coords);
        } else {
            setUserCoordinates({ lat: 'N/A', lon: 'N/A' });
        }
    };

    // ------------------------------------------------------------------
    // ⚡ FETCH MEMBER ID
    // ------------------------------------------------------------------
    useEffect(() => {
        if (activePhoneNumber) {
            const loadMemberId = async () => {
                const id = await fetchMemberId(activePhoneNumber);
                setMemberId(id);
            };
            loadMemberId();
        } else {
            setMemberId('N/A');
        }
    }, [activePhoneNumber]);


    // ------------------------------------------------------------------
    // ⚡ FETCH SERVICEMEN
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!activeServiceName) {
            setDispatchStatus('Error: Service type not specified.');
            return;
        }

        const loadServicemen = async () => {
            setDispatchStatus(`Searching for active ${activeServiceName} specialists...`);
            const servicemen = await fetchServicemenFromBackend(activeServiceName);
            setRawServicemen(servicemen);
            
            if (servicemen.length === 0) {
                setDispatchStatus(`⚠️ No active ${activeServiceName} specialists found.`);
            }
        };

        loadServicemen();
    }, [activeServiceName]); 

    // Sort Servicemen by Distance
    useEffect(() => {
        if (rawServicemen.length > 0 && userCoordinates && userCoordinates.lat !== 'N/A') {
            
            const processedList = rawServicemen.map(sm => {
                const dist = calculateDistance(
                    parseFloat(userCoordinates.lat),
                    parseFloat(userCoordinates.lon),
                    parseFloat(sm.current_lat),
                    parseFloat(sm.current_lng)
                );
                return { ...sm, calculatedDistance: dist };
            });

            const sortedList = processedList.sort((a, b) => {
                if (a.calculatedDistance === null) return 1;
                if (b.calculatedDistance === null) return -1;
                return a.calculatedDistance - b.calculatedDistance;
            });

            setSortedServicemen(sortedList);
            if (!dispatchStatus || dispatchStatus.includes('Searching') || dispatchStatus.includes('No active') || dispatchStatus.includes('Fetching')) {
                     setDispatchStatus(`${sortedList.length} specialists found near you.`);
            }
        } else if (rawServicemen.length > 0) {
            setSortedServicemen(rawServicemen);
        }
    }, [rawServicemen, userCoordinates, dispatchStatus]);


    // ------------------------------------------------------------------
    // ⚡ DISPATCH LOGIC
    // ------------------------------------------------------------------
    const handleDispatch = async () => {
        // 1. Get the raw state passed from the previous page
    const { 
        category, 
        requestAddress, 
        orderRequest, 
        customerPhone, 
        customerName, // <-- We now receive this
        ticketId 
    } = location.state || {};
        if (!selectedServiceman) {
            setDispatchStatus('❗️ Please select a serviceman to dispatch.');
            return;
        }
        if (!orderId) {
             setDispatchStatus('❌ Error: Order ID was not generated. Cannot dispatch.');
             return;
        }
        if (!adminId || adminId.startsWith('Error') || adminId.startsWith('N/A') || adminId.startsWith('Loading')) {
            setDispatchStatus(`❌ Error: Admin ID is missing or loading (${adminId}). Cannot dispatch.`);
            return;
        }

       const dispatchData = {
        user_id: selectedServiceman.user_id,
        
        // Fix: Use local state OR fallback to passed prop
        category: activeServiceName || category,            
        request_address: fetchedAddressLine || requestAddress, 
        order_request: activeRequest || orderRequest,       
        phone_number: activePhoneNumber || customerPhone,    
        
        ticket_id: activeTicketId || ticketId,           
        order_id: orderId,
        admin_id: adminId,
        order_status: 'Assigned',
        
        // 🔥 FIX 2: Add missing fields to prevent 500 Error
        customer_name: customerName || "Valued Customer", 
        customer_phone: activePhoneNumber || customerPhone, // Backend often checks this key specifically
        dispatched_at: new Date().toISOString(), // TIMESTAMP IS CRITICAL
        
        previous_order_id: previousOrderId || null 
    };

        setDispatchStatus(`Dispatching ${selectedServiceman.full_name || selectedServiceman.name}...`);

        try {
            const dispatchUrl = `${API_BASE_URL}/call/dispatch`;
            
            const response = await fetch(dispatchUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dispatchData),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`Dispatch failed: ${errorBody.message || response.statusText}`);
            }

            setDispatchStatus(`✅ DISPATCH SUCCESSFUL: Assigned to ${selectedServiceman.full_name || selectedServiceman.name}. Order ID: ${orderId}`);
            
            // Navigate away after a delay
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (error) {
            console.error("DISPATCH ERROR:", error);
            setDispatchStatus(`❌ DISPATCH FAILED: ${error.message}.`);
        }
    };

    // ------------------------------------------------------------------
    // ⚡ ERROR / MISSING DATA STATE
    // ------------------------------------------------------------------
    if ((!activeServiceName || !fetchedAddressLine) && !location.state && !previousOrderId) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ color: '#ef4444' }}>Error: Navigation Data Missing</h1>
                <p style={{ marginBottom: '20px' }}>Please ensure Service Name and Address were provided.</p>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: 'white', cursor: 'pointer' }}
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.brand}>
                    <PhoneIcon />
                    <span>CC Agent Console: Serviceman Dispatch</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.clock}>{currentTime}</span>
                    <div style={styles.avatar}>AG</div>
                </div>
            </header>

            <div style={styles.mainContent}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                    <span style={{ color: '#10b981' }}>{activeServiceName || 'Unknown Service'}</span> Servicemen Near User
                </h1>
                
                {previousOrderId && (
                    <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600' }}>
                        ⚠️ This is a re-dispatch for Cancelled Order #{previousOrderId}. A new Order ID will be generated.
                    </div>
                )}

                {/* Request Summary Card */}
                <div style={styles.card}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        User Location & Service Request
                    </h2>
                    
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '4px' }}>
                        **Ticket ID:** <span style={{ fontWeight: '600', backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '4px' }}>{activeTicketId}</span>
                        {' | '}
                        **New Order ID:** <span style={{ fontWeight: '600', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: '#4f46e5' }}>{orderId || 'Generating...'}</span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Customer Phone:** <span style={{ fontWeight: '600', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: '#4f46e5' }}>{activePhoneNumber || 'N/A'}</span>
                        {' | '}
                        **Member ID:** <span style={{ fontWeight: '600', backgroundColor: memberId === 'Not Found' ? '#fee2e2' : '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: memberId === 'Not Found' ? '#ef4444' : '#4f46e5' }}>
                            {memberId}
                        </span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Agent Admin ID:** <span style={{ fontWeight: '600', color: adminId.includes('Error') ? '#ef4444' : '#4f46e5' }}>{adminId}</span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Address:** <span style={{ fontWeight: '600' }}>{fetchedAddressLine}</span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Request:** <span style={{ fontWeight: '600' }}>{activeRequest}</span>
                    </p>
                    {userCoordinates && (
                    <p style={{ fontSize: '0.9rem', color: '#1f2937', marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                        **GPS Coordinates:** <span style={{ fontFamily: 'monospace', backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '4px' }}>
                            {userCoordinates.lat}, {userCoordinates.lon}
                        </span>
                    </p>
                    )}
                </div>

                {/* Serviceman List */}
                <div style={{ ...styles.card, padding: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                        Available Technicians (Sorted by Distance)
                    </h2>
                    
                    <p style={{ marginBottom: '16px', fontWeight: '600', color: dispatchStatus?.includes('SUCCESSFUL') ? '#047857' : dispatchStatus?.includes('No') || dispatchStatus?.includes('FAILED') || dispatchStatus?.includes('❗️') ? '#ef4444' : '#6b7280' }}>
                        {dispatchStatus}
                    </p>

                    <div style={styles.servicemanList}>
                        {sortedServicemen.length > 0 ? (
                            sortedServicemen.map(sm => (
                                <ServicemanCard
                                    key={sm.id}
                                    serviceman={sm}
                                    isSelected={selectedServiceman && selectedServiceman.id === sm.id}
                                    onClick={setSelectedServiceman}
                                />
                            ))
                        ) : (
                            <p style={{ color: '#ef4444', fontStyle: 'italic' }}>
                                {dispatchStatus?.includes('Searching') || dispatchStatus?.includes('Fetching') ? 'Loading technicians...' : 'No available technicians match the criteria.'}
                            </p>
                        )}
                    </div>
                    
                    {/* Dispatch Button */}
                    <div style={{ marginTop: '24px', textAlign: 'right' }}>
                        <button
                            onClick={handleDispatch}
                            disabled={!selectedServiceman || !orderId || dispatchStatus?.includes('Dispatching') || dispatchStatus?.includes('SUCCESSFUL') || adminId.startsWith('Error') || adminId.startsWith('N/A') || adminId.startsWith('Loading')}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: (!selectedServiceman || !orderId || dispatchStatus?.includes('Dispatching') || dispatchStatus?.includes('SUCCESSFUL')) ? 'default' : 'pointer',
                                backgroundColor: (!selectedServiceman || !orderId || dispatchStatus?.includes('Dispatching') || dispatchStatus?.includes('SUCCESSFUL')) ? '#9ca3af' : '#10b981',
                                color: 'white',
                                transition: 'background-color 0.3s',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            {dispatchStatus?.includes('Dispatching') ? 'Dispatching...' : dispatchStatus?.includes('SUCCESSFUL') ? 'Dispatched' : 'Confirm & Dispatch Serviceman'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
