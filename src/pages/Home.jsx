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
import OnlyFapsModal from '../components/onlyfapsmodal';

const buildingSprites = [
  missionButton, missionButton2, missionButton3, missionButton4, missionButton5,
  missionButton6, missionButton7, missionButton8, missionButton9
];

const menuOptions = [
  { icon: '🏠', label: 'Home', action: 'home' },
  { icon: '🎯', label: 'Active Missions', action: 'missions' },
  { icon: '🎁', label: 'Claim Rewards', action: 'claim' },
  { icon: '🖼️', label: 'NFT Inventory', action: 'inventory' },
  { icon: '🛒', label: 'Buy Cards', action: 'buy' },
  { icon: '🔧', label: 'Upgrade / Blends', action: 'upgrade' },
  { icon: '📜', label: 'History', action: 'history' },
  { icon: '⚙️', label: 'Settings', action: 'settings' },
  { icon: '🚪', label: 'Logout', action: 'logout' },
  { icon: '❓', label: 'Help', action: 'help' },
];

const Home = () => {
  const [showMission, setShowMission] = useState(false);
  const [showMissionStatus, setShowMissionStatus] = useState(false);
  const [showOnlyFaps, setShowOnlyFaps] = useState(false);
  const [onlyFapsGirl, setOnlyFapsGirl] = useState('Sandra');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useHistory();

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const currentUser = UserService.getName();
        if (!currentUser) {
          return;
        }
        // const userMissions = allMissions.filter(m => m.user === currentUser);
        // const now = Math.floor(Date.now() / 1000);
      } catch (err) {
      }
    };
    fetchMissions();
    const interval = setInterval(fetchMissions, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMenuClick = (action) => {
    setSidebarOpen(false);
    switch (action) {
      case 'home':
        navigate.push('/home');
        break;
      case 'missions':
        setShowMissionStatus(true);
        break;
      case 'claim':
        alert('¡Reclama tus recompensas desde Misiones activas!');
        break;
      case 'inventory':
        alert('Inventario de NFTs próximamente.');
        break;
      case 'buy':
        window.open('https://neftyblocks.com/collection/nightclubnft', '_blank');
        break;
      case 'upgrade':
        window.open('https://neftyblocks.com/collection/nightclubnft/blends', '_blank');
        break;
      case 'history':
        alert('Historial próximamente.');
        break;
      case 'settings':
        alert('Configuración próximamente.');
        break;
      case 'logout':
        UserService.logout();
        navigate.push('/');
        break;
      case 'help':
        alert('¿Necesitas ayuda? Contáctanos en Discord.');
        break;
      default:
        break;
    }
  };

  return (
    <div className="home-main-wrapper">
      <div className="home-image-row">
        <div className="home-image-container">
          <div className={`side-menu-inside${sidebarOpen ? ' open' : ''}`}
            style={{ height: '100%', maxHeight: '100%' }}>
            <button className="side-menu-toggle-inside" onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Collapse menu' : 'Expand menu'}>
              <span className="chevron-icon-inside">{sidebarOpen ? '<' : '>'}</span>
            </button>
            <nav className="side-menu-nav-inside">
              <div className="side-menu-scroll-inside">
                {menuOptions.map(opt => (
                  <button
                    key={opt.action}
                    className={`side-menu-btn-inside${sidebarOpen ? ' expanded' : ''}`}
                    onClick={() => handleMenuClick(opt.action)}
                    title={opt.label}
                  >
                    <span className="side-menu-icon-inside" aria-hidden="true">{opt.icon}</span>
                    {sidebarOpen && <span className="side-menu-label-inside">{opt.label}</span>}
                  </button>
                ))}
              </div>
            </nav>
          </div>
          <div className="logout-ear small-ear" style={{display: 'none'}}></div>
          <img src="/mapa1.png" alt="Map" className="home-image" />
          <div
            className="mission-button edificio1-map"
            onClick={() => { setOnlyFapsGirl('Sandra'); setShowOnlyFaps(true); }}
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
      {showOnlyFaps && (
        <OnlyFapsModal girlName={onlyFapsGirl} onClose={() => setShowOnlyFaps(false)} />
      )}
      <style jsx>{`
        .home-main-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
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
        .home-image-container {
          position: relative;
          border-radius: 28px;
          border: 2px solid #ff36ba;
          box-shadow: 0 0 20px rgba(255, 54, 186, 0.5);
          overflow: hidden;
          background: #181828;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: flex-start;
          width: 855px;
          height: 570px;
          z-index: 1;
        }
        .side-menu-inside {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
          background: transparent;
          border: none;
          border-radius: 0 12px 12px 0;
          box-shadow: none;
          padding: 10px 0 10px 0;
          min-width: 38px;
          width: 38px;
          transition: width 0.22s cubic-bezier(0.4,0,0.2,1);
          height: 100%;
          max-height: 100%;
          position: relative;
          z-index: 2;
          overflow: visible;
        }
        .side-menu-inside.open {
          width: 140px;
          min-width: 140px;
          background: rgba(24,24,40,0.92);
          box-shadow: 0 0 16px 0 #ff36ba33;
          border-right: 2px solid #ff36ba;
        }
        .side-menu-toggle-inside {
          background: none;
          border: none;
          color: #ff36ba;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px auto;
          cursor: pointer;
          transition: background 0.2s, border 0.2s;
          position: relative;
          z-index: 3;
        }
        .chevron-icon-inside {
          font-size: 1.2em;
          color: #ff36ba;
          opacity: 0.7;
          font-family: monospace;
          font-weight: bold;
          line-height: 1;
        }
        .side-menu-nav-inside {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          overflow: hidden;
        }
        .side-menu-scroll-inside {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #ff36ba #181828;
          padding-right: 2px;
        }
        .side-menu-scroll-inside::-webkit-scrollbar {
          width: 6px;
          background: #181828;
          border-radius: 8px;
        }
        .side-menu-scroll-inside::-webkit-scrollbar-thumb {
          background: #ff36ba55;
          border-radius: 8px;
        }
        .side-menu-btn-inside {
          display: flex;
          align-items: center;
          gap: 0;
          background: none;
          border: none;
          color: #fff;
          font-size: 0.98rem;
          font-weight: 500;
          padding: 5px 0 5px 0;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
          outline: none;
          margin: 0 4px;
          justify-content: center;
          position: relative;
        }
        .side-menu-btn-inside.expanded {
          gap: 10px;
          justify-content: flex-start;
          padding: 5px 12px;
        }
        .side-menu-btn-inside:hover {
          background: linear-gradient(90deg, #ff36ba33 0%, #7f36ff33 100%);
          color: #ff36ba;
        }
        .side-menu-icon-inside {
          font-size: 1.15em;
          width: 22px;
          text-align: center;
          color: #b0b3c6;
          opacity: 0.38;
          filter: grayscale(1);
          transition: color 0.2s, opacity 0.2s, filter 0.2s;
        }
        .side-menu-btn-inside:hover .side-menu-icon-inside {
          color: #ff36ba;
          opacity: 0.85;
          filter: grayscale(0.2);
        }
        .side-menu-label-inside {
          margin-left: 8px;
          color: #fff;
          font-size: 0.98rem;
          font-weight: 500;
          opacity: 0.92;
          letter-spacing: 0.3px;
          transition: opacity 0.2s;
          white-space: nowrap;
        }
        .home-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        @media (max-width: 1100px) {
          .home-image-container {
            width: 98vw;
            max-width: 98vw;
          }
          .side-menu-inside {
            height: 60vw;
            min-width: 28px;
            width: 28px;
          }
          .side-menu-inside.open {
            width: 80px;
            min-width: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;