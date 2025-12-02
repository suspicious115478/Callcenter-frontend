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

    console.log(`[Frontend Fetch] Attempting lookup for number: ${callerNumber}`);

    const fetchEmployeeDetails = async () => {
        setIsFetchingData(true);
        setFetchError(null);
        setEmployeeDispatchData(null); 

        try {
            // STEP 1: Fetch Employee user_id
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
            console.log(`[Frontend Fetch] STEP 1 Success. Found Employee ID: ${employeeId}`);


            // STEP 2: Use the fetched user_id to get the active dispatch/order details
            const dispatchUrl = `${BACKEND_URL}/call/dispatch/active-order?user_id=${employeeId}`;
            const dispatchResponse = await fetch(dispatchUrl);

            if (!dispatchResponse.ok) {
                throw new Error(`Failed to fetch active dispatch details. Status: ${dispatchResponse.status}`);
            }

            const dispatchResult = await dispatchResponse.json();
            
            setEmployeeDispatchData(dispatchResult.dispatchData || {}); 

        } catch (error) {
            console.error("[Frontend Fetch] Total Error:", error.message);
            setFetchError(error.message);
            setEmployeeDispatchData({}); 
        } finally {
            setIsFetchingData(false);
        }
    };

    fetchEmployeeDetails();

}, [callerNumber]); 

  const currentDispatchData = employeeDispatchData || {};


  // --- STYLES and RENDER LOGIC ---
  const styles = {
    // Structure Styles
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: '"Inter", sans-serif',
      backgroundColor: '#f3f4f6', 
      color: '#111827',
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
      padding: '32px',
      overflowY: 'auto',
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
        borderLeft: '8px solid #3b82f6', // 🌟 ENHANCEMENT: Thicker accent border
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // 🌟 ENHANCEMENT: Stronger shadow
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
        // 🌟 ENHANCEMENT: Ensure call info is prominent
        border: '2px solid #3b82f6', 
        padding: '10px 15px',
        borderRadius: '8px',
        backgroundColor: '#eff6ff',
    },
    phoneNumber: {
        fontSize: '2.5rem', // 🌟 ENHANCEMENT: Larger font
        fontWeight: '800', // 🌟 ENHANCEMENT: Bolder font
        color: '#1d4ed8', // Darker Blue
        letterSpacing: '0.05em', // Spread out digits slightly
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
        gridTemplateColumns: '2.5fr 1fr', // 🌟 ENHANCEMENT: Slightly wider main column
        gap: '32px', // 🌟 ENHANCEMENT: Increased gap
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        padding: '24px',
    },
    cardTitle: {
        fontSize: '1.25rem', // 🌟 ENHANCEMENT: Slightly larger card titles
        fontWeight: '700',
        color: '#111827',
        marginBottom: '16px',
        borderBottom: '2px solid #e5e7eb', // 🌟 ENHANCEMENT: Thicker divider
        paddingBottom: '8px',
    },
    // Dispatch Detail Grid
    detailGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', // 🌟 ENHANCEMENT: Use a 3-column layout for small details
        gap: '16px',
    },
    detailItem: (color, bgColor) => ({
        padding: '16px', // 🌟 ENHANCEMENT: More padding
        backgroundColor: bgColor,
        borderRadius: '8px',
        border: `1px solid ${bgColor.replace('50', '300')}`, 
    }),
    detailLabel: (color) => ({
        display: 'block',
        fontSize: '0.75rem',
        color: color,
        textTransform: 'uppercase',
        fontWeight: '700',
        marginBottom: '4px',
    }),
    detailValue: {
        fontSize: '1.125rem', // 🌟 ENHANCEMENT: Slightly larger value font
        fontWeight: '600', // 🌟 ENHANCEMENT: Bolder value font
        color: '#111827',
    },
    // Full width detail (for address/request)
    fullDetailItem: {
        gridColumn: 'span 3', // 🌟 ENHANCEMENT: Full width in the 3-column grid
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
    },
    requestText: {
        fontSize: '1rem',
        color: '#4b5563',
        fontStyle: 'italic',
        marginTop: '8px',
    },
    // Action Button Styles
    buttonGroup: {
        display: 'flex',
        gap: '16px',
        marginTop: '24px',
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        color: 'white',
        fontWeight: '700', // Bolder
        padding: '14px 24px', // Taller button
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
    // Quick Notes/Ticket
    inputField: {
        width: '100%',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        padding: '12px', // More padding
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        resize: 'vertical',
        fontFamily: 'inherit',
        fontSize: '0.95rem',
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#4b5563', // 🌟 ENHANCEMENT: Darker gray for a professional save button
        color: 'white',
        padding: '10px',
        borderRadius: '6px',
        marginTop: '12px', // More space
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    ticketBadge: {
        padding: '16px',
        border: '2px dashed #d1d5db', // 🌟 ENHANCEMENT: Dashed border for a ticket feel
        borderRadius: '8px',
        backgroundColor: '#f9fafb',
        textAlign: 'center',
    },
    ticketLabel: {
        fontSize: '0.875rem',
        color: '#6b7280',
    },
    ticketID: {
        fontFamily: 'monospace',
        fontWeight: '700',
        fontSize: '1.25rem', // Larger ID
        color: '#3b82f6',
        marginTop: '4px',
    },
    // Utility Styles (for mapping colors)
    colorMap: {
      blue: { text: '#2563eb', bg: '#eff6ff' }, // Darker blue
      purple: { text: '#7e22ce', bg: '#f5f3ff' }, // Darker purple
      yellow: { text: '#ca8a04', bg: '#fffbeb' }, 
      green: { text: '#059669', bg: '#ecfdf5' }, // Darker green
      gray: { text: '#4b5563', bg: '#f9fafb' } // Darker gray
    }
  };

  const c = styles.colorMap;

  // --- RENDERING LOGIC ---
  const renderDispatchContent = () => {
    if (isFetchingData) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
          ⏳ Fetching employee dispatch details...
        </div>
      );
    }

    if (fetchError) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
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

    // Render data when available
    return (
        <div style={styles.detailGrid}>
          
          {/* Order ID */}
          <div style={styles.detailItem(c.blue.text, c.blue.bg)}>
            <span style={styles.detailLabel(c.blue.text)}>Order ID</span>
            <span style={styles.detailValue}>**{currentDispatchData.order_id || 'N/A'}**</span>
          </div>
          
          {/* Category */}
          <div style={styles.detailItem(c.purple.text, c.purple.bg)}>
            <span style={styles.detailLabel(c.purple.text)}>Category</span>
            <span style={styles.detailValue}>**{currentDispatchData.category || 'N/A'}**</span>
          </div>
          
          {/* Order Status (Prominent, uses a different color map if needed) */}
          <div style={styles.detailItem(c.yellow.text, c.yellow.bg)}>
            <span style={styles.detailLabel(c.yellow.text)}>Order Status</span>
            <span style={styles.detailValue}>**{currentDispatchData.order_status || 'N/A'}**</span>
          </div>
          
          {/* Assigned Serviceman ID (Key ID) */}
          <div style={styles.detailItem(c.green.text, c.green.bg)}>
            <span style={styles.detailLabel(c.green.text)}>Employee ID (UID)</span>
            <span style={styles.detailValue}>{currentDispatchData.user_id || 'N/A'}</span>
          </div>

          {/* New field: Dispatch Time */}
          <div style={styles.detailItem(c.gray.text, c.gray.bg)}>
            <span style={styles.detailLabel(c.gray.text)}>Dispatched At</span>
            <span style={styles.detailValue}>{currentDispatchData.dispatched_at ? new Date(currentDispatchData.dispatched_at).toLocaleString() : 'N/A'}</span>
          </div>
          
          {/* New field: Customer Contact (if available) */}
          <div style={styles.detailItem(c.blue.text, c.blue.bg)}>
            <span style={styles.detailLabel(c.blue.text)}>Customer Contact</span>
            <span style={styles.detailValue}>{currentDispatchData.customer_phone || 'N/A'}</span>
          </div>

          {/* Service Address (Full Width) */}
          <div style={styles.fullDetailItem}>
            <span style={styles.detailLabel(c.gray.text)}>Service Address</span>
            <p style={styles.detailValue}>{currentDispatchData.request_address || 'N/A'}</p>
          </div>
          
          {/* Employee Notes/Request (Full Width) */}
          <div style={styles.fullDetailItem}>
            <span style={styles.detailLabel(c.gray.text)}>Employee Notes/Request</span>
            <p style={styles.requestText}>**"{currentDispatchData.order_request || 'No specific request found.'}"**</p>
          </div>
        </div>
    );
  };


  return (
    <div style={styles.container}>
      
      {/* HEADER (Unchanged, but robust) */}
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
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}> {/* Wider container */}
          
          {/* Page Header Section */}
          <header style={styles.pageHeader}>
            <div>
              <h1 style={styles.title}>📞 Employee Help Desk - Live Call</h1>
              <p style={styles.subtitle}>Automatically fetched details for the active caller.</p>
            </div>
            {/* 🌟 ENHANCEMENT: Highlighting Call Info */}
            <div style={styles.callInfo}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1d4ed8', marginBottom: '4px' }}>INCOMING CALL FROM:</div>
              <div style={styles.phoneNumber}>📱 {callerNumber || "N/A"}</div>
              <div style={styles.customerName}>Employee: **{customerName || "Serviceman"}**</div>
            </div>
          </header>

          {/* Main Content Grid */}
          <div style={styles.contentGrid}>
            
            {/* Left Column: Dispatch Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>📦 Active Dispatch Record</h2>
                
                {renderDispatchContent()}
                
              </div>

              {/* Action Buttons (Moved out of card for visual separation) */}
              <div style={styles.buttonGroup}>
                <button style={styles.primaryButton}>
                  📝 **Open Full Order Details**
                </button>
                <button style={styles.secondaryButton}>
                  🗺️ **Track Location / Live Map**
                </button>
              </div>
            </div>

            {/* Right Column: Quick Actions / Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>🎫 Associated Ticket</h3>
                <div style={styles.ticketBadge}>
                   <p style={styles.ticketLabel}>ACTIVE TICKET ID</p>
                   <p style={styles.ticketID}>{currentDispatchData.ticket_id || "**TICKET-NEW-001**"}</p>
                </div>
              </div>

              <div style={styles.card}>
                 <h3 style={styles.cardTitle}>💬 Quick Notes</h3>
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
