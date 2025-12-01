import React, { useState } from "react";

export default function Softphone({ activeCall, onHangup }) {
  if (!activeCall) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      left: 20,
      width: 260,
      padding: 20,
      background: "#f8f8f8",
      borderRadius: 10,
      border: "1px solid #ccc",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
    }}>
      <h3>On Call</h3>
      <p>{activeCall.caller}</p>

      <button 
        onClick={onHangup}
        style={{
          background: "red",
          padding: 10,
          color: "white",
          border: "none",
          width: "100%",
          borderRadius: 5,
          marginTop: 10
        }}
      >
        Hang Up
      </button>
    </div>
  );
}
