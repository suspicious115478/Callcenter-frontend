import React from 'react';

export default function CallCard({ callData, onAccept, isScheduledOrder = false, isPlacedOrder = false }) {
  const {
    caller,
    name,
    subscriptionStatus,
    ticket,
    scheduledTime,
    customerName,
    customerPhone,
    address,
    orderId,
    serviceCategory,
    workDescription,
    createdAt
  } = callData;

  // Determine card type and styling
  const cardType = isPlacedOrder ? 'placed' : isScheduledOrder ? 'scheduled' : 'call';
  
  const getCardStyles = () => {
    const baseStyle = {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '2px solid',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    };

    if (isPlacedOrder) {
      return {
        ...baseStyle,
        borderColor: '#8b5cf6', // Purple for app orders
        '&:hover': {
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
          transform: 'translateY(-2px)',
        }
      };
    } else if (isScheduledOrder) {
      return {
        ...baseStyle,
        borderColor: '#3b82f6', // Blue for scheduled
        '&:hover': {
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          transform: 'translateY(-2px)',
        }
      };
    } else {
      return {
        ...baseStyle,
        borderColor: '#10b981', // Green for incoming calls
        '&:hover': {
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          transform: 'translateY(-2px)',
        }
      };
    }
  };

  const getBadgeColor = () => {
    if (isPlacedOrder) return { bg: '#f3e8ff', text: '#6b21a8', border: '#c084fc' };
    if (isScheduledOrder) return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' };
    return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' };
  };

  const getIcon = () => {
    if (isPlacedOrder) return '📱';
    if (isScheduledOrder) return '📅';
    return '📞';
  };

  const badgeColors = getBadgeColor();
  const icon = getIcon();

  const styles = {
    card: getCardStyles(),
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
    },
    icon: {
      fontSize: '2rem',
    },
    badge: {
      backgroundColor: badgeColors.bg,
      color: badgeColors.text,
      border: `1px solid ${badgeColors.border}`,
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    content: {
      marginBottom: '16px',
    },
    title: {
      fontSize: '1.125rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px',
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '6px',
      gap: '8px',
    },
    label: {
      fontWeight: '600',
      color: '#374151',
      minWidth: '80px',
    },
    value: {
      color: '#111827',
    },
    address: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '8px',
      paddingTop: '8px',
      borderTop: '1px solid #e5e7eb',
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb',
    },
    button: {
      backgroundColor: isPlacedOrder ? '#8b5cf6' : isScheduledOrder ? '#3b82f6' : '#10b981',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    orderIdBadge: {
      fontSize: '0.75rem',
      color: '#6b7280',
      fontFamily: 'monospace',
      backgroundColor: '#f3f4f6',
      padding: '4px 8px',
      borderRadius: '4px',
    }
  };

  const handleClick = () => {
    onAccept(callData);
  };

  // Format created time for placed orders
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.card} onClick={handleClick}>
      <div style={styles.header}>
        <span style={styles.icon}>{icon}</span>
        <span style={styles.badge}>
          {isPlacedOrder ? 'App Order' : isScheduledOrder ? 'Scheduled' : 'Live Call'}
        </span>
      </div>

      <div style={styles.content}>
        <h3 style={styles.title}>
          {isPlacedOrder || isScheduledOrder ? customerName : name}
        </h3>

        {/* Phone Number */}
        <div style={styles.infoRow}>
          <span style={styles.label}>📱 Phone:</span>
          <span style={styles.value}>
            {isPlacedOrder || isScheduledOrder ? customerPhone : caller}
          </span>
        </div>

        {/* Status/Category */}
        {isPlacedOrder ? (
          <div style={styles.infoRow}>
            <span style={styles.label}>🔧 Service:</span>
            <span style={styles.value}>{serviceCategory}</span>
          </div>
        ) : (
          <div style={styles.infoRow}>
            <span style={styles.label}>📋 Status:</span>
            <span style={styles.value}>
              {isScheduledOrder ? 'Scheduled Service' : subscriptionStatus}
            </span>
          </div>
        )}

        {/* Time Info */}
        {isScheduledOrder && scheduledTime && (
          <div style={styles.infoRow}>
            <span style={styles.label}>🕒 Time:</span>
            <span style={styles.value}>{scheduledTime}</span>
          </div>
        )}

        {isPlacedOrder && createdAt && (
          <div style={styles.infoRow}>
            <span style={styles.label}>🕒 Placed:</span>
            <span style={styles.value}>{formatTime(createdAt)}</span>
          </div>
        )}

        {/* Ticket/Description */}
        {isPlacedOrder ? (
          <div style={styles.infoRow}>
            <span style={styles.label}>📝 Details:</span>
            <span style={styles.value}>{workDescription}</span>
          </div>
        ) : (
          <div style={styles.infoRow}>
            <span style={styles.label}>🎫 Ticket:</span>
            <span style={styles.value}>{ticket}</span>
          </div>
        )}

        {/* Address */}
        {(isScheduledOrder || isPlacedOrder) && address && (
          <div style={styles.address}>
            <strong>📍 Address:</strong> {address}
          </div>
        )}
      </div>

      <div style={styles.footer}>
        {orderId && (
          <span style={styles.orderIdBadge}>
            Order: {orderId}
          </span>
        )}
        <button
          style={styles.button}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          {isPlacedOrder ? 'Dispatch' : isScheduledOrder ? 'Assign' : 'Accept'}
        </button>
      </div>
    </div>
  );
}
