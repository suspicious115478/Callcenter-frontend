import React, { useState, useEffect } from 'react';
// 🎯 IMPORT useNavigate
import { useLocation, useNavigate } from 'react-router-dom'; 

// NOTE: Please replace this with your actual backend API base URL
// For example: 'http://localhost:3001/api'
const API_BASE_URL = 'http://localhost:3001/api'; 

// Using Emojis instead of custom SVG components
const PhoneIcon = () => <span style={{ fontSize: '1.25rem' }}>📞</span>; // Placeholder for header icon

// Define the services available for the user
const SERVICES = [
  // Emojis for service icons
  { name: 'Electrician', icon: '⚡', color: '#fcd34d', darkColor: '#b45309', description: 'Wiring, circuit repairs, and fixture installation.' }, // Amber/Yellow
  { name: 'Plumber', icon: '💧', color: '#60a5fa', darkColor: '#1d4ed8', description: 'Leaky pipes, drain cleaning, and water system fixes.' }, // Blue
  { name: 'Gardener', icon: '🌳', color: '#86efac', darkColor: '#15803d', description: 'Lawn care, planting, and landscape maintenance.' }, // Green
  { name: 'Carpenter', icon: '🔨', color: '#f97316', darkColor: '#7c2d12', description: 'Woodworking, furniture repair, and structural framing.' }, // Orange
  // 🎯 Note: Changed 'Driver' icon and fixed description typo
  { name: 'Driver', icon: '🚗', color: '#fca5a5', darkColor: '#b91c1c', description: 'Personal driving and vehicle assistance services.' }, // Red
  { name: 'Appliance Repair', icon: '🔧', color: '#fca5a5', darkColor: '#b91c1c', description: 'Fixing household appliances like washing machines and refrigerators.' }, // Red
  { name: 'HVAC Technician', icon: '❄️', color: '#93c5fd', darkColor: '#0c4a6e', description: 'Heating, ventilation, and air conditioning services.' }, // Sky Blue
];

// --- INLINE STYLES (MATCHING AGENT DASHBOARD) ---
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f3f4f6', // Light gray background
    color: '#111827',
  },
  header: {
    height: '64px',
    backgroundColor: '#1f2937', // Dark slate gray (from Dashboard)
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
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
  mainContent: {
    maxWidth: '1280px', // max-w-7xl approximation
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 16px',
    flex: 1,
    width: '100%',
  },
  card: { // General card style matching the Dashboard's sidebar and call cards
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s',
  },
  serviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  }
};

/**
 * Component for a single service card, now using inline styles and Emojis.
 */
const ServiceCard = ({ service, onClick }) => {
    // Style for the hover effect
    const [isHovered, setIsHovered] = useState(false);

    // Style for the icon container
    const iconContainerStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
      borderRadius: '50%',
      backgroundColor: service.color, // Theme color
      marginBottom: '16px',
      boxShadow: `0 4px 6px -1px ${service.darkColor}40`, // Custom shadow based on theme
    };

    // Card style with hover effects
    const cardStyle = {
        ...styles.card,
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          : styles.card.boxShadow
    };

    return (
      <div
        style={cardStyle}
        onClick={() => onClick(service)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={iconContainerStyle}>
          <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{service.icon}</span>
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>{service.name}</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{service.description}</p>
      </div>
    );
};


export default function UserServicesPage() {
  const location = useLocation(); // 👈 Get the location object
  // 🎯 Add useNavigate hook
  const navigate = useNavigate();
  
  // 👈 Extract state from location object
  const ticketId = location.state?.ticketId;
  const requestDetails = location.state?.requestDetails;
  // 🎯 CRITICAL: Extract the selectedAddressId
  const selectedAddressId = location.state?.selectedAddressId;

  // 🎯 NEW STATE: To store the fetched address line
  const [addressLine, setAddressLine] = useState('Fetching address...');
  const [fetchError, setFetchError] = useState(null);

  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isNavigated, setIsNavigated] = useState(false); // To simulate navigation away

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🎯 NEW EFFECT: Fetch the address when selectedAddressId is available
  useEffect(() => {
    if (!selectedAddressId) {
        setAddressLine('No Address ID provided.');
        return;
    }

    const fetchAddress = async () => {
        try {
            // Using the new backend route
            const response = await fetch(`${API_BASE_URL}/call/address/lookup/${selectedAddressId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update state with the fetched address line
            setAddressLine(data.address_line); 
            setFetchError(null);

        } catch (error) {
            console.error("Error fetching address:", error);
            setAddressLine('Error loading address.');
            setFetchError(error.message);
        }
    };

    fetchAddress();
  }, [selectedAddressId]); // Dependency array ensures it runs when the ID changes


  // Handle service selection
  const handleServiceSelect = (service) => {
    
    // 🎯 CRITICAL FIX: Navigate to the servicemen selection page
    navigate('/user/servicemen', {
        state: {
            ticketId: ticketId,
            requestDetails: requestDetails,
            selectedAddressId: selectedAddressId,
            serviceName: service.name, // Pass the chosen service name
        }
    });
  };

  // Check if required data is missing from the state
  if (!ticketId || !requestDetails || !selectedAddressId) {
      return (
        <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444', marginBottom: '16px' }}>Error: Required Details Missing</h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Please ensure the ticket ID and a valid address are passed from the Dashboard.</p>
        </div>
      );
  }

  return (
    <div style={styles.container}>

      {/* HEADER (Matching Dashboard Style) */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <PhoneIcon />
          <span>CC Agent Console: Service Assignment</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.clock}>{currentTime}</span>
          <div style={styles.avatar}>AG</div>
        </div>
      </header>

      {/* Confirmation Message Box - Removed for navigation flow, but kept structure */}
      {confirmationMessage && (<div /* ... styles ... */ >{confirmationMessage}</div>)}

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContent}>

        <div style={{ display: 'flex', flexDirection: window.innerWidth > 1024 ? 'row' : 'column', gap: '32px' }}>

          {/* Left Side: Agent's Notes/Request Summary Card (Styled as a Sidebar Card) */}
          <div style={{ width: window.innerWidth > 1024 ? '33.333%' : '100%' }}>
            <div style={styles.card}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                Request Details
              </h2>

              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
                Ticket ID: <span style={{ fontFamily: 'monospace', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: '#4f46e5', fontWeight: '600' }}>{ticketId}</span>
              </p>
              
              {/* 🎯 UPDATED: Display the Selected Address ID and the Address Line */}
              <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
                      Address ID: <span style={{ fontFamily: 'monospace', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: '#4f46e5', fontWeight: '600' }}>{selectedAddressId}</span>
                  </p>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      Full Address:
                  </h4>
                  <p style={{ color: fetchError ? '#ef4444' : '#374151', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                      {addressLine}
                  </p>
              </div>

              <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6', minHeight: '100px', marginTop: '16px' }}>
                <p style={{ color: '#374151', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.9rem' }}>
                  {requestDetails}
                </p>
              </div>

              <p style={{ marginTop: '16px', fontSize: '0.75rem', color: '#9ca3af' }}>
                Review the notes and select the appropriate service below to find matching servicemen.
              </p>
            </div>
          </div>

          {/* Right Side: Service Selection Grid (Main Content Area) */}
          <div style={{ width: window.innerWidth > 1024 ? '66.666%' : '100%' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '24px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
              Select Service Category
            </h1>
            <div style={styles.serviceGrid}>
              {SERVICES.map((service) => (
                <ServiceCard
                  key={service.name}
                  service={service}
                  onClick={handleServiceSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
