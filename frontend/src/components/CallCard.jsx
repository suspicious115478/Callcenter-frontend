import React from 'react';

// This component displays the call details and the Accept button
export default function CallCard({ callData, onAccept }) {
    
    // Determine visual style based on subscription status
    const isVerified = callData.subscriptionStatus === "Verified";
    
    const cardStyle = {
        padding: '15px',
        // Use a distinct border color for verified status
        border: `2px solid ${isVerified ? '#38a169' : '#b2b2b2'}`, 
        borderRadius: '8px',
        backgroundColor: isVerified ? '#f0fff4' : '#ffffff', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '400px'
    };

    const buttonStyle = {
        padding: '8px 15px',
        backgroundColor: '#38a169', 
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginTop: '10px'
    };

    return (
        <div style={cardStyle}>
            <h4>
                {isVerified ? '🟢 Verified Subscriber Call' : '🟡 Unverified Call'}
            </h4>
            
            <p style={{ margin: '5px 0' }}>
                **Caller:** <strong>{callData.name}</strong> ({callData.caller})
            </p>
            <p style={{ margin: '5px 0' }}>
                **Status:** <span style={{ color: isVerified ? '#38a169' : '#e53e3e' }}>
                    {callData.subscriptionStatus}
                </span>
            </p>
            <p style={{ margin: '5px 0' }}>
                **Ticket Info:** {callData.ticket}
            </p>

            <button 
                style={buttonStyle}
                // Call the handler function passed from the AgentDashboard
                onClick={() => onAccept(callData)}
            >
                Accept Call & Redirect
            </button>
        </div>
    );
}