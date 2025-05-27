import React from "react";
import MissionModal from "../components/MissionModal";
import UnstakeModal from "../components/UnstakeModal";
import ClaimActionButton from "../components/ClaimActionButton";

export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Night Club Game</h1>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Gestión de Misiones</h2>
        <div style={styles.actions}>
          <MissionModal />
          <ClaimActionButton />
          <UnstakeModal />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#181824",
    minHeight: "100vh",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  title: {
    fontSize: "3rem",
    fontWeight: "bold",
    color: "#ff36ba",
    marginBottom: "40px",
    textShadow: "0 3px 12px rgba(255, 54, 186, 0.7)",
    textAlign: "center"
  },
  card: {
    background: "linear-gradient(135deg, #221c34 60%, #1a162b)",
    borderRadius: "20px",
    padding: "50px 30px",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backdropFilter: "blur(5px)"
  },
  sectionTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "30px"
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%"
  }
};
