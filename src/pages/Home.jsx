import React from "react";
import StakingModal from "../components/StakingModal";
import UnstakeModal from "../components/UnstakeModal";
import ClaimActionButton from "../components/ClaimActionButton";

export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Night Club Game</h1>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>NFT Staking</h2>
        <div style={styles.actions}>
          <StakingModal />
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
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#ff36ba",
    marginBottom: "40px",
    textShadow: "0 2px 8px rgba(255, 54, 186, 0.6)"
  },
  card: {
    backgroundColor: "#221c34",
    borderRadius: "16px",
    padding: "40px",
    maxWidth: "460px",
    width: "100%",
    boxShadow: "0 8px 28px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  sectionTitle: {
    fontSize: "1.6rem",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "30px"
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%"
  }
};
