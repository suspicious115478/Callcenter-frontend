import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Simple Icons
const CalendarIcon = () => <span>📅</span>;
const ClockIcon = () => <span>⏰</span>;

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        fontFamily: '"Inter", -apple-system, sans-serif',
        backgroundColor: '#f3f4f6',
        color: '#111827',
    },
    header: {
        height: '64px',
        backgroundColor: '#1f2937',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    },
    mainContent: {
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        padding: '32px 16px',
        display: 'flex',
        gap: '32px',
        flexDirection: window.innerWidth > 1024 ? 'row' : 'column',
    },
    card: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
        height: 'fit-content',
    },
    contextHighlight: {
        fontFamily: 'monospace',
        backgroundColor: '#eef2ff',
        padding: '2px 8px',
        borderRadius: '4px',
        color: '#4f46e5',
        fontWeight: '600'
    },
    timeSlotGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '12px',
        marginTop: '16px',
    },
    timeSlot: {
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: 'white',
        transition: 'all 0.2s',
    },
    timeSlotSelected: {
        backgroundColor: '#4f46e5',
        color: 'white',
        borderColor: '#4f46e5',
        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
    },
    inputDate: {
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        width: '100%',
        fontSize: '1rem',
        marginTop: '8px',
        fontFamily: 'inherit',
    },
    confirmBtn: {
        width: '100%',
        backgroundColor: '#4f46e5',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        cursor: 'pointer',
        marginTop: '32px',
        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)',
    }
};

// Mock Time Slots
const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM'
];

export default function SchedulingPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract all parameters passed from Services Page
    const { ticketId, requestDetails, selectedAddressId, phoneNumber, serviceName } = location.state || {};

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        return () => clearInterval(timer);
    }, []);

    const handleConfirmSchedule = () => {
        if (!selectedDate || !selectedTime) {
            alert("Please select both a Date and a Time.");
            return;
        }

        // Navigate to ServiceManSelectionPage with the NEW schedule parameter
        // plus all the old parameters
        navigate('/user/servicemen', {
            state: {
                ticketId,
                requestDetails,
                selectedAddressId,
                phoneNumber,
                serviceName,
                // ⭐️ New Parameter: The scheduled time
                scheduledDateTime: `${selectedDate} ${selectedTime}`,
                isScheduled: true 
            }
        });
    };

    if (!serviceName) {
         return <div style={{padding: 20}}>Error: No service selected. Go back.</div>;
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', gap: '10px' }}>
                    <CalendarIcon /> CC Agent Console: Scheduling
                </div>
                <div>{currentTime}</div>
            </header>

            <div style={styles.mainContent}>
                
                {/* Left Side: Summary Context (Same as Service Page for consistency) */}
                <div style={{ width: window.innerWidth > 1024 ? '35%' : '100%' }}>
                    <div style={styles.card}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                            📋 Appointment Details
                        </h2>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>Service Requested</label>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827' }}>{serviceName}</div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>Customer</label>
                            <div style={styles.contextHighlight}>{phoneNumber}</div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280' }}>Ticket ID</label>
                            <div style={{ fontSize: '0.9rem' }}>{ticketId}</div>
                        </div>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af' }}>NOTES</label>
                            <p style={{ fontSize: '0.9rem', color: '#374151', marginTop: '4px' }}>{requestDetails}</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Scheduling Form */}
                <div style={{ width: window.innerWidth > 1024 ? '65%' : '100%' }}>
                    <div style={styles.card}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '24px' }}>
                            Schedule Appointment
                        </h1>

                        {/* Date Selection */}
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#374151' }}>
                                <CalendarIcon /> Select Date
                            </label>
                            <input 
                                type="date" 
                                style={styles.inputDate}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]} // Disable past dates
                            />
                        </div>

                        {/* Time Selection */}
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#374151' }}>
                                <ClockIcon /> Select Time Slot
                            </label>
                            <div style={styles.timeSlotGrid}>
                                {TIME_SLOTS.map(time => (
                                    <div 
                                        key={time}
                                        style={selectedTime === time ? { ...styles.timeSlot, ...styles.timeSlotSelected } : styles.timeSlot}
                                        onClick={() => setSelectedTime(time)}
                                    >
                                        {time}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ color: '#6b7280' }}>Chosen Slot:</span>
                                <span style={{ fontWeight: 'bold', color: '#4f46e5', fontSize: '1.1rem' }}>
                                    {selectedDate ? selectedDate : '...'} @ {selectedTime ? selectedTime : '...'}
                                </span>
                            </div>
                            
                            <button 
                                style={{
                                    ...styles.confirmBtn,
                                    opacity: (selectedDate && selectedTime) ? 1 : 0.5,
                                    cursor: (selectedDate && selectedTime) ? 'pointer' : 'not-allowed'
                                }}
                                onClick={handleConfirmSchedule}
                                disabled={!selectedDate || !selectedTime}
                            >
                                Confirm Schedule & Find Serviceman →
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
