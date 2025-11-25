import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function UserDashboardPage() {
  const { phoneNumber } = useParams();
  const [notes, setNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  // Mock subscription status - replace with actual API fetch if needed
  const [subscriptionStatus] = useState('Premium'); 

  useEffect(() => {
    // Clock timer for the header
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- INLINE STYLES ADAPTED FROM AgentDashboard ---
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
      width: '300px', // Slightly wider for user info
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      flexShrink: 0, // Prevents sidebar from shrinking
    },
    contentArea: {
      flex: 1,
      padding: '32px',
      backgroundColor: '#f3f4f6',
      overflowY: 'auto',
    },
    card: {
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '24px',
    },
    notesTextarea: {
      width: '100%',
      minHeight: '400px',
      padding: '16px',
      fontSize: '1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    userInfoBlock: {
      marginBottom: '24px',
    },
    userInfoTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '12px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e5e7eb',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px dashed #f3f4f6',
    },
    infoKey: {
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    infoVal: {
      fontSize: '0.875rem',
      fontWeight: '700',
      color: '#111827',
    },
    subscriptionBadge: {
      padding: '4px 10px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      backgroundColor: subscriptionStatus === 'Premium' ? '#d1fae5' : '#fef9c3',
      color: subscriptionStatus === 'Premium' ? '#065f46' : '#a16207',
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
          <span>CC Agent Console: Active Call</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.clock}>{currentTime}</span>
          <div style={styles.avatar}>AG</div>
        </div>
      </header>

      <div style={styles.main}>
        {/* SIDEBAR - Used to display User/Call Info */}
        <aside style={styles.sidebar}>
          <div style={{ ...styles.card, ...styles.userInfoBlock }}>
            <div style={styles.userInfoTitle}>☎️ Customer Details</div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoKey}>Call Number</span>
              <span style={styles.infoVal}>{phoneNumber}</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoKey}>Subscription Status</span>
              <span style={styles.subscriptionBadge}>{subscriptionStatus}</span>
            </div>
            
            {/* You can add more user details here (e.g., Name, Last Contact) */}
            <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#9ca3af' }}>
              *Details are for the verified calling party.
            </div>
          </div>
          
          <div style={{ ...styles.card, flex: 1 }}>
            <div style={styles.userInfoTitle}>Call History Summary</div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              *Implement history lookup here (e.g., last 3 tickets, products owned).
            </p>
          </div>
        </aside>

        {/* CONTENT AREA - Used for Note Taking */}
        <main style={styles.contentArea}>
          <h2 style={styles.title}>📝 Active Call Notes</h2>

          <div style={styles.card}>
            <textarea
              style={styles.notesTextarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Start taking notes on the user's request, issues, or actions taken..."
            />
          </div>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button 
              onClick={() => alert('Notes saved! (Implement save logic to backend/CRM)')} 
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: '#10b981',
                color: 'white',
              }}
            >
              Save Notes
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
