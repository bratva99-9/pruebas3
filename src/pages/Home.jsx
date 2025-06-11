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
  { icon: 'home', label: 'Home', action: 'home' },
  { icon: 'target', label: 'Active Missions', action: 'missions' },
  { icon: 'image', label: 'NFT Inventory', action: 'inventory' },
  { icon: 'cart', label: 'Buy Cards', action: 'buy' },
  { icon: 'wrench', label: 'Upgrade', action: 'upgrade' },
  { icon: 'gift', label: 'Gift History', action: 'history' },
  { icon: 'settings', label: 'Settings', action: 'settings' },
  { icon: 'logout', label: 'Logout', action: 'logout' },
  { icon: 'help', label: 'Help', action: 'help' },
];

function getMenuIcon(name) {
  switch (name) {
    case 'home': return (<svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10L10 4l7 6"/><path d="M5 10v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6"/></svg>);
    case 'target': return (<svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="3"/></svg>);
    case 'gift': return (<svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="16" height="9" rx="2"/><path d="M2 7h16"/><path d="M10 7v9"/><path d="M7 3a2 2 0 1 1 4 0c0 1-2 3-2 3s-2-2-2-3z"/></svg>);
    case 'image': return (<svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="16" height="10" rx="2"/><circle cx="7" cy="9" r="1.5"/><path d="M2 15l4-4a2 2 0 0 1 3 0l5 5"/></svg>);
    case 'cart': return (<svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="17" r="1"/><circle cx="15" cy="17" r="1"/><path d="M2 2h2l3.6 9.59a1 1 0 0 0 1 .41h7.72a1 1 0 0 0 1-.76l1.38-5.52H5.21"/></svg>);
    case 'wrench': return (<svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 13.3a4 4 0 0 1-5.6-5.6l-5.1-5.1a2 2 0 1 1 2.8-2.8l5.1 5.1a4 4 0 0 1 5.6 5.6z"/></svg>);
    case 'settings': return (<svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
    case 'logout': return (<svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
    case 'help': return (<svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8"/><path d="M10 14v-2a2 2 0 1 1 2-2"/><circle cx="10" cy="17" r="1"/></svg>);
    default: return null;
  }
}

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
        <div className="home-image-container main-rounded">
          <div className={`side-menu-overlay${sidebarOpen ? ' open' : ''}`} style={{ height: '100%', maxHeight: '100%', pointerEvents: 'none' }}>
            <button className="side-menu-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Collapse menu' : 'Expand menu'} style={{ pointerEvents: 'auto' }}>
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
            </button>
            <nav className="side-menu-nav-overlay" style={{display: sidebarOpen ? 'flex' : 'none', pointerEvents: 'auto'}}>
              <div className="side-menu-scroll-overlay">
                {menuOptions.map(opt => (
                  <button
                    key={opt.action}
                    className="side-menu-btn-overlay"
                    onClick={() => handleMenuClick(opt.action)}
                    title={opt.label}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <span className="side-menu-icon-overlay" aria-hidden="true">{getMenuIcon(opt.icon)}</span>
                    {sidebarOpen && <span className="side-menu-label-overlay">{opt.label}</span>}
                  </button>
                ))}
              </div>
            </nav>
            {!sidebarOpen && (
              <div className="side-menu-icons-only" style={{ pointerEvents: 'auto' }}>
                {menuOptions.map(opt => (
                  <button
                    key={opt.action}
                    className="side-menu-btn-overlay"
                    onClick={() => handleMenuClick(opt.action)}
                    title={opt.label}
                    style={{marginBottom: 2, pointerEvents: 'auto'}}>
                    <span className="side-menu-icon-overlay" aria-hidden="true">{getMenuIcon(opt.icon)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <img src="/mapa1.png" alt="Mapa" className="home-image" />
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
        .side-menu-overlay {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 44px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          background: rgba(24,24,40,0.72);
          border-right: 2px solid #ff36ba;
          border-radius: 0 16px 16px 0;
          box-shadow: 0 0 16px 0 #ff36ba33;
          transition: width 0.22s cubic-bezier(0.4,0,0.2,1);
          overflow: visible;
        }
        .side-menu-overlay.open {
          width: 160px;
          background: rgba(24,24,40,0.92);
        }
        .side-menu-hamburger {
          margin: 18px 0 12px 8px;
          background: none;
          border: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          z-index: 11;
        }
        .hamburger-bar {
          width: 22px;
          height: 3px;
          background: #b0b3c6;
          border-radius: 2px;
          transition: background 0.2s;
        }
        .side-menu-hamburger:hover .hamburger-bar {
          background: linear-gradient(90deg, #ff36ba 0%, #7f36ff 100%);
        }
        .side-menu-nav-overlay {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          margin-top: 10px;
          width: 100%;
          height: calc(100% - 60px);
          overflow: hidden;
        }
        .side-menu-scroll-overlay {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #ff36ba #181828;
          padding-right: 2px;
        }
        .side-menu-scroll-overlay::-webkit-scrollbar {
          width: 6px;
          background: #181828;
          border-radius: 8px;
        }
        .side-menu-scroll-overlay::-webkit-scrollbar-thumb {
          background: #ff36ba55;
          border-radius: 8px;
        }
        .side-menu-btn-overlay {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          color: #b0b3c6;
          font-size: 0.98rem;
          font-weight: 500;
          padding: 7px 10px 7px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
          outline: none;
          margin: 0 2px;
          justify-content: flex-start;
          position: relative;
        }
        .side-menu-btn-overlay:hover {
          background: linear-gradient(90deg, #ff36ba33 0%, #7f36ff33 100%);
          color: #ff36ba;
        }
        .side-menu-icon-overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          opacity: 0.7;
          filter: grayscale(1);
          transition: color 0.2s, opacity 0.2s, filter 0.2s;
        }
        .side-menu-btn-overlay:hover .side-menu-icon-overlay {
          opacity: 1;
          filter: grayscale(0.2);
        }
        .side-menu-label-overlay {
          color: #b0b3c6;
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
          .side-menu-overlay {
            width: 32px;
          }
          .side-menu-overlay.open {
            width: 100px;
          }
        }
        .edificio-zindex {
          position: absolute;
          z-index: 30;
          pointer-events: auto;
          cursor: pointer;
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
        .main-rounded {
          border-radius: 28px;
        }
        .home-image-container {
          position: relative;
          overflow: visible;
        }
        .side-menu-icons-only {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-top: 10px;
          width: 100%;
          z-index: 12;
        }
      `}</style>
    </div>
  );
};

export default Home;