import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import MissionModal from '../components/MissionModal';
import MissionStatus from '../components/missionstatus';
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
import home1 from '../images/home1.webp';

const buildingSprites = [
  missionButton, missionButton2, missionButton3, missionButton4, missionButton5,
  missionButton6, missionButton7, missionButton8, missionButton9
];

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
      <div className="home-image-row">
        <div className="home-image-container">
          <div className="user-tap">
            <span className="user-tap-name">{UserService.getName()}</span>
            <span className="user-tap-wax">{UserService.formatWAXOnly()} WAX</span>
          </div>
          <img src={home1} alt="Home Background" className="home-image" />
          <div className="user-info">
            <span className="home-user-sexy">{UserService.formatSEXYOnly()} SEXY</span>
            <button className="btn-logout" onClick={handleLogout}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff36ba" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="buildings-row">
        {buildingSprites.map((sprite, idx) => (
          <div
            key={idx}
            className="building-btn"
            style={{ backgroundImage: `url(${sprite})` }}
            onClick={() => setShowMission(true)}
          />
        ))}
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
          background: hsl(245, 86.70%, 2.90%);
          position: relative;
          overflow: hidden;
        }
        .home-image-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          width: 100%;
          margin-bottom: 32px;
        }
        .home-image-container {
          position: relative;
          border-radius: 28px;
          border: 2px solid #ff36ba;
          box-shadow: 0 0 20px rgba(255, 54, 186, 0.5);
          overflow: hidden;
          background: #181828;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          width: 855px;
          aspect-ratio: 3/2;
          min-width: 320px;
          height: auto;
        }
        .home-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .user-tap {
          position: absolute;
          left: -8px;
          top: 32px;
          min-width: 210px;
          height: 44px;
          background: #181828;
          border: 2.5px solid #00ffff;
          border-radius: 18px 0 0 18px;
          border-right: 0;
          box-shadow: 0 0 16px #00ffff44;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 0 22px 0 18px;
          font-size: 1.15rem;
          font-weight: 600;
          color: #fff;
          z-index: 4;
          letter-spacing: 0.5px;
        }
        .user-tap-name {
          color: #6ffcff;
          font-weight: 700;
        }
        .user-tap-wax {
          color: #00ffff;
          font-weight: 700;
        }
        .user-info {
          position: absolute;
          top: 18px;
          right: 24px;
          background: rgba(0, 255, 255, 0.13);
          border: 2px solid #00ffff;
          border-radius: 12px;
          padding: 6px 12px;
          text-align: center;
          color: #fff;
          font-weight: 500;
          font-size: 0.95rem;
          box-shadow: 0 2px 12px 0 #00ffff22;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
          z-index: 2;
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
          margin-left: 8px;
          cursor: default;
        }
        .buildings-row {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          justify-content: center;
          gap: 32px;
          margin-top: 36px;
        }
        .building-btn {
          width: 120px;
          height: 120px;
          background-repeat: no-repeat;
          background-size: 200% 100%;
          background-position: left center;
          cursor: pointer;
          border: none;
          outline: none;
          transition: none;
        }
        .building-btn:hover {
          background-position: right center;
        }
        .home-user-sexy {
          color: #ff36ba;
        }
      `}</style>
    </div>
  );
};

export default Home;