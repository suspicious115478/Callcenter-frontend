import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Ensure you have the BACKEND_URL configured or defined globally, e.g., in a config file
const BACKEND_URL = 'https://callcenter-baclend.onrender.com'; 

const EmployeeHelpDeskPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Retrieve data passed from the incoming call socket event (via navigation state)
  // **REMOVED dispatchData**
  const { callerNumber, customerName } = location.state || {};
  
  // State to manage the fetched data
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
// ⚡ FINALIZED LOGIC: Fetch Employee & Dispatch details from API ONLY
// ----------------------------------------------------------------------
useEffect(() => {
    if (!callerNumber) return; // Stop if no phone number is provided

    // 💡 Frontend Log for Debugging
    console.log(`[Frontend Fetch] Attempting lookup for number: ${callerNumber}`);

    const fetchEmployeeDetails = async () => {
        setIsFetchingData(true);
        setFetchError(null);
        setEmployeeDispatchData(null); // Clear old data when starting a fresh fetch

        try {
            // STEP 1: Fetch Employee user_id and other basic details using the phone number
            const userUrl = `${BACKEND_URL}/api/employee/details?mobile_number=${callerNumber}`;
            console.log(`[Frontend Fetch] STEP 1: Calling: ${userUrl}`);
            const userResponse = await fetch(userUrl);
            
            if (!userResponse.ok) {
                // If it's a 404, we treat it as "Employee Not Found" and stop
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
            const dispatchUrl = `${BACKEND_URL}/api/dispatch/active-order?user_id=${employeeId}`;
            console.log(`[Frontend Fetch] STEP 2: Calling: ${dispatchUrl}`);
            const dispatchResponse = await fetch(dispatchUrl);

            if (!dispatchResponse.ok) {
                throw new Error(`Failed to fetch active dispatch details. Status: ${dispatchResponse.status}`);
            }

            const dispatchResult = await dispatchResponse.json();
            
            console.log(`[Frontend Fetch] STEP 2 Success. Dispatch data received: ${Object.keys(dispatchResult.dispatchData || {}).length} keys.`);
            setEmployeeDispatchData(dispatchResult.dispatchData || {}); 

        } catch (error) {
            console.error("[Frontend Fetch] Total Error:", error.message);
            setFetchError(error.message);
            setEmployeeDispatchData({}); 
        } finally {
            setIsFetchingData(false);
            console.log("[Frontend Fetch] Process complete.");
        }
    };

    fetchEmployeeDetails();

}, [callerNumber]); // Re-run only when callerNumber changes

  // Use the fetched data for rendering. Prioritize the explicitly fetched data, 
  // **Removed fallback to dispatchData**
  const currentDispatchData = employeeDispatchData || {};


  // --- STYLES and RENDER LOGIC (Unchanged) ---
    const styles = {
    // Structure Styles
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f3f4f6', // Light gray background
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
        borderLeft: '4px solid #3b82f6', // Blue accent
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
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
    },
    phoneNumber: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#3b82f6', // Blue color
    },
    customerName: {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#4b5563',
    },
    // Grid and Card Styles
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr', // Roughly md:grid-cols-3 (2/3 and 1/3)
        gap: '24px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        padding: '24px',
    },
    cardTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '16px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '8px',
    },
    // Dispatch Detail Grid
    detailGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
    },
    detailItem: (color, bgColor) => ({
        padding: '12px',
        backgroundColor: bgColor,
        borderRadius: '8px',
        border: `1px solid ${bgColor.replace('50', '200')}`, // Light border
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
        fontSize: '1rem',
        fontWeight: '500',
        color: '#111827',
    },
    // Full width detail (for address/request)
    fullDetailItem: {
        gridColumn: 'span 2',
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
    },
    requestText: {
        fontSize: '0.875rem',
        color: '#4b5563',
        fontStyle: 'italic',
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
        fontWeight: '600',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        // Note: Actual hover effects require pseudo-classes or libraries like styled-components
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#10b981', // Green
        color: 'white',
        fontWeight: '600',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    // Quick Notes/Ticket
    inputField: {
        width: '100%',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        padding: '8px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        resize: 'none',
        fontFamily: 'inherit',
        fontSize: '0.875rem',
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#1f2937', // Dark gray
        color: 'white',
        padding: '8px',
        borderRadius: '6px',
        marginTop: '8px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    ticketBadge: {
        padding: '16px',
        border: '1px solid #e5e7eb',
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
        fontSize: '1rem',
        color: '#111827',
        marginTop: '4px',
    },
    // Utility Styles (for mapping colors)
    colorMap: {
      blue: { text: '#3b82f6', bg: '#eff6ff' },
      purple: { text: '#9333ea', bg: '#f5f3ff' },
      yellow: { text: '#ca8a04', bg: '#fffbeb' },
      green: { text: '#10b981', bg: '#ecfdf5' },
      gray: { text: '#6b7280', bg: '#f9fafb' }
    }
  };

  const c = styles.colorMap;

  // --- RENDERING LOGIC ---
  const renderDispatchContent = () => {
    if (isFetchingData) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
          Fetching employee dispatch details... (Loading...)
        </div>
      );
    }

    if (fetchError) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
              Error: {fetchError}. Check backend status.
            </div>
          );
    }
    
    // Check for data availability
    if (!currentDispatchData || Object.keys(currentDispatchData).length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
              No active dispatch record found for this employee.
            </div>
          );
    }

    // Render data when available
    return (
        <div style={styles.detailGrid}>
          
          {/* Order ID */}
          <div style={styles.detailItem(c.blue.text, c.blue.bg)}>
            <span style={styles.detailLabel(c.blue.text)}>Order ID</span>
            <span style={styles.detailValue}>{currentDispatchData.order_id || 'N/A'}</span>
          </div>
          
          {/* Category */}
          <div style={styles.detailItem(c.purple.text, c.purple.bg)}>
            <span style={styles.detailLabel(c.purple.text)}>Category</span>
            <span style={styles.detailValue}>{currentDispatchData.category || 'N/A'}</span>
          </div>
          
          {/* Order Status (The specific field you requested) */}
          <div style={styles.detailItem(c.yellow.text, c.yellow.bg)}>
            <span style={styles.detailLabel(c.yellow.text)}>Order Status</span>
            <span style={styles.detailValue}>{currentDispatchData.order_status || 'N/A'}</span>
          </div>
          
          {/* Assigned Serviceman ID (The key ID used for fetching) */}
          <div style={styles.detailItem(c.green.text, c.green.bg)}>
            <span style={styles.detailLabel(c.green.text)}>Employee ID</span>
            <span style={styles.detailValue}>{currentDispatchData.user_id || 'N/A'}</span>
          </div>
          
          {/* Service Address */}
          <div style={styles.fullDetailItem}>
            <span style={styles.detailLabel(c.gray.text)}>Service Address</span>
            <span style={styles.detailValue}>{currentDispatchData.request_address || 'N/A'}</span>
          </div>
          
          {/* Customer Request (The specific field you requested) */}
          <div style={styles.fullDetailItem}>
            <span style={styles.detailLabel(c.gray.text)}>Employee Notes/Request</span>
            <p style={styles.requestText}>"{currentDispatchData.order_request || 'No specific request found.'}"</p>
          </div>
        </div>
    );
  };


  return (
    <div style={styles.container}>
      
      {/* HEADER (Replicated from AgentDashboard) */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>CC Agent Console</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.clock}>{currentTime}</span>
          {/* Mock Avatar and Logout for consistency */}
          <div style={{ ...styles.avatar, width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: '600', border: '2px solid #4b5563', }}>JD</div>
          <button style={{ 
            backgroundColor: '#f87171', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s', marginLeft: '15px', 
          }} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </header>
      
      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContentArea}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Page Header Section */}
          <header style={styles.pageHeader}>
            <div>
              <h1 style={styles.title}>Employee Help Desk</h1>
              <p style={styles.subtitle}>{currentDispatchData.user_id ? `Dispatch Record for ${currentDispatchData.user_id}` : 'Employee Details Lookup'}</p>
            </div>
            <div style={styles.callInfo}>
              <div style={styles.phoneNumber}>{callerNumber || "N/A"}</div>
              <div style={styles.customerName}>{customerName || "Employee/Serviceman"}</div>
            </div>
          </header>

          {/* Main Content Grid */}
          <div style={styles.contentGrid}>
            
            {/* Left Column: Dispatch Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Active Dispatch Record</h2>
                
                {renderDispatchContent()}
                
              </div>

              {/* Action Buttons */}
              <div style={styles.buttonGroup}>
                <button style={styles.primaryButton}>
                  Open Full Order Details
                </button>
                <button style={styles.secondaryButton}>
                  Contact Serviceman
                </button>
              </div>
            </div>

            {/* Right Column: Quick Actions / Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Ticket Status</h3>
                <div style={styles.ticketBadge}>
                   <p style={styles.ticketLabel}>Associated Ticket ID</p>
                   <p style={styles.ticketID}>{currentDispatchData.ticket_id || "N/A"}</p>
                </div>
              </div>

              <div style={styles.card}>
                 <h3 style={styles.cardTitle}>Quick Notes</h3>
                 <textarea 
                    style={styles.inputField}
                    rows="6"
                    placeholder="Enter call notes here..."
                 ></textarea>
                 <button style={styles.saveButton}>
                   Save Note
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
