// src/components/Header.jsx
import React from 'react';

const styles = {
    header: {
        backgroundColor: '#1f2937', // Dark slate gray (consistent with AgentDashboard)
        color: 'white',
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: '700',
        margin: 0,
        letterSpacing: '0.05em',
    },
    // Simple placeholder for right-side elements
    rightContent: {
        fontSize: '0.875rem',
        color: '#9ca3af',
    }
};

/**
 * A basic header component for internal pages.
 * @param {object} props - Component props
 * @param {string} props.title - The main title to display in the header.
 */
export default function Header({ title = "Customer Support Console" }) {
    return (
        <header style={styles.header}>
            <h1 style={styles.title}>{title}</h1>
            <div style={styles.rightContent}>
                Agent View
            </div>
        </header>
    );
}
