// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth'; // Import Firebase listener

// Import the auth instance from the config file
import { auth } from './config'; 

// Pages
import Login from './pages/Login'; // Public Auth Page
import Signup from './pages/Signup'; // Public Auth Page (New)
import Home from './pages/Home';
import NewCallSearchPage from "./pages/NewCallSearchPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import UserServicesPage from "./pages/UserServicesPage"; 
import { ServiceManSelectionPage } from "./pages/ServiceManSelectionPage"; // Named Import
// 🚨 NEW IMPORT: Import the Employee Help Desk Page
import EmployeeHelpDeskPage from "./pages/EmployeeHelpDeskPage"; 
import SchedulingPage from "./pages/SchedulingPage";
// Components
import AgentDashboard from "./components/AgentDashboard";


// --- Protected Route Component (Auth Guard) ---
const ProtectedRoute = ({ children, isAuthenticated }) => {
    if (isAuthenticated === null) {
        // Still checking auth state, show a simple loader
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: '#1f2937'}}>Checking Authentication...</div>;
    }
    // If not authenticated, redirect to login
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    // isAuthenticated state: null (checking), true (logged in), false (logged out)
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    
    // 🔥 NEW STATE: Tracks if the last action was a signup that resulted in auto-login.
    const [justSignedUp, setJustSignedUp] = useState(false);

    useEffect(() => {
        // Firebase listener for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                setIsAuthenticated(true);
            } else {
                // User is signed out
                setIsAuthenticated(false);
            }
            setLoadingAuth(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Function to set the flag after a successful signup redirection (called from Signup page)
    const handleSignupSuccess = () => {
        setJustSignedUp(true);
    };

    if (loadingAuth) {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: '#1f2937'}}>Loading App...</div>;
    }
    
    // 🔥 NEW LOGIC: If authenticated but flagged as 'justSignedUp', redirect to /login
    if (isAuthenticated && justSignedUp) {
        // Clear the flag after redirecting
        setJustSignedUp(false);
        console.log("Redirecting new sign-up user to Login page.");
        return <Navigate to="/login" replace />;
    }

    return (
        <Router>
            <div className="app-container">
                <Routes>
                    {/* --- 1. Public Auth Routes --- */}
                    {/* 💡 Pass the callback function to the Signup page */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={
                        <Signup onSuccessfulSignup={handleSignupSuccess} />
                    } />
                    
                    {/* --- 2. Protected Agent Routes (Wrapped in ProtectedRoute) --- */}
                    
                    {/* Primary Agent Dashboard (Default View) */}
                    <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AgentDashboard /></ProtectedRoute>} />

                    {/* 🚀 NEW ROUTE: Employee Help Desk */}
                    <Route 
                        path="/employeehelpdesk" 
                        element={<ProtectedRoute isAuthenticated={isAuthenticated}><EmployeeHelpDeskPage /></ProtectedRoute>} 
                    />

                    {/* Target for UNVERIFIED calls */}
                    <Route path="/new-call/search" element={<ProtectedRoute isAuthenticated={isAuthenticated}><NewCallSearchPage /></ProtectedRoute>} />
                    
                    {/* User Dashboard */}
                    <Route path="/user/dashboard/:userId" element={<ProtectedRoute isAuthenticated={isAuthenticated}><UserDashboardPage /></ProtectedRoute>} />
                    
                    {/* Service Flows */}
                    <Route path="/user/services" element={<ProtectedRoute isAuthenticated={isAuthenticated}><UserServicesPage /></ProtectedRoute>} />
                    <Route path="/user/servicemen" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ServiceManSelectionPage /></ProtectedRoute>} />
                    <Route path="/user/scheduling" element={<SchedulingPage />} />
                    {/* Optional: Catch all other routes */}
                    <Route path="*" element={
                        isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;


