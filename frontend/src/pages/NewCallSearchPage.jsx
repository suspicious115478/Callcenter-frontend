import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Configuration: Adjust your API base URL here
const API_BASE_URL = 'https://callcenter-baclend.onrender.com'; // Or whatever your backend port is

// Static list of services (since no API was provided for this specific list)
const MEDICAL_SERVICES = [
    { id: 'ambulance', label: '🚑 Emergency Ambulance' },
    { id: 'general_physician', label: '👨‍⚕️ General Physician Visit' },
    { id: 'nurse', label: '👩‍⚕️ Nursing Assistance' },
    { id: 'oxygen', label: '💨 Oxygen Cylinder Delivery' },
];

export default function NewCallSearchPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    
    // State for Search
    const [phoneNumber, setPhoneNumber] = useState(queryParams.get('caller') || '');
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for User Data
    const [userId, setUserId] = useState(null);
    const [addresses, setAddresses] = useState([]);
    
    // State for Selection
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [dispatchLoading, setDispatchLoading] = useState(false);

    // 1. Function to Find Member ID by Phone
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        setSearchLoading(true);
        setUserId(null);
        setAddresses([]);

        try {
            const response = await fetch(`${API_BASE_URL}/memberid/lookup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber }) // Matches your route: getMemberIdByPhoneNumber
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Member not found');
            }

            // Assuming the API returns { userId: "..." }
            setUserId(data.userId); 
            
            // Once we have ID, immediately fetch addresses
            fetchAddresses(data.userId);

        } catch (err) {
            setError(err.message);
        } finally {
            setSearchLoading(false);
        }
    };

    // 2. Function to Fetch Addresses by User ID
    const fetchAddresses = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/address/${id}`); // Matches your route: getAddressByUserId
            const data = await response.json();

            if (response.ok) {
                setAddresses(data.addresses || []);
            } else {
                console.error("Failed to load addresses:", data.message);
            }
        } catch (err) {
            console.error("Error fetching addresses:", err);
        }
    };

    // 3. Function to Dispatch Service
    const handleDispatch = async () => {
        if (!userId || !selectedAddressId || !selectedService) {
            alert("Please select an address and a service.");
            return;
        }

        setDispatchLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/dispatch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    addressId: selectedAddressId,
                    serviceType: selectedService,
                    callerNumber: phoneNumber
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Success! Dispatch Ticket #${data.ticketId || 'Created'}`);
                // Navigate to a success page or dashboard
                // navigate('/dashboard'); 
            } else {
                alert(`Dispatch Failed: ${data.message}`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setDispatchLoading(false);
        }
    };

    // Auto-search if phone number is present in URL on load
    useEffect(() => {
        if (phoneNumber && !userId) {
            // Optional: Uncomment below if you want it to auto-search on page load
            // handleSearch();
        }
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1>New Call Intake</h1>
            
            {/* --- SECTION 1: SEARCH --- */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h3>1. Identify Subscriber</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter Phone Number"
                        style={{ padding: '8px', flex: 1 }}
                    />
                    <button 
                        onClick={handleSearch} 
                        disabled={searchLoading}
                        style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        {searchLoading ? 'Searching...' : 'Search Member'}
                    </button>
                </div>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                {userId && <p style={{ color: 'green', marginTop: '10px' }}><strong>User Found! ID:</strong> {userId}</p>}
            </div>

            {userId && (
                <>
                    {/* --- SECTION 2: SELECT ADDRESS --- */}
                    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                        <h3>2. Select Emergency Location</h3>
                        {addresses.length === 0 ? (
                            <p>No addresses found for this user.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {addresses.map((addr) => (
                                    <label 
                                        key={addr.address_id} 
                                        style={{ 
                                            padding: '10px', 
                                            border: selectedAddressId === addr.address_id ? '2px solid #007bff' : '1px solid #eee',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            backgroundColor: selectedAddressId === addr.address_id ? '#f0f8ff' : '#fff'
                                        }}
                                    >
                                        <input 
                                            type="radio" 
                                            name="address" 
                                            value={addr.address_id} 
                                            checked={selectedAddressId === addr.address_id}
                                            onChange={() => setSelectedAddressId(addr.address_id)}
                                            style={{ marginRight: '10px' }}
                                        />
                                        {addr.address_line}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- SECTION 3: SELECT SERVICE --- */}
                    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                        <h3>3. Select Medical Service</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {MEDICAL_SERVICES.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => setSelectedService(service.id)}
                                    style={{
                                        padding: '15px',
                                        border: selectedService === service.id ? '2px solid #dc3545' : '1px solid #ccc',
                                        backgroundColor: selectedService === service.id ? '#fff5f5' : 'white',
                                        color: selectedService === service.id ? '#dc3545' : 'black',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        borderRadius: '5px'
                                    }}
                                >
                                    {service.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- SECTION 4: ACTION --- */}
                    <button 
                        onClick={handleDispatch}
                        disabled={dispatchLoading || !selectedAddressId || !selectedService}
                        style={{
                            width: '100%',
                            padding: '15px',
                            backgroundColor: dispatchLoading ? '#ccc' : '#dc3545',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: dispatchLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {dispatchLoading ? 'Dispatching...' : '🚨 DISPATCH EMERGENCY SERVICE'}
                    </button>
                </>
            )}
        </div>
    );
}

