import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import MissionModal from '../components/MissionModal';
import MissionStatus from '../components/missionstatus';
import InventoryModal from '../components/InventoryModal';
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
  const [showInventory, setShowInventory] = useState(false);
  const history = useHistory();

  const handleMenuClick = (action) => {
    switch (action) {
      case 'home':
        history.push('/');
        break;
      case 'missions':
        setShowMissionStatus(true);
        break;
      case 'inventory':
        setShowInventory(true);
        break;
      case 'buy':
        history.push('/buy');
        break;
      case 'upgrade':
        history.push('/upgrade');
        break;
      case 'history':
        history.push('/history');
        break;
      case 'settings':
        history.push('/settings');
        break;
      case 'logout':
        UserService.logout();
        history.push('/login');
        break;
      case 'help':
        history.push('/help');
        break;
      default:
        break;
    }
  };

  return (
    <div className="home-main-wrapper">
      <div className="home-image-row">
        <div className="home-image-container fab-rounded">
          <div className="top-info-bar inside-map">
            <div className="top-info-item user-name">{UserService.getName()}</div>
            <div className="top-info-item wax-balance">{UserService.formatWAXOnly()} WAX</div>
            <div className="top-info-item sexy-balance">{UserService.formatSEXYOnly()} SEXY</div>
            <div className="top-info-item sexy-balance2">{UserService.formatSEXYOnly()} SEXY+</div>
          </div>
          <div className="fab-menu-vertical inside-map">
            {menuOptions.map(opt => (
              <div className="fab-menu-btn-pill-wrapper" key={opt.action}>
                <button
                  className="fab-menu-btn"
                  onClick={() => handleMenuClick(opt.action)}
                  title={opt.label}
                  tabIndex={0}
                >
                  <span className="fab-menu-icon" aria-hidden="true">{getMenuIcon(opt.icon)}</span>
                </button>
                <span className="fab-menu-pill">{opt.label}</span>
              </div>
            ))}
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
      {showInventory && (
        <InventoryModal
          onClose={() => setShowInventory(false)}
        />
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
          margin-top: 22px;
        }
        .home-image-container {
          position: relative;
          border-radius: 32px;
          border: 2.5px solid #ff36ba;
          box-shadow: 0 0 28px rgba(255, 54, 186, 0.5);
          overflow: hidden;
          background: #181828;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          width: 855px;
          height: 570px;
        }
        .fab-rounded { border-radius: 32px !important; }
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
        .top-info-bar.inside-map {
          position: absolute;
          top: 15px;
          left: 50%;
          transform: translateX(-50%);
          width: 92%;
          background: none;
          border-radius: 0;
          box-shadow: none;
          padding: 0;
          font-size: 0.92rem;
          font-weight: 500;
          color: #fff;
          gap: 4px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          z-index: 30;
          border: none;
        }
        .fab-menu-vertical.inside-map {
          position: absolute;
          left: 14px;
          top: 65px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          z-index: 30;
          background: none;
          box-shadow: none;
          border-radius: 0;
          padding: 0;
          transform: scale(0.95);
        }
        .fab-menu-btn-pill-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .fab-menu-btn {
          width: 43.7px;
          height: 43.7px;
          border-radius: 50%;
          background: rgba(10, 6, 22, 0.92);
          border: 2px solid #ff36ba55;
          box-shadow: 0 2px 8px #ff36ba22;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 0;
          padding: 0;
          cursor: pointer;
          transition: background 0.18s, border 0.18s, transform 0.18s;
          outline: none;
          z-index: 2;
        }
        .fab-menu-btn:hover,
        .fab-menu-btn:focus {
          background: rgba(18, 10, 40, 0.95);
          border: 2.5px solid #ff36ba;
          transform: scale(1.03);
        }
        .fab-menu-icon {
          width: 20px;
          height: 20px;
          color: #ffb9fa;
          opacity: 0.88;
          font-size: 1.05em;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        .fab-menu-pill {
          position: absolute;
          left: 52px;
          top: 50%;
          transform: translateY(-50%) scaleX(0.92);
          background: rgba(24,24,40,0.92);
          color: #b0b3c6;
          padding: 6px 18px 6px 16px;
          border-radius: 22px;
          font-size: 0.93em;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          border: 1.5px solid #ff36ba55;
          box-shadow: 0 2px 8px #ff36ba33;
          transition: opacity 0.18s, transform 0.22s cubic-bezier(0.4,0,0.2,1);
          z-index: 1;
        }
        .fab-menu-btn-pill-wrapper:hover .fab-menu-pill,
        .fab-menu-btn-pill-wrapper:focus-within .fab-menu-pill {
          opacity: 1;
          transform: translateY(-50%) scaleX(1);
        }
        .top-info-item {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 95px;
          padding: 0 12px;
          height: 37px;
          background: rgba(24,24,40,0.82);
          border-radius: 18px;
          border: 2px solid #ff36ba55;
          box-shadow: 0 2px 8px #ff36ba33;
          font-size: 0.93em;
          font-weight: 600;
          color: #ffb9fa;
          margin: 0 2px;
          transition: background 0.18s, border 0.18s, transform 0.18s;
        }
        .top-info-item:hover, .top-info-item:focus {
          background: linear-gradient(135deg, #ff36ba33 0%, #7f36ff33 100%);
          border: 2.5px solid #ff36ba;
          transform: scale(1.05);
        }
        .user-name { color: #ffb9fa; }
        .wax-balance { color: #00ffff; }
        .sexy-balance, .sexy-balance2 { color: #ff36ba; }
        .responsive-scale-wrapper {
          will-change: transform;
          overflow: visible;
        }
        .rotate-warning {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(20,20,30,0.92);
          color: #fff;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3em;
          text-align: center;
          padding: 32px;
        }
        body, html {
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
};

export default Home;