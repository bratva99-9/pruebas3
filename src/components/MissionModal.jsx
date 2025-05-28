// src/components/MissionModal.jsx
import React, { useState, useEffect } from "react";
import { UserService } from "../UserService";

const CONTRACT_ACCOUNT = "nightclubapp";
const TABLE_NAME = "missiontypes";

export default function MissionModal({ onClose }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchMissions = async () => {
      if (!UserService.session) return;
      const result = await UserService.session.rpc.get_table_rows({
        code: CONTRACT_ACCOUNT,
        scope: CONTRACT_ACCOUNT,
        table: TABLE_NAME,
        limit: 1000,
        json: true
      });
      setMissions(result.rows || []);
      setLoading(false);
    };
    fetchMissions();
  }, []);

  const selectMission = (id) => {
    setSelected(id);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{
        background: "#201b2c", borderRadius: 20,
        padding: 32, width: "90%", maxWidth: 600, maxHeight: "80vh",
        overflowY: "auto", position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 10, right: 15,
            fontSize: 28, background: "none", color: "#fff",
            border: "none", cursor: "pointer"
          }}
        >×</button>
        <h2 style={{ color: "#fff", marginBottom: 20 }}>Selecciona una Misión</h2>
        {loading ? (
          <div style={{ color: "#fff" }}>Cargando misiones...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {missions.map((mission) => (
              <div
                key={mission.id}
                onClick={() => selectMission(mission.id)}
                style={{
                  padding: "12px 18px",
                  background: selected === mission.id ? "#5325e9" : "#322545",
                  color: "#fff",
                  borderRadius: 14,
                  cursor: "pointer",
                  fontWeight: "bold",
                  border: selected === mission.id ? "2px solid #ff36ba" : "1px solid #444",
                  transition: "all .2s"
                }}
              >
                {mission.name || `Misión #${mission.id}`}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
