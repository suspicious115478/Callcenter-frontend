import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Using Emojis instead of custom SVG components
const PhoneIcon = () => <span style={{ fontSize: '1.25rem' }}>📞</span>;

// Define the services available for the user
const SERVICES = [
    // --- HOME SERVICES ---
    { name: 'Electrician', icon: '⚡', color: '#fcd34d', darkColor: '#b45309', description: 'Wiring, circuit repairs, and fixture installation.' },
    { name: 'Plumber', icon: '💧', color: '#60a5fa', darkColor: '#1d4ed8', description: 'Leaky pipes, drain cleaning, and water system fixes.' },
    { name: 'Carpenter', icon: '🔨', color: '#f97316', darkColor: '#7c2d12', description: 'Woodworking, furniture repair, and structural framing.' },
    { name: 'Cleaning', icon: '🧼', color: '#a78bfa', darkColor: '#5b21b6', description: 'Deep cleaning, sanitization, and domestic help.' },
    { name: 'Repairing (Appliance)', icon: '🔧', color: '#ef4444', darkColor: '#b91c1c', description: 'Fixing household appliances like ACs, refrigerators, and ovens.' },
    { name: 'Water Purifier', icon: '🌊', color: '#34d399', darkColor: '#065f46', description: 'RO/UV installation, service, and filter replacement.' },
    { name: 'Gardener', icon: '🌳', color: '#86efac', darkColor: '#15803d', description: 'Lawn care, planting, and landscape maintenance.' },

    // --- PERSONAL / TRAVEL SERVICES ---
    { name: 'Medical / Health', icon: '⚕️', color: '#fb7185', darkColor: '#be123c', description: 'Doctor/Nurse visit, lab collection, or teleconsultation.' },
    { name: 'Travel / Driver', icon: '🚗', color: '#fca5a5', darkColor: '#b91c1c', description: 'Car with driver, taxi booking, or transport assistance.' },
    { name: 'Salon / Grooming', icon: '💇', color: '#f0abfc', darkColor: '#a21caf', description: 'Hair, beauty, and personal grooming services.' },

    // --- ERRAND / MISC SERVICES ---
    { name: 'Grocery / Delivery', icon: '🛒', color: '#818cf8', darkColor: '#3730a3', description: 'Grocery shopping, food, and general item delivery.' },
];

// --- INLINE STYLES ---
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
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
    brand: { fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '24px' },
    clock: { fontFamily: 'monospace', color: '#9ca3af', fontSize: '0.95rem' },
    avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', border: '2px solid #4b5563' },
    mainContent: {
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 16px',
        flex: 1,
        width: '100%',
    },
    card: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s',
    },
    serviceGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '100px', // Space for the fixed footer
    },
    contextHighlight: {
        fontFamily: 'monospace',
        backgroundColor: '#eef2ff',
        padding: '2px 8px',
        borderRadius: '4px',
        color: '#4f46e5',
        fontWeight: '600'
    },
    // Styles for the bottom action bar
    actionBar: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '16px',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 50,
    },
    buttonPrimary: {
        backgroundColor: '#4f46e5',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
        opacity: 1,
        transition: 'opacity 0.2s',
    },
    buttonSecondary: {
        backgroundColor: 'white',
        color: '#4b5563',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '600',
        border: '1px solid #d1d5db',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        backgroundColor: '#9ca3af',
        boxShadow: 'none',
    }
};

/**
 * Component for a single service card.
 * Updated to handle "Selected" state visually.
 */
const ServiceCard = ({ service, onClick, isSelected }) => {
    const [isHovered, setIsHovered] = useState(false);

    const iconContainerStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        borderRadius: '50%',
        backgroundColor: service.color,
        marginBottom: '16px',
        boxShadow: `0 4px 6px -1px ${service.darkColor}40`,
    };

    const cardStyle = {
        ...styles.card,
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transform: isHovered || isSelected ? 'translateY(-4px)' : 'translateY(0)',
        // ⭐️ Change border and background if selected
        border: isSelected ? '2px solid #4f46e5' : '1px solid #e5e7eb',
        backgroundColor: isSelected ? '#eef2ff' : 'white',
        boxShadow: (isHovered || isSelected)
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            : styles.card.boxShadow
    };

    return (
        <div
            style={cardStyle}
            onClick={() => onClick(service)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                <div style={iconContainerStyle}>
                    <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{service.icon}</span>
                </div>
                {isSelected && <span style={{fontSize: '1.5rem'}}>✅</span>}
            </div>
            
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>{service.name}</h3>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', flex: 1 }}>{service.description}</p>
        </div>
    );
};


export default function UserServicesPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const ticketId = location.state?.ticketId;
    const requestDetails = location.state?.requestDetails;
    const selectedAddressId = location.state?.selectedAddressId;
    const phoneNumber = location.state?.phoneNumber; 

    // ⭐️ State to track selected service locally
    const [selectedService, setSelectedService] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // ⭐️ Handle Direct Confirmation
    const handleConfirmAndContinue = () => {
        if (!selectedService) return;
        navigate('/user/servicemen', {
            state: {
                ticketId,
                requestDetails,
                selectedAddressId,
                phoneNumber,
                serviceName: selectedService.name, // Pass the chosen service
            }
        });
    };

    // ⭐️ Handle Scheduling Redirect
    const handleScheduleRedirect = () => {
        if (!selectedService) return;
        navigate('/user/scheduling', {
            state: {
                ticketId,
                requestDetails,
                selectedAddressId,
                phoneNumber,
                serviceName: selectedService.name, // Pass the chosen service
            }
        });
    };

    if (!ticketId || !requestDetails || !selectedAddressId || !phoneNumber) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>Error: Missing Call Context</h1>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* HEADER */}
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

            {/* MAIN CONTENT */}
            <div style={styles.mainContent}>
                <div style={{ display: 'flex', flexDirection: window.innerWidth > 1024 ? 'row' : 'column', gap: '32px' }}>
                    
                    {/* LEFT: Context */}
                    <div style={{ width: window.innerWidth > 1024 ? '33.333%' : '100%', position: 'sticky', top: '32px', height: 'fit-content' }}>
                        <div style={styles.card}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                                🚨 Active Call Context
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
                                **Customer Phone:** <span style={styles.contextHighlight}>{phoneNumber}</span>
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
                                **Ticket ID:** <span style={styles.contextHighlight}>{ticketId}</span>
                            </p>
                            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6', minHeight: '100px', marginTop: '16px' }}>
                                <p style={{ color: '#374151', fontSize: '0.9rem', fontWeight: '600' }}>Customer Request:</p>
                                <p style={{ color: '#374151', fontSize: '0.9rem', marginTop: '4px' }}>{requestDetails}</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Selection Grid */}
                    <div style={{ width: window.innerWidth > 1024 ? '66.666%' : '100%' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', marginBottom: '24px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                            Select Service Category
                        </h1>
                        <div style={styles.serviceGrid}>
                            {SERVICES.map((service) => (
                                <ServiceCard
                                    key={service.name}
                                    service={service}
                                    isSelected={selectedService?.name === service.name}
                                    onClick={setSelectedService}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ⭐️ BOTTOM ACTION BAR */}
            <div style={styles.actionBar}>
                <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center' }}>
                    {selectedService ? (
                        <span style={{color: '#4b5563', fontWeight: '500'}}>Selected: <strong style={{color: '#4f46e5'}}>{selectedService.name}</strong></span>
                    ) : (
                        <span style={{color: '#9ca3af', fontStyle: 'italic'}}>Please select a service...</span>
                    )}
                </div>

                <button 
                    style={!selectedService ? { ...styles.buttonSecondary, ...styles.buttonDisabled } : styles.buttonSecondary}
                    disabled={!selectedService}
                    onClick={handleScheduleRedirect}
                >
                    📅 Schedule Time for Service
                </button>

                <button 
                    style={!selectedService ? { ...styles.buttonPrimary, ...styles.buttonDisabled } : styles.buttonPrimary}
                    disabled={!selectedService}
                    onClick={handleConfirmAndContinue}
                >
                    Confirm and Continue →
                </button>
            </div>
        </div>
    );
}
