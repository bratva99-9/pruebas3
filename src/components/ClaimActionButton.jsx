import React, { useState, useEffect } from "react";
import { UserService } from "../UserService";

export default function ClaimActionButton() {
  const [claiming, setClaiming] = useState(false);
  const [toast, setToast] = useState(null);

  const wallet = UserService.isLogged() ? UserService.getName() : null;

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await UserService.claimRewards();
      setToast({ type: "success", message: "Claim successful!" });

      // Mostrar toast de actualización
      setTimeout(() => {
        setToast({ type: "info", message: "Updating balances..." });

        UserService.reloadBalances().then(() => {
          setTimeout(() => {
            setToast({ type: "success", message: "Balances updated!" });
          }, 500);
        });
      }, 1500);
    } catch (e) {
      setToast({ type: "error", message: "Claim failed: " + (e.message || e) });
    }
    setClaiming(false);
  };

  const Toast = ({ message, type }) => {
    useEffect(() => {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }, []);

    const backgroundColor = {
      success: "#22c55e",
      error: "#ef4444",
      info: "#3b82f6"
    }[type] || "#555";

    return (
      <div style={{
        position: "fixed",
        top: 100,
        right: 20,
        zIndex: 9999,
        padding: "14px 22px",
        borderRadius: 10,
        backgroundColor,
        color: "#fff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        fontSize: 16,
        fontWeight: 600,
        maxWidth: 280
      }}>
        {message}
      </div>
    );
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
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
            opacity: claiming || !wallet ? 0.6 : 1
          }}
          onClick={handleClaim}
          disabled={claiming || !wallet}
        >
          Claim
        </button>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
