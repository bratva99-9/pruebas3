import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import MissionModal from '../components/MissionModal';
import MissionStatus from '../components/missionstatus';
import ClaimActionButton from '../components/ClaimActionButton';
import { UserService } from '../UserService';
import missionButton from '../images/missionboton.webp';
import missionButton2 from '../images/missionboton2.webp';
import missionButton3 from '../images/missionboton3.webp';
import missionButton4 from '../images/missionboton4.webp';
import missionButton5 from '../images/missionboton5.webp';
import missionButton6 from '../images/missionboton6.webp';
import missionButton7 from '../images/missionboton7.webp';
import missionButton8 from '../images/missionboton8.webp';
import missionButton9 from '../images/missionboton9.webp';
import home1 from '../images/home1.png';

const Home = () => {
  const [showMission, setShowMission] = useState(false);
  const [showMissionStatus, setShowMissionStatus] = useState(false);
  const navigate = useHistory();

  const handleLogout = () => {
    UserService.logout();
    navigate.push('/');
  };

  return (
    <div className="home-container">
      <div className="home-image-container">
        <img src={home1} alt="Home Background" className="home-image" />
      </div>
      <div className="home-user-bar user-info">
        <span className="home-user-name">{UserService.getName()}</span>
        <span className="home-user-balance">{UserService.formatWAXOnly()} WAX</span>
        <span className="home-user-sexy">{UserService.formatSEXYOnly()} SEXY</span>
        <button className="btn-logout" onClick={handleLogout}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff36ba" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
      <ClaimActionButton />
      <div style={{display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24}}>
        <div className="mission-button" onClick={() => setShowMission(true)} />
        <div className="mission-button" onClick={() => setShowMission(true)} />
        <div className="mission-button" onClick={() => setShowMission(true)} />
        <div className="mission-button" onClick={() => setShowMission(true)} />
        <div className="mission-button" onClick={() => setShowMission(true)} />
        <div className="mission-button" onClick={() => setShowMission(true)} />
        <div className="mission-button" onClick={() => setShowMission(true)} />
        <div className="mission-button" onClick={() => setShowMission(true)} />
        <div className="mission-button" onClick={() => setShowMission(true)} />
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
        .home-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 20px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          position: relative;
          overflow: hidden;
        }
        .home-image-container {
          margin: 32px auto 24px auto;
          border-radius: 20px;
          border: 2px solid #ff36ba;
          box-shadow: 0 0 20px rgba(255, 54, 186, 0.5);
          overflow: hidden;
          background: #181828;
          display: flex;
          align-items: center;
          justify-content: center;
          width: auto;
          max-width: 100vw;
        }
        .home-image {
          display: block;
          max-width: 100%;
          height: auto;
        }
        .user-info {
          background: rgba(0, 255, 255, 0.13);
          border: 2px solid #00ffff;
          border-radius: 12px;
          padding: 20px 32px;
          margin-top: 20px;
          text-align: center;
          color: #fff;
          font-weight: 500;
          font-size: 1.1rem;
          box-shadow: 0 2px 12px 0 #00ffff22;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 18px;
        }
        .btn-logout {
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
          box-shadow: none;
          margin-left: 12px;
          /* Sin cursor pointer ni efectos */
          cursor: default;
        }
        .mission-button {
          width: 120px;
          height: 120px;
          background: url(${missionButton}) no-repeat left center;
          background-size: 200% auto;
          cursor: pointer;
        }
        .mission-button:nth-child(1) { background-image: url(${missionButton}); }
        .mission-button:nth-child(2) { background-image: url(${missionButton2}); }
        .mission-button:nth-child(3) { background-image: url(${missionButton3}); }
        .mission-button:nth-child(4) { background-image: url(${missionButton4}); }
        .mission-button:nth-child(5) { background-image: url(${missionButton5}); }
        .mission-button:nth-child(6) { background-image: url(${missionButton6}); }
        .mission-button:nth-child(7) { background-image: url(${missionButton7}); }
        .mission-button:nth-child(8) { background-image: url(${missionButton8}); }
        .mission-button:nth-child(9) { background-image: url(${missionButton9}); }
        .mission-button:hover {
          background-position: right center;
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