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
    console.log('Mission selected:', mission);
    setSelectedMission(mission);
    setShowNFTModal(true);
  };

  const handleNFTModalClose = () => {
    setShowNFTModal(false);
    setSelectedMission(null);
  };

  if (loading) {
    return (
      <div className="mission-modal-overlay">
        <div className="mission-modal">
          <div className="loading">Loading missions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mission-modal-overlay">
      <div className="mission-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
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
                <div className="mission-name neon-title">{mission.name}</div>
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

        {showNFTModal && selectedMission && (
          <NFTModal 
            mission={selectedMission}
            onClose={handleNFTModalClose}
          />
        )}
      </div>

      <style jsx>{`
        .mission-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .mission-modal {
          background: linear-gradient(135deg, #0a0a2e 0%, #16213e 50%, #0f3460 100%);
          border-radius: 20px;
          padding: 40px;
          max-width: 1200px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          border: 2px solid #ff00ff;
          box-shadow: 0 0 50px rgba(255, 0, 255, 0.3);
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 30px;
          background: none;
          border: none;
          color: #fff;
          font-size: 30px;
          cursor: pointer;
          z-index: 10;
          transition: color 0.3s ease;
        }

        .close-btn:hover {
          color: #ff00ff;
        }

        .mission-title {
          text-align: center;
          font-size: 48px;
          font-weight: bold;
          color: #ff00ff;
          margin-bottom: 30px;
          text-shadow: 0 0 20px rgba(255, 0, 255, 0.8);
          letter-spacing: 3px;
        }

        .missions-row-scroll {
          display: flex;
          flex-direction: row;
          gap: 30px;
          overflow-x: auto;
          padding-bottom: 18px;
          margin-bottom: 40px;
          margin-top: 32px;
          padding-top: 16px;
          scrollbar-color: #ff00ff #181828;
          scrollbar-width: thin;
        }
        .missions-row-scroll::-webkit-scrollbar {
          height: 14px;
          background: #181828;
          border-radius: 8px;
        }
        .missions-row-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #ff00ff 0%, #00ffff 100%);
          border-radius: 8px;
        }
        .missions-row-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #00ffff 0%, #ff00ff 100%);
        }
        .mission-card {
          position: relative;
          background: transparent;
          border: 2px solid #ff00ff;
          border-radius: 22px;
          min-width: 230px;
          max-width: 230px;
          width: 230px;
          height: 370px;
          padding: 0;
          cursor: pointer;
          transition: border-color 0.3s, transform 0.3s;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .mission-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(255, 0, 255, 0.4);
          border-color: #00ffff;
        }

        .mission-card.selected {
          border-color: #fff;
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
          filter: brightness(1.08) contrast(1.12) saturate(1.18) blur(0.5px);
        }
        .mission-content {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          height: 100%;
          padding: 44px 18px 32px 18px;
        }
        .mission-name.neon-title {
          font-size: 22px;
          font-weight: 600;
          color: #ff00ff;
          text-shadow: 0 0 6px #ff00ff99;
          margin-bottom: 4px;
          text-align: center;
          letter-spacing: 0.5px;
        }
        .mission-description {
          color: #b3b3ff;
          font-size: 15px;
          margin-bottom: 32px;
          text-align: center;
          font-weight: 400;
          text-shadow: none;
        }
        .mission-stats-box {
          width: 100%;
          background: rgba(10,10,46,0.82);
          border-radius: 0 0 18px 18px;
          padding: 18px 0 10px 0;
          box-shadow: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
        }
        .stat {
          color: #fff;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          text-shadow: 0 0 4px #ff00ff44;
        }
        .stat-icon {
          font-size: 22px;
          width: 28px;
          text-align: center;
        }

        .loading {
          text-align: center;
          color: white;
          font-size: 20px;
          padding: 40px;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .mission-modal {
            padding: 10px;
            width: 99%;
          }
          .mission-title {
            font-size: 26px;
          }
          .missions-row-scroll {
            gap: 12px;
            padding-bottom: 10px;
          }
          .mission-card {
            min-width: 170px;
            max-width: 170px;
            width: 170px;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default MissionModal;