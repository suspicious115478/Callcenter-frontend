import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { BACKEND_URL } from "../config";

export default function AgentDashboard() {
  const [status, setStatus] = useState("offline");
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/agent/status`)
      .then(res => res.json())
      .then(data => setStatus(data.status));

    const socket = io(BACKEND_URL);
    socket.on("incoming-call", (call) => {
      setIncomingCall(call);
    });
  }, []);

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

      {incomingCall && (
        <div style={{marginTop:20,padding:10,border:"1px solid gray"}}>
          <h3>Incoming Call</h3>
          <p>From: {incomingCall.caller}</p>
          <p>Name: {incomingCall.name}</p>
        </div>
      )}
    </div>
  );
}
