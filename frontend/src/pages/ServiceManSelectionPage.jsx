import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { app } from '../config';

const API_BASE_URL = 'https://callcenter-baclend.onrender.com';
const auth = getAuth(app);

const PhoneIcon = () => <span style={{ fontSize: '1.25rem' }}>📞</span>;

const generateUniqueOrderId = () => {
    const now = new Date();
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomPart = Math.floor(Math.random() * 9000) + 1000;
    return `ORD-${datePart}-${timePart}-${randomPart}`;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
};

const styles = {
    container: {
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f3f4f6', color: '#111827',
    },
    header: {
        height: '64px', backgroundColor: '#1f2937', color: 'white', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 20,
    },
    brand: { fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '24px' },
    clock: { fontFamily: 'monospace', color: '#9ca3af', fontSize: '0.95rem' },
    avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: '600', border: '2px solid #4b5563' },
    mainContent: { maxWidth: '1280px', margin: '0 auto', padding: '32px 16px', flex: 1, width: '100%' },
    card: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginBottom: '20px' },
    categorySection: {
        backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '2px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginBottom: '24px',
    },
    categoryHeader: {
        fontSize: '1.3rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px',
        paddingBottom: '12px', borderBottom: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px'
    },
    servicemanList: { display: 'flex', flexDirection: 'column', gap: '16px' },
    servicemanItem: { padding: '16px', border: '1px solid #d1d5db', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' },
    servicemanHover: { backgroundColor: '#f3f4f6', borderColor: '#9ca3af' },
    servicemanSelected: { backgroundColor: '#dcfce7', borderColor: '#10b981', fontWeight: '700', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' },
};

const ServicemanCard = ({ serviceman, isSelected, onClick, categoryName }) => {
    const [isHovered, setIsHovered] = useState(false);

    const cardStyle = {
        ...styles.servicemanItem,
        ...(isSelected ? styles.servicemanSelected : {}),
        ...(isHovered && !isSelected ? styles.servicemanHover : {}),
    };

    return (
        <div style={cardStyle} onClick={() => onClick(serviceman, categoryName)}
            onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' }}>
                    {serviceman.full_name || serviceman.name || 'Unknown Technician'}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {serviceman.category || 'General'} | Vehicle: {serviceman.vehicle || 'Standard'}
                </p>
                {serviceman.matchedSubcategories && serviceman.matchedSubcategories.length > 0 && (
                    <p style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600', marginTop: '4px' }}>
                        ✓ Specializes in: {serviceman.matchedSubcategories.join(', ')}
                    </p>
                )}
            </div>
            <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
                    ⭐ {serviceman.rating || 'New'}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', fontWeight: '600' }}>
                    {serviceman.calculatedDistance !== undefined
                        ? `📍 ${serviceman.calculatedDistance} km away`
                        : 'Checking distance...'}
                </p>
            </div>
        </div>
    );
};

const geocodeAddress = async (address) => {
    const encodedAddress = encodeURIComponent(address);
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

    try {
        const response = await fetch(geocodingUrl);
        if (!response.ok) throw new Error(`Geocoding error! Status: ${response.status}`);
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat).toFixed(4), lon: parseFloat(data[0].lon).toFixed(4) };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};

const fetchServicemenFromBackend = async (serviceName, selectedSubcategories) => {
    const url = `${API_BASE_URL}/call/servicemen/available`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service: serviceName, subcategories: selectedSubcategories })
        });

        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Servicemen fetch error:", error);
        return [];
    }
};

const fetchMemberId = async (phoneNumber) => {
    if (!phoneNumber) return null;
    const url = `${API_BASE_URL}/call/memberid/lookup`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber })
        });

        if (!response.ok) {
            if (response.status === 404) return 'Not Found';
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.member_id;
    } catch (error) {
        console.error("Member ID fetch error:", error);
        return 'Error';
    }
};

const fetchAgentAdminId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const url = `${API_BASE_URL}/agent/adminid/${firebaseUid}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) return 'Admin Not Found';
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.admin_id;
    } catch (error) {
        console.error("Admin ID fetch error:", error);
        return 'Error Fetching Admin ID';
    }
};

export function ServiceManSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        ticketId: paramTicketId,
        requestDetails: paramRequestDetails,
        selectedAddressId,
        selectedServices, // 🚀 NEW: { serviceName: [subcategories] }
        phoneNumber: paramPhoneNumber,
        previousOrderId,
        cancellationReason,
        callerNumber,
        request_address,
        isScheduledDispatch,
        orderId: existingOrderId,
        adminId: passedAdminId
    } = location.state || {};

    const [activeTicketId, setActiveTicketId] = useState(paramTicketId || 'UNKNOWN_TKT');
    const [activePhoneNumber, setActivePhoneNumber] = useState(paramPhoneNumber || callerNumber);
    const [activeRequest, setActiveRequest] = useState(
        paramRequestDetails || (cancellationReason ? `Re-dispatch: ${cancellationReason}` : 'Service Request')
    );
    const [fetchedAddressLine, setFetchedAddressLine] = useState(request_address || 'Loading address...');
    const [adminId, setAdminId] = useState(passedAdminId || 'Fetching...');
    const [memberId, setMemberId] = useState('Searching...');
    const [orderId, setOrderId] = useState(isScheduledDispatch ? existingOrderId : null);
    const [userCoordinates, setUserCoordinates] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    // 🚀 NEW: Store servicemen by category
    const [servicemanByCategory, setServicemanByCategory] = useState({}); // { categoryName: [servicemen] }
    const [selectedServicemen, setSelectedServicemen] = useState({}); // { categoryName: serviceman }
    const [dispatchStatus, setDispatchStatus] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isScheduledDispatch) {
            setOrderId(existingOrderId);
        } else {
            const newOrderId = generateUniqueOrderId();
            setOrderId(newOrderId);
        }
    }, [isScheduledDispatch, existingOrderId]);

    useEffect(() => {
        if (previousOrderId) {
            // Re-dispatch scenario handling...
            // (Keep your existing re-dispatch logic)
        } else if (!isScheduledDispatch) {
            const user = auth.currentUser;
            if (user && !passedAdminId) {
                setAdminId('Loading...');
                fetchAgentAdminId(user.uid).then(id => setAdminId(id));
            }
        }
    }, [previousOrderId, isScheduledDispatch, passedAdminId]);

    // Handle address geocoding
    const handleGeocoding = async (rawAddress) => {
        const simplifiedAddress = rawAddress
            .replace(/Flat \d+,\s*/i, '')
            .replace(/Rosewood Apartments,\s*/i, '')
            .trim();

        if (simplifiedAddress) {
            const coords = await geocodeAddress(simplifiedAddress);
            setUserCoordinates(coords);
        } else {
            setUserCoordinates({ lat: 'N/A', lon: 'N/A' });
        }
    };

    useEffect(() => {
        if (!previousOrderId && !isScheduledDispatch && selectedAddressId) {
            const fetchAndGeocodeAddress = async () => {
                const fullUrl = `${API_BASE_URL}/call/address/lookup/${selectedAddressId}`;
                setFetchedAddressLine('Fetching address details...');

                try {
                    const response = await fetch(fullUrl);
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                    const data = await response.json();
                    const addressLine = data.address_line;
                    setFetchedAddressLine(addressLine);
                    handleGeocoding(addressLine);
                } catch (error) {
                    console.error("Address fetch error:", error);
                    setFetchedAddressLine(`Error loading address.`);
                }
            };
            fetchAndGeocodeAddress();
        } else if (!previousOrderId && request_address) {
            setFetchedAddressLine(request_address);
            handleGeocoding(request_address);
        }
    }, [selectedAddressId, request_address, previousOrderId, isScheduledDispatch]);

    useEffect(() => {
        if (activePhoneNumber) {
            fetchMemberId(activePhoneNumber).then(id => setMemberId(id));
        } else {
            setMemberId('N/A');
        }
    }, [activePhoneNumber]);

    // 🚀 NEW: Fetch servicemen for ALL selected categories
    useEffect(() => {
        if (!selectedServices || Object.keys(selectedServices).length === 0) {
            setDispatchStatus("⚠️ No services selected.");
            return;
        }

        if (!userCoordinates || userCoordinates.lat === 'N/A') {
            setDispatchStatus("Waiting for address geocoding...");
            return;
        }

        setDispatchStatus("Searching for specialists across all categories...");

        const fetchAllServicemen = async () => {
            const results = {};

            for (const [categoryName, subcategories] of Object.entries(selectedServices)) {
                console.log(`Fetching servicemen for ${categoryName} with subcategories:`, subcategories);

                const data = await fetchServicemenFromBackend(categoryName, subcategories);

                if (data.length === 0) {
                    results[categoryName] = [];
                    continue;
                }

                // Calculate distances and sort
                const processedList = data.map(sm => {
                    const dist = calculateDistance(
                        parseFloat(userCoordinates.lat),
                        parseFloat(userCoordinates.lon),
                        parseFloat(sm.current_lat),
                        parseFloat(sm.current_lng)
                    );
                    return { ...sm, calculatedDistance: dist };
                });

                const sortedList = processedList.sort((a, b) => {
                    if (a.calculatedDistance === null) return 1;
                    if (b.calculatedDistance === null) return -1;
                    return a.calculatedDistance - b.calculatedDistance;
                });

                results[categoryName] = sortedList;
            }

            setServicemanByCategory(results);

            const totalCount = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
            setDispatchStatus(totalCount > 0
                ? `Found ${totalCount} specialists across ${Object.keys(results).length} categories.`
                : "⚠️ No specialists found for selected services.");
        };

        fetchAllServicemen();
    }, [selectedServices, userCoordinates]);

    const handleSelectServiceman = (serviceman, categoryName) => {
        setSelectedServicemen(prev => ({
            ...prev,
            [categoryName]: prev[categoryName]?.id === serviceman.id ? null : serviceman
        }));
    };

    // 🚀 UPDATED: Dispatch all selected servicemen
    const handleDispatchAll = async () => {
        const selectedCount = Object.values(selectedServicemen).filter(Boolean).length;

        if (selectedCount === 0) {
            setDispatchStatus('❗️ Please select at least one serviceman from each category.');
            return;
        }

        if (!orderId) {
            setDispatchStatus('❌ Error: Order ID was not generated. Cannot dispatch.');
            return;
        }

        if (!adminId || adminId.startsWith('Error') || adminId.startsWith('N/A') || adminId.startsWith('Loading')) {
            setDispatchStatus(`❌ Error: Admin ID is missing (${adminId}). Cannot dispatch.`);
            return;
        }

        setDispatchStatus(`Dispatching ${selectedCount} servicemen...`);

        try {
            const dispatchPromises = Object.entries(selectedServicemen)
                .filter(([_, serviceman]) => serviceman !== null)
                .map(([categoryName, serviceman]) => {
                    const subcategories = selectedServices[categoryName] || [];

                    const dispatchData = {
                        user_id: serviceman.user_id,
                        category: categoryName,
                        request_address: fetchedAddressLine,
                        order_status: 'Assigned',
                        order_request: `${activeRequest} | Subcategories: ${subcategories.join(', ')}`,
                        order_id: `${orderId}_${categoryName}`, // Unique order ID per category
                        ticket_id: activeTicketId,
                        phone_number: activePhoneNumber,
                        admin_id: adminId,
                        previous_order_id: previousOrderId || null,
                        isScheduledUpdate: isScheduledDispatch,
                        selected_subcategories: subcategories
                    };

                    return fetch(`${API_BASE_URL}/call/dispatch`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dispatchData),
                    });
                });

            const responses = await Promise.all(dispatchPromises);

            const allSuccessful = responses.every(r => r.ok);

            if (allSuccessful) {
                setDispatchStatus(`✅ DISPATCH SUCCESSFUL: All ${selectedCount} servicemen assigned!`);
                setTimeout(() => navigate('/'), 3000);
            } else {
                setDispatchStatus(`⚠️ Some dispatches failed. Please check logs.`);
            }

        } catch (error) {
            console.error("DISPATCH ERROR:", error);
            setDispatchStatus(`❌ DISPATCH FAILED: ${error.message}`);
        }
    };

    if (!selectedServices || Object.keys(selectedServices).length === 0) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ color: '#ef4444' }}>Error: No Services Selected</h1>
                <button onClick={() => navigate(-1)}
                    style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: 'white', cursor: 'pointer' }}>
                    Go Back
                </button>
            </div>
        );
    }

    const totalSelected = Object.values(selectedServicemen).filter(Boolean).length;
    const totalCategories = Object.keys(selectedServices).length;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.brand}>
                    <PhoneIcon />
                    <span>CC Agent Console: Multi-Service Dispatch</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.clock}>{currentTime}</span>
                    <div style={styles.avatar}>AG</div>
                </div>
            </header>

            <div style={styles.mainContent}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                    Available Servicemen by Category
                </h1>

                {isScheduledDispatch && (
                    <div style={{ backgroundColor: '#dbeafe', border: '1px solid #3b82f6', color: '#1e40af', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600' }}>
                        📅 Scheduled order assignment. Order ID: {orderId}
                    </div>
                )}

                <div style={styles.card}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        User Location & Service Request
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '4px' }}>
                        **Ticket ID:** <span style={{ fontWeight: '600', backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '4px' }}>{activeTicketId}</span>
                        {' | '}
                        **Order ID:** <span style={{ fontWeight: '600', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: '#4f46e5' }}>{orderId || 'Generating...'}</span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Customer Phone:** <span style={{ fontWeight: '600', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: '#4f46e5' }}>{activePhoneNumber || 'N/A'}</span>
                        {' | '}
                        **Member ID:** <span style={{ fontWeight: '600', backgroundColor: memberId === 'Not Found' ? '#fee2e2' : '#eef2ff', padding: '2px 8px', borderRadius: '4px', color: memberId === 'Not Found' ? '#ef4444' : '#4f46e5' }}>
                            {memberId}
                        </span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '8px' }}>
                        **Address:** <span style={{ fontWeight: '600' }}>{fetchedAddressLine}</span>
                    </p>
                    {userCoordinates && (
                        <p style={{ fontSize: '0.9rem', color: '#1f2937', marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                            **GPS:** <span style={{ fontFamily: 'monospace', backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '4px' }}>
                                {userCoordinates.lat}, {userCoordinates.lon}
                            </span>
                        </p>
                    )}
                </div>

                <p style={{ marginBottom: '16px', fontWeight: '600', fontSize: '1rem', color: dispatchStatus?.includes('SUCCESSFUL') ? '#047857' : dispatchStatus?.includes('⚠️') || dispatchStatus?.includes('❌') ? '#ef4444' : '#6b7280' }}>
                    {dispatchStatus}
                </p>

                {/* 🚀 NEW: Render servicemen in category-based grids */}
                {Object.entries(servicemanByCategory).map(([categoryName, servicemen]) => {
                    const subcategories = selectedServices[categoryName] || [];
                    const selectedForCategory = selectedServicemen[categoryName];

                    return (
                        <div key={categoryName} style={styles.categorySection}>
                            <div style={styles.categoryHeader}>
                                <span style={{ fontSize: '1.8rem' }}>
                                    {categoryName === 'Plumber' ? '💧' :
                                        categoryName === 'Carpenter' ? '🔨' :
                                            categoryName === 'Cleaning' ? '🧼' :
                                                categoryName === 'Electrician' ? '⚡' :
                                                    categoryName === 'Painter' ? '🎨' : '🔧'}
                                </span>
                                <div>
                                    <div>{categoryName} Specialists</div>
                                    {subcategories.length > 0 && (
                                        <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#6b7280', marginTop: '4px' }}>
                                            Requested: {subcategories.join(', ')}
                                        </div>
                                    )}
                                </div>
                                {selectedForCategory && (
                                    <span style={{ marginLeft: 'auto', fontSize: '1.5rem' }}>✅</span>
                                )}
                            </div>

                            <div style={styles.servicemanList}>
                                {servicemen.length > 0 ? (
                                    servicemen.map(sm => (
                                        <ServicemanCard
                                            key={sm.id}
                                            serviceman={sm}
                                            categoryName={categoryName}
                                            isSelected={selectedForCategory && selectedForCategory.id === sm.id}
                                            onClick={handleSelectServiceman}
                                        />
                                    ))
                                ) : (
                                    <p style={{ color: '#ef4444', fontStyle: 'italic' }}>
                                        No available technicians for {categoryName}.
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                <div style={{ marginTop: '24px', textAlign: 'right', backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                        Selected: {totalSelected} of {totalCategories} categories
                    </p>
                    <button
                        onClick={handleDispatchAll}
                        disabled={totalSelected === 0 || !orderId || dispatchStatus?.includes('Dispatching') || dispatchStatus?.includes('SUCCESSFUL')}
                        style={{
                            padding: '14px 28px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '1.05rem',
                            cursor: (totalSelected === 0 || !orderId) ? 'not-allowed' : 'pointer',
                            backgroundColor: (totalSelected === 0 || !orderId) ? '#9ca3af' : '#10b981',
                            color: 'white',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}>
                        {dispatchStatus?.includes('Dispatching') ? 'Dispatching...' : dispatchStatus?.includes('SUCCESSFUL') ? 'Dispatched' : `Dispatch All ${totalSelected} Servicemen`}
                    </button>
                </div>
            </div>
        </div>
    );
}
