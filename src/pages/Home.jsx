import React, { useState, useEffect } from 'react';
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

const buildingSprites = [
  missionButton, missionButton2, missionButton3, missionButton4, missionButton5,
  missionButton6, missionButton7, missionButton8, missionButton9
];

const Home = () => {
  const [showMission, setShowMission] = useState(false);
  const [showMissionStatus, setShowMissionStatus] = useState(false);
  const [pendingMissions, setPendingMissions] = useState(0);
  const [completedMissions, setCompletedMissions] = useState(0);
  const navigate = useHistory();

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const currentUser = UserService.getName();
        if (!currentUser) {
          setPendingMissions(0);
          setCompletedMissions(0);
          return;
        }
        const allMissions = await UserService.getUserMissions();
        const userMissions = allMissions.filter(m => m.user === currentUser);
        const now = Math.floor(Date.now() / 1000);
        // Pendientes: end_time > ahora
        const pending = userMissions.filter(m => Number(m.end_time) > now);
        // Completadas: end_time <= ahora y !m.claimed
        const completed = userMissions.filter(m => Number(m.end_time) <= now && !m.claimed);
        setPendingMissions(pending.length);
        setCompletedMissions(completed.length);
      } catch (err) {
        setPendingMissions(0);
        setCompletedMissions(0);
      }
    };
    fetchMissions();
    const interval = setInterval(fetchMissions, 10000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="side-bottom-ears-left">
            <div className="user-tap user-tap-block small-ear night-club-status-ear-fix">
              <div className="ncs-title">Night Club Status</div>
              <div className="ncs-line ncs-pending">Pending <span className="ncs-value">{pendingMissions}</span></div>
              <div className="ncs-line ncs-completed">Completed <span className="ncs-value">{completedMissions}</span></div>
            </div>
            <div className="user-tap user-tap-block small-ear">
              <span className="user-tap-name">Buy Cards</span>
            </div>
            <div className="user-tap user-tap-block small-ear">
              <span className="user-tap-name">Marketplace</span>
            </div>
            <div className="user-tap user-tap-block small-ear">
              <span className="user-tap-name">Upgrade</span>
            </div>
          </div>
        </div>
        <div className="home-image-container">
          <div className="logout-ear small-ear">
            <button className="btn-logout" onClick={handleLogout}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff36ba" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
          <img src="/mapa1.png" alt="Mapa" className="home-image" />
          <div
            className="mission-button edificio1-map"
            onClick={() => setShowMission(true)}
          />
          <div
            className="mission-button edificio2-map"
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
          height: 570px;
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
        .edificio1-map {
          position: absolute;
          left: 451.7px;
          top: 270px;
          width: 240.8px;
          height: 321.1px;
          background-image: url(/edificio1.svg);
          background-size: 200% auto;
          background-position: left center;
          background-repeat: no-repeat;
          z-index: 10;
          cursor: pointer;
          transition: none;
        }
        .edificio1-map:hover {
          background-position: right center;
        }
        .edificio2-map {
          position: absolute;
          left: 617.3px;
          top: 200.4px;
          width: 219.2px;
          height: 273px;
          background-image: url(/edifico2.svg);
          background-size: 200% auto;
          background-position: left center;
          background-repeat: no-repeat;
          z-index: 10;
          cursor: pointer;
          transition: none;
        }
        .edificio2-map:hover {
          background-position: right center;
        }
        .side-bottom-ears-left {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .side-bottom-ears-left .user-tap-block {
          border-radius: 12px 0 0 12px;
          border: none;
          min-width: 160px;
          height: 28px;
          background: transparent;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          font-size: 0.85rem;
          font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
          font-weight: 400;
          color: #b0b3c6;
          letter-spacing: 0.1px;
          text-align: left;
          margin: 0 0 0 4px;
          padding-left: 8px;
        }
        .subdata-mission-status {
          margin-top: 2px;
          margin-left: 2px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .subdata-row {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
        .subdata-label {
          font-size: 0.78rem;
          color: #b0b3c6;
          font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
          font-weight: 400;
          opacity: 0.85;
        }
        .subdata-value {
          font-size: 0.78rem;
          color: #b0b3c6;
          font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
          font-weight: 600;
          opacity: 0.95;
          margin-left: 8px;
        }
        .night-club-status-ear-fix {
          min-height: 78px;
          height: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0px;
          padding-top: 1px;
          padding-bottom: 1px;
        }
        .night-club-status-ear-fix .ncs-title {
          font-size: 0.97rem;
          color: #ffb9fa;
          font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
          font-weight: 600;
          margin-bottom: 0px;
          width: 100%;
          text-align: center;
        }
        .night-club-status-ear-fix .ncs-line {
          font-size: 0.85rem;
          color: #b0b3c6;
          font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
          font-weight: 400;
          width: 100%;
          text-align: center;
          margin-bottom: 0px;
          line-height: 1.02;
        }
        .night-club-status-ear-fix .ncs-value {
          font-weight: 600;
          margin-left: 4px;
          color: #b0b3c6;
        }
      `}</style>
    </div>
  );
};

export default Home;