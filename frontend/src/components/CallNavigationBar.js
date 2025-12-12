import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallSession } from './CallSessionContext';

export const CallNavigationBar = () => {
  const { callSession, sessionData, endCallSession } = useCallSession();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show navbar if no active call
  if (!callSession?.isActive) return null;

 const steps = [
  { 
    id: 'dashboard', 
    label: 'Notes', 
    path: `/dashboard/${sessionData.dashboard?.userId}?phoneNumber=${sessionData.dashboard?.phoneNumber}`, // 🔥 FIX: Add query param
    icon: '📝',
    isCompleted: !!sessionData.dashboard?.ticketId
  },
  { 
    id: 'services', 
    label: 'Services', 
    path: '/user/services',
    icon: '🛠️',
    isCompleted: sessionData.services?.selectedServices && 
                 Object.keys(sessionData.services.selectedServices).length > 0
  },
  { 
    id: 'scheduling', 
    label: 'Schedule', 
    path: '/user/scheduling',
    icon: '📅',
    isCompleted: !!sessionData.scheduling?.selectedDate,
    isOptional: true
  },
  { 
    id: 'serviceman', 
    label: 'Dispatch', 
    path: '/user/servicemen',
    icon: '👷',
    isCompleted: false
  }
];

  const currentStepIndex = steps.findIndex(step => 
    location.pathname.includes(step.path.split('?')[0])
  );

  const handleStepClick = (step, index) => {
  // Prevent skipping ahead
  if (index > 0 && index > currentStepIndex + 1) {
    const prevStep = steps[index - 1];
    if (!prevStep.isCompleted && !prevStep.isOptional) {
      alert(`Please complete "${prevStep.label}" step first`);
      return;
    }
  }

  // Build navigation state based on step
  const navigationState = buildNavigationState(step.id);
  
  // 🔥 FIX: For dashboard, use navigate with query params already in path
  if (step.id === 'dashboard') {
    navigate(step.path); // Path already has query param
  } else {
    navigate(step.path, { state: navigationState });
  }
};
 const buildNavigationState = (stepId) => {
  const dashboardData = sessionData.dashboard || {};
  const servicesData = sessionData.services || {};
  const schedulingData = sessionData.scheduling || {};

  switch (stepId) {
    case 'dashboard':
      // 🔥 FIX: Return path with query parameter for phoneNumber
      return {
        // No state needed - phone number will be in URL query
      };
    
    case 'services':
      return {
        ticketId: dashboardData.ticketId,
        requestDetails: dashboardData.requestDetails,
        selectedAddressId: dashboardData.selectedAddressId,
        phoneNumber: dashboardData.phoneNumber
      };
    
    case 'scheduling':
      return {
        ticketId: dashboardData.ticketId,
        requestDetails: dashboardData.requestDetails,
        selectedAddressId: dashboardData.selectedAddressId,
        phoneNumber: dashboardData.phoneNumber,
        selectedServices: servicesData.selectedServices // 🔥 FIX: Pass full selectedServices object
      };
    
    case 'serviceman':
      return {
        ticketId: dashboardData.ticketId,
        requestDetails: dashboardData.requestDetails,
        selectedAddressId: dashboardData.selectedAddressId,
        selectedServices: servicesData.selectedServices,
        phoneNumber: dashboardData.phoneNumber,
        scheduledDate: schedulingData.selectedDate,
        scheduledTime: schedulingData.selectedTime
      };
    
    default:
      return {};
  }
};

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to end this call session? All unsaved data will be lost.')) {
      endCallSession();
      navigate('/');
    }
  };

  const styles = {
    navbar: {
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: '#4f46e5',
      borderBottom: '3px solid #4338ca',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '24px',
      flexWrap: 'wrap'
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    callIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: 'white',
      fontWeight: '600',
      fontSize: '0.95rem'
    },
    pulseDot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: '#ef4444',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    },
    stepsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flex: 1,
      minWidth: '600px'
    },
    stepButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      whiteSpace: 'nowrap'
    },
    stepButtonActive: {
      backgroundColor: 'white',
      color: '#4f46e5',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
    },
    stepButtonCompleted: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      color: '#d1fae5'
    },
    arrow: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '1.2rem'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    sessionInfo: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '0.8rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      minWidth: '140px'
    },
    endCallButton: {
      padding: '8px 20px',
      borderRadius: '8px',
      border: '2px solid white',
      backgroundColor: '#ef4444',
      color: 'white',
      fontWeight: '700',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      whiteSpace: 'nowrap'
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 1200px) {
          .nav-steps { flex-wrap: wrap; min-width: auto; }
        }
      `}</style>
      <div style={styles.navbar}>
        <div style={styles.container}>
          <div style={styles.leftSection}>
            <div style={styles.callIndicator}>
              <div style={styles.pulseDot}></div>
              <span>ACTIVE CALL</span>
            </div>
          </div>

          <div style={styles.stepsContainer} className="nav-steps">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {index > 0 && <span style={styles.arrow}>→</span>}
                <button
                  style={{
                    ...styles.stepButton,
                    ...(currentStepIndex === index ? styles.stepButtonActive : {}),
                    ...(step.isCompleted ? styles.stepButtonCompleted : {}),
                    opacity: step.isOptional ? 0.8 : 1
                  }}
                  onClick={() => handleStepClick(step, index)}
                  title={step.isOptional ? 'Optional step' : ''}
                >
                  <span>{step.icon}</span>
                  <span>{step.label}</span>
                  {step.isCompleted && <span>✓</span>}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div style={styles.rightSection}>
            <div style={styles.sessionInfo}>
              <div>📞 {sessionData.dashboard?.phoneNumber || 'N/A'}</div>
              <div style={{fontSize: '0.7rem', opacity: 0.7}}>
                Session: {callSession?.sessionId?.toString().slice(-6)}
              </div>
            </div>

            <button style={styles.endCallButton} onClick={handleEndCall}>
              <span>📴</span>
              <span>End Call</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
