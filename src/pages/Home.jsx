import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import MissionModal from '../components/MissionModal';
import ClaimActionButton from '../components/ClaimActionButton';
import { UserService } from '../UserService';
import fondo2 from '../images/fondo2.webp';

const Home = () => {
  const [showMission, setShowMission] = useState(false);
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
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        padding: 0,
        margin: 0,
        position: 'relative',
        textAlign: 'center'
      }}
    >
      <h1>Welcome to Night Club App</h1>
      <div className="home-user-info">
        <span className="home-user-name">{UserService.getName()}</span>
        <span className="home-user-balance">{UserService.formatWAXOnly()} WAX</span>
        <span className="home-user-sexy">{UserService.formatSEXYOnly()} SEXY</span>
      </div>
      <ClaimActionButton />
      <div style={{display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24}}>
        <button
          className="btn-square btn-small"
          onClick={() => setShowMission(true)}
        >
          Mission
        </button>
        <button
          className="btn-square btn-small"
          onClick={handleLogout}
          style={{padding: '8px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff36ba" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
      {showMission && (
        <MissionModal
          onClose={() => setShowMission(false)}
          onForceCloseAll={() => setShowMission(false)}
        />
      )}
      <style jsx>{`
        .home h1 {
          font-size: 36px;
          color: #ff00ff;
          margin-bottom: 40px;
          text-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
        }
        .btn-square {
          font-size: 16px;
          font-weight: 500;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 12px;
          padding: 10px 32px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          margin: 0 8px;
          white-space: nowrap;
        }
        .btn-square:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
          color: #fff;
          box-shadow: none;
        }
        .btn-small {
          font-size: 16px;
          padding: 10px 32px;
          min-width: 120px;
        }
        .home-user-info {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 32px;
          margin-bottom: 18px;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          background: rgba(36,0,56,0.10);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 10px 32px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 1px;
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