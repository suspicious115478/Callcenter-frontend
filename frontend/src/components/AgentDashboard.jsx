// frontend/src/components/AgentDashboard.jsx

import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { BACKEND_URL } from "../config";
import CallCard from "./CallCard";

export default function AgentDashboard() {
  const [status, setStatus] = useState("offline");
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    // Clock timer for the header
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);

    // 1. Initial status fetch
    fetch(`${BACKEND_URL}/agent/status`)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(err => console.error("Failed to fetch status:", err));

    // 2. Socket.IO Listener for Incoming Calls
    const socket = io(BACKEND_URL);

    socket.on("incoming-call", (callData) => {
      console.log("New call received:", callData);
      // NOTE: Ensure the incoming callData includes a 'caller' property with the phone number
      setIncomingCalls(prevCalls => [
        { ...callData, id: Date.now() },
        ...prevCalls 
      ]);
    });

    // Cleanup socket listener on component unmount
    return () => {
      socket.off("incoming-call");
      clearInterval(timer);
    };
  }, []);

  // Handle clicking "Accept" on a card
  const handleCallAccept = (acceptedCall) => {
    // 🎯 CRITICAL FIX: Append phone number to the dashboardLink as a query parameter
    // We assume the phone number is stored in the 'caller' property of acceptedCall
    const phoneNumber = acceptedCall.caller; 
    const dashboardLink = acceptedCall.dashboardLink;

    if (dashboardLink && phoneNumber) {
      // Encode the phone number just in case it contains special characters (+, etc.)
      const encodedPhoneNumber = encodeURIComponent(phoneNumber);
      const redirectUrl = `${dashboardLink}?phoneNumber=${encodedPhoneNumber}`;
      
      console.log(`AgentDashboard: Accepting call. Redirecting to: ${redirectUrl}`); // 🚀 LOG
      
      window.location.href = redirectUrl;
    } else {
      console.error("AgentDashboard: Cannot redirect. Missing dashboardLink or caller phone number.", acceptedCall); // 🚀 LOG
    }
    
    // Remove from list
    setIncomingCalls(prevCalls =>
      prevCalls.filter(call => call.id !== acceptedCall.id)
    );
  };

  // Toggle Agent Status
  const toggleStatus = () => {
    const newStatus = status === "offline" ? "online" : "offline";
    fetch(`${BACKEND_URL}/agent/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })
    .catch(err => console.error("Status update failed:", err));
    
    setStatus(newStatus);
  };

  const isOnline = status === "online";

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
      backgroundColor: '#1f2937', // Dark slate gray
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
    },
    sidebar: {
      width: '280px',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
    },
    statusCard: {
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      textAlign: 'center',
    },
    statusLabel: {
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#6b7280',
      fontWeight: '600',
      marginBottom: '12px',
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 16px',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600',
      backgroundColor: isOnline ? '#ecfdf5' : '#f3f4f6',
      color: isOnline ? '#047857' : '#374151',
      border: `1px solid ${isOnline ? '#a7f3d0' : '#d1d5db'}`,
      marginBottom: '20px',
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: isOnline ? '#10b981' : '#9ca3af',
    },
    toggleBtn: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: isOnline ? '#ef4444' : '#10b981',
      color: 'white',
      boxShadow: isOnline 
        ? '0 4px 6px -1px rgba(239, 68, 68, 0.2)' 
        : '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
    },
    stats: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #f3f4f6',
    },
    statKey: {
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    statVal: {
      fontSize: '0.875rem',
      fontWeight: '700',
      color: '#111827',
    },
    contentArea: {
      flex: 1,
      padding: '32px',
      backgroundColor: '#f3f4f6',
      overflowY: 'auto',
    },
    queueHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px',
    },
    queueTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#111827',
      margin: 0,
    },
    countBadge: {
      backgroundColor: '#3b82f6',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '600',
      padding: '4px 12px',
      borderRadius: '9999px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '24px',
    },
    empty: {
      height: '400px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '2px dashed #e5e7eb',
      color: '#9ca3af',
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: '16px',
      opacity: 0.5,
    }
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
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.statusCard}>
            <div style={styles.statusLabel}>Current Status</div>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot}></span>
              {status.toUpperCase()}
            </div>
            <button style={styles.toggleBtn} onClick={toggleStatus}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

          <div style={styles.stats}>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Calls Today</span>
              <span style={styles.statVal}>12</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Avg Handle Time</span>
              <span style={styles.statVal}>4m 22s</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Utilization</span>
              <span style={styles.statVal}>85%</span>
            </div>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main style={styles.contentArea}>
          <div style={styles.queueHeader}>
            <h2 style={styles.queueTitle}>Incoming Call Queue</h2>
            <span style={styles.countBadge}>{incomingCalls.length} Waiting</span>
          </div>

          {incomingCalls.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>
                {isOnline ? '📡' : '🌙'}
              </div>
              <h3 style={{margin: 0, color: '#374151'}}>
                {isOnline ? 'Waiting for calls...' : 'You are currently offline'}
              </h3>
              <p style={{marginTop: '8px', fontSize: '0.875rem'}}>
                {isOnline ? 'System is active and listening.' : 'Go online to start receiving calls.'}
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {incomingCalls.map(call => (
                <CallCard 
                  key={call.id} 
                  callData={call} 
                  onAccept={handleCallAccept} 
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
