import React, { useState } from "react";

export default function MissionModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 16,
            padding: "14px 32px",
            fontSize: 18,
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
            transition: "all 0.3s"
          }}
        >
          🚀 Send to Mission
        </button>
      </div>

      {isOpen && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, backdropFilter: "blur(5px)"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1e1e2e 0%, #2d1b69 100%)",
            borderRadius: 24, width: "90%", maxWidth: 900, maxHeight: "90vh",
            overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
          }}>
            <div style={{
              padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(0,0,0,0.2)"
            }}>
              <h2 style={{ margin: 0, color: "#fff", fontSize: 24, fontWeight: "bold" }}>
                Modal abierto
              </h2>
              <button onClick={() => setIsOpen(false)} style={{
                background: "transparent", border: "none", color: "#fff",
                fontSize: 28, cursor: "pointer", opacity: 0.7
              }}>×</button>
            </div>

            <div style={{ padding: "24px 32px", color: "#fff" }}>
              <p>Aquí irá el contenido del modal.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
