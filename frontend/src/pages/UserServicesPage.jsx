import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Using Emojis instead of custom SVG components
const PhoneIcon = () => <span style={{ fontSize: '1.25rem' }}>📞</span>; // Placeholder for header icon

// Define the services available for the user - UPDATED LIST
const SERVICES = [
    // --- HOME SERVICES ---
    { name: 'Electrician', icon: '⚡', color: '#fcd34d', darkColor: '#b45309', description: 'Wiring, circuit repairs, and fixture installation.' }, // Amber/Yellow
    { name: 'Plumber', icon: '💧', color: '#60a5fa', darkColor: '#1d4ed8', description: 'Leaky pipes, drain cleaning, and water system fixes.' }, // Blue
    { name: 'Carpenter', icon: '🔨', color: '#f97316', darkColor: '#7c2d12', description: 'Woodworking, furniture repair, and structural framing.' }, // Orange
    { name: 'Cleaning', icon: '🧼', color: '#a78bfa', darkColor: '#5b21b6', description: 'Deep cleaning, sanitization, and domestic help.' }, // Violet
    { name: 'Repairing (Appliance)', icon: '🔧', color: '#ef4444', darkColor: '#b91c1c', description: 'Fixing household appliances like ACs, refrigerators, and ovens.' }, // Red
    { name: 'Water Purifier', icon: '🌊', color: '#34d399', darkColor: '#065f46', description: 'RO/UV installation, service, and filter replacement.' }, // Emerald Green
    { name: 'Gardener', icon: '🌳', color: '#86efac', darkColor: '#15803d', description: 'Lawn care, planting, and landscape maintenance.' }, // Light Green

    // --- PERSONAL / TRAVEL SERVICES ---
    { name: 'Medical / Health', icon: '⚕️', color: '#fb7185', darkColor: '#be123c', description: 'Doctor/Nurse visit, lab collection, or teleconsultation.' }, // Rose
    { name: 'Travel / Driver', icon: '🚗', color: '#fca5a5', darkColor: '#b91c1c', description: 'Car with driver, taxi booking, or transport assistance.' }, // Light Red
    { name: 'Salon / Grooming', icon: '💇', color: '#f0abfc', darkColor: '#a21caf', description: 'Hair, beauty, and personal grooming services.' }, // Pink/Fuchsia

    // --- ERRAND / MISC SERVICES ---
    { name: 'Grocery / Delivery', icon: '🛒', color: '#818cf8', darkColor: '#3730a3', description: 'Grocery shopping, food, and general item delivery.' }, // Indigo
];

// --- INLINE STYLES (MATCHING AGENT DASHBOARD) ---
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f3f4f6', // Light gray background
        color: '#111827',
    },
    header: {
        height: '64px',
        backgroundColor: '#1f2937', // Dark slate gray (from Dashboard)
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
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
    mainContent: {
        maxWidth: '1280px', // max-w-7xl approximation
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 16px',
        flex: 1,
        width: '100%',
    },
    card: { // General card style matching the Dashboard's sidebar and call cards
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s',
    },
    serviceGrid: {
        display: 'grid',
        // Adjusted grid to be slightly tighter for more services
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
    }
};

/**
 * Component for a single service card, now using inline styles and Emojis.
 */
const ServiceCard = ({ service, onClick }) => {
    // Style for the hover effect
    const [isHovered, setIsHovered] = useState(false);

    // Style for the icon container
    const iconContainerStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        borderRadius: '50%',
        backgroundColor: service.color, // Theme color
        marginBottom: '16px',
        boxShadow: `0 4px 6px -1px ${service.darkColor}40`, // Custom shadow based on theme
    };

    // Card style with hover effects
    const cardStyle = {
        ...styles.card,
        cursor: 'pointer',
        height: '100%', // Ensure all cards have equal height in the grid
        display: 'flex',
        flexDirection: 'column',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            : styles.card.boxShadow
    };

    return (
        <div
            style={cardStyle}
            onClick={() => onClick(service)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={iconContainerStyle}>
                <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{service.icon}</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>{service.name}</h3>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', flex: 1 }}>{service.description}</p>
        </div>
    );
};


export default function UserServicesPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Extract state from location object
    const ticketId = location.state?.ticketId;
    const requestDetails = location.state?.requestDetails;
    const selectedAddressId = location.state?.selectedAddressId;
    
    // 💡 FIX IS HERE: Extract phoneNumber from state
    const phoneNumber = location.state?.phoneNumber;

    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    // Clock timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Handle service selection
    const handleServiceSelect = (service) => {
        
        // Navigate to the servicemen selection page
        navigate('/user/servicemen', {
            state: {
                ticketId: ticketId,
                requestDetails: requestDetails,
                selectedAddressId: selectedAddressId,
                serviceName: service.name, // Pass the chosen service name
                // 💡 FIX IS HERE: Pass phoneNumber forward
                phoneNumber: phoneNumber 
            }
        });
    };

    // Check if required data is missing from the state (Essential Agent Workflow Check)
    if (!ticketId || !requestDetails || !selectedAddressId) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444', marginBottom: '16px' }}>Error: Missing Call Context</h1>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>Agent must start the process from the Dashboard with an active ticket and address.</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>

            {/* HEADER (Matching Dashboard Style) */}
            <header style={styles.header}>
                <div style={styles.brand}>
                    <PhoneIcon />
                    <span>CC Agent Console: Service Assignment</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.clock}>{currentTime}</span>
                    <div style={styles.avatar}>AG</div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <div style={styles.mainContent}>

                <div style={{ display: 'flex', flexDirection: window.innerWidth > 1024 ? 'row' : 'column', gap: '32px' }}>

                    {/* Left Side: Agent's Notes/Request Summary Card (CRITICAL CONTEXT) */}
                    <div style={{ width: window.innerWidth > 1024 ? '33.333%' : '100%', position: 'sticky', top: '32px', height: 'fit-content' }}>
                        <div style={styles.card}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                                🚨 Active Call Context
                            </h2>

                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
                                **Ticket ID:** <span style={{ fontFamily: 'monospace', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: '#4f46e5', fontWeight: '600' }}>{ticketId}</span>
                            </p>
                            
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '16px' }}>
                                **Address ID:** <span style={{ fontFamily: 'monospace', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: '#4f46e5', fontWeight: '600' }}>{selectedAddressId}</span>
                            </p>
                            
                            {/* 💡 Display Phone Number for verification */}
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '16px' }}>
                                **Caller Phone:** <span style={{ fontFamily: 'monospace', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: '#4f46e5', fontWeight: '600' }}>{phoneNumber || 'N/A'}</span>
                            </p>


                            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6', minHeight: '100px' }}>
                                <p style={{ color: '#374151', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.9rem', fontWeight: '600' }}>
                                    Customer Request:
                                </p>
                                <p style={{ color: '#374151', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.9rem', marginTop: '4px' }}>
                                     {requestDetails}
                                </p>
                            </div>

                            <p style={{ marginTop: '16px', fontSize: '0.75rem', color: '#9ca3af' }}>
                                Review the request summary above, then click the **best matching service** on the right.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Service Selection Grid (Main Decision Area) */}
                    <div style={{ width: window.innerWidth > 1024 ? '66.666%' : '100%' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', marginBottom: '24px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                            Service Category Dispatch
                        </h1>
                        <div style={styles.serviceGrid}>
                            {SERVICES.map((service) => (
                                <ServiceCard
                                    key={service.name}
                                    service={service}
                                    onClick={handleServiceSelect}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
