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
      <div className="modal-fade-scale-container">
        <div className={`modal-fade-scale-front${showNFTModal ? ' fade-scale-out' : ''}`}>
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
                  </div>
                  <div className="mission-stats-bottom">
                    <div className="stat">
                      <span className="stat-icon">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8.5" stroke="#bfc2d1" strokeWidth="1.5"/><path d="M10 5.5V10L13 12" stroke="#bfc2d1" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </span>
                      <span className="stat-text">{formatDuration(mission.duration_minutes)}</span>
                    </div>
                    <div className="stat-separator"></div>
                    <div className="stat">
                      <span className="stat-icon">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="11" cy="11" r="9" fill="#ffe066" stroke="#ff00ff" strokeWidth="2"/>
                          <circle cx="11" cy="11" r="7" fill="#fffbe6" fillOpacity="0.7"/>
                          <path d="M11 15.2c-2.2-1.6-4-3.1-4-4.7a2 2 0 0 1 4-1.1A2 2 0 0 1 15 10.5c0 1.6-1.8 3.1-4 4.7z" fill="#ff00ff" stroke="#ff00ff" strokeWidth="0.7"/>
                        </svg>
                      </span>
                      <span className="stat-text">{Number.isInteger(Number(mission.reward_multiplier)) ? Number(mission.reward_multiplier) : Number(mission.reward_multiplier).toFixed(1)} SEXY</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="4.5" y="9.5" width="13" height="7" rx="2" fill="#ff00ff" fillOpacity="0.13" stroke="#ff00ff" strokeWidth="1.7"/>
                          <rect x="8.5" y="4.5" width="5" height="5" rx="1.5" fill="#ff00ff" fillOpacity="0.18" stroke="#ff00ff" strokeWidth="1.3"/>
                          <path d="M4.5 12H17.5" stroke="#ff00ff" strokeWidth="1.3"/>
                          <path d="M11 9.5V16" stroke="#ff00ff" strokeWidth="1.3"/>
                          <path d="M8.5 7C7.5 5.5 10 4 11 7" stroke="#ff00ff" strokeWidth="1.2" strokeLinecap="round"/>
                          <path d="M13.5 7C14.5 5.5 12 4 11 7" stroke="#ff00ff" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </span>
                      <span className="stat-text stat-gift-chance">{Number.isInteger(Number(mission.nft_drop_multiplier)) ? Number(mission.nft_drop_multiplier) : Number(mission.nft_drop_multiplier).toFixed(1)}% Gift Chance</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
        <div className={`modal-fade-scale-back${showNFTModal ? ' fade-scale-in' : ''}`}>
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
          overflow: visible;
        }
        .missions-row-scroll::after {
          content: '';
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10, 6, 22, 0.92) !important;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 20;
        }
        .missions-row-scroll.focus-mode::after {
          opacity: 1;
        }
        .missions-row-scroll.focus-mode .mission-card:not(:hover) {
          filter: grayscale(1);
          transform: scale(0.93);
          z-index: 21;
          transition: filter 0.9s cubic-bezier(0.4,0,0.2,1), transform 0.9s cubic-bezier(0.4,0,0.2,1);
        }
        .mission-card {
          min-width: 204px;
          max-width: 204px;
          width: 204px;
          height: 348px;
          border: none;
          border-radius: 18px;
          box-shadow: none;
          background: rgba(18, 10, 40, 0.92);
          overflow: visible;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          transition: border 0.32s cubic-bezier(0.4,0,0.2,1), transform 0.44s cubic-bezier(0.4,0,0.2,1), box-shadow 0.44s cubic-bezier(0.4,0,0.2,1), filter 0.44s cubic-bezier(0.4,0,0.2,1);
          z-index: 21;
        }
        .mission-card:hover {
          filter: none !important;
          transform: scale(1.08);
          z-index: 99999;
          transition: filter 0.9s cubic-bezier(0.4,0,0.2,1), transform 0.9s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 0 14px 3px #ff36ba44, 0 0 0 1.2px #ff00ff99;
          background: hsl(245, 86.70%, 2.90%);
        }
        .mission-bg-image {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          overflow: visible;
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
        .mission-stats-bottom {
          width: 100%;
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(30, 30, 50, 0.30);
          border-radius: 0 0 18px 18px;
          box-shadow: 0 2px 12px 0 #0002;
          padding-bottom: 18px;
          padding-top: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 15;
        }
        .stat {
          color: #bfc2d1;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 400;
          text-shadow: none;
          margin-bottom: 4px;
          letter-spacing: 0.01em;
        }
        .stat-text {
          color: #bfc2d1;
          font-size: 15px;
          font-weight: 400;
          letter-spacing: 0.01em;
          text-shadow: none;
          opacity: 0.85;
        }
        .stat-icon {
          font-size: 18px;
          width: 22px;
          text-align: center;
          opacity: 0.55;
          filter: grayscale(1) brightness(1.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }
        .stat-separator {
          width: 60%;
          height: 1.5px;
          background: linear-gradient(90deg, #e0e0e055 0%, #fff0 100%);
          margin: 2px auto 6px auto;
          border: none;
          border-radius: 1.5px;
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
        .missions-row-scroll.focus-mode ~ .cancel-btn {
          filter: grayscale(1) brightness(0.7);
          opacity: 0.7;
          transition: filter 0.4s, opacity 0.4s;
        }
        /* Animaciones para los modales */
        .modal-transition {
          animation: scaleInModal 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes scaleInModal {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        /* Fade + Scale para transición de modales */
        .modal-fade-scale-container {
          position: relative;
          width: 100vw;
          height: 100vh;
        }
        .modal-fade-scale-front, .modal-fade-scale-back {
          position: absolute;
          top: 0; left: 0; width: 100vw; height: 100vh;
          transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1);
          will-change: opacity, transform;
          z-index: 2;
          pointer-events: all;
        }
        .modal-fade-scale-front {
          opacity: 1;
          transform: scale(1);
          z-index: 3;
        }
        .modal-fade-scale-front.fade-scale-out {
          opacity: 0;
          transform: scale(0.93);
          pointer-events: none;
          z-index: 2;
        }
        .modal-fade-scale-back {
          opacity: 0;
          transform: scale(1.07);
          z-index: 2;
          pointer-events: none;
        }
        .modal-fade-scale-back.fade-scale-in {
          opacity: 1;
          transform: scale(1);
          pointer-events: all;
          z-index: 4;
        }
        .mission-card-hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 18px;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(255,0,255,0.13) 0%, rgba(255,0,255,0.09) 100%);
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 5;
        }
        .mission-card:hover .mission-card-hover-overlay {
          opacity: 1;
        }
        .stat-gift-chance {
          color: #bfc2d1;
          font-weight: 400;
          opacity: 0.95;
          letter-spacing: 0.01em;
          font-size: 15px;
          text-shadow: none;
        }
        .modal-fade-scale-container::after {
          content: '';
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10, 6, 22, 0.92);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s;
          z-index: 9;
        }
        .modal-fade-scale-back.fade-scale-in ~ .modal-fade-scale-container::after {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default MissionModal;