import React, { useState, useEffect, useCallback } from "react";
import { UserService } from "../UserService";

// Convierte IPFS URI o hash en URL pública
const ipfsify = (url) => {
  if (!url) return "";
  if (url.startsWith("ipfs://")) return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  if (/^Qm/.test(url)) return `https://ipfs.io/ipfs/${url}`;
  return url;
};

export default function MissionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);

  const fetchMissions = useCallback(async () => {
    try {
      const missionTypes = await UserService.getMissionTypes();
      const activeMissions = missionTypes.filter(m => m.is_active === 1);
      setMissions(activeMissions);
    } catch (e) {
      console.error("Error loading missions", e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchMissions();
  }, [isOpen, fetchMissions]);

  const handleMissionSelect = (mission) => {
    setSelectedMission(mission);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedMission(null);
  };

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
          🚀 Ver Misiones
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
            borderRadius: 24, width: "90%", maxWidth: 900,
            overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
          }}>
            <div style={{
              padding: "24px 32px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <h2 style={{ color: "#fff" }}>🎯 Selecciona una Misión</h2>
              <button onClick={handleClose} style={{
                background: "transparent", border: "none", color: "#fff",
                fontSize: 28, cursor: "pointer"
              }}>×</button>
            </div>

            <div style={{ padding: "0 32px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 20 }}>
              {missions.map(m => (
                <div key={m.id} onClick={() => handleMissionSelect(m)} style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16, padding: 20,
                  cursor: "pointer"
                }}>
                  <h3 style={{ color: "#667eea" }}>{m.name}</h3>
                  <p style={{ color: "#ccc" }}>{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
