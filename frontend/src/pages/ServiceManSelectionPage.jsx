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
/**
 * Generates a simple, unique ID based on the current timestamp and a random number.
 * Format: ORD-YYMMDD-HHMMSS-RND
 */
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


// --- 🔥 NEW HELPER: Fetch Agent's Admin ID from Backend ---
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
        // Backend should return { admin_id: "..." }
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
    reassignmentBadge: { 
        display: 'inline-block',
        backgroundColor: '#fef3c7',
        color: '#92400e',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '700',
        marginLeft: '8px',
        border: '1px solid #fcd34d'
    }
};

// Helper component for servicemen display (Unchanged)
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
                {/* Uses full_name from DB, falls back to name */}
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
                {/* Shows calculated distance */}
                <p style={{ fontSize: '0.875rem', color: '#4b5563', fontWeight: '600' }}>
                    {serviceman.calculatedDistance !== undefined 
                        ? `📍 ${serviceman.calculatedDistance} km away` 
                        : 'Checking distance...'}
                </p>
            </div>
        </div>
    );
};

// Geocode function (Nominatim) (Unchanged)
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
 * @param {string} serviceName 
 * @returns {Promise<Array>} List of servicemen
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
 * @param {string} phoneNumber 
 * @returns {Promise<string>} member_id or status
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
             // If phone number is not found, backend will return 404
             if (response.status === 404) return 'Not Found';
             throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        // The backend returns { member_id: "..." }
        console.log(`[MEMBER ID SUCCESS] Found Member ID: ${data.member_id}`);
        return data.member_id;
    } catch (error) {
        console.error("[MEMBER ID ERROR] Fetch failed:", error);
        return 'Error'; // Return 'Error' on failure
    }
};


export function ServiceManSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // 🔥 NEW: Destructure reassignment flags from state
    const { 
        ticketId, 
        requestDetails, 
        selectedAddressId, 
        serviceName, 
        phoneNumber,
        isReassignment,
        cancelledOrderId 
    } = location.state || {};
    
    // State for generated IDs and customer details
    const [orderId, setOrderId] = useState(null);
    const [fetchedAddressLine, setFetchedAddressLine] = useState('Loading address...');
    const [userCoordinates, setUserCoordinates] = useState(null); 
    const [memberId, setMemberId] = useState('Searching...'); // For the fetched member ID
    
    // 🔥 NEW STATE: To hold the Agent's Admin ID
    const [adminId, setAdminId] = useState('Fetching...'); 

    // UI and Dispatch State
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [rawServicemen, setRawServicemen] = useState([]);
    const [sortedServicemen, setSortedServicemen] = useState([]);
    const [selectedServiceman, setSelectedServiceman] = useState(null);
    const [dispatchStatus, setDispatchStatus] = useState(null);
    
    // Clock timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Generate orderId on component load (or use existing for reassignment)
    useEffect(() => {
        if (isReassignment && cancelledOrderId) {
            // For reassignment, we keep the same order_id
            setOrderId(cancelledOrderId);
            console.log(`[REASSIGNMENT MODE] Using existing Order ID: ${cancelledOrderId}`);
        } else {
            // For new orders, generate a new ID
            const newOrderId = generateUniqueOrderId();
            setOrderId(newOrderId);
            console.log(`[ORDER CREATION] Generated unique Order ID: ${newOrderId}`);
        }
    }, [isReassignment, cancelledOrderId]); 
    
    // Fetch Member ID (Unchanged)
    useEffect(() => {
        if (phoneNumber) {
            const loadMemberId = async () => {
                const id = await fetchMemberId(phoneNumber);
                setMemberId(id);
            };
            loadMemberId();
        } else {
            setMemberId('N/A');
        }
    }, [phoneNumber]);

    // 🔥 NEW EFFECT: Fetch Admin ID when component loads
    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setAdminId('Loading...');
            const loadAdminId = async () => {
                const id = await fetchAgentAdminId(user.uid);
                setAdminId(id);
            };
            loadAdminId();
        } else {
            setAdminId('N/A - Agent not logged in.');
        }
    }, []);

    // 1. Fetch Address & Geocode (Unchanged)
    useEffect(() => {
        if (!selectedAddressId) return;

        const fetchAndGeocodeAddress = async () => {
            const fullUrl = `${API_BASE_URL}/call/address/lookup/${selectedAddressId}`;
            setFetchedAddressLine('Fetching address details...');
            
            try {
                const response = await fetch(fullUrl);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                
                const data = await response.json();
                const addressLine = data.address_line; 
                setFetchedAddressLine(addressLine); 

                // Simple address cleanup for better geocoding accuracy
                const simplifiedAddress = addressLine
                    .replace(/Flat \d+,\s*/i, '') 
                    .replace(/Rosewood Apartments,\s*/i, '')
                    .trim();

                if (simplifiedAddress) {
                    const coords = await geocodeAddress(simplifiedAddress);
                    setUserCoordinates(coords);
                } else {
                    setUserCoordinates({ lat: 'N/A', lon: 'N/A' });
                }

            } catch (error) {
                console.error("Error during fetch/geocode:", error);
                setFetchedAddressLine(`Error loading address.`);
            }
        };

        fetchAndGeocodeAddress();
    }, [selectedAddressId]); 


    // 2. Fetch Servicemen (Raw Data) (Unchanged)
    useEffect(() => {
        if (!serviceName) {
            setDispatchStatus('Error: Service type not specified.');
            return;
        }

        const loadServicemen = async () => {
            setDispatchStatus(`Searching for active ${serviceName} specialists...`);
            const servicemen = await fetchServicemenFromBackend(serviceName);
            setRawServicemen(servicemen); // Store raw data first
            
            if (servicemen.length === 0) {
                setDispatchStatus(`⚠️ No active ${serviceName} specialists found.`);
            }
        };

        loadServicemen();
    }, [serviceName]); 

    // 3. Calculate Distance & Sort (Unchanged)
    useEffect(() => {
        if (rawServicemen.length > 0 && userCoordinates && userCoordinates.lat !== 'N/A') {
            
            const processedList = rawServicemen.map(sm => {
                // Parse strings to floats for calculation
                const dist = calculateDistance(
                    parseFloat(userCoordinates.lat),
                    parseFloat(userCoordinates.lon),
                    parseFloat(sm.current_lat),
                    parseFloat(sm.current_lng)
                );
                return { ...sm, calculatedDistance: dist };
            });

            // Sort: Nearest (lowest distance) first. If distance is null (error), push to bottom.
            const sortedList = processedList.sort((a, b) => {
                if (a.calculatedDistance === null) return 1;
                if (b.calculatedDistance === null) return -1;
                return a.calculatedDistance - b.calculatedDistance;
            });

            setSortedServicemen(sortedList);
            // Only update status if the list was loaded successfully and coordinates are available
            if (!dispatchStatus || dispatchStatus.includes('Searching') || dispatchStatus.includes('No active')) {
                     setDispatchStatus(`${sortedList.length} specialists found near you.`);
            }
        } else if (rawServicemen.length > 0) {
            // If we have servicemen but NO user coordinates yet, just show the list unsorted
            setSortedServicemen(rawServicemen);
        }
    }, [rawServicemen, userCoordinates, dispatchStatus]);


    /**
     * 🔥 UPDATED: Sends dispatch data including reassignment flags
     */
    const handleDispatch = async () => {
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

        // 1. Prepare Data for Dispatch Table
        const dispatchData = {
            user_id: selectedServiceman.user_id, // Serviceman's ID
            category: serviceName,              // Service/category name
            request_address: fetchedAddressLine, // Full address line
            order_status: 'Assigned',           // Initial status
            order_request: requestDetails,      // Customer request details

            order_id: orderId,                  // Unique order identifier (same for reassignment)
            ticket_id: ticketId,                // Associated support ticket
            phone_number: phoneNumber,          // Customer's phone number
            admin_id: adminId,                  // Agent's admin ID
            
            // 🔥 NEW: Include reassignment flags
            isReassignment: isReassignment || false,
            cancelledOrderId: cancelledOrderId || null
        };

        setDispatchStatus(`${isReassignment ? 'Reassigning to' : 'Dispatching'} ${selectedServiceman.full_name || selectedServiceman.name}...`);

        try {
            // 2. Make API Call to Backend
            const dispatchUrl = `${API_BASE_URL}/call/dispatch`;
            
            const response = await fetch(dispatchUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dispatchData),
            });

            if (!response.ok) {
                // Try to read JSON error body if available
                const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`Dispatch failed: ${errorBody.message || response.statusText}`);
            }

            // 3. Success Handling
            const successMessage = isReassignment 
                ? `✅ REASSIGNMENT SUCCESSFUL: Order ${orderId} reassigned to ${selectedServiceman.full_name || selectedServiceman.name}.`
                : `✅ DISPATCH SUCCESSFUL: Assigned to ${selectedServiceman.full_name || selectedServiceman.name}. Order ID: ${orderId}`;
            
            setDispatchStatus(successMessage);
            
            console.log("Dispatch data sent:", dispatchData);
            
            // Navigate away after a delay
            setTimeout(() => {
                navigate('/');
            }, 3000);

        } catch (error) {
            console.error("DISPATCH ERROR:", error);
            setDispatchStatus(`❌ DISPATCH FAILED: ${error.message}. Please check backend logs.`);
        }
    };

    if (!ticketId || !selectedAddressId || !serviceName) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ color: '#ef4444' }}>Error: Navigation Data Missing</h1>
                <p style={{ marginBottom: '20px' }}>Please ensure a Ticket ID, Address ID, and Service Name were provided from the previous step.</p>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: 'white', cursor: 'pointer' }}
                >
                    Go to Home
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
                    {isReassignment && <span style={styles.reassignmentBadge}>♻️ REASSIGNMENT MODE</span>}
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.clock}>{currentTime}</span>
                    <div style={styles.avatar}>AG</div>
                </div>
            </header>

            <div style={styles.mainContent}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                    <span style={{ color: '#10b981' }}>{serviceName}</span> Servicemen Near User
                    {isReassignment && <span style={{ fontSize: '1rem', color: '#92400e', marginLeft: '12px' }}>🔄 Reassignment after Cancellation</span>}
                </h1>
                
                {/* Request Summary Card */}
                <div style={styles.card}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        User Location & Service Request {isReassignment && <span style={{ color: '#92400e', fontSize: '0.9rem' }}>(Reassignment)</span>}
                    </h2>
                    {/* Displaying new IDs */}
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '4px' }}>
                        **Ticket ID:** <span style={{ fontWeight: '600', backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '4px' }}>{ticketId}</span>
                        {' | '}
                        **Order ID:** <span style={{ fontWeight: '600', backgroundColor: isReassignment ? '#fef3c7' : '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: isReassignment ? '#92400e' : '#4f46e5' }}>{orderId || 'Generating...'} {isReassignment && '(Existing)'}</span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Customer Phone:** <span style={{ fontWeight: '600', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: '#4f46e5' }}>{phoneNumber || 'N/A'}</span>
                        {' | '}
                        **Member ID:** <span style={{ fontWeight: '600', backgroundColor: memberId === 'Not Found' ? '#fee2e2' : '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: memberId === 'Not Found' ? '#ef4444' : '#4f46e5' }}>
                            {memberId}
                        </span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Agent's Admin ID:** <span style={{ fontWeight: '600', backgroundColor: adminId.includes('Error') || adminId.includes('N/A') ? '#fee2e2' : '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: adminId.includes('Error') || adminId.includes('N/A') ? '#ef4444' : '#4f46e5' }}>
                            {adminId}
                        </span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Address:** <span style={{ fontWeight: '600' }}>{fetchedAddressLine}</span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Request:** <span style={{ fontWeight: '600' }}>{requestDetails}</span>
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
                        Available {serviceName} Technicians (Sorted by Distance)
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
                                {dispatchStatus?.includes('Searching') ? 'Loading technicians...' : 'No available technicians match the criteria.'}
                            </p>
                        )}
                    </div>
                    
                    {/* Dispatch Button */}
                    <div style={{ marginTop: '24px', textAlign: 'right' }}>
                        <button
                            onClick={handleDispatch}
                            disabled={!selectedServiceman || !orderId || dispatchStatus?.includes('Dispatching') || dispatchStatus?.includes('Reassigning') || dispatchStatus?.includes('SUCCESSFUL') || adminId.startsWith('Error') || adminId.startsWith('N/A') || adminId.startsWith('Loading')}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: (!selectedServiceman || !orderId || dispatchStatus?.includes('Dispatching') || dispatchStatus?.includes('Reassigning') || dispatchStatus?.includes('SUCCESSFUL') || adminId.startsWith('Error') || adminId.startsWith('N/A') || adminId.startsWith('Loading')) ? 'default' : 'pointer',
                                backgroundColor: (!selectedServiceman || !orderId || dispatchStatus?.includes('Dispatching') || dispatchStatus?.includes('Reassigning') || dispatchStatus?.includes('SUCCESSFUL') || adminId.startsWith('Error') || adminId.startsWith('N/A') || adminId.startsWith('Loading')) ? '#9ca3af' : isReassignment ? '#f59e0b' : '#10b981',
                                color: 'white',
                                transition: 'background-color 0.3s',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            {dispatchStatus?.includes('Dispatching') || dispatchStatus?.includes('Reassigning') 
                                ? 'Processing...' 
                                : dispatchStatus?.includes('SUCCESSFUL') 
                                    ? 'Completed' 
                                    : isReassignment 
                                        ? '🔄 Confirm Reassignment' 
                                        : 'Confirm & Dispatch Serviceman'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
