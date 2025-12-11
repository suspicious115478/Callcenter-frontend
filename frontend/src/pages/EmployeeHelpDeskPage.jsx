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

    const [noteText, setNoteText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

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
                    if (userResponse.status === 404) throw new Error("Employee not found (404).");
                    throw new Error(`Failed to fetch employee details. Status: ${userResponse.status}`);
                }

                const employeeDetails = await userResponse.json();
                const employeeId = employeeDetails.user_id;

                if (!employeeId) {
                    setFetchError("Employee ID not resolved.");
                    setIsFetchingData(false);
                    return;
                }

                const dispatchUrl = `${BACKEND_URL}/call/dispatch/active-order?user_id=${employeeId}`;
                const dispatchResponse = await fetch(dispatchUrl);

                if (!dispatchResponse.ok) {
                    throw new Error(`Failed to fetch active dispatch. Status: ${dispatchResponse.status}`);
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

    const handleCancelTicket = async () => {
        const orderId = currentDispatchData.order_id;
        const serviceCategory = currentDispatchData.category;
        const requestAddress = currentDispatchData.request_address;
        const phoneNumber = currentDispatchData.phone_number;
        const ticketId = currentDispatchData.ticket_id;

        if (!orderId) {
            alert("No active ticket ID found to cancel.");
            return;
        }
        if (!noteText.trim()) {
            alert("⚠️ Please enter a reason for cancellation in the note box.");
            return;
        }
        if (!window.confirm("⚠️ Are you sure you want to CANCEL this ticket?\n\nThis will update the status to 'Cancelled' and redirect you to assign a new technician.")) {
            return;
        }

        setIsProcessing(true);

        try {
            const response = await fetch(`${BACKEND_URL}/call/dispatch/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    cancellation_reason: noteText
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to cancel order");
            }

            alert("✅ Ticket Cancelled Successfully. Redirecting to Technician Selection...");
            
            // 🔥 FIXED NAVIGATION: Use correct prop names
            navigate('/user/servicemen', {
                state: {
                    // ✅ CRITICAL FIX: Use 'previousOrderId' instead of 'orderId'
                    previousOrderId: orderId,
                    
                    // ✅ Pass all required context data
                    category: serviceCategory,
                    serviceName: serviceCategory,
                    request_address: requestAddress,
                    phoneNumber: phoneNumber,
                    callerNumber: phoneNumber,
                    ticketId: ticketId,
                    
                    // ✅ Pass cancellation details
                    cancellationReason: noteText,
                    previousEmployeeId: currentDispatchData.user_id
                }
            });

        } catch (error) {
            console.error("Cancel Error:", error);
            alert(`❌ Error cancelling ticket: ${error.message}`);
            setIsProcessing(false);
        }
    };

    const styles = {
        container: {
            display: 'flex', flexDirection: 'column', height: '100vh',
            fontFamily: '"Inter", sans-serif', backgroundColor: '#f3f4f6', color: '#111827', overflow: 'hidden',
        },
        header: {
            height: '64px', backgroundColor: '#1f2937', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 20,
        },
        brand: { fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '10px' },
        headerRight: { display: 'flex', alignItems: 'center', gap: '24px' },
        clock: { fontFamily: 'monospace', color: '#9ca3af', fontSize: '0.95rem' },
        
        mainContentArea: { flex: 1, padding: '32px 0', overflowY: 'auto' },
        centeredContainer: { maxWidth: '900px', margin: '0 auto', padding: '0 24px' },
        
        pageHeader: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            backgroundColor: 'white', padding: '24px', marginBottom: '32px',
            borderRadius: '12px', borderLeft: '8px solid #3b82f6', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
        title: { fontSize: '1.5rem', fontWeight: '700', color: '#111827' },
        subtitle: { fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' },
        callInfo: { textAlign: 'right', border: '2px solid #3b82f6', padding: '10px 15px', borderRadius: '8px', backgroundColor: '#eff6ff' },
        phoneNumber: { fontSize: '2.5rem', fontWeight: '800', color: '#1d4ed8', letterSpacing: '0.05em' },
        customerName: { fontSize: '1rem', fontWeight: '600', color: '#4b5563', marginTop: '4px' },

        contentStack: { display: 'flex', flexDirection: 'column', gap: '32px' },

        card: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' },
        cardTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '16px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' },

        ticketCard: { border: '1px solid #d1d5db', borderRadius: '10px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' },
        ticketHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #d1d5db', paddingBottom: '15px', marginBottom: '15px' },
        ticketID: { fontSize: '1.5rem', fontWeight: '800', color: '#1d4ed8', fontFamily: 'monospace' },
        ticketStatus: (status) => ({ padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '0.875rem', backgroundColor: status.bg, color: status.text }),
        
        detailRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 20px', marginBottom: '10px' },
        detailItem: { padding: '8px 0', borderBottom: '1px solid #f3f4f6' },
        detailLabel: { display: 'block', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '2px' },
        detailValue: { fontSize: '1rem', fontWeight: '500', color: '#111827' },
        fullDetail: { marginTop: '15px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' },
        requestText: { fontSize: '0.95rem', color: '#4b5563', fontStyle: 'italic', marginTop: '8px' },

        inputField: { width: '100%', minHeight: '150px', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.95rem', marginBottom: '16px', resize: 'vertical', boxSizing: 'border-box' },
        
        buttonRow: { display: 'flex', gap: '15px', marginTop: '10px' },
        
        saveButton: { flex: 1, backgroundColor: '#2563eb', color: 'white', fontWeight: '700', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' },
        
        cancelButton: { 
            flex: 1, 
            backgroundColor: '#dc2626',
            color: 'white', 
            fontWeight: '800', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            border: '2px solid #991b1b', 
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'background-color 0.2s'
        },
        
        buttonGroup: { display: 'flex', gap: '16px', marginTop: '24px' },
        primaryButton: { flex: 1, backgroundColor: '#3b82f6', color: 'white', fontWeight: '700', padding: '14px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' },
        secondaryButton: { flex: 1, backgroundColor: '#10b981', color: 'white', fontWeight: '700', padding: '14px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' },

        colorMap: {
            blue: { text: '#2563eb', bg: '#eff6ff' },
            purple: { text: '#7e22ce', bg: '#f5f3ff' },
            yellow: { text: '#ca8a04', bg: '#fffbeb' },
            green: { text: '#059669', bg: '#ecfdf5' },
            red: { text: '#dc2626', bg: '#fee2e2' },
            gray: { text: '#4b5563', bg: '#f9fafb' }
        }
    };
    const c = styles.colorMap;

    const renderDispatchContent = () => {
        if (isFetchingData) return <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>⏳ Fetching active dispatch ticket details...</div>;
        if (fetchError) return <div style={{ textAlign: 'center', padding: '40px 0', color: c.red.text, backgroundColor: c.red.bg, borderRadius: '8px', border: '1px solid #fca5a5' }}>🛑 **Error:** {fetchError}.</div>;
        if (!currentDispatchData || Object.keys(currentDispatchData).length === 0) return <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>ℹ️ **No active dispatch** record found.</div>;

        const getStatusColor = (status) => {
            switch ((status || '').toLowerCase()) {
                case 'completed': case 'resolved': return c.green;
                case 'pending': case 'in-progress': return c.yellow;
                case 'cancelled': return c.red;
                default: return c.blue;
            }
        };

        const statusStyle = getStatusColor(currentDispatchData.order_status);

        return (
            <div style={styles.ticketCard}>
                <div style={styles.ticketHeader}>
                    <div>
                        <span style={styles.detailLabel}>TICKET / ORDER ID</span>
                        <div style={styles.ticketID}>{currentDispatchData.order_id || 'N/A'}</div>
                    </div>
                    <div style={styles.ticketStatus(statusStyle)}>
                        {currentDispatchData.order_status ? currentDispatchData.order_status.toUpperCase() : 'UNKNOWN'}
                    </div>
                </div>
                <div style={styles.detailRow}>
                    <div style={styles.detailItem}><span style={styles.detailLabel}>Assigned Employee ID</span><span style={styles.detailValue}>**{currentDispatchData.user_id || 'N/A'}**</span></div>
                    <div style={styles.detailItem}><span style={styles.detailLabel}>Service Category</span><span style={styles.detailValue}>**{currentDispatchData.category || 'N/A'}**</span></div>
                    <div style={styles.detailItem}><span style={styles.detailLabel}>Dispatch Date</span><span style={styles.detailValue}>{currentDispatchData.dispatched_at ? new Date(currentDispatchData.dispatched_at).toLocaleDateString() : 'N/A'}</span></div>
                    <div style={styles.detailItem}><span style={styles.detailLabel}>Customer Contact</span><span style={styles.detailValue}>{currentDispatchData.phone_number || 'N/A'}</span></div>
                </div>
                <div style={styles.fullDetail}><span style={styles.detailLabel}>Service Address</span><p style={styles.detailValue}>{currentDispatchData.request_address || 'N/A'}</p></div>
                <div style={styles.fullDetail}><span style={styles.detailLabel}>Employee's Last Note/Request</span><p style={styles.requestText}>"{currentDispatchData.order_request || 'No specific note or request filed.'}"</p></div>
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.brand}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <span>CC Agent Console</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.clock}>⏰ {currentTime}</span>
                    <button style={{ backgroundColor: '#f87171', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s', marginLeft: '15px' }} onClick={() => navigate('/dashboard')}>
                        ⬅️ Dashboard
                    </button>
                </div>
            </header>

            <div style={styles.mainContentArea}>
                <div style={styles.centeredContainer}>

                    <header style={styles.pageHeader}>
                        <div>
                            <h1 style={styles.title}>📞 Employee Help Desk - Live Call</h1>
                            <p style={styles.subtitle}>Automatically fetched details for the active caller.</p>
                        </div>
                        <div style={styles.callInfo}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1d4ed8', marginBottom: '4px' }}>INCOMING CALL FROM:</div>
                            <div style={styles.phoneNumber}>📱 {callerNumber || "N/A"}</div>
                            <div style={styles.customerName}>Employee: **{customerName || "Serviceman"}**</div>
                        </div>
                    </header>

                    <div style={styles.contentStack}>

                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>📦 Current Active Ticket Details</h2>
                            {renderDispatchContent()}
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>💬 Resolution & Cancellation</h3>
                            
                            <p style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '10px'}}>
                                To <b>Cancel</b> this ticket, please write the reason below and click the red Cancel button.
                            </p>

                            <textarea
                                style={styles.inputField}
                                rows="8"
                                placeholder="Reason for cancellation (Required) OR General Notes..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                            ></textarea>

                            <div style={styles.buttonRow}>
                                <button style={styles.saveButton} disabled={isProcessing}>
                                    💾 Save Note Only
                                </button>

                                <button 
                                    style={styles.cancelButton} 
                                    onClick={handleCancelTicket}
                                    disabled={isProcessing || !currentDispatchData.order_id}
                                >
                                    {isProcessing ? 'Processing...' : '🚫 CANCEL & REASSIGN'}
                                </button>
                            </div>
                        </div>

                        <div style={styles.buttonGroup}>
                            <button style={styles.primaryButton}>📝 **Open Full Order History**</button>
                            <button style={styles.secondaryButton}>🗺️ **Track Location / Live Map**</button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeHelpDeskPage;
