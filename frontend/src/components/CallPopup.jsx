import React from "react";

export default function CallPopup({ call, onAccept, onReject }) {
  if (!call) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      width: 280,
      padding: 20,
      border: "1px solid #ccc",
      borderRadius: 10,
      background: "#fff",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
    }}>
      <h3>Incoming Call</h3>
      <p><strong>From:</strong> {call.caller}</p>
      <p><strong>Name:</strong> {call.name}</p>

      <button onClick={onAccept} style={{ marginRight: 10, padding: 8 }}>
        Accept
      </button>
      <button onClick={onReject} style={{ padding: 8 }}>
        Reject
      </button>
    </div>
  );
}
