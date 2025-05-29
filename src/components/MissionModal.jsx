import React, { useState, useEffect, useCallback } from 'react';
import { UserService } from '../UserService';
import NFTModal from './NFTModal';
import missionImg from '../images/1.webp';

const MissionModal = ({ onClose }) => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNFTModal, setShowNFTModal] = useState(false);

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
      <div className="mission-modal-content">
        <h1 className="mission-title">MISSION SELECTION</h1>
        <div className="missions-row-scroll">
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
                <div className="mission-title-box">
                  <div className="mission-name neon-title">{mission.name}</div>
                </div>
                <div className="mission-description">{mission.description}</div>
                <div className="mission-stats-box">
                  <div className="stat"><span className="stat-icon">⏱️</span> <span>{formatDuration(mission.duration_minutes)}</span></div>
                  <div className="stat"><span className="stat-icon">🪙</span> <span>{Number(mission.reward_multiplier).toFixed(1)} SEXXY</span></div>
                  <div className="stat"><span className="stat-icon">🎁</span> <span>{Number(mission.nft_drop_multiplier).toFixed(1)}% probabilidad</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="cancel-btn" onClick={onClose}>Cancelar</button>
      </div>
      {showNFTModal && selectedMission && (
        <NFTModal 
          mission={selectedMission}
          onClose={handleNFTModalClose}
        />
      )}
      <style jsx>{`
        .mission-modal-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          background: linear-gradient(135deg, #0a0a2e 0%, #16213e 50%, #0f3460 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
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
        .mission-content {
          position: absolute;
          z-index: 2;
          left: 0; right: 0; top: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          height: 100%;
          width: 100%;
        }
        .mission-title-box {
          width: 100%;
          padding: 12px 0 0 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .mission-name.neon-title {
          font-size: 17px;
          font-weight: 700;
          color: #ff6fff;
          text-shadow: 0 0 6px #ff00ff55;
          margin-bottom: 0;
          text-align: center;
          letter-spacing: 0.5px;
        }
        .mission-description {
          color: #b3b3ff;
          font-size: 13px;
          margin-bottom: 38px;
          margin-top: 10px;
          text-align: center;
          font-weight: 400;
          text-shadow: none;
        }
        .mission-stats-box {
          width: 100%;
          background: rgba(10,10,46,0.30);
          border-radius: 0 0 18px 18px;
          padding: 18px 0 10px 0;
          box-shadow: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
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
        .cancel-btn {
          position: fixed;
          left: 50%;
          bottom: 32px;
          transform: translateX(-50%);
          z-index: 10001;
          font-size: 18px;
          font-weight: 500;
          color: #fff;
          background: rgba(36,0,56,0.30);
          border: 1.5px solid #444;
          border-radius: 14px;
          padding: 10px 38px;
          box-shadow: 0 0 8px #0004;
          text-shadow: none;
          letter-spacing: 1px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .cancel-btn:hover {
          background: rgba(36,0,56,0.45);
          border-color: #888;
          color: #ff6fff;
          box-shadow: 0 0 16px #0006;
        }
      `}</style>
    </div>
  );
};

export default MissionModal;