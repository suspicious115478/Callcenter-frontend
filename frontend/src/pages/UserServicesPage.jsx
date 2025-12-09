import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Using Emojis instead of custom SVG components
const PhoneIcon = () => <span style={{ fontSize: '1.25rem' }}>📞</span>;

// ⭐️ NEW: Cleaning Subcategories List
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

// ⭐️ UPDATED SERVICE CATEGORIES
const SERVICES = [
    // List based on user's request
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

// --- INLINE STYLES ---
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f3f4f6',
        color: '#111827',
    },
    header: {
        height: '64px',
        backgroundColor: '#1f2937',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 20,
    },
    brand: { fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '24px' },
    clock: { fontFamily: 'monospace', color: '#9ca3af', fontSize: '0.95rem' },
    avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', border: '2px solid #4b5563' },
    
    mainLayout: {
        maxWidth: '1280px', 
        margin: '0 auto',
        padding: '32px 16px',
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
    },

    card: {
        backgroundColor: 'white',
        padding: '30px', 
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s',
    },

    contextBox: {
        width: '100%',
        maxWidth: '600px', 
        alignSelf: 'center', 
        zIndex: 10,
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: 'white',
        border: '1px solid #dbeafe', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    },

    serviceGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '100px', 
        width: '100%',
    },
    
    contextHighlight: {
        fontFamily: 'monospace',
        backgroundColor: '#eef2ff',
        padding: '2px 8px',
        borderRadius: '4px',
        color: '#4f46e5',
        fontWeight: '600'
    },

    // Styles for the bottom action bar
    actionBar: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '16px',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 50,
    },
    buttonPrimary: {
        backgroundColor: '#4f46e5',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
        opacity: 1,
        transition: 'opacity 0.2s',
    },
    buttonSecondary: {
        backgroundColor: 'white',
        color: '#4b5563',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '600',
        border: '1px solid #d1d5db',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        backgroundColor: '#9ca3af',
        boxShadow: 'none',
    },
    
    // ⭐️ NEW MODAL STYLES
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    subcategoryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px',
        marginTop: '16px',
        paddingBottom: '20px',
    },
    subcategoryCard: {
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s',
    },
};

/**
 * Component for a single service category card.
 */
const ServiceCard = ({ service, onClick, isSelected, hasSubcategories }) => {
    const [isHovered, setIsHovered] = useState(false);

    const iconContainerStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '18px', 
        borderRadius: '50%',
        backgroundColor: service.color,
        marginBottom: '16px',
        boxShadow: `0 4px 6px -1px ${service.darkColor}40`,
    };

    const cardStyle = {
        ...styles.card,
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transform: isHovered || isSelected ? 'translateY(-4px)' : 'translateY(0)',
        
        // Card Outline Logic
        border: isSelected 
            ? '2px solid #4f46e5' 
            : isHovered
                ? '1px solid #d1d5db' 
                : '1px solid #e5e7eb', 
        
        backgroundColor: isSelected ? '#eef2ff' : 'white',
        boxShadow: (isHovered || isSelected)
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            : styles.card.boxShadow,
    };

    return (
        <div
            style={cardStyle}
            onClick={() => onClick(service)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
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


/**
 * ⭐️ NEW: Subcategory Card Component
 */
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
        fontSize: '1.5rem',
        marginBottom: '4px',
        filter: isSelected ? 'grayscale(100%) brightness(10)' : 'none',
    };

    return (
        <div 
            style={cardStyle} 
            onClick={() => onClick(subcategory.name)}
        >
            <span style={iconStyle}>{subcategory.icon}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{subcategory.name}</span>
        </div>
    );
};

/**
 * ⭐️ NEW: Subcategory Modal Component
 */
const SubcategoryModal = ({ service, subcategories, initialSelection, onSave, onClose }) => {
    const [tempSelection, setTempSelection] = useState(initialSelection || []);

    const toggleSelection = (name) => {
        setTempSelection(prev => 
            prev.includes(name) 
                ? prev.filter(n => n !== name) 
                : [...prev, name]
        );
    };

    const handleSave = () => {
        onSave(tempSelection);
        onClose();
    };
    
    // Prevent modal close on overlay click if a subcategory is required (optional logic)
    // const handleOverlayClick = (e) => {
    //     if (e.target === e.currentTarget) {
    //         // onClose(); // Uncomment if you want closing on outside click
    //     }
    // }

    return (
        <div style={styles.modalOverlay} /* onClick={handleOverlayClick} */>
            <div style={styles.modalContent}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px' }}>
                    Select Sub-Services for {service.name}
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                    Please select one or more specific items the customer is requesting service for.
                </p>

                <div style={styles.subcategoryGrid}>
                    {subcategories.map(sub => (
                        <SubcategoryCard
                            key={sub.name}
                            subcategory={sub}
                            isSelected={tempSelection.includes(sub.name)}
                            onClick={toggleSelection}
                        />
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                    <button 
                        style={{ ...styles.buttonSecondary, padding: '8px 16px' }} 
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        style={tempSelection.length === 0 ? { ...styles.buttonPrimary, ...styles.buttonDisabled, padding: '8px 16px' } : { ...styles.buttonPrimary, padding: '8px 16px' }}
                        disabled={tempSelection.length === 0}
                        onClick={handleSave}
                    >
                        Save ({tempSelection.length} Selected)
                    </button>
                </div>
            </div>
        </div>
    );
};

// Context Component (Unchanged)
const CallContext = ({ ticketId, phoneNumber, requestDetails }) => {
    // ... (Your CallContext component implementation)
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

    // ⭐️ UPDATED State: selectedService now stores the main service object
    // ⭐️ NEW State: subcategories stores selected subcategories (array of strings)
    const [selectedService, setSelectedService] = useState(null);
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // ⭐️ NEW: Logic to handle service selection and potentially open the modal
    const handleSelectService = (service) => {
        // If the same service is clicked, and it has subcategories, reopen modal for review
        if (selectedService?.name === service.name && service.name === 'Cleaning') {
             setShowSubcategoryModal(true);
             return;
        }

        setSelectedService(service);

        if (service.name === 'Cleaning') {
            setShowSubcategoryModal(true);
        } else {
            // Clear subcategories if a non-subcategorized service is selected
            setSelectedSubcategories([]); 
        }
    };

    const handleSubcategorySave = (subcategories) => {
        setSelectedSubcategories(subcategories);
    }


    const handleConfirmAndContinue = () => {
        if (!selectedService) return;
        
        // Validation check for Cleaning
        if (selectedService.name === 'Cleaning' && selectedSubcategories.length === 0) {
            alert("Please select at least one Cleaning sub-service before continuing.");
            setShowSubcategoryModal(true);
            return;
        }

        navigate('/user/servicemen', {
            state: {
                ticketId,
                requestDetails,
                selectedAddressId,
                phoneNumber,
                serviceName: selectedService.name,
                selectedSubcategories, // Pass subcategories forward
            }
        });
    };

    const handleScheduleRedirect = () => {
        if (!selectedService) return;

        // Validation check for Cleaning
        if (selectedService.name === 'Cleaning' && selectedSubcategories.length === 0) {
            alert("Please select at least one Cleaning sub-service before scheduling.");
            setShowSubcategoryModal(true);
            return;
        }

        navigate('/user/scheduling', {
            state: {
                ticketId,
                requestDetails,
                selectedAddressId,
                phoneNumber,
                serviceName: selectedService.name,
                selectedSubcategories, // Pass subcategories forward
            }
        });
    };

    // Determine the button state logic
    const isServiceSelected = selectedService !== null;
    const isCleaningSelectedButNoSubcategories = selectedService?.name === 'Cleaning' && selectedSubcategories.length === 0;

    if (!ticketId || !requestDetails || !selectedAddressId || !phoneNumber) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>Error: Missing Call Context</h1>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* HEADER (Unchanged) */}
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

            {/* MAIN CONTENT */}
            <div style={styles.mainLayout}>
                
                <CallContext
                    ticketId={ticketId}
                    phoneNumber={phoneNumber}
                    requestDetails={requestDetails}
                />

                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                    Select Service Category
                </h1>
                
                {/* Service Selection Grid */}
                <div style={styles.serviceGrid}>
                    {SERVICES.map((service) => (
                        <ServiceCard
                            key={service.name}
                            service={service}
                            isSelected={selectedService?.name === service.name}
                            hasSubcategories={service.name === 'Cleaning'} // Display link icon if it has subcategories
                            onClick={handleSelectService}
                        />
                    ))}
                </div>
            </div>

            {/* ⭐️ SUB-CATEGORY MODAL */}
            {showSubcategoryModal && selectedService?.name === 'Cleaning' && (
                <SubcategoryModal
                    service={selectedService}
                    subcategories={CLEANING_SUBCATEGORIES}
                    initialSelection={selectedSubcategories}
                    onSave={handleSubcategorySave}
                    onClose={() => setShowSubcategoryModal(false)}
                />
            )}

            {/* BOTTOM ACTION BAR */}
            <div style={styles.actionBar}>
                <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isServiceSelected ? (
                        <>
                            <span style={{color: '#4b5563', fontWeight: '500'}}>Selected Service: <strong style={{color: '#4f46e5'}}>{selectedService.name}</strong></span>
                            {selectedService.name === 'Cleaning' && (
                                <span style={{ color: selectedSubcategories.length > 0 ? '#10b981' : '#f59e0b', fontWeight: '500' }}>
                                    (Sub-services: <strong>{selectedSubcategories.length > 0 ? selectedSubcategories.length : '0'}</strong> selected)
                                </span>
                            )}
                        </>
                    ) : (
                        <span style={{color: '#9ca3af', fontStyle: 'italic'}}>Please select a service...</span>
                    )}
                </div>

                <button 
                    style={!isServiceSelected || isCleaningSelectedButNoSubcategories ? { ...styles.buttonSecondary, ...styles.buttonDisabled } : styles.buttonSecondary}
                    disabled={!isServiceSelected || isCleaningSelectedButNoSubcategories}
                    onClick={handleScheduleRedirect}
                >
                    📅 Schedule Time for Service
                </button>

                <button 
                    style={!isServiceSelected || isCleaningSelectedButNoSubcategories ? { ...styles.buttonPrimary, ...styles.buttonDisabled } : styles.buttonPrimary}
                    disabled={!isServiceSelected || isCleaningSelectedButNoSubcategories}
                    onClick={handleConfirmAndContinue}
                >
                    Confirm and Continue →
                </button>
            </div>
        </div>
    );
}
