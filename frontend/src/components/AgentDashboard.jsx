import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { BACKEND_URL } from "../config";
// 🚨 NEW IMPORT: Component to display individual calls
import CallCard from "./CallCard"; 

export default function AgentDashboard() {
  const [status, setStatus] = useState("offline");
  // 🚨 CHANGE: incomingCalls is now an array to hold multiple pending calls
  const [incomingCalls, setIncomingCalls] = useState([]); 

  useEffect(() => {
    // 1. Initial status fetch
    fetch(`${BACKEND_URL}/agent/status`)
      .then(res => res.json())
      .then(data => setStatus(data.status));

    // 2. Socket.IO Listener for Incoming Calls
    const socket = io(BACKEND_URL);
    
    socket.on("incoming-call", (callData) => {
      console.log("New call received, showing card:", callData.caller);
      
      // 🚨 CORE LOGIC CHANGE: Add the new call to the array state
      setIncomingCalls(prevCalls => [
        // Add a unique ID to manage the list (necessary for array state and React keys)
        { ...callData, id: Date.now() }, 
        ...prevCalls // Optionally display newer calls at the top
      ]);
      
      // Removed: alert() and automatic window.location.href
    });

    // Cleanup socket listener on component unmount
    return () => {
        socket.off("incoming-call");
    };
  }, []); 

  // 🚨 NEW FUNCTION: Handles the acceptance click from a CallCard
  const handleCallAccept = (acceptedCall) => {
    // 1. Redirect the agent immediately (The "Screen Pop")
    if (acceptedCall.dashboardLink) {
      console.log(`Call accepted. Redirecting agent to: ${acceptedCall.dashboardLink}`);
      window.location.href = acceptedCall.dashboardLink;
    }

    // 2. Remove the accepted call from the list, so the card disappears
    setIncomingCalls(prevCalls => 
      prevCalls.filter(call => call.id !== acceptedCall.id)
    );
  };

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

      {/* 🚨 RENDER CALL CARDS */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3>
            Pending Calls ({incomingCalls.length})
            {incomingCalls.length > 0 && " - Click 'Accept' to process."}
        </h3>
        {/* Map over the array and render a CallCard for each pending call */}
        {incomingCalls.map(call => (
          <CallCard 
            key={call.id} 
            callData={call} 
            onAccept={handleCallAccept} // Pass the handler function
          />
        ))}
      </div>
    </div>
  );
}
