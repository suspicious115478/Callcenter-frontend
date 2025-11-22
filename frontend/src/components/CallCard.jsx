import React from 'react';

export default function CallCard({ callData, onAccept }) {
    
    const isVerified = callData.subscriptionStatus === "Verified";
    
    const cardStyle = {
        padding: '20px',
        borderLeft: `6px solid ${isVerified ? '#10b981' : '#fbbf24'}`, // Green or Yellow left border
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'transform 0.2s',
        marginBottom: '0', // Handled by grid gap in parent
    };

    const badgeStyle = {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
        backgroundColor: isVerified ? '#ecfdf5' : '#fffbeb',
        color: isVerified ? '#047857' : '#b45309',
        alignSelf: 'flex-start',
    };

    const buttonStyle = {
        padding: '10px',
        backgroundColor: '#1f2937', // Dark gray button
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        marginTop: '8px',
        width: '100%',
        transition: 'background 0.2s',
    };

    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={badgeStyle}>
                    {isVerified ? 'Verified User' : 'Unknown Caller'}
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Now</span>
            </div>
            
            <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                    {callData.caller}
                </div>
                <div style={{ fontSize: '14px', color: '#4b5563' }}>
                    {callData.name}
                </div>
            </div>

            <div style={{ fontSize: '13px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '4px' }}>
                🎟 {callData.ticket}
            </div>

            <button 
                style={buttonStyle}
                onClick={() => onAccept(callData)}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            >
                Accept Call
            </button>
        </div>
    );
}
