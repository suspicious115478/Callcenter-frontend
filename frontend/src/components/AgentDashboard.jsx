import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { BACKEND_URL } from "../config";

export default function AgentDashboard() {
  const [status, setStatus] = useState("offline");
  // State is now used only for temporary display/notification before redirection
  const [incomingCall, setIncomingCall] = useState(null); 

  useEffect(() => {
    // 1. Initial status fetch
    fetch(`${BACKEND_URL}/agent/status`)
      .then(res => res.json())
      .then(data => setStatus(data.status));

    // 2. Socket.IO Listener for Incoming Calls
    const socket = io(BACKEND_URL);
    
    socket.on("incoming-call", (callData) => {
      // Set state for a quick notification display (optional)
      setIncomingCall(callData);

      const { dashboardLink, subscriptionStatus, name, caller } = callData;

      // Notify the agent about the incoming call
      alert(`🔔 Incoming Call: ${name || caller} | Status: ${subscriptionStatus}`);

      // **CORE LOGIC: Check and Redirect (Screen Pop)**
      if (dashboardLink) {
          console.log(`Redirecting agent to: ${dashboardLink}`);
          // Redirect the agent's browser window to the user dashboard or search page
          window.location.href = dashboardLink;
      }
    });

    // Cleanup socket listener on component unmount
    return () => {
        socket.off("incoming-call");
    };
  }, []); // Run only once on component mount

  const toggleStatus = () => {
    const newStatus = status === "offline" ? "online" : "offline";
    fetch(`${BACKEND_URL}/agent/status`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ status: newStatus })
    });
    setStatus(newStatus);
  };

  return (
    <div>
      <h2>Agent Dashboard</h2>
      <p>Status: {status}</p>
      <button onClick={toggleStatus}>
        Go {status === "offline" ? "Online" : "Offline"}
      </button>

      {/* This display block will show the call information briefly before redirection */}
      {incomingCall && (
        <div 
          style={{
            marginTop: 20, 
            padding: 10, 
            border: "2px solid",
            // Highlight verified calls
            borderColor: incomingCall.subscriptionStatus === "Verified" ? "green" : "gray",
            backgroundColor: incomingCall.subscriptionStatus === "Verified" ? "#e6ffe6" : "#fff"
          }}
        >
          <h3>Incoming Call</h3>
          <p>From: <strong>{incomingCall.caller}</strong> ({incomingCall.name})</p>
          <p>Status: <strong style={{color: incomingCall.subscriptionStatus === "Verified" ? "green" : "red"}}>{incomingCall.subscriptionStatus}</strong></p>
          <p>Ticket Info: {incomingCall.ticket}</p>
        </div>
      )}
    </div>
  );
}
