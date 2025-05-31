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
        <div className="user-taps-vertical small-ears">
          <div className="user-tap user-tap-block small-ear">
            <span className="user-tap-name">{UserService.getName()}</span>
          </div>
          <div className="user-tap user-tap-block small-ear">
            <span className="user-tap-wax">{UserService.formatWAXOnly()} WAX</span>
          </div>
          <div className="user-tap user-tap-block small-ear">
            <span className="user-tap-sexy">{UserService.formatSEXYOnly()} SEXY</span>
          </div>
        </div>
        <div className="home-image-container">
          <div className="logout-ear small-ear">
            <button className="btn-logout" onClick={handleLogout}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff36ba" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
          <img src={home1} alt="Home Background" className="home-image" />
          <div
            className="mission-button main-building"
            style={{ backgroundImage: `url(${missionButton})` }}
            onClick={() => setShowMission(true)}
          />
          <div
            className="mission-button main-building second-building"
            style={{ backgroundImage: `url(${missionButton8})` }}
            onClick={() => setShowMission(true)}
          />
        </div>
      </div>
      <div className="buildings-row">
        {buildingSprites.slice(1).map((sprite, idx) => (
          <div
            key={idx}
            className="mission-button"
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
          justify-content: center;
          padding: 20px;
          background: hsl(245, 86.70%, 2.90%);
          position: relative;
          overflow: hidden;
        }
        .home-image-row {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: center;
          width: 100%;
          margin-bottom: 32px;
        }
        .user-taps-vertical.small-ears {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          margin-top: 38px;
          margin-right: 0;
          z-index: 4;
        }
        .user-tap.user-tap-block.small-ear {
          min-width: 140px;
          height: 30px;
          background: #181828;
          border: 2px solid #ff36ba;
          border-radius: 12px 0 0 12px;
          border-right: 0;
          box-shadow: 0 0 8px #ff36ba33;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 14px 0 10px;
          font-size: 0.95rem;
          font-weight: 500;
          color: #fff;
          letter-spacing: 0.2px;
          text-align: center;
        }
        .user-tap-name {
          color: #ffb9fa;
          font-weight: 600;
        }
        .user-tap-wax {
          color: #00ffff;
          font-weight: 600;
        }
        .user-tap-sexy {
          color: #ff36ba;
          font-weight: 600;
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
        .logout-ear.small-ear {
          position: absolute;
          top: 38px;
          right: -142px;
          min-width: 38px;
          height: 30px;
          background: #181828;
          border: 2px solid #ff36ba;
          border-radius: 0 12px 12px 0;
          border-left: 0;
          box-shadow: 0 0 8px #ff36ba33;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
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
          margin: 0;
          cursor: pointer;
        }
        .home-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .main-building {
          position: absolute;
          left: 60px;
          bottom: 40px;
          width: 360px;
          height: 360px;
          z-index: 3;
        }
        .second-building {
          left: 260px;
          bottom: 40px;
        }
        .buildings-row {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          justify-content: center;
          gap: 32px;
          margin-top: 36px;
        }
        .mission-button {
          width: 120px;
          height: 120px;
          background-repeat: no-repeat;
          background-size: 200% auto;
          background-position: left center;
          cursor: pointer;
          border: none;
          outline: none;
          transition: none;
        }
        .mission-button:hover {
          background-position: right center;
        }
      `}</style>
    </div>
  );
};

export default Home;