// App.js (Updated)

import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import core component (assuming it handles the initial state/logic)
import AgentDashboard from "./components/AgentDashboard";

// 🚨 Import the required target components for the redirects
import NewCallSearchPage from "./pages/NewCallSearchPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import UserServicesPage from "./pages/UserServicesPage"; 
import ServiceManSelectionPage from "./pages/ServiceManSelectionPage"; 

function App() {
  return (
    // 1. Wrap the application in the Router
    <Router>
      <div className="app-container">
        
        {/* 2. Define the application Routes */}
        <Routes>
          
          {/* Primary Agent Dashboard (Default View) */}
          <Route path="/" element={<AgentDashboard />} />

          {/* Target for UNVERIFIED calls (e.g., /new-call/search?caller=...) */}
          <Route path="/new-call/search" element={<NewCallSearchPage />} />
          
          {/* 🚀 CRITICAL FIX: Changed parameter name from :phoneNumber to :userId */}
          <Route path="/user/dashboard/:userId" element={<UserDashboardPage />} />
          
          {/* Target for selecting services after ticket creation */}
          <Route path="/user/services" element={<UserServicesPage />} />
          <Route path="/user/servicemen" element={<ServiceManSelectionPage />} />
          
          {/* Optional: 404 Not Found fallback */}
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;


