import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import MissionModal from '../components/MissionModal';
import MissionStatus from '../components/missionstatus';
import ClaimActionButton from '../components/ClaimActionButton';
import { UserService } from '../UserService';
import fondo2 from '../images/fondo2.webp';
import missionButton from '../images/missionboton.webp';
import missionButtonHover from '../images/missionboton1.webp';

const Home = () => {
  const [showMission, setShowMission] = useState(false);
  const [showMissionStatus, setShowMissionStatus] = useState(false);
  const navigate = useHistory();

  const handleLogout = () => {
    UserService.logout();
    navigate.push('/');
  };

  return (
    <div
      className="home"
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: `url(${fondo2})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        padding: 0,
        margin: 0,
        position: 'relative',
        textAlign: 'center',
        overflow: 'hidden'
      }}
    >
      <div className="home-user-bar">
        <span className="home-user-name">{UserService.getName()}</span>
        <span className="home-user-balance">{UserService.formatWAXOnly()} WAX</span>
        <span className="home-user-sexy">{UserService.formatSEXYOnly()} SEXY</span>
        <button
          className="home-logout-btn"
          onClick={handleLogout}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff36ba" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
      <ClaimActionButton />
      <div style={{display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24}}>
        <button
          className="mission-button"
          onClick={() => setShowMission(true)}
        >
          Mission
        </button>
        <button
          className="btn-square btn-small"
          onClick={() => setShowMissionStatus(true)}
        >
          Mission Status
        </button>
      </div>
      {showMission && (
        <MissionModal
          onClose={() => setShowMission(false)}
          onForceCloseAll={() => setShowMission(false)}
        />
      )}
      {showMissionStatus && (
        <MissionStatus
          onClose={() => setShowMissionStatus(false)}
        />
      )}
      <style jsx>{`
        .home-user-bar {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          margin-bottom: 18px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(90deg, rgba(36,0,56,0.7) 0%, rgba(36,0,56,0.3) 100%);
          border-radius: 12px;
          padding: 8px 24px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.2);
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          letter-spacing: 0.5px;
          margin-top: 24px;
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
        }
        .home-logout-btn {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        .home-logout-btn:hover {
          transform: scale(1.1);
        }
        .mission-button {
          width: 200px;
          height: 60px;
          background: url(${missionButton}) no-repeat center center;
          background-size: contain;
          border: none;
          cursor: pointer;
          transition: background-image 0.2s;
        }
        .mission-button:hover {
          background-image: url(${missionButtonHover});
        }
        .home-user-name {
          color: #ffb9fa;
        }
        .home-user-balance {
          color: #00ffff;
        }
        .home-user-sexy {
          color: #ff36ba;
        }
      `}</style>
    </div>
  );
};

export default Home;