import React from 'react';

export default function CallCard({ callData, onAccept, isScheduledOrder = false }) {
    
    // Determine verification status for calls
    const isVerified = callData.subscriptionStatus === "Verified";
    
    // Colors based on type and status
    let accentColor, bgBadge, textBadge, badgeText;
    
    if (isScheduledOrder) {
        accentColor = '#8b5cf6'; // Purple for scheduled orders
        bgBadge = '#f3e8ff';
        textBadge = '#6b21a8';
        badgeText = 'Scheduled Order';
    } else {
        accentColor = isVerified ? '#10b981' : '#f59e0b'; // Green vs Amber
        bgBadge = isVerified ? '#ecfdf5' : '#fffbeb';
        textBadge = isVerified ? '#047857' : '#b45309';
        badgeText = isVerified ? 'Verified Customer' : 'Unverified Caller';
    }

    // Format scheduled time
    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
        metaRow: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        },
        addressBox: {
            display: 'flex',
            alignItems: 'flex-start',
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
            backgroundColor: isScheduledOrder ? '#8b5cf6' : '#1f2937',
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

    const handleButtonHover = (e, isEnter) => {
        if (isScheduledOrder) {
            e.currentTarget.style.backgroundColor = isEnter ? '#7c3aed' : '#8b5cf6';
        } else {
            e.currentTarget.style.backgroundColor = isEnter ? '#111827' : '#1f2937';
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <span style={styles.badge}>
                    {badgeText}
                </span>
                <span style={styles.time}>
                    {isScheduledOrder ? formatTime(callData.scheduledTime) : 'Just Now'}
                </span>
            </div>

            <div style={styles.info}>
                <div style={styles.phone}>
                    {isScheduledOrder 
                        ? (callData.customerPhone || 'N/A')
                        : (callData.caller || 'Unknown')
                    }
                </div>
                <div style={styles.name}>
                    {isScheduledOrder 
                        ? (callData.customerName || 'Unknown Customer')
                        : (callData.name || callData.userName || 'Unknown Caller')
                    }
                </div>
            </div>

            {isScheduledOrder ? (
                <div style={styles.metaRow}>
                    <div style={styles.meta}>
                        <span style={{fontSize: '1.1em'}}>🆔</span> 
                        <span>Order #{callData.orderId || callData.id}</span>
                    </div>
                    {callData.address && (
                        <div style={styles.addressBox}>
                            <span style={{fontSize: '1.1em', marginTop: '2px'}}>📍</span> 
                            <span style={{flex: 1}}>{callData.address}</span>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div style={styles.meta}>
                        <span style={{fontSize: '1.1em'}}>🎫</span> 
                        <span>{callData.ticket || 'N/A'}</span>
                    </div>
                    {callData.dispatchDetails?.address && (
                        <div style={styles.addressBox}>
                            <span style={{fontSize: '1.1em', marginTop: '2px'}}>📍</span> 
                            <span style={{flex: 1}}>{callData.dispatchDetails.address}</span>
                        </div>
                    )}
                </>
            )}

            <button 
                style={styles.button}
                onClick={() => onAccept(callData)}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                {isScheduledOrder ? (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Assign to Me
                    </>
                ) : (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        Answer Call
                    </>
                )}
            </button>
        </div>
    );
}
