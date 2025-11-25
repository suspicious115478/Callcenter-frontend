import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [agentId, setAgentId] = useState("");
  const navigate = useNavigate();

  const login = () => {
    if (!agentId.trim()) return alert("Enter Agent ID");
    localStorage.setItem("agentId", agentId);
    navigate("/home");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: 300, margin: "80px auto" }}>
      <h2>Agent Login</h2>

      <input
        placeholder="Enter Agent ID"
        value={agentId}
        onChange={(e) => setAgentId(e.target.value)}
        style={{ padding: 10, marginBottom: 10 }}
      />

      <button onClick={login} style={{ padding: 10 }}>
        Login
      </button>
    </div>
  );
}
