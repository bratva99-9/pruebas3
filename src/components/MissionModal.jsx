import React, { useState, useEffect, useCallback } from 'react';
import { UserService } from '../UserService';
import NFTModal from './NFTModal';
import missionImg from '../images/1.webp';

const MissionModal = ({ onClose }) => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNFTModal, setShowNFTModal] = useState(false);

  const missionImages = {
    'Night Club': '/missions/nightclub.png',
    'City Stroll': '/missions/city.png', 
    'Luxury Hotel': '/missions/hotel.png',
    'Beach Party': '/missions/beach.png'
  };

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
                <div className="mission-gradient-overlay" />
              </div>
              <div className="mission-content">
                <div className="mission-name neon-title">{mission.name}</div>
                <div className="mission-description">{mission.description}</div>
                <div className="mission-stats-row">
                  <div className="stat"><span className="stat-icon">⏱️</span> {formatDuration(mission.duration_minutes)}</div>
                  <div className="stat"><span className="stat-icon">🪙</span> {Number(mission.reward_multiplier).toFixed(1)} SEXXY</div>
                  <div className="stat"><span className="stat-icon">🎁</span> {Number(mission.nft_drop_multiplier).toFixed(1)}% probabilidad</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showNFTModal && selectedMission && (
          <NFTModal 
            mission={selectedMission}
            onClose={() => {
              console.log('Closing NFT Modal');
              setShowNFTModal(false);
              onClose(); // Cierra también el mission modal después de enviar
            }}
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
          border-radius: 18px;
          min-width: 224px;
          max-width: 224px;
          width: 224px;
          height: 390px;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
          box-shadow: 0 0 24px #ff00ff44;
        }

        .mission-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(255, 0, 255, 0.4);
          border-color: #00ffff;
        }

        .mission-card.selected {
          border-color: #00ffff;
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
          background: rgba(0, 255, 255, 0.1);
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
        }
        .mission-gradient-overlay {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 55%;
          background: linear-gradient(0deg, #181828 90%, rgba(24,24,40,0.1) 100%, transparent 100%);
          z-index: 2;
        }
        .mission-content {
          position: absolute;
          z-index: 3;
          left: 0; right: 0; bottom: 0; top: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          padding: 24px 12px 18px 12px;
        }
        .mission-name.neon-title {
          font-size: 22px;
          font-weight: bold;
          color: #ff00ff;
          text-shadow: 0 0 12px #ff00ff, 0 0 2px #fff;
          margin-bottom: 6px;
          text-align: center;
        }
        .mission-description {
          color: #b3b3ff;
          font-size: 15px;
          margin-bottom: 18px;
          text-align: center;
        }
        .mission-stats-row {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }
        .stat {
          color: #fff;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        .stat-icon {
          font-size: 18px;
          width: 24px;
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