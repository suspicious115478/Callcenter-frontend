import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AgentDashboard from "./components/AgentDashboard";

// 🚨 Import the required target components for the redirects
import NewCallSearchPage from "./pages/NewCallSearchPage";
import UserDashboardPage from "./pages/UserDashboardPage";

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
          
          {/* Target for VERIFIED calls (e.g., /user/dashboard/+91...) */}
          {/* The ':phoneNumber' is a dynamic parameter that captures the number */}
          <Route path="/user/dashboard/:phoneNumber" element={<UserDashboardPage />} />
          
          {/* Optional: 404 Not Found fallback */}
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;