import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { BACKEND_URL } from "../config";
import CallCard from "./CallCard";
import { useNavigate } from "react-router-dom"; 
import { getAuth, signOut } from "firebase/auth";
import { app } from "../config"; 

// Initialize Firebase Auth
const auth = getAuth(app); 

export default function AgentDashboard() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("offline");
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  // UI State for hover effects (simulating CSS hover in inline styles)
  const [isHoveringLogout, setIsHoveringLogout] = useState(false);

  const isOnline = status === "online";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);

    fetch(`${BACKEND_URL}/agent/status`)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(err => console.error("Failed to fetch status:", err));

    const socket = io(BACKEND_URL);

    socket.on("incoming-call", (callData) => {
      console.log("New call received:", callData);
      setIncomingCalls(prevCalls => [
        { ...callData, id: Date.now() },
        ...prevCalls 
      ]);
    });

    return () => {
      socket.off("incoming-call");
      clearInterval(timer);
    };
  }, []);

  const handleCallAccept = (acceptedCall) => {
    const dashboardLink = acceptedCall.dashboardLink;
    const callerNumber = acceptedCall.caller || null;
    const dispatchData = acceptedCall.dispatchDetails || null; 
    const customerName = acceptedCall.userName || null;

    if (dashboardLink) {
      console.log(`AgentDashboard: Accepting call. Redirecting to: ${dashboardLink}`);
      
      navigate(dashboardLink, {
        state: {
          callerNumber: callerNumber,
          dispatchData: dispatchData,
          customerName: customerName
        }
      });
    } else {
      console.error("AgentDashboard: Cannot redirect. Missing dashboardLink.", acceptedCall); 
    }
    
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
  
  const handleLogout = async () => {
    try {
      if (status === 'online') {
          await fetch(`${BACKEND_URL}/agent/status`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "offline" })
          });
      }
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  // --- MODERNIZED STYLES ---
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#f8fafc', // Very light slate
      color: '#1e293b',
    },
    // Header is now white with a subtle border, cleaner look
    header: {
      height: '70px',
      backgroundColor: '#ffffff', 
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      zIndex: 20,
    },
    brandGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    brandText: {
      fontSize: '1.25rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.025em',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    },
    // The Status Switch is now prominent in the header
    statusSwitch: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: isOnline ? '#dcfce7' : '#f1f5f9',
      padding: '4px',
      borderRadius: '24px',
      cursor: 'pointer',
      border: `1px solid ${isOnline ? '#86efac' : '#cbd5e1'}`,
      transition: 'all 0.3s ease',
    },
    statusText: {
      fontSize: '0.85rem',
      fontWeight: '600',
      padding: '0 12px',
      color: isOnline ? '#166534' : '#64748b',
      userSelect: 'none',
    },
    statusKnob: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: isOnline ? '#16a34a' : '#94a3b8',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease',
    },
    clockCard: {
      backgroundColor: '#f1f5f9',
      padding: '6px 12px',
      borderRadius: '8px',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.9rem',
      color: '#475569',
      fontWeight: '600',
    },
    logoutBtn: {
      backgroundColor: isHoveringLogout ? '#fee2e2' : 'transparent',
      color: '#ef4444',
      border: '1px solid #ef4444',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    mainLayout: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    sidebar: {
      width: '300px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px',
    },
    sectionTitle: {
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#94a3b8',
      fontWeight: '700',
      marginBottom: '16px',
    },
    statsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    statCard: {
      padding: '16px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statValue: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#0f172a',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#64748b',
    },
    contentArea: {
      flex: 1,
      padding: '40px',
      backgroundColor: '#f8fafc',
      overflowY: 'auto',
      backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    },
    queueContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    queueHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px',
    },
    pageTitle: {
      fontSize: '1.875rem',
      fontWeight: '800',
      color: '#0f172a',
      letterSpacing: '-0.025em',
      margin: 0,
    },
    liveBadge: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '24px',
    },
    emptyState: {
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px dashed #cbd5e1',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    },
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span style={styles.brandText}>ConnectOne</span>
        </div>

        <div style={styles.headerRight}>
          {/* Status Toggle moved to header for easy access */}
          <div style={styles.statusSwitch} onClick={toggleStatus} title="Toggle Availability">
            <span style={styles.statusText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            <div style={styles.statusKnob}></div>
          </div>

          <div style={styles.clockCard}>
            {currentTime}
          </div>

          <button 
            style={styles.logoutBtn} 
            onClick={handleLogout}
            onMouseEnter={() => setIsHoveringLogout(true)}
            onMouseLeave={() => setIsHoveringLogout(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Exit
          </button>
        </div>
      </header>

      <div style={styles.mainLayout}>
        {/* SIDEBAR: Performance Metrics */}
        <aside style={styles.sidebar}>
          <div>
            <div style={styles.sectionTitle}>Agent Performance</div>
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Calls Taken</span>
                <span style={styles.statValue}>24</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Avg Handle Time</span>
                <span style={styles.statValue}>3m 12s</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Satisfaction</span>
                <span style={{...styles.statValue, color: '#16a34a'}}>4.8/5</span>
              </div>
            </div>
          </div>
          
          <div>
             <div style={styles.sectionTitle}>Agent Profile</div>
             <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{width: '48px', height: '48px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>JD</div>
                <div>
                  <div style={{fontWeight: '700', color: '#334155'}}>John Doe</div>
                  <div style={{fontSize: '0.8rem', color: '#94a3b8'}}>Senior Agent</div>
                </div>
             </div>
          </div>
        </aside>

        {/* MAIN CONTENT: The Call Queue */}
        <main style={styles.contentArea}>
          <div style={styles.queueContainer}>
            <div style={styles.queueHeader}>
              <div>
                <h2 style={styles.pageTitle}>Call Queue</h2>
                <p style={{color: '#64748b', margin: '4px 0 0 0'}}>
                  {isOnline ? 'You are visible to the routing system.' : 'You are currently hidden from the routing system.'}
                </p>
              </div>
              {incomingCalls.length > 0 && (
                <div style={styles.liveBadge}>
                  <span style={{width:'8px', height:'8px', background:'currentColor', borderRadius:'50%'}}></span>
                  LIVE TRAFFIC
                </div>
              )}
            </div>

            {incomingCalls.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{fontSize: '4rem', marginBottom: '16px', opacity: 0.8}}>
                   {isOnline ? '📡' : '💤'}
                </div>
                <h3 style={{fontSize: '1.5rem', color: '#1e293b', margin: '0 0 8px 0'}}>
                  {isOnline ? 'Waiting for incoming calls...' : 'You are currently offline'}
                </h3>
                <p style={{color: '#64748b', maxWidth: '400px'}}>
                  {isOnline 
                    ? 'Calls will appear here automatically as they are routed to your station.' 
                    : 'Toggle your status to "Online" in the top bar to start receiving calls.'}
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
          </div>
        </main>
      </div>
    </div>
  );
}
