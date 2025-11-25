import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// CRITICAL: Defined URL locally. Ensure this matches your deployed backend URL exactly.
const BACKEND_URL = 'https://callcenter-baclend.onrender.com'; 

export default function UserDashboardPage() {
  // 1. ROBUST ID EXTRACTION
  // We capture all params and check for either 'userId' OR 'phoneNumber'.
  // This ensures the page works regardless of how the route is named in App.js
  const params = useParams();
  const currentId = params.userId || params.phoneNumber; 

  const navigate = useNavigate();
  
  // --- State Initialization ---
  const [userData, setUserData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Helper values derived from state (safely handled if userData is null)
  const phoneNumber = userData?.phoneNumber || 'Unknown';
  const userName = userData?.name || 'Loading User...';
  const subscriptionStatus = userData?.planStatus || 'Loading...';

  // --- EFFECT 1: Clock Timer ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- EFFECT 2: Fetch User Data and Addresses ---
  useEffect(() => {
    // If we couldn't find an ID in the URL, stop loading.
    if (!currentId) {
      console.error("No User ID or Phone Number found in URL parameters.");
      setLoadingData(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoadingData(true);
      try {
        console.log(`Fetching data for ID: ${currentId}`);
        
        // Fetch user details from the backend
        const response = await fetch(`${BACKEND_URL}/user/data/${currentId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Frontend received data:", data);
        
        setUserData({
            userId: data.userId,
            name: data.name,
            planStatus: data.planStatus,
            phoneNumber: data.phoneNumber || 'N/A', 
        }); 
        
        // Set addresses
        const fetchedAddresses = data.addresses || [];
        setAddresses(fetchedAddresses);

        // Pre-select the first address if available
        if (fetchedAddresses.length > 0) {
            setSelectedAddress(fetchedAddresses[0]);
        }
        
      } catch (error) {
        console.error('Dashboard Data Fetch Error:', error);
        setSaveMessage(`❌ Error fetching user data: ${error.message}`);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboardData();
  }, [currentId]); // Dependency is the robust currentId


  // --- FUNCTION: Save Notes to Backend as a Ticket and Navigate ---
  const saveNotesAsTicket = async () => {
    if (!notes.trim()) {
      setSaveMessage('Error: Notes cannot be empty.');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    
    // Address Validation: Mandatory if addresses exist
    if (addresses.length > 0 && !selectedAddress) {
         setSaveMessage('Error: Please select a service address.');
         setTimeout(() => setSaveMessage(''), 3000);
         return;
    }

    setIsSaving(true);
    setSaveMessage('Saving...');

    try {
      const response = await fetch(`${BACKEND_URL}/call/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Agent-Id': 'AGENT_001', 
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber, 
          requestDetails: notes.trim(),
          selectedAddress: selectedAddress, // Include the selected address
        }),
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          const errorText = await response.text();
          throw new Error(`Server responded with ${response.status}. Body: ${errorText.substring(0, 100)}...`);
        }
        throw new Error(errorData.message || 'Server error occurred.');
      }

      const result = await response.json();

      console.log(`Ticket ${result.ticket_id} created. Navigating to service selection.`);
      
      // Navigate to next page
      navigate('/user/services', {
        state: {
          ticketId: result.ticket_id,
          requestDetails: result.requestDetails || notes.trim(), 
          selectedAddress: selectedAddress, 
        }
      });
      

    } catch (error) {
      console.error('API Error:', error);
      setSaveMessage(`❌ Failed to create ticket: ${error.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };
  // --------------------------------------------------------

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
      width: '300px',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      flexShrink: 0,
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
      minHeight: '200px', 
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
      backgroundColor: subscriptionStatus === 'active' ? '#d1fae5' : '#fef9c3',
      color: subscriptionStatus === 'active' ? '#065f46' : '#a16207',
    },
    addressSelector: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px dashed #d1d5db',
    },
    addressOption: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '8px',
        transition: 'background-color 0.2s',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
    },
    addressSelected: {
        backgroundColor: '#e0f2f1',
        borderColor: '#0d9488',
        boxShadow: '0 0 0 2px #ccfbf1',
    },
    addressRadio: {
        marginRight: '12px',
        minWidth: '16px',
        minHeight: '16px',
        cursor: 'pointer'
    },
    addressLine: {
        fontSize: '0.95rem',
        color: '#1f2937',
        fontWeight: '500',
    },
    saveButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      fontSize: '0.875rem',
      cursor: isSaving || loadingData ? 'default' : 'pointer',
      backgroundColor: isSaving || loadingData ? '#6b7280' : '#10b981',
      color: 'white',
      transition: 'background-color 0.3s',
      boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4), 0 2px 4px -2px rgba(16, 185, 129, 0.4)',
    },
    message: {
      marginRight: '15px',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: saveMessage.includes('Error') ? '#ef4444' : '#047857',
    }
  };
  // --------------------------------------------------------

  if (loadingData) {
      return (
          <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
              <p style={{ fontSize: '1.5rem', color: '#4f46e5' }}>Loading user data and addresses...</p>
          </div>
      );
  }


  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.brand}>
          {/* Inline SVG Phone Icon */}
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
              <span style={styles.infoKey}>Customer Name</span>
              <span style={styles.infoVal}>{userName}</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoKey}>Call Number</span>
              <span style={styles.infoVal}>{phoneNumber}</span>
            </div>
            
            <div style={styles.infoRow}>
              <span style={styles.infoKey}>Subscription Status</span>
              <span style={styles.subscriptionBadge}>{subscriptionStatus}</span>
            </div>
            
            <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#9ca3af' }}>
              *Details for User ID: {currentId}
            </div>
          </div>
          
          <div style={{ ...styles.card, flex: 1 }}>
            <div style={styles.userInfoTitle}>Call History Summary</div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              *Implement history lookup here (e.g., last 3 tickets, products owned).
            </p>
          </div>
        </aside>

        {/* CONTENT AREA - Used for Note Taking and Address Selection */}
        <main style={styles.contentArea}>
          <h2 style={styles.title}>📝 Active Call Notes & Service Intake</h2>

          <div style={styles.card}>
            {/* Notes Section */}
            <textarea
              style={styles.notesTextarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Start taking notes on the user's request, issues, or actions taken..."
            />
            
            {/* Address Selection Section */}
            {addresses.length > 0 && (
                <div style={styles.addressSelector}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '15px' }}>
                        📍 Select Service Address:
                    </h3>
                    {addresses.map((address, index) => (
                        <div 
                            key={index}
                            style={{ 
                                ...styles.addressOption, 
                                ...(selectedAddress === address ? styles.addressSelected : {}) 
                            }}
                            onClick={() => setSelectedAddress(address)}
                        >
                            <input 
                                type="radio" 
                                name="serviceAddress" 
                                value={address} 
                                checked={selectedAddress === address}
                                onChange={() => setSelectedAddress(address)}
                                style={styles.addressRadio}
                            />
                            <span style={styles.addressLine}>{address}</span>
                        </div>
                    ))}
                </div>
            )}
            
            {addresses.length === 0 && !loadingData && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fef2f2', border: '1px dashed #f87171', borderRadius: '8px' }}>
                    <p style={{ color: '#991b1b', fontSize: '0.875rem', textAlign: 'center' }}>
                        No saved addresses found for this user. Please ask for their current location.
                    </p>
                </div>
            )}
            
            {/* Action Buttons */}
            <div style={{ marginTop: '20px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              {saveMessage && (
                <span style={styles.message}>{saveMessage}</span>
              )}
              <button 
                onClick={saveNotesAsTicket} 
                disabled={isSaving || loadingData}
                style={styles.saveButton}
              >
                {isSaving ? 'Saving...' : 'Save Notes & Select Service'}
              </button>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
