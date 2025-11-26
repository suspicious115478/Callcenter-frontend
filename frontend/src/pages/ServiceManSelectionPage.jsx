import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// 🚀 CRITICAL FIX: The base URL must be updated based on the discussion (removing /api)
// Assuming you chose the frontend fix to align with the backend's /call route.
const API_BASE_URL = 'https://callcenter-baclend.onrender.com'; 

// Placeholder for header icon
const PhoneIcon = () => <span style={{ fontSize: '1.25rem' }}>📞</span>; 

// --- MOCK DATA ---
const MOCK_SERVICEMEN = [
    { id: 1, name: 'Ravi Kumar', service: 'Driver', rating: 4.8, distance: 0.4, vehicle: 'Sedan' },
    { id: 2, name: 'Sonia Verma', service: 'Driver', rating: 4.5, distance: 0.9, vehicle: 'SUV' },
    { id: 3, name: 'Amit Singh', service: 'Driver', rating: 4.9, distance: 1.2, vehicle: 'Hatchback' },
    { id: 4, name: 'Deepa Sharma', service: 'Plumber', rating: 4.7, distance: 0.5, vehicle: null },
];

// --- INLINE STYLES ---
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' }}>{serviceman.name}</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {serviceman.service} Specialist | Vehicle: {serviceman.vehicle}
                </p>
            </div>
            <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
                    ⭐ {serviceman.rating}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                    {serviceman.distance} km away
                </p>
            </div>
        </div>
    );
};

// 🎯 NEW FUNCTION: Geocode the address string to Lat/Lng using Nominatim
const geocodeAddress = async (address) => {
    // Encode the address for safe URL inclusion
    const encodedAddress = encodeURIComponent(address);
    // Nominatim search endpoint (OpenStreetMap)
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

export function ServiceManSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Extract state passed from UserServicesPage
    const { ticketId, requestDetails, selectedAddressId, serviceName } = location.state || {};
    
    // 🎯 NEW STATE: For the fetched address line
    const [fetchedAddressLine, setFetchedAddressLine] = useState('Loading address...');
    // 🎯 NEW STATE: For the geocoded coordinates
    const [userCoordinates, setUserCoordinates] = useState(null); 

    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [availableServicemen, setAvailableServicemen] = useState([]);
    const [selectedServiceman, setSelectedServiceman] = useState(null);
    const [dispatchStatus, setDispatchStatus] = useState(null);

    // Clock timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 🎯 UPDATED EFFECT: Fetch the full address line and then geocode it
    useEffect(() => {
        console.groupCollapsed("LOG-FETCH-ADDRESS-PROCESS");
        console.log(`LOG-0: Hook triggered. selectedAddressId: ${selectedAddressId}`);
        
        if (!selectedAddressId) {
            setFetchedAddressLine('Error: No Address ID provided.');
            console.groupEnd();
            return;
        }

        const fetchAndGeocodeAddress = async () => {
            // Using the corrected backend path /call/address/lookup/...
            const fullUrl = `${API_BASE_URL}/call/address/lookup/${selectedAddressId}`;
            setFetchedAddressLine('Fetching address details...');
            
            try {
                // 1. FETCH ADDRESS
                const response = await fetch(fullUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                const addressLine = data.address_line;

setFetchedAddressLine(addressLine); 
console.log(`LOG-4-SUCCESS: Address line retrieved: ${addressLine}`);

// 🎯 FIX: Simplify the address for the geocoding service
const simplifiedAddress = addressLine
    .replace(/Flat \d+,\s*/i, '') // Remove "Flat 201, " (case insensitive)
    .replace(/Rosewood Apartments,\s*/i, '') // Remove the apartment name
    .trim(); // Remove any extra space

console.log(`[GEOCODING PRE-QUERY] Using simplified address: ${simplifiedAddress}`);
                // 2. GEOCODE ADDRESS
                if (simplifiedAddress) {
                    const coords = await geocodeAddress(simplifiedAddress);
                    setUserCoordinates(coords);
                } else {
                    setUserCoordinates({ lat: 'N/A', lon: 'N/A' });
                }

            } catch (error) {
                console.error("LOG-CATCH: Error during fetch/geocode process:", error);
                setFetchedAddressLine(`Error loading address. Status ${error.message.split(': ')[1] || 'Unknown'}.`);
                setUserCoordinates({ lat: 'Error', lon: 'Error' });
            }
            console.groupEnd();
        };

        fetchAndGeocodeAddress();
    }, [selectedAddressId]); // Runs when the selectedAddressId is available/changes


    // 🚀 EFFECT: Fetch/Filter Servicemen (No Change, retained for context)
    useEffect(() => {
        if (selectedAddressId && serviceName) {
            setDispatchStatus(`Searching for ${serviceName} servicemen near address ID ${selectedAddressId}...`);
            
            // Simulate fetching data after a brief delay
            setTimeout(() => {
                
                // 1. Filter by Service Name AND Distance (<= 1.0 km)
                const filteredServicemen = MOCK_SERVICEMEN.filter(sm => 
                    sm.service === serviceName && sm.distance <= 1.0
                );
                
                setAvailableServicemen(filteredServicemen);
                
                if (filteredServicemen.length > 0) {
                    setDispatchStatus(`${filteredServicemen.length} ${serviceName} servicemen found within 1 km.`);
                } else {
                    setDispatchStatus(`⚠️ No ${serviceName} servicemen found within 1 km.`);
                }
            }, 1000);
        }
    }, [selectedAddressId, serviceName]); // Re-run when address or service changes

    // Handle Dispatch Button Click (No Change, retained for context)
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

            // Assuming we navigate back to the agent's main screen ('/').
            setTimeout(() => {
                navigate('/');
            }, 3000);

        }, 2000);
    };


    // Check if required data is missing from the state
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
                
                {/* Request Summary Card - UPDATED SECTION with Coordinates */}
                <div style={styles.card}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        User Location
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Address ID:** <span style={{ fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>{selectedAddressId}</span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                        **Full Address:** <span style={{ fontWeight: '600' }}>{fetchedAddressLine}</span>
                    </p>
                        {userCoordinates && (
                        <p style={{ fontSize: '0.9rem', color: '#1f2937', marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                            **GPS Location:**                             <span style={{ fontFamily: 'monospace', backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '4px' }}>
                                Lat: {userCoordinates.lat}, Lng: {userCoordinates.lon}
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
                        Available Technicians (Within 1.0 km)
                    </h2>
                    
                    <p style={{ marginBottom: '16px', fontWeight: '600', color: dispatchStatus?.includes('SUCCESSFUL') ? '#047857' : dispatchStatus?.includes('No') ? '#ef4444' : '#6b7280' }}>
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
                                Searching... or no local servicemen found for this request.
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
