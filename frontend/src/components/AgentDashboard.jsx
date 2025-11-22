import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { BACKEND_URL } from "../config";
// 🚨 NEW IMPORT: Component to display individual calls
import CallCard from "./CallCard";

export default function AgentDashboard() {
  const [status, setStatus] = useState("offline");
  // 🚨 CHANGE: incomingCalls is now an array to hold multiple pending calls
  const [incomingCalls, setIncomingCalls] = useState([]);

  // --- State for a simple clock (UI flair) ---
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    // Clock timer
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);

    // 1. Initial status fetch
    fetch(`${BACKEND_URL}/agent/status`)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(err => console.error("Failed to fetch status:", err));

    // 2. Socket.IO Listener for Incoming Calls
    const socket = io(BACKEND_URL);

    socket.on("incoming-call", (callData) => {
      console.log("New call received, showing card:", callData.caller);

      // 🚨 CORE LOGIC CHANGE: Add the new call to the array state
      setIncomingCalls(prevCalls => [
        // Add a unique ID to manage the list
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

  // 🚨 NEW FUNCTION: Handles the acceptance click from a CallCard
  const handleCallAccept = (acceptedCall) => {
    // 1. Redirect the agent immediately (The "Screen Pop")
    if (acceptedCall.dashboardLink) {
      console.log(`Call accepted. Redirecting agent to: ${acceptedCall.dashboardLink}`);
      window.location.href = acceptedCall.dashboardLink;
    }

    // 2. Remove the accepted call from the list
    setIncomingCalls(prevCalls =>
      prevCalls.filter(call => call.id !== acceptedCall.id)
    );
  };

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

  // --- Helpers for Styles ---
  const isOnline = status === "online";

  return (
    <div style={styles.dashboardContainer}>
      {/* --- TOP NAVIGATION BAR --- */}
      <header style={styles.header}>
        <div style={styles.brandSection}>
          {/* Simple SVG Icon for Logo */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span style={styles.brandName}>CloudConnect Console</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.clock}>{currentTime}</span>
          <div style={styles.profileBadge}>JD</div>
        </div>
      </header>

      {/* --- MAIN WORKSPACE --- */}
      <div style={styles.workspace}>
        
        {/* --- LEFT SIDEBAR: STATS & CONTROLS --- */}
        <aside style={styles.sidebar}>
          
          {/* STATUS CARD */}
          <div style={styles.statusCard}>
            <div style={styles.statusHeader}>Agent Status</div>
            <div style={{ ...styles.statusIndicator, backgroundColor: isOnline ? '#d1fae5' : '#f3f4f6', color: isOnline ? '#065f46' : '#374151', border: isOnline ? '1px solid #34d399' : '1px solid #d1d5db' }}>
              <span style={{ ...styles.statusDot, backgroundColor: isOnline ? '#10b981' : '#9ca3af' }}></span>
              {status.toUpperCase()}
            </div>
            <button 
              onClick={toggleStatus}
              style={{ 
                ...styles.toggleButton, 
                backgroundColor: isOnline ? '#ef4444' : '#10b981',
                boxShadow: isOnline ? '0 4px 6px rgba(239, 68, 68, 0.2)' : '0 4px 6px rgba(16, 185, 129, 0.2)'
              }}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

          {/* STATS MOCKUP (To make it look real) */}
          <div style={styles.statsContainer}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Calls Today</span>
              <span style={styles.statValue}>12</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Avg Handle Time</span>
              <span style={styles.statValue}>4m 20s</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Queue Wait</span>
              <span style={styles.statValue}>00:00</span>
            </div>
          </div>
        </aside>

        {/* --- RIGHT AREA: CALL QUEUE --- */}
        <main style={styles.callFeed}>
          <div style={styles.feedHeader}>
            <h3 style={styles.feedTitle}>Incoming Call Queue</h3>
            <span style={styles.callCountBadge}>{incomingCalls.length} Waiting</span>
          </div>

          <div style={styles.feedContent}>
            {!isOnline ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>😴</div>
                <p>You are currently <strong>Offline</strong>.</p>
                <p style={styles.subText}>Go Online to start receiving calls.</p>
              </div>
            ) : incomingCalls.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '40px', marginBottom: '10px', animation: 'pulse 2s infinite' }}>📡</div>
                <p>Waiting for incoming calls...</p>
                <p style={styles.subText}>System is active and listening.</p>
              </div>
            ) : (
              <div style={styles.cardsGrid}>
                {/* Map over the array and render a CallCard for each pending call */}
                {incomingCalls.map(call => (
                  <CallCard 
                    key={call.id} 
                    callData={call} 
                    onAccept={handleCallAccept}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- INLINE CSS STYLES ---
const styles = {
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#f3f4f6', // Light gray background
    color: '#1f2937',
  },
  header: {
    height: '64px',
    backgroundColor: '#111827', // Dark slate
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  brandSection: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  clock: {
    fontFamily: 'monospace',
    fontSize: '16px',
    color: '#9ca3af',
  },
  profileBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    border: '2px solid #4b5563',
  },
  workspace: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden', // Prevents double scrollbars
  },
  sidebar: {
    width: '300px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
  statusHeader: {
    fontSize: '14px',
    textTransform: 'uppercase',
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: '12px',
    letterSpacing: '1px',
  },
  statusIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 16px',
    borderRadius: '9999px',
    fontWeight: '700',
    fontSize: '14px',
    marginBottom: '20px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  toggleButton: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  statsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #f3f4f6',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
  },
  callFeed: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto',
    backgroundColor: '#f3f4f6',
  },
  feedHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  feedTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  callCountBadge: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
  },
  feedContent: {
    minHeight: '400px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '300px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '2px dashed #e5e7eb',
    color: '#6b7280',
  },
  subText: {
    fontSize: '14px',
    color: '#9ca3af',
    marginTop: '4px',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  }
};
