import React, { useState, useEffect } from 'react';

// FIXED: Added the trailing slash to the BACKEND_URL to ensure correct path concatenation.
const BACKEND_URL = "https://callcenter-baclend.onrender.com/"; 

// Since react-router-dom/useParams cannot be imported in a single file environment, 
// we mock the necessary data (phoneNumber) for demonstration.
const MOCKED_PHONE_NUMBER = "555-0123-4567";

// The component is renamed to 'App' for execution in this environment.
export default function App() {
    // Mocked phone number instead of using useParams()
    const phoneNumber = MOCKED_PHONE_NUMBER; 
    
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    
    // Form state
    const [notes, setNotes] = useState("");
    const [category, setCategory] = useState("support");
    const [isSaving, setIsSaving] = useState(false); // For button loading state
    const [error, setError] = useState(null); // For custom error notification

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Sends data to backend with robust error handling for empty/malformed responses
    const handleSaveNotes = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        
        if (!notes.trim()) {
            setError("Please enter some notes before saving.");
            return;
        }

        setIsSaving(true);

        try {
            // FIX APPLIED HERE: BACKEND_URL now ends with a slash, fixing the 
            // ERR_NAME_NOT_RESOLVED issue from the malformed URL.
            const response = await fetch(`${BACKEND_URL}api/logs/save`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: phoneNumber,
                    category: category,
                    notes: notes,
                    agentName: "Agent JD"  
                })
            });

            // 1. Check for non-200 status codes first
            if (!response.ok) {
                const errorDetail = await response.text();
                const errorMessage = errorDetail ? errorDetail.substring(0, 100) : "No error details provided.";
                throw new Error(`Server Error (${response.status}): ${errorMessage}...`);
            }

            // 2. Safely handle JSON parsing or empty body (Supabase/Serverless fix)
            let result;
            const text = await response.text();

            if (!text) {
                // If the server returns a successful status (e.g., 201 Created or 204 No Content) 
                // but with an empty body, we assume success.
                result = { success: true, message: "No content returned, assuming successful save." };
                console.warn("Received successful status with empty body. Assuming success and proceeding.");
            } else {
                // If content exists, attempt to parse it as JSON
                try {
                    result = JSON.parse(text);
                } catch (e) {
                    throw new Error(`Invalid JSON format in response: ${e.message}`);
                }
            }
            
            // 3. Check for application-level success flag
            if (result.success) {
                console.log("Request logged successfully. Simulating navigation to services page.");
                
                // Instead of window.location.href (which relies on routing), 
                // we show a success message in this static environment.
                setError("✅ Successfully logged request! Redirect simulation to User Services page.");

                // Clear form after successful submission
                setNotes(""); 
                setCategory("support");

            } else {
                // Handle cases where the server returned JSON but with success: false
                console.error("Failed to save log:", result.message);
                setError("❌ Failed to save log: " + (result.message || "Unknown error occurred."));
            }
        } catch (err) {
            console.error("Save Error:", err.message);
            setError(`❌ ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Tailwind Classes Equivalent (Simplified) ---
    // Using inline styles for readability in this React single-file context
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            fontFamily: '"Inter", sans-serif',
            backgroundColor: '#f3f4f6', // gray-100
            color: '#111827', // gray-900
        },
        header: {
            height: '64px',
            backgroundColor: '#1f2937', // gray-800
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 20,
        },
        brand: {
            fontSize: '1.25rem', // text-xl
            fontWeight: '700', // font-bold
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
            color: '#9ca3af', // gray-400
            fontSize: '0.95rem',
        },
        avatar: {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#374151', // gray-700
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: '600',
            border: '2px solid #4b5563', // gray-600
        },
        main: {
            display: 'flex',
            flex: 1,
            overflow: 'auto',
            padding: '32px',
            gap: '32px',
            flexWrap: 'wrap', // Responsive wrapping for mobile
        },
        leftPanel: {
            flex: '1',
            minWidth: '350px', // Ensures usability on smaller screens
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
        },
        rightPanel: {
            width: '380px',
            minWidth: '300px',
            flexGrow: 1, // Allows panel to grow on smaller screens
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb', // gray-200
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
        },
        cardHeader: {
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        cardTitle: {
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            margin: 0,
        },
        cardBody: {
            padding: '24px',
        },
        verifiedBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '600',
            backgroundColor: '#ecfdf5', // green-50
            color: '#047857', // green-700
            border: '1px solid #a7f3d0', // green-200
        },
        detailRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px',
            fontSize: '0.95rem',
        },
        detailLabel: {
            color: '#6b7280', // gray-500
        },
        detailValue: {
            fontWeight: '600',
            color: '#111827',
        },
        formGroup: {
            marginBottom: '20px',
        },
        label: {
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151', // gray-700
            marginBottom: '8px',
        },
        select: {
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '0.95rem',
            backgroundColor: 'white',
            cursor: 'pointer',
        },
        textarea: {
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '0.95rem',
            minHeight: '120px',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
        },
        saveButton: {
            backgroundColor: isSaving ? '#93c5fd' : '#2563eb', // blue-400 / blue-600
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            width: '100%',
            marginTop: '10px',
        },
        activityItem: {
            padding: '12px 0',
            borderBottom: '1px solid #f3f4f6',
            fontSize: '0.9rem',
        },
        activityTime: {
            fontSize: '0.75rem',
            color: '#9ca3af',
            marginBottom: '4px',
        },
        errorBox: {
            // General alert style
            backgroundColor: error && error.startsWith("✅") ? '#ecfdf5' : '#fef2f2', // green-50 / red-50
            border: error && error.startsWith("✅") ? '1px solid #a7f3d0' : '1px solid #fca5a5', // green-200 / red-300
            color: error && error.startsWith("✅") ? '#047857' : '#dc2626', // green-700 / red-700
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
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
                {/* LEFT PANEL: INTAKE FORM */}
                <div style={styles.leftPanel}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>📝 New Request Intake</h2>
                            <div style={styles.verifiedBadge}>
                                <span>✓ Verified Subscriber</span>
                            </div>
                        </div>
                        <div style={styles.cardBody}>
                            {error && <div style={styles.errorBox}>{error}</div>}
                            <form onSubmit={handleSaveNotes}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Request Category</label>
                                    <select 
                                        style={styles.select}
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="support">Technical Support</option>
                                        <option value="billing">Billing Inquiry</option>
                                        <option value="upgrade">Plan Upgrade</option>
                                        <option value="cancellation">Cancellation Request</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Call Notes & Request Details</label>
                                    <textarea 
                                        style={styles.textarea}
                                        placeholder="Type detailed notes about the customer's request here..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    style={styles.saveButton}
                                    onMouseOver={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#1d4ed8')} // blue-700
                                    onMouseOut={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#2563eb')} // blue-600
                                >
                                    {isSaving ? "Saving..." : "Save Request Log & Select Service"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: USER DETAILS & HISTORY */}
                <div style={styles.rightPanel}>
                    {/* CUSTOMER PROFILE CARD */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Customer Profile</h2>
                        </div>
                        <div style={styles.cardBody}>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Phone Number</span>
                                <span style={styles.detailValue}>{phoneNumber}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Status</span>
                                <span style={{color: '#059669', fontWeight: '700'}}>Active</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Member Since</span>
                                <span style={styles.detailValue}>Jan 2024</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Current Plan</span>
                                <span style={styles.detailValue}>Premium</span>
                            </div>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY CARD */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Recent History</h2>
                        </div>
                        <div style={styles.cardBody}>
                            <div style={styles.activityItem}>
                                <div style={styles.activityTime}>Today, 10:30 AM</div>
                                <div><strong>System Check:</strong> Auto-verified subscription status via IVR.</div>
                            </div>
                            <div style={styles.activityItem}>
                                <div style={styles.activityTime}>Yesterday</div>
                                <div><strong>Billing:</strong> Invoice #4492 generated.</div>
                            </div>
                            <div style={styles.activityItem}>
                                <div style={{...styles.activityTime, borderBottom: 'none'}}>2 days ago</div>
                                <div><strong>Login:</strong> Successful web login.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
