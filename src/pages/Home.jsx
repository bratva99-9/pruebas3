import React, { useState } from "react";
import StakingModal from "../components/StakingModal";
import MissionModal from "../components/MissionModal";

export default function Home() {
  const [showMissionModal, setShowMissionModal] = useState(false);

  return (
    <div className="gigaland-home-container flex flex-col items-center min-h-screen">
      <h1 className="gigaland-title text-center mb-8 mt-12 text-3xl font-bold text-white">
        Night Club Game
      </h1>
      <StakingModal />
      <button
        className="mt-6 bg-pink-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:bg-pink-700"
        onClick={() => setShowMissionModal(true)}
      >
        Seleccionar Misión
      </button>
      {showMissionModal && <MissionModal onClose={() => setShowMissionModal(false)} />}
    </div>
  );
}
