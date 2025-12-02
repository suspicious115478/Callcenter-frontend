import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BACKEND_URL = 'https://callcenter-baclend.onrender.com'; 

const EmployeeHelpDeskPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { callerNumber, customerName } = location.state || {};
  
  const [employeeDispatchData, setEmployeeDispatchData] = useState(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // --- Clock and Initial Check useEffect ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);


  // ----------------------------------------------------------------------
// ⚡ FINALIZED LOGIC: Fetch Employee & Dispatch details (Kept Unchanged)
// ----------------------------------------------------------------------
useEffect(() => {
    if (!callerNumber) return; 

    const fetchEmployeeDetails = async () => {
        setIsFetchingData(true);
        setFetchError(null);
        setEmployeeDispatchData(null); 

        try {
            const userUrl = `${BACKEND_URL}/call/employee/details?mobile_number=${callerNumber}`;
            const userResponse = await fetch(userUrl);
            
            if (!userResponse.ok) {
                if (userResponse.status === 404) {
                    throw new Error("Employee not found for this number (404).");
                }
                throw new Error(`Failed to fetch employee details. Status: ${userResponse.status}`);
            }

            const employeeDetails = await userResponse.json();
            const employeeId = employeeDetails.user_id;

            if (!employeeId) {
                setFetchError("Employee ID not resolved from mobile number.");
                setIsFetchingData(false);
                return;
            }

            const dispatchUrl = `${BACKEND_URL}/call/dispatch/active-order?user_id=${employeeId}`;
            const dispatchResponse = await fetch(dispatchUrl);

            if (!dispatchResponse.ok) {
                throw new Error(`Failed to fetch active dispatch details. Status: ${dispatchResponse.status}`);
            }

            const dispatchResult = await dispatchResponse.json();
            
            setEmployeeDispatchData(dispatchResult.dispatchData || {}); 

        } catch (error) {
            setFetchError(error.message);
            setEmployeeDispatchData({}); 
        } finally {
            setIsFetchingData(false);
        }
    };

    fetchEmployeeDetails();

}, [callerNumber]); 

  const currentDispatchData = employeeDispatchData || {};


// --- UPDATED STYLES FOR ALIGNMENT AND TICKET CARD ---
  const styles = {
    // Structure Styles
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: '"Inter", sans-serif',
      backgroundColor: '#f3f4f6', 
      color: '#111827',
      // FIX: Ensure no accidental overflow on container
      overflow: 'hidden', 
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
    mainContentArea: {
      flex: 1,
      padding: '32px 0', // FIX: Remove side padding here, let the inner container handle centering
      overflowY: 'auto',
    },
    centeredContainer: { // New style for centering content
      maxWidth: '1400px', 
      margin: '0 auto',
      padding: '0 32px', // Add padding inside the centered box
    },
    // Page-specific Styles
    pageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '24px',
        marginBottom: '32px',
        borderRadius: '12px',
        borderLeft: '8px solid #3b82f6', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', 
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        fontSize: '0.875rem',
        color: '#6b7280',
        marginTop: '4px',
    },
    callInfo: {
        textAlign: 'right',
        border: '2px solid #3b82f6', 
        padding: '10px 15px',
        borderRadius: '8px',
        backgroundColor: '#eff6ff',
    },
    phoneNumber: {
        fontSize: '2.5rem', 
        fontWeight: '800', 
        color: '#1d4ed8', 
        letterSpacing: '0.05em', 
    },
    customerName: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#4b5563',
        marginTop: '4px',
    },
    // Grid and Card Styles
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: '2.5fr 1fr', 
        gap: '32px', 
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        padding: '24px',
    },
    cardTitle: {
        fontSize: '1.25rem', 
        fontWeight: '700',
        color: '#111827',
        marginBottom: '16px',
        borderBottom: '2px solid #e5e7eb', 
        paddingBottom: '8px',
    },
    // TICKET CARD STYLES (New/Refined)
    ticketCard: {
        border: '1px solid #d1d5db',
        borderRadius: '10px',
        padding: '20px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden',
    },
    ticketHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px dashed #d1d5db',
        paddingBottom: '15px',
        marginBottom: '15px',
    },
    ticketID: {
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#1d4ed8', // Darker blue
        fontFamily: 'monospace',
    },
    ticketStatus: (status) => ({
        padding: '4px 12px',
        borderRadius: '20px',
        fontWeight: '700',
        fontSize: '0.875rem',
        backgroundColor: status.bg,
        color: status.text,
    }),
    detailRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px 20px',
        marginBottom: '10px',
    },
    detailItem: {
        padding: '8px 0',
        borderBottom: '1px solid #f3f4f6',
    },
    detailLabel: {
        display: 'block',
        fontSize: '0.75rem',
        color: '#6b7280',
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: '2px',
    },
    detailValue: {
        fontSize: '1rem',
        fontWeight: '500',
        color: '#111827',
    },
    fullDetail: {
        marginTop: '15px',
        padding: '15px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
    },
    requestText: {
        fontSize: '0.95rem',
        color: '#4b5563',
        fontStyle: 'italic',
        marginTop: '8px',
    },
    // Action Button Styles (Unchanged)
    buttonGroup: {
        display: 'flex',
        gap: '16px',
        marginTop: '24px',
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        color: 'white',
        fontWeight: '700', 
        padding: '14px 24px', 
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.2s',
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#10b981', 
        color: 'white',
        fontWeight: '700',
        padding: '14px 24px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.2s',
    },
    // Utility Styles (for mapping colors)
    colorMap: {
      blue: { text: '#2563eb', bg: '#eff6ff' }, 
      purple: { text: '#7e22ce', bg: '#f5f3ff' }, 
      yellow: { text: '#ca8a04', bg: '#fffbeb' }, 
      green: { text: '#059669', bg: '#ecfdf5' }, 
      red: { text: '#dc2626', bg: '#fee2e2' }, // For errors/important status
      gray: { text: '#4b5563', bg: '#f9fafb' } 
    }
  };

  const c = styles.colorMap;

// --- TICKET CARD RENDER LOGIC ---
const renderDispatchContent = () => {
    if (isFetchingData) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
          ⏳ Fetching active dispatch ticket details...
        </div>
      );
    }

    if (fetchError) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0', color: c.red.text, backgroundColor: c.red.bg, borderRadius: '8px', border: '1px solid #fca5a5' }}>
              🛑 **Error:** {fetchError}.
            </div>
          );
    }
    
    // Check for data availability
    if (!currentDispatchData || Object.keys(currentDispatchData).length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
              ℹ️ **No active dispatch** record found for this employee.
            </div>
          );
    }

    // Function to determine status color based on status string (Example logic)
    const getStatusColor = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'completed':
            case 'resolved':
                return c.green;
            case 'pending':
            case 'in-progress':
                return c.yellow;
            case 'cancelled':
                return c.red;
            default:
                return c.blue;
        }
    };

    const statusStyle = getStatusColor(currentDispatchData.order_status);

    // Render data as a structured Ticket Card
    return (
        <div style={styles.ticketCard}>
          
          {/* Ticket Header (ID and Status) */}
          <div style={styles.ticketHeader}>
            <div>
              <span style={styles.detailLabel}>TICKET / ORDER ID</span>
              <div style={styles.ticketID}>{currentDispatchData.order_id || 'N/A'}</div>
            </div>
            <div style={styles.ticketStatus(statusStyle)}>
              {currentDispatchData.order_status ? currentDispatchData.order_status.toUpperCase() : 'UNKNOWN'}
            </div>
          </div>

          {/* Detail Grid */}
          <div style={styles.detailRow}>
            
            {/* Employee ID */}
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Assigned Employee ID</span>
              <span style={styles.detailValue}>**{currentDispatchData.user_id || 'N/A'}**</span>
            </div>
          
            {/* Category */}
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Service Category</span>
              <span style={styles.detailValue}>**{currentDispatchData.category || 'N/A'}**</span>
            </div>
          
            {/* Dispatched At */}
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Dispatch Date</span>
              <span style={styles.detailValue}>{currentDispatchData.dispatched_at ? new Date(currentDispatchData.dispatched_at).toLocaleDateString() : 'N/A'}</span>
            </div>
          
            {/* Customer Contact */}
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Customer Contact</span>
              <span style={styles.detailValue}>{currentDispatchData.customer_phone || 'N/A'}</span>
            </div>
          </div>

          {/* Service Address (Full Width) */}
          <div style={styles.fullDetail}>
            <span style={styles.detailLabel}>Service Address</span>
            <p style={styles.detailValue}>{currentDispatchData.request_address || 'N/A'}</p>
          </div>
          
          {/* Employee Notes/Request (Full Width) */}
          <div style={styles.fullDetail}>
            <span style={styles.detailLabel}>Employee's Last Note/Request</span>
            <p style={styles.requestText}>"{currentDispatchData.order_request || 'No specific note or request filed.'}"</p>
          </div>
        </div>
    );
  };


  return (
    <div style={styles.container}>
      
      {/* HEADER (Unchanged) */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>CC Agent Console</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.clock}>⏰ {currentTime}</span>
          <button style={{ 
            backgroundColor: '#f87171', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s', marginLeft: '15px', 
          }} onClick={() => navigate('/dashboard')}>
            ⬅️ Dashboard
          </button>
        </div>
      </header>
      
      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContentArea}>
        {/* FIX: Centered Container ensures alignment */}
        <div style={styles.centeredContainer}> 
          
          {/* Page Header Section */}
          <header style={styles.pageHeader}>
            <div>
              <h1 style={styles.title}>📞 Employee Help Desk - Live Call</h1>
              <p style={styles.subtitle}>Automatically fetched details for the active caller.</p>
            </div>
            {/* Highlighting Call Info */}
            <div style={styles.callInfo}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1d4ed8', marginBottom: '4px' }}>INCOMING CALL FROM:</div>
              <div style={styles.phoneNumber}>📱 {callerNumber || "N/A"}</div>
              <div style={styles.customerName}>Employee: **{customerName || "Serviceman"}**</div>
            </div>
          </header>

          {/* Main Content Grid */}
          <div style={styles.contentGrid}>
            
            {/* Left Column: Dispatch Details (Now a single Ticket Card) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>📦 Current Active Ticket Details</h2>
                
                {renderDispatchContent()}
                
              </div>

              {/* Action Buttons */}
              <div style={styles.buttonGroup}>
                <button style={styles.primaryButton}>
                  📝 **Open Full Order History**
                </button>
                <button style={styles.secondaryButton}>
                  🗺️ **Track Location / Live Map**
                </button>
              </div>
            </div>

            {/* Right Column: Quick Actions / Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* The dedicated Ticket badge is now integrated into the main card, this section is for Notes/Actions */}
              
              <div style={styles.card}>
                 <h3 style={styles.cardTitle}>💬 Quick Notes & Resolution</h3>
                 <textarea 
                    style={styles.inputField}
                    rows="8"
                    placeholder="Enter key call notes, actions taken, and follow-up required here..."
                 ></textarea>
                 <button style={styles.saveButton}>
                   💾 **Save Note to Ticket**
                 </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHelpDeskPage;
