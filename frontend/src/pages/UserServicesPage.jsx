import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Data structure for the available services
const servicesData = [
    { 
        id: 1, 
        name: "Issue Escalation", 
        description: "Send to Tier 2 Technical Support.", 
        icon: "🚨", 
        color: "#f87171" 
    },
    { 
        id: 2, 
        name: "Process Refund", 
        description: "Initiate full or partial billing refund.", 
        icon: "💳", 
        color: "#34d399" 
    },
    { 
        id: 3, 
        name: "Account Upgrade", 
        description: "Apply promotion and upgrade plan.", 
        icon: "✨", 
        color: "#60a5fa" 
    },
    { 
        id: 4, 
        name: "Send Documentation", 
        description: "Email knowledge base links/guides.", 
        icon: "📧", 
        color: "#fcd34d" 
    },
    { 
        id: 5, 
        name: "Schedule Callback", 
        description: "Book a follow-up call time.", 
        icon: "📞", 
        color: "#a78bfa" 
    },
    { 
        id: 6, 
        name: "Cancellation Finalize", 
        description: "Confirm and process account closure.", 
        icon: "🗑️", 
        color: "#fb923c" 
    },
];

export default function UserServicesPage() {
    const { phoneNumber } = useParams();
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    
    // Extract notes and category from the URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const notes = urlParams.get('notes') ? decodeURIComponent(urlParams.get('notes')) : 'No notes provided.';
    const category = urlParams.get('category') || 'support';

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleServiceSelect = (service) => {
        // Log a message to the console instead of using alert()
        console.log(`[SERVICE INITIATED] Selected: ${service.name} for ${phoneNumber}. Request Category: ${category}. Notes: ${notes}`);
    };

    // --- INLINE STYLES ---
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
            padding: '32px',
            gap: '32px',
            // Responsive layout: stack columns on small screens
            '@media (maxWidth: 768px)': {
                flexDirection: 'column',
                overflowY: 'auto',
            }
        },
        leftPanel: {
            flex: '2',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            minWidth: '0',
        },
        rightPanel: {
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            minWidth: '300px',
            maxWidth: '400px', // constrain the width for readability
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            height: 'fit-content',
        },
        cardHeader: {
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        cardTitle: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#111827',
            margin: 0,
        },
        cardBody: {
            padding: '24px',
        },
        notesArea: {
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            whiteSpace: 'pre-wrap',
            minHeight: '200px',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            color: '#374151',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '20px',
        },
        serviceCard: (color) => ({
            backgroundColor: 'white',
            border: `2px solid ${color}`,
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }),
        serviceIcon: {
            fontSize: '2.5rem',
            marginBottom: '10px',
        },
        serviceName: {
            fontSize: '1rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '5px',
        },
        serviceDescription: {
            fontSize: '0.85rem',
            color: '#6b7280',
        },
        button: (color) => ({
            marginTop: '15px',
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: color,
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
        }),
    };

    const ServiceCard = ({ service }) => {
        const [isHovered, setIsHovered] = useState(false);
        const cardStyle = {
            ...styles.serviceCard(service.color),
            transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
            boxShadow: isHovered ? `0 6px 16px ${service.color}33` : '0 4px 12px rgba(0, 0, 0, 0.05)',
        };
        const buttonStyle = {
            ...styles.button(service.color),
        }

        return (
            <div 
                style={cardStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div style={styles.serviceIcon}>{service.icon}</div>
                <div style={styles.serviceName}>{service.name}</div>
                <div style={styles.serviceDescription}>{service.description}</div>
                <button 
                    style={buttonStyle} 
                    onClick={() => handleServiceSelect(service)}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = service.color}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = service.color}
                >
                    Select Action
                </button>
            </div>
        );
    };

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <header style={styles.header}>
                <div style={styles.brand}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>CC Agent Console</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.clock}>{currentTime}</span>
                    <div style={styles.avatar}>JD</div>
                </div>
            </header>

            <div style={styles.main}>
                {/* LEFT PANEL: SERVICE SELECTION */}
                <div style={styles.leftPanel}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Service Action Grid</h2>
                        </div>
                        <div style={styles.cardBody}>
                            <p style={{marginBottom: '20px', color: '#6b7280'}}>
                                Select the next action based on the user's request log below.
                            </p>
                            <div style={styles.grid}>
                                {servicesData.map(service => (
                                    <ServiceCard key={service.id} service={service} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: LOG & CUSTOMER DETAILS */}
                <div style={styles.rightPanel}>
                    {/* LOGGED NOTES CARD */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Logged Request Details</h2>
                        </div>
                        <div style={styles.cardBody}>
                            <div style={{marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb'}}>
                                <div style={{fontSize: '0.9rem', color: '#6b7280'}}>Customer: </div>
                                <div style={{fontWeight: '700', fontSize: '1.1rem'}}>{phoneNumber}</div>
                            </div>
                            <div style={{marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb'}}>
                                <div style={{fontSize: '0.9rem', color: '#6b7280'}}>Category: </div>
                                <div style={{fontWeight: '700', fontSize: '1.1rem', textTransform: 'capitalize'}}>{category}</div>
                            </div>
                            <h3 style={{fontSize: '1rem', fontWeight: '600', marginTop: '0', marginBottom: '10px', color: '#374151'}}>Agent Notes:</h3>
                            <div style={styles.notesArea}>
                                {notes}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
