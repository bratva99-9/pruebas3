import React, { useState } from "react";
import { UserService } from "../UserService";

export default function ClaimActionButton() {
  const [claiming, setClaiming] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const wallet = UserService.isLogged() ? UserService.getName() : null;

  const handleClaim = async () => {
    setClaiming(true);
    setMensaje("Procesando claim...");
    try {
      await UserService.claimRewards(); // Asegúrate que esta función esté implementada
      setMensaje("¡Claim exitoso!");
    } catch (e) {
      setMensaje("Error al reclamar: " + (e.message || e));
    }
    setClaiming(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0" }}>
      <button
        style={{
          background: "linear-gradient(90deg,#5eead4 0%,#3b82f6 100%)",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 18,
          border: "none",
          borderRadius: 14,
          padding: "12px 38px",
          boxShadow: "0 4px 24px #0002",
          cursor: claiming || !wallet ? "not-allowed" : "pointer",
          opacity: claiming || !wallet ? 0.6 : 1,
          transition: "all .18s"
        }}
        onClick={handleClaim}
        disabled={claiming || !wallet}
      >
        Claim
      </button>
      {mensaje && (
        <div style={{
          marginTop: 12,
          padding: "8px 16px",
          background: "#3b2548",
          color: "#fff",
          borderRadius: 10,
          fontWeight: 500,
          textAlign: "center",
          maxWidth: 300
        }}>
          {mensaje}
        </div>
      )}
    </div>
  );
}
