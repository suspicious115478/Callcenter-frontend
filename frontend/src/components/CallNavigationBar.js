import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallSession } from './CallSessionContext';

export const CallNavigationBar = () => {
  const { callSession, sessionData, endCallSession } = useCallSession();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar if no active call
  if (!callSession?.isActive) return null;

  /* -------------------- SAFE SESSION ID -------------------- */
  const getShortSessionId = () => {
    const id = callSession?.sessionId;

    if (!id) return '—';
    if (typeof id === 'string') return id.slice(-6);
    if (typeof id === 'number') return String(id).slice(-6);
    if (typeof id === 'object' && id.id) return String(id.id).slice(-6);

    return '—';
  };

  /* -------------------- STEPS -------------------- */
  const steps = [
    {
      id: 'dashboard',
      label: 'Notes',
      path: '/dashboard',
      isCompleted: !!sessionData.dashboard?.ticketId
    },
    {
      id: 'services',
      label: 'Services',
      path: '/user/services',
      isCompleted:
        sessionData.services?.selectedServices &&
        Object.keys(sessionData.services.selectedServices).length > 0
    },
    {
      id: 'scheduling',
      label: 'Schedule',
      path: '/user/scheduling',
      isCompleted: !!sessionData.scheduling?.selectedDate,
      isOptional: true
    },
    {
      id: 'serviceman',
      label: 'Dispatch',
      path: '/user/servicemen',
      isCompleted: false
    }
  ];

  const currentStepIndex = steps.findIndex(step => {
    if (step.id === 'dashboard') {
      return location.pathname.startsWith('/dashboard');
    }
    return location.pathname.includes(step.path);
  });

  /* -------------------- NAV STATE BUILDER -------------------- */
  const buildNavigationState = (stepId) => {
    const dashboard = sessionData.dashboard || {};
    const services = sessionData.services || {};
    const scheduling = sessionData.scheduling || {};

    switch (stepId) {
      case 'dashboard':
        return {
          phoneNumber: dashboard.phoneNumber,
          userId: dashboard.userId
        };

      case 'services':
        return {
          ticketId: dashboard.ticketId,
          requestDetails: dashboard.requestDetails,
          selectedAddressId: dashboard.selectedAddressId,
          phoneNumber: dashboard.phoneNumber
        };

      case 'scheduling':
        return {
          ticketId: dashboard.ticketId,
          requestDetails: dashboard.requestDetails,
          selectedAddressId: dashboard.selectedAddressId,
          phoneNumber: dashboard.phoneNumber,
          selectedServices: services.selectedServices
        };

      case 'serviceman':
        return {
          ticketId: dashboard.ticketId,
          requestDetails: dashboard.requestDetails,
          selectedAddressId: dashboard.selectedAddressId,
          selectedServices: services.selectedServices,
          phoneNumber: dashboard.phoneNumber,
          scheduledDate: scheduling.selectedDate,
          scheduledTime: scheduling.selectedTime
        };

      default:
        return {};
    }
  };

  /* -------------------- STEP CLICK -------------------- */
  const handleStepClick = (step, index) => {
    if (index > currentStepIndex + 1) {
      const prev = steps[index - 1];
      if (!prev.isCompleted && !prev.isOptional) {
        alert(`Please complete "${prev.label}" first`);
        return;
      }
    }

    const navigationState = buildNavigationState(step.id);

    if (step.id === 'dashboard') {
      const phoneNumber = sessionData.dashboard?.phoneNumber || '';
      const userId = sessionData.dashboard?.userId;
      const path = userId ? `/dashboard/${userId}` : '/dashboard/active';

      navigate(`${path}?phoneNumber=${phoneNumber}`, {
        state: navigationState
      });
    } else {
      navigate(step.path, { state: navigationState });
    }
  };

  /* -------------------- END CALL -------------------- */
  const handleEndCall = () => {
    if (window.confirm('End this call session? Unsaved data will be lost.')) {
      endCallSession();
      navigate('/');
    }
  };

  /* -------------------- STYLES -------------------- */
  const styles = {
    navbar: {
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b'
    },
    container: {
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    statusPill: {
      padding: '6px 12px',
      borderRadius: '999px',
      backgroundColor: '#16a34a',
      color: '#fff',
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.05em'
    },
    callerInfo: {
      display: 'flex',
      flexDirection: 'column',
      fontSize: '0.8rem',
      color: '#e5e7eb'
    },
    stepsContainer: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      gap: '12px'
    },
    step: {
      padding: '6px 14px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: 600,
      backgroundColor: '#020617',
      color: '#94a3b8',
      border: '1px solid #1e293b',
      cursor: 'pointer'
    },
    stepActive: {
      backgroundColor: '#2563eb',
      borderColor: '#2563eb',
      color: '#fff'
    },
    stepCompleted: {
      backgroundColor: '#022c22',
      borderColor: '#16a34a',
      color: '#16a34a'
    },
    sessionMeta: {
      textAlign: 'right',
      fontSize: '0.7rem',
      color: '#94a3b8'
    },
    endCall: {
      marginLeft: '16px',
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#dc2626',
      color: '#fff',
      fontWeight: 700,
      fontSize: '0.75rem',
      cursor: 'pointer'
    }
  };

  /* -------------------- RENDER -------------------- */
  return (
    <div style={styles.navbar}>
      <div style={styles.container}>

        {/* LEFT */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={styles.statusPill}>LIVE CALL</div>

          <div style={styles.callerInfo}>
            <div><strong>Caller:</strong> {sessionData.dashboard?.phoneNumber || 'Unknown'}</div>
            <div><strong>Ticket:</strong> {sessionData.dashboard?.ticketId || '—'}</div>
          </div>
        </div>

        {/* CENTER */}
        <div style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <button
              key={step.id}
              style={{
                ...styles.step,
                ...(index === currentStepIndex ? styles.stepActive : {}),
                ...(step.isCompleted ? styles.stepCompleted : {})
              }}
              onClick={() => handleStepClick(step, index)}
            >
              {step.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={styles.sessionMeta}>
            <div>SESSION</div>
            <div>{getShortSessionId()}</div>
          </div>

          <button style={styles.endCall} onClick={handleEndCall}>
            END CALL
          </button>
        </div>

      </div>
    </div>
  );
};
