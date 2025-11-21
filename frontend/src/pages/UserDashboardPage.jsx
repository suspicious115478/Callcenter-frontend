import React from 'react';
import { useParams } from 'react-router-dom';

export default function UserDashboardPage() {
    const { phoneNumber } = useParams();
    
    return (
        <div>
            <h1>Verified User Dashboard</h1>
            <p>Welcome, Agent! Displaying details for verified user:</p>
            <p>Phone Number: <strong>{phoneNumber}</strong></p>
            {/* Add user info, subscription status, history lookup, etc. here */}
        </div>
    );
}