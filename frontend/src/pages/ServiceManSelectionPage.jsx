import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// 🚀 CRITICAL FIX: Base URL without /api prefix
const API_BASE_URL = 'https://callcenter-baclend.onrender.com'; 

// Placeholder for header icon
const PhoneIcon = () => <span style={{ fontSize: '1.25rem' }}>📞</span>; 

// --- INLINE STYLES (Kept for completeness) ---
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

// 🌟 NEW: Haversine Formula Implementation
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return parseFloat(distance.toFixed(1)); // Return to 1 decimal place
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' }}>{serviceman.name}</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {/* Fallback values provided if backend data is sparse */}
                    {serviceman.service || 'General'} Specialist | Vehicle: {serviceman.vehicle || 'Standard'}
                </p>
            </div>
            <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
                    ⭐ {serviceman.rating || 'N/A'}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                    **{serviceman.distance ? `${serviceman.distance} km away` : 'Distance N/A'}**
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
            const lat = parseFloat(data[0].lat); // Keep as number for calculation
            const lon = parseFloat(data[0].lon); // Keep as number for calculation
            console.log(`[GEOCODING SUCCESS] Found Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}`);
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

// 🚀 NEW FUNCTION: Fetch Servicemen from Backend API
const fetchServicemenFromBackend = async (serviceName) => {
    // Construct URL: API_BASE_URL + route prefix + endpoint
    const url = `${API_BASE_URL}/call/servicemen/available`;
    console.log(`[SERVICEMEN FETCH] Requesting: ${url} for service: ${serviceName}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ service: serviceName })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        // ⚠️ ASSUMPTION: Backend servicemen data has 'latitude' and 'longitude' fields
        console.log(`[SERVICEMEN SUCCESS] Received ${data.length} records.`);
        return data;
    } catch (error) {
        console.error("[SERVICEMEN ERROR] Fetch failed:", error);
        return [];
    }
};

export function ServiceManSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Extract state passed from UserServicesPage
    const { ticketId, requestDetails, selectedAddressId, serviceName } = location.state || {};
    
    // State
    const [fetchedAddressLine, setFetchedAddressLine] = useState('Loading address...');
    const [userCoordinates, setUserCoordinates] = useState(null); 
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    
    // 🎯 Servicemen Data State
    const [availableServicemen, setAvailableServicemen] = useState([]);
    
    const [selectedServiceman, setSelectedServiceman] = useState(null);
    const [dispatchStatus, setDispatchStatus] = useState(null);

    // Clock timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 🎯 Effect 1: Fetch Address & Geocode (User Location)
    useEffect(() => {
        console.groupCollapsed("LOG-FETCH-ADDRESS-PROCESS");
        if (!selectedAddressId) {
            setFetchedAddressLine('Error: No Address ID provided.');
            console.error("LOG-0-ERROR: selectedAddressId is null. Aborting.");
            console.groupEnd();
            return;
        }

        const fetchAndGeocodeAddress = async () => {
            // ... (unchanged address fetch logic) ...
            const fullUrl = `${API_BASE_URL}/call/address/lookup/${selectedAddressId}`;
            setFetchedAddressLine('Fetching address details...');
            
            try {
                // 1. FETCH ADDRESS
                const response = await fetch(fullUrl);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                
                const data = await response.json();
                const addressLine = data.address_line;
                setFetchedAddressLine(addressLine); 
                console.log(`LOG-SUCCESS: Address retrieved: ${addressLine}`);

                // 2. GEOCODE ADDRESS (Simplified)
                const simplifiedAddress = addressLine
                    .replace(/Flat \d+,\s*/i, '') 
                    .replace(/Rosewood Apartments,\s*/i, '')
                    .trim();

                console.log(`[GEOCODING PRE-QUERY] Using simplified address: ${simplifiedAddress}`);
                if (simplifiedAddress) {
                    // Use a more generic N/A or default if geocoding fails, but keep coords as number/null
                    const coords = await geocodeAddress(simplifiedAddress); 
                    setUserCoordinates(coords);
                } else {
                    setUserCoordinates(null);
                }

            } catch (error) {
                console.error("LOG-CATCH: Error during fetch/geocode:", error);
                setFetchedAddressLine(`Error loading address.`);
                setUserCoordinates(null);
            }
            console.groupEnd();
        };

        fetchAndGeocodeAddress();
    }, [selectedAddressId]); 


    // 🚀 Effect 2: Fetch Servicemen, Calculate Distance, and Sort
    useEffect(() => {
        // Only run this effect if we have the service name AND the user's coordinates
        if (!serviceName) {
            setDispatchStatus('Error: Service type not specified.');
            return;
        }
        if (!userCoordinates || typeof userCoordinates.lat !== 'number' || typeof userCoordinates.lon !== 'number') {
            setDispatchStatus('Waiting for user coordinates to calculate distance...');
            return;
        }

        const loadServicemen = async () => {
            setDispatchStatus(`Searching for active ${serviceName} specialists and calculating distance...`);
            setAvailableServicemen([]); // Clear previous state

            // 1. Fetch Servicemen
            let servicemen = await fetchServicemenFromBackend(serviceName);
            
            // 2. Calculate Distance for each Serviceman
            servicemen = servicemen
                .map(sm => {
                    // Check if serviceman data has coordinates (latitude and longitude)
                    const smLat = parseFloat(sm.latitude);
                    const smLon = parseFloat(sm.longitude);

                    if (isNaN(smLat) || isNaN(smLon)) {
                        console.warn(`Serviceman ${sm.id} missing valid coordinates.`);
                        return { ...sm, distance: null }; // Mark distance as null if coordinates are bad
                    }

                    // Use user coordinates (lat1, lon1) and serviceman coordinates (lat2, lon2)
                    const distance = haversineDistance(
                        userCoordinates.lat, userCoordinates.lon, 
                        smLat, smLon
                    );

                    return { ...sm, distance };
                })
                // Filter out servicemen without a calculable distance if necessary, or just keep them (I'll keep them)
                .sort((a, b) => {
                    // Sort by distance (closest first). Null distances go to the end.
                    if (a.distance === null) return 1;
                    if (b.distance === null) return -1;
                    return a.distance - b.distance;
                });
            
            setAvailableServicemen(servicemen);

            if (servicemen.length > 0) {
                setDispatchStatus(`${servicemen.length} active ${serviceName} specialists found and sorted by proximity.`);
            } else {
                setDispatchStatus(`⚠️ No active ${serviceName} specialists found in database.`);
            }
        };

        loadServicemen();
    }, [serviceName, userCoordinates]); // Depend on userCoordinates as well

    // Handle Dispatch Button Click (Unchanged)
    const handleDispatch = () => {
        if (!selectedServiceman) {
            alert('Please select a serviceman to dispatch.');
            return;
        }

        setDispatchStatus(`Dispatching ${selectedServiceman.name} for Ticket ${ticketId}...`);
        
        // --- FINAL DISPATCH SIMULATION ---
        setTimeout(() => {
            setDispatchStatus(`✅ DISPATCH SUCCESSFUL: Ticket ${ticketId} assigned to ${selectedServiceman.name}.`);
            console.log(`Final Dispatch: Ticket ${ticketId}, Service: ${serviceName}, Address ID: ${selectedAddressId}, Serviceman ID: ${selectedServiceman.id}`);

            setTimeout(() => {
                navigate('/');
            }, 3000);

        }, 2000);
    };


    // Check if required data is missing from the state (Unchanged)
    if (!ticketId || !selectedAddressId || !serviceName) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444', marginBottom: '16px' }}>Error: Navigation Data Missing</h1>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>Cannot proceed without Ticket ID, Address ID, and Service Name.</p>
                <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Go Back</button>
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
                    <span style={{ color: '#10b981' }}>{serviceName}</span> Servicemen Near User
                </h1>
                
                {/* Request Summary Card */}
                <div style={styles.card}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        User Location & Service Request (Ticket: {ticketId})
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Service:** <span style={{ fontWeight: '700', color: '#10b981' }}>{serviceName}</span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Address ID:** <span style={{ fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>{selectedAddressId}</span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                        **Full Address:** <span style={{ fontWeight: '600' }}>{fetchedAddressLine}</span>
                    </p>
                        {userCoordinates && (
                        <p style={{ fontSize: '0.9rem', color: '#1f2937', marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                            **GPS Location:** <span style={{ fontFamily: 'monospace', backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '4px' }}>
                                Lat: {userCoordinates.lat.toFixed(4)}, Lng: {userCoordinates.lon.toFixed(4)}
                            </span>
                        </p>
                        )}
                    <p style={{ marginTop: '12px', fontSize: '0.9rem', color: '#6b7280' }}>
                        **Request Details:** {requestDetails}
                    </p>
                </div>

                {/* Serviceman List */}
                <div style={{ ...styles.card, padding: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                        Closest Available {serviceName} Technicians
                    </h2>
                    
                    <p style={{ marginBottom: '16px', fontWeight: '600', color: dispatchStatus?.includes('SUCCESSFUL') ? '#047857' : dispatchStatus?.includes('No') || dispatchStatus?.includes('Error') ? '#ef4444' : '#6b7280' }}>
                        {dispatchStatus}
                    </p>

                    <div style={styles.servicemanList}>
                        {availableServicemen.length > 0 ? (
                            availableServicemen.map(sm => (
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
                            disabled={!selectedServiceman || dispatchStatus?.includes('Dispatching') || dispatchStatus?.includes('SUCCESSFUL')}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: (!selectedServiceman || dispatchStatus?.includes('Dispatching') || dispatchStatus?.includes('SUCCESSFUL')) ? 'default' : 'pointer',
                                backgroundColor: (!selectedServiceman || dispatchStatus?.includes('Dispatching') || dispatchStatus?.includes('SUCCESSFUL')) ? '#9ca3af' : '#10b981',
                                color: 'white',
                                transition: 'background-color 0.3s',
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
