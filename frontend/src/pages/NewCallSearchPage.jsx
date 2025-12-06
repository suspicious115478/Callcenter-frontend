import React from 'react';
import { useLocation } from 'react-router-dom';

export default function NewCallSearchPage() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const caller = queryParams.get('caller');
    
    return (
        <div>
            <h1>New Call Intake</h1>
            <p>Caller is not a verified subscriber. Please search for the customer or create a new profile.</p>
            <p>Incoming Caller ID: <strong>{caller}</strong></p>
            {/* Add your search form/component here */}
        </div>
    );
}
