import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// 🚨 FIX THE TYPO AND VERIFY THE PATH! Assuming 'backend' is correct.
const API_BASE_URL = 'https://callcenter-backend.onrender.com/call'; 

// Static list of services (unchanged)
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
        
        // 🔍 LOG: Starting Search
        console.log(`[SEARCH] Starting search for phone: ${phoneNumber}`);
        
        setError(null);
        setSearchLoading(true);
        setUserId(null);
        setAddresses([]);

        try {
            const url = `${API_BASE_URL}/memberid/lookup`;
            // 🔍 LOG: Request Details
            console.log(`[SEARCH] POST Request to: ${url}`);
            console.log(`[SEARCH] Request Body: ${JSON.stringify({ phoneNumber })}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber })
            });

            // 🔍 LOG: Response Status
            console.log(`[SEARCH] Response Status: ${response.status}`);
            
            const data = await response.json();
            // 🔍 LOG: Full API Response Data
            console.log(`[SEARCH] Full response data received:`, data);

            if (!response.ok) {
                // 🔍 LOG: API Error
                console.error(`[SEARCH] API Error: ${data.message}`);
                throw new Error(data.message || 'Member not found');
            }

            // --- CRITICAL CHECK POINT ---
            const memberId = data.userId || data.memberId || data.id; // Check common property names

            if (!memberId) {
                // 🔍 LOG: userId Missing
                console.error("[SEARCH] CRITICAL: Member ID not found in response data. Check backend property name.");
                throw new Error("Could not find Member ID in API response.");
            }
            // 🔍 LOG: userId Found
            console.log(`[SEARCH] Member ID successfully extracted: ${memberId}`);

            setUserId(memberId); 
            
            // Once we have ID, immediately fetch addresses
            fetchAddresses(memberId);

        } catch (err) {
            // 🔍 LOG: Search Exception
            console.error("[SEARCH] Exception occurred during handleSearch:", err.message);
            setError(err.message);
        } finally {
            setSearchLoading(false);
            // 🔍 LOG: Search Finished
            console.log(`[SEARCH] Search process finished. userId state: ${userId}`);
        }
    };

    // 2. Function to Fetch Addresses by User ID
    const fetchAddresses = async (id) => {
        // 🔍 LOG: Starting Address Fetch
        console.log(`[ADDRESS] Starting fetchAddresses for ID: ${id}`);
        
        if (!id) {
            // 🔍 LOG: Invalid ID Check (This confirms the root issue if this runs)
            console.error("[ADDRESS] CANCELLING REQUEST: ID is null or undefined. The previous step failed to retrieve it.");
            setError("Cannot fetch addresses: User ID is missing.");
            return;
        }

        try {
            const url = `${API_BASE_URL}/address/${id}`;
            // 🔍 LOG: Request URL
            console.log(`[ADDRESS] GET Request to: ${url}`);

            const response = await fetch(url); // Matches your route: getAddressByUserId
            
            // 🔍 LOG: Response Status
            console.log(`[ADDRESS] Response Status: ${response.status}`);

            const data = await response.json();
            // 🔍 LOG: Full Address API Response Data
            console.log(`[ADDRESS] Full response data received:`, data);


            if (response.ok) {
                // 🔍 LOG: Success
                console.log(`[ADDRESS] Addresses fetched successfully. Count: ${data.addresses?.length}`);
                setAddresses(data.addresses || []);
            } else {
                // 🔍 LOG: Backend Error (DB Error)
                console.error(`[ADDRESS] Failed to load addresses: ${data.message}. Details: ${data.details || 'N/A'}`);
                setError(data.message || "Failed to load addresses.");
            }
        } catch (err) {
            // 🔍 LOG: Fetch Exception (e.g., Network error)
            console.error("[ADDRESS] Exception occurred during fetchAddresses:", err);
            setError("Network or parsing error during address fetch.");
        }
    };

    // 3. Function to Dispatch Service (logging added for completeness)
    const handleDispatch = async () => {
        // 🔍 LOG: Dispatch Attempt
        console.log(`[DISPATCH] Attempting dispatch for User: ${userId}, Address: ${selectedAddressId}, Service: ${selectedService}`);

        if (!userId || !selectedAddressId || !selectedService) {
            console.warn("[DISPATCH] Validation Failed: Missing required fields.");
            alert("Please select an address and a service.");
            return;
        }

        setDispatchLoading(true);

        try {
            // ... (rest of the dispatch logic is largely unchanged)
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
                console.log(`[DISPATCH] Success! Ticket ID: ${data.ticketId}`);
                alert(`Success! Dispatch Ticket #${data.ticketId || 'Created'}`);
            } else {
                console.error(`[DISPATCH] API Failure: ${data.message}`);
                alert(`Dispatch Failed: ${data.message}`);
            }
        } catch (err) {
            console.error("[DISPATCH] Exception:", err.message);
            alert(`Error: ${err.message}`);
        } finally {
            setDispatchLoading(false);
        }
    };

    // Auto-search if phone number is present in URL on load (unchanged)
    useEffect(() => {
        if (phoneNumber && !userId) {
            // You can uncomment handleSearch() here if you want it to trigger immediately.
        }
    }, []);

    return (
        // ... (JSX is unchanged)
    );
}
