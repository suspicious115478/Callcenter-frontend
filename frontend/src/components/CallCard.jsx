import React from 'react';

export default function CallCard({ callData, onAccept }) {
    
    const isVerified = callData.subscriptionStatus === "Verified";
    
    // Colors based on status
    const accentColor = isVerified ? '#10b981' : '#f59e0b'; // Green vs Amber
    const bgBadge = isVerified ? '#ecfdf5' : '#fffbeb';
    const textBadge = isVerified ? '#047857' : '#b45309';

    const styles = {
        card: {
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            borderLeft: `5px solid ${accentColor}`,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        badge: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: bgBadge,
            color: textBadge,
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
        },
        time: {
            fontSize: '0.75rem',
            color: '#9ca3af',
        },
        info: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
        },
        phone: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#111827',
            letterSpacing: '-0.025em',
        },
        name: {
            fontSize: '0.95rem',
            color: '#4b5563',
            fontWeight: '500',
        },
        meta: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            padding: '8px 12px',
            borderRadius: '6px',
        },
        button: {
            marginTop: '8px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#1f2937',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <span style={styles.badge}>
                    {isVerified ? 'Verified Customer' : 'Unverified Caller'}
                </span>
                <span style={styles.time}>Just Now</span>
            </div>

            <div style={styles.info}>
                <div style={styles.phone}>{callData.caller}</div>
                <div style={styles.name}>{callData.name}</div>
            </div>

            <div style={styles.meta}>
                <span style={{fontSize: '1.1em'}}>🎫</span> 
                <span>{callData.ticket}</span>
            </div>

            <button 
                style={styles.button}
                onClick={() => onAccept(callData)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Answer Call
            </button>
        </div>
    );
}
