import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// NOTE: Please replace this with your actual backend API base URL
// For example: 'http://localhost:3001/api'
const API_BASE_URL = 'https://callcenter-baclend.onrender.com/api'; 

// Placeholder for header icon
const PhoneIcon = () => <span style={{ fontSize: '1.25rem' }}>📞</span>; 

// --- MOCK DATA ---
// 🎯 REMOVED PROXY_ADDRESS as we will now fetch the real address_line.

// 🎯 MOCK SERVICEMEN for the 'Driver' service within 1km radius
const MOCK_SERVICEMEN = [
    { id: 1, name: 'Ravi Kumar', service: 'Driver', rating: 4.8, distance: 0.4, vehicle: 'Sedan' },
    { id: 2, name: 'Sonia Verma', service: 'Driver', rating: 4.5, distance: 0.9, vehicle: 'SUV' },
    { id: 3, name: 'Amit Singh', service: 'Driver', rating: 4.9, distance: 1.2, vehicle: 'Hatchback' }, // Outside 1km radius
    { id: 4, name: 'Deepa Sharma', service: 'Plumber', rating: 4.7, distance: 0.5, vehicle: null }, // Wrong service
];

// --- INLINE STYLES ---
const styles = {
    // ... (Use similar styles from UserServicesPage for consistency)
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

// ⚠️ FIX: Change 'export default function' to 'export function'
export function ServiceManSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Extract state passed from UserServicesPage
    const { ticketId, requestDetails, selectedAddressId, serviceName } = location.state || {};
    
    // 🎯 NEW STATE: For the fetched address line
    const [fetchedAddressLine, setFetchedAddressLine] = useState('Loading address...');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [availableServicemen, setAvailableServicemen] = useState([]);
    const [selectedServiceman, setSelectedServiceman] = useState(null);
    const [dispatchStatus, setDispatchStatus] = useState(null);

    // Clock timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 🎯 NEW EFFECT: Fetch the full address line using the address ID
    useEffect(() => {
        if (!selectedAddressId) {
            setFetchedAddressLine('Error: No Address ID provided.');
            return;
        }

        const fetchAddress = async () => {
            try {
                // Call the new backend route created in callController.js
                const response = await fetch(`${API_BASE_URL}/call/address/lookup/${selectedAddressId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Update state with the fetched address line
                setFetchedAddressLine(data.address_line); 

            } catch (error) {
                console.error("Error fetching address:", error);
                setFetchedAddressLine('Error loading address. Please check console.');
            }
        };

        fetchAddress();
    }, [selectedAddressId]); // Runs when the selectedAddressId is available/changes


    // 🚀 EFFECT: Fetch/Filter Servicemen
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

    // Handle Dispatch Button Click
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

            // In a real app, you might navigate back to a summary page or the dashboard
            setTimeout(() => {
                // navigate('/user/services'); // Navigating back to service selection for simple loop
                // 🎯 To prevent immediate looping, let's navigate back to the dashboard.
                // NOTE: This assumes the user ID is available or can be retrieved, 
                // but for now, we'll navigate to the agent's main screen ('/').
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
                
                {/* Request Summary Card - UPDATED SECTION */}
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
