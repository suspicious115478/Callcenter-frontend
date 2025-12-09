import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PhoneIcon = () => <span style={{ fontSize: '1.25rem' }}>📞</span>;

// Subcategory data
const PLUMBER_SUBCATEGORIES = [
    { name: 'Shower Head Repair', icon: '🚿' },
    { name: 'Diverter Repair', icon: '🔧' },
    { name: 'Waste Pipe Repair', icon: '💧' },
    { name: 'Sink Drainage Repair', icon: '🍽️' },
    { name: 'Angle Valve Repair', icon: '⚙️' },
    { name: 'Sink Blockage', icon: '⏳' },
    { name: 'Floor Trap Cleaning', icon: '🏠' },
    { name: 'Flush Tank Repair', icon: '🚽' },
    { name: 'Toilet Repair', icon: '🚾' },
    { name: 'Toilet Pot Blockage', icon: '🚫' },
    { name: 'Flush Valve Repair', icon: '🚰' },
    { name: 'Tap Repair', icon: '🚰' },
    { name: 'Water Mixer Tap Repair', icon: '🌡️' },
    { name: 'Water Tank Repair', icon: '💧' },
    { name: 'Motor Repair', icon: '⚡' },
    { name: 'Pipeline Repair', icon: '🔗' },
    { name: 'Bathroom Accessories', icon: '🧼' },
    { name: 'Shower Installation', icon: '🚿' },
    { name: 'Shower Diverter Install', icon: '🔧' },
    { name: 'Wash Basin Install', icon: '🧴' },
    { name: 'Basin Waste Pipe', icon: '🗑️' },
    { name: 'Waste Pipe & Bottle Trap', icon: '📦' },
    { name: 'Shower Filter Install', icon: '🧽' },
    { name: 'Washing Machine Filter', icon: '🧺' },
    { name: 'Drainage Cover/Floor Trap', icon: '🪜' },
    { name: 'Jet Spray Installation', icon: '💦' },
    { name: 'Toilet Installation', icon: '🚻' },
    { name: 'Flush Tank Installation', icon: '🚽' },
    { name: 'Tap Installation', icon: '🚰' },
    { name: 'Water Mixer Installation', icon: '🌡️' },
    { name: 'Water Nozzle Install', icon: '🔫' },
    { name: 'Overhead Water Tank', icon: '🌊' },
    { name: 'Water Meter Install', icon: '📊' },
    { name: 'Water Level Controller', icon: '📡' },
    { name: 'Washing Machine Inlet', icon: '🔌' },
    { name: 'Connection Hose', icon: '➰' },
    { name: 'PVC / CPVC Pipe Install', icon: '🏗️' },
    { name: 'Toilet Seat Cover', icon: '🪑' },
    { name: 'Flush Button Install', icon: '🔘' },
    { name: 'Motor Installation', icon: '🔋' },
];

const CARPENTER_SUBCATEGORIES = [
    { name: 'Shelf Installation', icon: '🖼️' },
    { name: 'Drawer Installation', icon: '🗄️' },
    { name: 'Curtain Rod Installation', icon: '🪟' },
    { name: 'Blinds Installation', icon: '🪟' },
    { name: 'Door Lock Installation', icon: '🔒' },
    { name: 'Door Stopper Installation', icon: '🚪' },
    { name: 'Door Peephole Installation', icon: '👁️' },
    { name: 'Photo Frame / Wall Art Installation', icon: '🖼️' },
    { name: 'Mirror Installation', icon: '🪞' },
    { name: 'Kitchen Rack Installation', icon: '🔪' },
    { name: 'Mesh Installation', icon: '🕸️' },
    { name: 'Door Installation', icon: '🚪' },
    { name: 'Door Closer Installation', icon: '⚙️' },
    { name: 'Foot Caps / Glide Installation', icon: '👣' },
    { name: 'Bed Repair', icon: '🛏️' },
    { name: 'Table Repair', icon: '🪑' },
    { name: 'Chair Repair', icon: '🪑' },
    { name: 'Drawer Channel Repair', icon: '🔧' },
    { name: 'Drawer Handle Repair', icon: '🤚' },
    { name: 'Door Repair', icon: '🚪' },
    { name: 'Window Repair', icon: '🪟' },
    { name: 'Lock Repair', icon: '🔑' },
    { name: 'Latch / Magnet Catch Repair', icon: '🧲' },
    { name: 'Hinges Repair', icon: '🔩' },
    { name: 'Door Closer Repair', icon: '🛠️' },
    { name: 'Door Stopper Repair', icon: '🛑' },
    { name: 'Door Peephole Repair', icon: '🧐' },
    { name: 'Sliding Track / Rollers Repair', icon: '🚄' },
];

const CLEANING_SUBCATEGORIES = [
    { name: 'Bathroom Cleaning', icon: '🛁' },
    { name: 'Kitchen Cleaning', icon: '🔪' },
    { name: 'Full House Cleaning', icon: '🏠' },
    { name: 'Room Cleaning', icon: '🛌' },
    { name: 'Sofa Cleaning', icon: '🛋️' },
    { name: 'Carpet Cleaning', icon: '🧶' },
    { name: 'Mattress', icon: '🛏️' },
    { name: 'Fridge Cleaning', icon: '🧊' },
    { name: 'Chimney Cleaning', icon: '🔥' },
    { name: 'Exhaust Fan', icon: '💨' },
    { name: 'Water Tank', icon: '💧' },
    { name: 'Kitchen Sink', icon: '🍽️' },
    { name: 'Dining Chair', icon: '🪑' },
    { name: 'Windows/Gates', icon: '🖼️' },
    { name: 'Fan Cleaning', icon: '🌀' },
    { name: 'Wardrobe Cleaning', icon: '👚' },
];

const SERVICES = [
    { name: 'Cleaning', icon: '🧼', color: '#a78bfa', darkColor: '#5b21b6', description: 'Deep cleaning, sanitization, and domestic help.' },
    { name: 'Carpenter', icon: '🔨', color: '#f97316', darkColor: '#7c2d12', description: 'Woodworking, furniture repair, and structural framing.' },
    { name: 'Gardener', icon: '🌳', color: '#86efac', darkColor: '#15803d', description: 'Lawn care, planting, and landscape maintenance.' },
    { name: 'Painter', icon: '🎨', color: '#f0abfc', darkColor: '#a21caf', description: 'Interior, exterior painting, and touch-ups.' },
    { name: 'Plumber', icon: '💧', color: '#60a5fa', darkColor: '#1d4ed8', description: 'Leaky pipes, drain cleaning, and water system fixes.' },
    { name: 'Travel Partner', icon: '✈️', color: '#fca5a5', darkColor: '#b91c1c', description: 'Booking, guide services, or driver assistance.' },
    { name: 'Salon', icon: '💇', color: '#d946ef', darkColor: '#86198f', description: 'Hair, beauty, and personal grooming services.' },
    { name: 'Electrician', icon: '⚡', color: '#fcd34d', darkColor: '#b45309', description: 'Wiring, circuit repairs, and fixture installation.' },
    { name: 'Home Security', icon: '🔒', color: '#374151', darkColor: '#111827', description: 'CCTV, alarm system installation, and monitoring.' },
    { name: 'Pest Control', icon: '🐜', color: '#34d399', darkColor: '#065f46', description: 'Extermination and prevention services for common pests.' },
    { name: 'House Help', icon: '🧺', color: '#ef4444', darkColor: '#b91c1c', description: 'Maid services, laundry, and daily domestic assistance.' },
    { name: 'Appliances Servicing', icon: '⚙️', color: '#fcd34d', darkColor: '#b45309', description: 'Repair and maintenance for major household appliances.' },
    { name: 'Car Services', icon: '🚗', color: '#818cf8', darkColor: '#3730a3', description: 'Routine maintenance, washing, and breakdown support.' },
    { name: 'Mason Services', icon: '🧱', color: '#f97316', darkColor: '#7c2d12', description: 'Tiling, brickwork, and civil construction jobs.' },
    { name: 'S2S', icon: '🤝', color: '#2dd4bf', darkColor: '#0f766e', description: 'Specialized Service-to-Service coordination.' },
    { name: 'Medical Wing', icon: '🏥', color: '#fb7185', darkColor: '#be123c', description: 'Doctor, nurse, or medical support scheduling.' },
];

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
    avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', border: '2px solid #4b5563' },
    mainLayout: {
        maxWidth: '1280px', margin: '0 auto', padding: '32px 16px', flex: 1, width: '100%',
        display: 'flex', flexDirection: 'column', gap: '32px',
    },
    card: {
        backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', transition: 'all 0.3s',
    },
    contextBox: {
        width: '100%', maxWidth: '600px', alignSelf: 'center', zIndex: 10, padding: '16px',
        borderRadius: '12px', backgroundColor: 'white', border: '1px solid #dbeafe',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    },
    serviceGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px', marginBottom: '100px', width: '100%',
    },
    contextHighlight: {
        fontFamily: 'monospace', backgroundColor: '#eef2ff', padding: '2px 8px',
        borderRadius: '4px', color: '#4f46e5', fontWeight: '600'
    },
    actionBar: {
        position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex',
        justifyContent: 'flex-end', gap: '16px', boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50,
    },
    buttonPrimary: {
        backgroundColor: '#4f46e5', color: 'white', padding: '12px 24px', borderRadius: '8px',
        fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '1rem',
        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)', transition: 'opacity 0.2s',
    },
    buttonSecondary: {
        backgroundColor: 'white', color: '#4b5563', padding: '12px 24px', borderRadius: '8px',
        fontWeight: '600', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '1rem',
    },
    buttonDisabled: {
        opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#9ca3af', boxShadow: 'none',
    },
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
    },
    modalContent: {
        backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '800px',
        maxHeight: '80vh', overflowY: 'auto', padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    subcategoryGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px', marginTop: '16px', paddingBottom: '20px',
    },
    subcategoryCard: {
        padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex',
        flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer',
        transition: 'all 0.15s',
    },
};

const ServiceCard = ({ service, onClick, isSelected, hasSubcategories }) => {
    const [isHovered, setIsHovered] = useState(false);

    const iconContainerStyle = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '18px',
        borderRadius: '50%', backgroundColor: service.color, marginBottom: '16px',
        boxShadow: `0 4px 6px -1px ${service.darkColor}40`,
    };

    const cardStyle = {
        ...styles.card, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column',
        transform: isHovered || isSelected ? 'translateY(-4px)' : 'translateY(0)',
        border: isSelected ? '2px solid #4f46e5' : isHovered ? '1px solid #d1d5db' : '1px solid #e5e7eb',
        backgroundColor: isSelected ? '#eef2ff' : 'white',
        boxShadow: (isHovered || isSelected) ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : styles.card.boxShadow,
    };

    return (
        <div style={cardStyle} onClick={() => onClick(service)}
            onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                <div style={iconContainerStyle}>
                    <span style={{ fontSize: '2.25rem', lineHeight: 1 }}>{service.icon}</span>
                </div>
                {isSelected && <span style={{fontSize: '1.5rem'}}>{hasSubcategories ? '🔗' : '✅'}</span>}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>{service.name}</h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', flex: 1 }}>{service.description}</p>
        </div>
    );
};

const SubcategoryCard = ({ subcategory, isSelected, onClick }) => {
    const cardStyle = {
        ...styles.subcategoryCard,
        backgroundColor: isSelected ? '#4f46e5' : 'white',
        color: isSelected ? 'white' : '#1f2937',
        borderColor: isSelected ? '#4f46e5' : '#d1d5db',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isSelected ? '0 4px 6px -1px rgba(79, 70, 229, 0.4)' : 'none',
    };

    const iconStyle = {
        fontSize: '1.5rem', marginBottom: '4px',
        filter: isSelected ? 'grayscale(100%) brightness(10)' : 'none',
    };

    return (
        <div style={cardStyle} onClick={() => onClick(subcategory.name)}>
            <span style={iconStyle}>{subcategory.icon}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{subcategory.name}</span>
        </div>
    );
};

const SubcategoryModal = ({ service, subcategories, initialSelection, onSave, onClose }) => {
    const [tempSelection, setTempSelection] = useState(initialSelection || []);

    const toggleSelection = (name) => {
        setTempSelection(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const handleSave = () => {
        onSave(tempSelection);
        onClose();
    };

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px' }}>
                    Select Sub-Services for {service.name}
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                    Please select one or more specific items the customer is requesting service for.
                </p>
                <div style={styles.subcategoryGrid}>
                    {subcategories.map(sub => (
                        <SubcategoryCard key={sub.name} subcategory={sub}
                            isSelected={tempSelection.includes(sub.name)} onClick={toggleSelection} />
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                    <button style={{ ...styles.buttonSecondary, padding: '8px 16px' }} onClick={onClose}>Cancel</button>
                    <button
                        style={tempSelection.length === 0 ? { ...styles.buttonPrimary, ...styles.buttonDisabled, padding: '8px 16px' } : { ...styles.buttonPrimary, padding: '8px 16px' }}
                        disabled={tempSelection.length === 0} onClick={handleSave}>
                        Save ({tempSelection.length} Selected)
                    </button>
                </div>
            </div>
        </div>
    );
};

const CallContext = ({ ticketId, phoneNumber, requestDetails }) => {
    return (
        <div style={styles.contextBox}>
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #e5e7eb' }}>
                🚨 Active Call Context
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>
                **Phone:** <span style={styles.contextHighlight}>{phoneNumber}</span>
            </p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '12px' }}>
                **Ticket:** <span style={styles.contextHighlight}>{ticketId}</span>
            </p>
            <div style={{ backgroundColor: '#f9fafb', padding: '8px', borderRadius: '4px', border: '1px solid #f3f4f6', minHeight: '50px' }}>
                <p style={{ color: '#374151', fontSize: '0.8rem', fontWeight: '600' }}>Request Note:</p>
                <p style={{ color: '#374151', fontSize: '0.75rem', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {requestDetails}
                </p>
            </div>
        </div>
    );
};

export default function UserServicesPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const ticketId = location.state?.ticketId;
    const requestDetails = location.state?.requestDetails;
    const selectedAddressId = location.state?.selectedAddressId;
    const phoneNumber = location.state?.phoneNumber;

    // 🚀 NEW: Store multiple selected services with their subcategories
    const [selectedServices, setSelectedServices] = useState({}); // { serviceName: [subcategories] }
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [activeModalService, setActiveModalService] = useState(null);
    const [activeSubcategoryList, setActiveSubcategoryList] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getSubcategoryList = (serviceName) => {
        if (serviceName === 'Cleaning') return CLEANING_SUBCATEGORIES;
        if (serviceName === 'Plumber') return PLUMBER_SUBCATEGORIES;
        if (serviceName === 'Carpenter') return CARPENTER_SUBCATEGORIES;
        return null;
    };

    const handleSelectService = (service) => {
        const serviceName = service.name;
        const subcategoryList = getSubcategoryList(serviceName);

        if (subcategoryList) {
            // Service with subcategories - open modal
            setActiveModalService(service);
            setActiveSubcategoryList(subcategoryList);
            setShowSubcategoryModal(true);
        } else {
            // Service without subcategories - toggle selection
            setSelectedServices(prev => {
                const newSelection = { ...prev };
                if (newSelection[serviceName]) {
                    delete newSelection[serviceName];
                } else {
                    newSelection[serviceName] = [];
                }
                return newSelection;
            });
        }
    };

    const handleSubcategorySave = (subcategories) => {
        if (activeModalService && subcategories.length > 0) {
            setSelectedServices(prev => ({
                ...prev,
                [activeModalService.name]: subcategories
            }));
        }
    };

    const handleConfirmAndContinue = () => {
        if (Object.keys(selectedServices).length === 0) {
            alert('Please select at least one service before continuing.');
            return;
        }

        // Validate subcategories for services that require them
        for (const [serviceName, subcategories] of Object.entries(selectedServices)) {
            const requiresSubcategories = ['Cleaning', 'Plumber', 'Carpenter'].includes(serviceName);
            if (requiresSubcategories && (!subcategories || subcategories.length === 0)) {
                alert(`Please select at least one sub-service for ${serviceName} before continuing.`);
                const service = SERVICES.find(s => s.name === serviceName);
                setActiveModalService(service);
                setActiveSubcategoryList(getSubcategoryList(serviceName));
                setShowSubcategoryModal(true);
                return;
            }
        }

        navigate('/user/servicemen', {
            state: {
                ticketId,
                requestDetails,
                selectedAddressId,
                phoneNumber,
                selectedServices, // Pass entire object: { serviceName: [subcategories] }
            }
        });
    };

    const handleScheduleRedirect = () => {
        if (Object.keys(selectedServices).length === 0) {
            alert('Please select at least one service before scheduling.');
            return;
        }

        // Same validation as above
        for (const [serviceName, subcategories] of Object.entries(selectedServices)) {
            const requiresSubcategories = ['Cleaning', 'Plumber', 'Carpenter'].includes(serviceName);
            if (requiresSubcategories && (!subcategories || subcategories.length === 0)) {
                alert(`Please select at least one sub-service for ${serviceName} before scheduling.`);
                const service = SERVICES.find(s => s.name === serviceName);
                setActiveModalService(service);
                setActiveSubcategoryList(getSubcategoryList(serviceName));
                setShowSubcategoryModal(true);
                return;
            }
        }

        navigate('/user/scheduling', {
            state: {
                ticketId,
                requestDetails,
                selectedAddressId,
                phoneNumber,
                selectedServices,
            }
        });
    };

    if (!ticketId || !requestDetails || !selectedAddressId || !phoneNumber) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>Error: Missing Call Context</h1>
            </div>
        );
    }

    const selectedCount = Object.keys(selectedServices).length;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.brand}>
                    <PhoneIcon />
                    <span>CC Agent Console: Service Assignment</span>
                </div>
                <div style={styles.headerRight}>
                    <span style={styles.clock}>{currentTime}</span>
                    <div style={styles.avatar}>AG</div>
                </div>
            </header>

            <div style={styles.mainLayout}>
                <CallContext ticketId={ticketId} phoneNumber={phoneNumber} requestDetails={requestDetails} />

                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                    Select Service Categories (Multiple Allowed)
                </h1>

                <div style={styles.serviceGrid}>
                    {SERVICES.map((service) => {
                        const hasSubcategories = ['Cleaning', 'Plumber', 'Carpenter'].includes(service.name);
                        const isSelected = selectedServices.hasOwnProperty(service.name);
                        return (
                            <ServiceCard
                                key={service.name}
                                service={service}
                                isSelected={isSelected}
                                hasSubcategories={hasSubcategories}
                                onClick={handleSelectService}
                            />
                        );
                    })}
                </div>
            </div>

            {showSubcategoryModal && activeModalService && activeSubcategoryList.length > 0 && (
                <SubcategoryModal
                    service={activeModalService}
                    subcategories={activeSubcategoryList}
                    initialSelection={selectedServices[activeModalService.name] || []}
                    onSave={handleSubcategorySave}
                    onClose={() => setShowSubcategoryModal(false)}
                />
            )}

            <div style={styles.actionBar}>
                <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedCount > 0 ? (
                        <>
                            <span style={{color: '#4b5563', fontWeight: '500'}}>
                                Selected Services: <strong style={{color: '#4f46e5'}}>{selectedCount}</strong>
                            </span>
                            <span style={{ color: '#10b981', fontWeight: '500', fontSize: '0.9rem' }}>
                                ({Object.entries(selectedServices).map(([name, subs]) => 
                                    `${name}${subs.length > 0 ? ` (${subs.length})` : ''}`
                                ).join(', ')})
                            </span>
                        </>
                    ) : (
                        <span style={{color: '#9ca3af', fontStyle: 'italic'}}>Please select at least one service...</span>
                    )}
                </div>

                <button
                    style={selectedCount === 0 ? { ...styles.buttonSecondary, ...styles.buttonDisabled } : styles.buttonSecondary}
                    disabled={selectedCount === 0}
                    onClick={handleScheduleRedirect}>
                    📅 Schedule Time for Service
                </button>

                <button
                    style={selectedCount === 0 ? { ...styles.buttonPrimary, ...styles.buttonDisabled } : styles.buttonPrimary}
                    disabled={selectedCount === 0}
                    onClick={handleConfirmAndContinue}>
                    Confirm and Continue →
                </button>
            </div>
        </div>
    );
}
