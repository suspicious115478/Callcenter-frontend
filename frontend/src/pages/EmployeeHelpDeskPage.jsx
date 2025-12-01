// src/pages/EmployeeHelpdeskPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header'; // Assuming you have a standard Header component

const styles = {
    container: {
        padding: '40px',
        backgroundColor: '#f3f4f6',
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '30px',
        maxWidth: '900px',
        margin: '20px auto',
    },
    title: {
        fontSize: '2rem',
        color: '#1f2937',
        borderBottom: '2px solid #3b82f6',
        paddingBottom: '10px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    info: {
        fontSize: '1.1rem',
        marginBottom: '15px',
        color: '#4b5563',
    },
    badge: {
        display: 'inline-block',
        backgroundColor: '#f97316', // Orange for internal
        color: 'white',
        padding: '6px 15px',
        borderRadius: '8px',
        fontWeight: '700',
        marginLeft: '15px'
    },
    actionButton: {
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '20px',
        transition: 'background-color 0.2s',
    }
};

export default function EmployeeHelpdeskPage() {
    const location = useLocation();
    const [phoneNumber, setPhoneNumber] = useState(null);

    useEffect(() => {
        // Parse query parameters from the URL
        const params = new URLSearchParams(location.search);
        const number = params.get('phoneNumber');
        if (number) {
            setPhoneNumber(number);
            console.log(`Employee Helpdesk loaded for phone: ${number}`);
        }
    }, [location]);

    // Dummy data fetch simulation
    const employeeData = phoneNumber ? {
        name: "Alice Johnson",
        employeeId: "EMP-4930",
        department: "IT Operations",
        lastTicket: "Password Reset Failure (ID 1092)",
    } : null;


    return (
        <div style={styles.container}>
            {/* You might want a dedicated employee header or the existing one */}
            <Header title="Employee Helpdesk" /> 
            
            <div style={styles.card}>
                <h2 style={styles.title}>
                    Employee Call Intake 📞 
                    <span style={styles.badge}>INTERNAL</span>
                </h2>
                
                {phoneNumber ? (
                    <div>
                        <p style={styles.info}>
                            **Calling Number:** **{phoneNumber}**
                        </p>
                        {employeeData && (
                            <>
                                <p style={styles.info}>
                                    **Name:** {employeeData.name}
                                </p>
                                <p style={styles.info}>
                                    **Employee ID:** {employeeData.employeeId}
                                </p>
                                <p style={styles.info}>
                                    **Department:** {employeeData.department}
                                </p>
                                <p style={styles.info}>
                                    **Last Ticket:** {employeeData.lastTicket}
                                </p>
                                <button style={styles.actionButton}>
                                    Create New IT Ticket
                                </button>
                                <button style={{...styles.actionButton, backgroundColor: '#3b82f6', marginLeft: '10px'}}>
                                    View Service History
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <p style={styles.info}>
                        Loading employee data or missing phone number in URL.
                    </p>
                )}
            </div>
        </div>
    );
}
