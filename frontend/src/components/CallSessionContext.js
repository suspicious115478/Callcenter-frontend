import React, { createContext, useContext, useState, useEffect } from 'react';

const CallSessionContext = createContext();

export const CallSessionProvider = ({ children }) => {
  const [callSession, setCallSession] = useState(null);
  const [sessionData, setSessionData] = useState({
    dashboard: {},
    services: {},
    scheduling: {},
    serviceman: {}
  });

  // Start a new call session
  const startCallSession = (initialData) => {
    const session = {
      sessionId: Date.now(),
      startTime: new Date().toISOString(),
      isActive: true,
      ...initialData
    };
    
    setCallSession(session);
    setSessionData({
      dashboard: initialData,
      services: {},
      scheduling: {},
      serviceman: {}
    });
    
    sessionStorage.setItem('activeCallSession', JSON.stringify(session));
    sessionStorage.setItem('callSessionData', JSON.stringify({
      dashboard: initialData,
      services: {},
      scheduling: {},
      serviceman: {}
    }));
    
    console.log('📞 Call session started:', session);
  };

  // Update data for a specific step
  const updateStepData = (step, data) => {
    setSessionData(prev => {
      const updated = {
        ...prev,
        [step]: { ...prev[step], ...data }
      };
      sessionStorage.setItem('callSessionData', JSON.stringify(updated));
      console.log(`📝 Updated ${step} data:`, data);
      return updated;
    });
  };

  // Get data for a specific step
  const getStepData = (step) => {
    return sessionData[step] || {};
  };

  // End the call session
  const endCallSession = () => {
    console.log('📴 Call session ended');
    setCallSession(null);
    setSessionData({
      dashboard: {},
      services: {},
      scheduling: {},
      serviceman: {}
    });
    sessionStorage.removeItem('activeCallSession');
    sessionStorage.removeItem('callSessionData');
  };

  // Restore session on mount (if page refreshed)
  useEffect(() => {
    const savedSession = sessionStorage.getItem('activeCallSession');
    const savedData = sessionStorage.getItem('callSessionData');
    
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      setCallSession(parsedSession);
      console.log('🔄 Restored call session:', parsedSession);
    }
    
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setSessionData(parsedData);
      console.log('🔄 Restored session data:', parsedData);
    }
  }, []);

  return (
    <CallSessionContext.Provider value={{
      callSession,
      sessionData,
      startCallSession,
      updateStepData,
      getStepData,
      endCallSession
    }}>
      {children}
    </CallSessionContext.Provider>
  );
};

export const useCallSession = () => {
  const context = useContext(CallSessionContext);
  if (!context) {
    throw new Error('useCallSession must be used within CallSessionProvider');
  }
  return context;
};
