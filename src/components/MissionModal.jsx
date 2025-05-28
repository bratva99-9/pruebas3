import React, { useState, useEffect, useCallback } from 'react';
import { UserService } from '../UserService';
import NFTModal from './NFTModal';

const MissionModal = ({ onClose }) => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
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
        
        {showSuccess && (
          <div className="success-message">
            Success! Mission selected: {selectedMission?.name}
          </div>
        )}

        <div className="missions-grid">
          {missions.map((mission) => (
            <div 
              key={mission.id} 
              className={`mission-card ${selectedMission?.id === mission.id ? 'selected' : ''}`}
              onClick={() => handleMissionSelect(mission)}
            >
              <div className="mission-image">
                <img 
                  src={missionImages[mission.name] || '/missions/nightclub.png'} 
                  alt={mission.name}
                  onError={(e) => {
                    console.log('Image failed to load:', e.target.src);
                    // Usar un placeholder o imagen por defecto
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
              
              <div className="mission-info">
                <h3 className="mission-name">{mission.name}</h3>
                <p className="mission-description">{mission.description}</p>
                
                <div className="mission-stats">
                  <div className="stat">
                    <span className="stat-icon">⏱️</span>
                    <span>{formatDuration(mission.duration_minutes)}</span>
                  </div>
                  
                  <div className="stat">
                    <span className="stat-icon">🪙</span>
                    <span>{Number(mission.reward_multiplier).toFixed(1)} SEXXY</span>
                  </div>
                  
                  <div className="stat">
                    <span className="stat-icon">🎁</span>
                    <span>{Number(mission.nft_drop_multiplier).toFixed(1)}% probabilidad</span>
                  </div>
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

        .success-message {
          background: rgba(0, 255, 255, 0.2);
          border: 2px solid #00ffff;
          border-radius: 10px;
          padding: 15px;
          text-align: center;
          color: #00ffff;
          margin-bottom: 30px;
          font-size: 18px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .missions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        .mission-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid #ff00ff;
          border-radius: 15px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
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

        .mission-image {
          width: 100%;
          height: 200px;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 15px;
          background: #333;
        }

        .mission-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .mission-card:hover .mission-image img {
          transform: scale(1.05);
        }

        .mission-info {
          color: white;
        }

        .mission-name {
          font-size: 24px;
          font-weight: bold;
          color: #ff00ff;
          margin-bottom: 10px;
          text-align: center;
        }

        .mission-description {
          font-size: 14px;
          color: #ccc;
          margin-bottom: 20px;
          text-align: center;
          line-height: 1.4;
        }

        .mission-stats {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          color: #fff;
          padding: 5px 0;
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
            padding: 20px;
            width: 95%;
          }
          
          .mission-title {
            font-size: 32px;
          }
          
          .missions-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default MissionModal;