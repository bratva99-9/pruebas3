import React, { useState } from "react";
import MissionModal from "../components/MissionModal";

const [showMissionModal, setShowMissionModal] = useState(false);

<MissionModal 
  isOpen={showMissionModal} 
  onClose={() => setShowMissionModal(false)} 
/>