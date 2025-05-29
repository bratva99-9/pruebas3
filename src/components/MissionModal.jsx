import React, { useState, useEffect, useCallback } from 'react';
import { UserService } from '../UserService';
import NFTModal from './NFTModal';
import missionImg from '../images/1.webp';

const MissionModal = ({ onClose }) => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await UserService.rpc.get_table_rows({
        code: 'nightclubapp',
        scope: 'nightclubapp',
        table: 'missiontypes',
        limit: 100
      });
      setMissions(response.rows || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching missions:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return hours === 1 ? '1 hour' : `${hours} hours`;
      } else {
        return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
      }
    }
  };

  const handleMissionSelect = (mission) => {
    setSelectedMission(mission);
    setShowNFTModal(true);
  };

  const handleNFTModalClose = () => {
    setShowNFTModal(false);
    setSelectedMission(null);
  };

  const handleRowMouseEnter = () => setFocusMode(true);
  const handleRowMouseLeave = () => setFocusMode(false);

  if (loading) {
    return (
      <div className="mission-modal-fullscreen">
        <div className="mission-modal-content">
          <div className="loading">Loading missions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mission-modal-fullscreen">
      <div className={`modal-flip3d-container${showNFTModal ? ' flipped' : ''}`}>
        <div className="modal-flip3d-front">
          <div className="mission-modal-content">
            <h1 className="mission-title">MISSION SELECTION</h1>
            <div className={`missions-row-scroll${focusMode ? ' focus-mode' : ''}`}
                 onMouseEnter={handleRowMouseEnter}
                 onMouseLeave={handleRowMouseLeave}>
              {missions.map((mission) => (
                <div 
                  key={mission.id} 
                  className={`mission-card ${selectedMission?.id === mission.id ? 'selected' : ''}`}
                  onClick={() => handleMissionSelect(mission)}
                >
                  <div className="mission-bg-image">
                    <img 
                      src={missionImg} 
                      alt={mission.name}
                      className="mission-bg-img"
                    />
                  </div>
                  <div className="mission-content">
                    <div className="mission-header-box">
                      <div className="mission-name neon-title">{mission.name}</div>
                      <div className="mission-description">{mission.description}</div>
                    </div>
                    <div className="mission-divider"></div>
                    <div className="mission-stats-container">
                      <div className="mission-stats-box">
                        <div className="stat"><span className="stat-icon">⏱️</span> <span>{formatDuration(mission.duration_minutes)}</span></div>
                        <div className="stat"><span className="stat-icon">🪙</span> <span>{Number(mission.reward_multiplier).toFixed(1)} SEXXY</span></div>
                        <div className="stat"><span className="stat-icon">🎁</span> <span>{Number(mission.nft_drop_multiplier).toFixed(1)}% probabilidad</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="cancel-btn" onClick={onClose}>Cancelar</button>
          </div>
        </div>
        <div className="modal-flip3d-back">
          {showNFTModal && selectedMission && (
            <NFTModal 
              mission={selectedMission}
              onClose={handleNFTModalClose}
            />
          )}
        </div>
      </div>
      <style jsx>{`
        .mission-modal-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          background:hsl(245, 86.70%, 2.90%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          animation: fadeInModal 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .mission-modal-content {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 24px;
        }
        .mission-title {
          text-align: center;
          font-size: 38px;
          font-weight: 700;
          color: #ff6fff;
          margin-bottom: 18px;
          text-shadow: 0 0 12px #ff00ff99;
          letter-spacing: 2px;
        }
        .missions-row-scroll {
          display: flex;
          flex-direction: row;
          gap: 36px;
          overflow-x: auto;
          padding-bottom: 18px;
          margin-bottom: 0;
          margin-top: 8px;
          padding-top: 16px;
          scrollbar-color: #ff00ff #181828;
          scrollbar-width: thin;
          justify-content: center;
          width: 100vw;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          position: relative;
        }
        .missions-row-scroll::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(18,9,42,0.3);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 2;
        }
        .missions-row-scroll.focus-mode::before {
          opacity: 1;
        }
        .mission-card {
          min-width: 204px;
          max-width: 204px;
          width: 204px;
          height: 348px;
          border: none;
          border-radius: 18px;
          box-shadow: none;
          background: none;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          transition: border 0.2s, transform 0.32s cubic-bezier(0.4,0,0.2,1), box-shadow 0.32s, filter 0.32s;
          z-index: 3;
        }
        .mission-card:hover {
          border: 1.2px solid #ff00ffcc;
          transform: scale(1.08);
          box-shadow: 0 0 24px 0 #00ffff33, 0 0 0 1.2px #ff00ff55;
          z-index: 4;
        }
        .missions-row-scroll.focus-mode .mission-card:not(:hover) {
          transform: scale(0.93);
          z-index: 2;
        }
        .missions-row-scroll.focus-mode .mission-card:hover {
          transform: scale(1.08);
          z-index: 5;
        }
        .mission-bg-image {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .mission-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 18px;
        }
        .mission-gradient-bottom {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 34%;
          background: linear-gradient(0deg, rgba(10,10,46,0.10) 90%, rgba(10,10,46,0.0) 100%);
          z-index: 2;
          border-radius: 0 0 18px 18px;
        }
        .mission-content {
          position: absolute;
          z-index: 2;
          left: 0; right: 0; top: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          height: 100%;
          width: 100%;
        }
        .mission-header-box {
          width: 100%;
          padding: 10px 0 0 0;
          background: linear-gradient(180deg, rgba(10,10,46,0.65) 80%, rgba(10,10,46,0.0) 100%);
          border-radius: 18px 18px 0 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .mission-name.neon-title {
          font-size: 17px;
          font-weight: 700;
          color: #00ffff;
          text-shadow: 0 0 6px #00ffff55;
          margin-bottom: 2px;
          text-align: center;
          letter-spacing: 0.5px;
          transition: color 0.25s;
        }
        .mission-description {
          color: #b0b0c3;
          font-size: 13px;
          margin-bottom: 0;
          margin-top: 0;
          text-align: center;
          font-weight: 400;
          text-shadow: none;
          line-height: 1.3;
          margin-bottom: 6px;
          transition: color 0.25s;
        }
        .mission-card:hover .mission-name.neon-title {
          color: #ff00ff;
          text-shadow: 0 0 8px #ff00ffcc;
        }
        .mission-card:hover .mission-description {
          color: #ffe6ff;
        }
        .mission-divider {
          width: 70%;
          height: 2px;
          background: linear-gradient(90deg, #ff00ff99 0%, #fff0 100%);
          margin: 0 auto 0 auto;
          border: none;
          border-radius: 2px;
        }
        .mission-stats-container {
          width: 100%;
          background: rgba(18, 9, 42, 0.72);
          border-radius: 0 0 18px 18px;
          box-shadow: 0 2px 12px 0 #0002;
          padding-bottom: 18px;
          padding-top: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .mission-stats-box {
          width: 100%;
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding-bottom: 18px;
          padding-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          z-index: 3;
        }
        .stat {
          color: #e0e0e0;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          text-shadow: 0 0 2px #000a;
        }
        .stat-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
          filter: grayscale(1) brightness(1.5);
        }
        .stat-prob {
          color: #ff36ba;
          font-weight: 700;
        }
        .cancel-btn {
          position: fixed;
          left: 50%;
          bottom: 32px;
          transform: translateX(-50%);
          z-index: 10001;
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 8px 32px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 1px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .cancel-btn:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
          color: #fff;
          box-shadow: none;
        }
        /* Animaciones para los modales */
        .modal-transition {
          animation: scaleInModal 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes scaleInModal {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        /* Flip 3D elegante para transición de modales */
        .modal-flip3d-container {
          perspective: 1200px;
          width: 100vw;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(18,9,42,0.85);
          backdrop-filter: blur(6px);
          transition: background 0.5s;
        }
        .modal-flip3d-front, .modal-flip3d-back {
          width: 100vw;
          height: 100vh;
          position: absolute;
          top: 0;
          left: 0;
          backface-visibility: hidden;
          box-shadow: 0 8px 48px 0 #0008, 0 1.5px 0 #ff00ff33;
          border-radius: 24px;
          overflow: hidden;
        }
        .modal-flip3d-front {
          background: none;
          z-index: 2;
          transform: rotateY(0deg);
          transition: transform 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        .modal-flip3d-back {
          background: none;
          z-index: 3;
          transform: rotateY(180deg);
          transition: transform 0.7s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 8px 48px 0 #000a, 0 1.5px 0 #00fff033;
        }
        .modal-flip3d-container.flipped .modal-flip3d-front {
          transform: rotateY(-180deg);
        }
        .modal-flip3d-container.flipped .modal-flip3d-back {
          transform: rotateY(0deg);
        }
        /* Brillo elegante al finalizar el giro */
        .modal-flip3d-back {
          animation: flipShine 0.8s 0.6s both;
        }
        @keyframes flipShine {
          0% { box-shadow: 0 8px 48px 0 #000a, 0 1.5px 0 #00fff033; }
          60% { box-shadow: 0 0 80px 16px #ff6fff66, 0 1.5px 0 #00fff033; }
          100% { box-shadow: 0 8px 48px 0 #000a, 0 1.5px 0 #00fff033; }
        }
      `}</style>
    </div>
  );
};

export default MissionModal;