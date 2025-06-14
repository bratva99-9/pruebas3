import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import MissionModal from '../components/MissionModal';
import MissionStatus from '../components/missionstatus';
import InventoryModal from '../components/InventoryModal';
import { UserService } from '../UserService';
import OnlyFapsModal from '../components/onlyfapsmodal';

const buildingSprites = [
  // Elimina estas líneas:
  // missionButton, missionButton2, missionButton3, missionButton4, missionButton5,
  // missionButton6, missionButton7, missionButton8, missionButton9
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
    case 'home':
      // Home: simple house
      return (
        <svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10L10 4l7 6"/>
          <path d="M5 10v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6"/>
        </svg>
      );
    case 'target':
      // Target: simple target
      return (
        <svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="8"/>
          <circle cx="10" cy="10" r="3"/>
        </svg>
      );
    case 'gift':
      // Gift: simple gift box
      return (
        <svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="14" height="9" rx="2"/>
          <path d="M3 8h14"/>
          <path d="M10 8v9"/>
          <path d="M7 5a2 2 0 1 1 4 0c0 1-2 3-2 3s-2-2-2-3z"/>
        </svg>
      );
    case 'image':
      // Inventory: simple grid
      return (
        <svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="5" height="5" rx="1"/>
          <rect x="12" y="3" width="5" height="5" rx="1"/>
          <rect x="3" y="12" width="5" height="5" rx="1"/>
          <rect x="12" y="12" width="5" height="5" rx="1"/>
        </svg>
      );
    case 'cart':
      // Cart: simple cart
      return (
        <svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="17" r="1"/>
          <circle cx="15" cy="17" r="1"/>
          <path d="M2 2h2l3.6 9.59a1 1 0 0 0 1 .41h7.72a1 1 0 0 0 1-.76l1.38-5.52H5.21"/>
        </svg>
      );
    case 'wrench':
      // Upgrade: simple arrow up
      return (
        <svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5"/>
          <path d="M5 12l7-7 7 7"/>
        </svg>
      );
    case 'settings':
      // Settings: simple sliders
      return (
        <svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="7" x2="16" y2="7" />
          <line x1="4" y1="13" x2="16" y2="13" />
          <circle cx="8" cy="7" r="2" />
          <circle cx="12" cy="13" r="2" />
        </svg>
      );
    case 'logout':
      // Logout: simple arrow out of a box
      return (
        <svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 12l4-4-4-4"/>
          <path d="M19 8H9"/>
          <rect x="3" y="4" width="6" height="12" rx="2"/>
        </svg>
      );
    case 'help':
      // Help: simple question mark
      return (
        <svg width="20" height="20" fill="none" stroke="#b0b3c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="8"/>
          <path d="M10 14v-2a2 2 0 1 1 2-2"/>
          <circle cx="10" cy="17" r="1"/>
        </svg>
      );
    default:
      return null;
  }
}

const Home = () => {
  const [showMission, setShowMission] = useState(false);
  const [showMissionStatus, setShowMissionStatus] = useState(false);
  const [showOnlyFaps, setShowOnlyFaps] = useState(false);
  const [onlyFapsGirl, setOnlyFapsGirl] = useState('Sandra');
  const [showInventory, setShowInventory] = useState(false);
  const history = useHistory();
  const [toasts, setToasts] = useState([]);
  const [showRotateWarning, setShowRotateWarning] = useState(false);

  useEffect(() => {
    function checkOrientation() {
      if (window.innerWidth < window.innerHeight && window.innerWidth < 900) {
        setShowRotateWarning(true);
      } else {
        setShowRotateWarning(false);
      }
    }
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleMenuClick = (action) => {
    setShowMission(false);
    setShowMissionStatus(false);
    setShowOnlyFaps(false);
    setShowInventory(false);
    switch (action) {
      case 'home':
        // Solo cerrar modales
        break;
      case 'missions':
        setShowMissionStatus(true);
        break;
      case 'inventory':
        setShowInventory(true);
        break;
      case 'buy':
        window.open('https://neftyblocks.com/collection/nightclubnft', '_blank');
        break;
      case 'upgrade':
        window.open('https://neftyblocks.com/collection/nightclubnft/blends', '_blank');
        break;
      case 'history':
        addToast('This feature is coming soon!');
        break;
      case 'settings':
        addToast('Settings will be available in a future update!');
        break;
      case 'logout':
        UserService.logout();
        window.location.href = '/login';
        break;
      case 'help':
        addToast('Help is coming soon!');
        break;
      default:
        break;
    }
  };

  function addToast(msg) {
    setToasts(prev => [{ id: Date.now(), msg }, ...prev]);
    setTimeout(() => {
      setToasts(prev => prev.slice(0, -1));
    }, 5000);
  }

  return (
    <div className="home-main-wrapper">
      <div className="home-center-container">
        <div className="home-image-row">
          <div className="home-image-container fab-rounded">
            <div className="top-info-bar inside-map">
              <div className="top-info-item user-name">{UserService.getName()}</div>
              <div className="top-info-item wax-balance">{UserService.formatWAXOnly()} WAX</div>
              <div className="top-info-item sexy-balance">
                {UserService.formatSEXYOnly()} SEXY
                <span
                  style={{ marginLeft: 6, cursor: 'pointer', color: '#00ffff', fontWeight: 700, fontSize: 20, verticalAlign: 'middle' }}
                  title="Buy/Swap SEXY"
                  onClick={() => window.open('https://swap.tacocrypto.io/swap?output=SEXY-nightclub.gm&input=WAX-eosio.token', '_blank')}
                >
                  +
                </span>
              </div>
              <div className="top-info-item sexy-balance2">
                {UserService.formatSEXYOnly()} SEXY+
                <span
                  style={{ marginLeft: 6, cursor: 'pointer', color: '#00ffff', fontWeight: 700, fontSize: 20, verticalAlign: 'middle' }}
                  title="Buy/Swap SEXY"
                  onClick={() => window.open('https://swap.tacocrypto.io/swap?output=SEXY-nightclub.gm&input=WAX-eosio.token', '_blank')}
                >
                  +
                </span>
              </div>
            </div>
            <div className="fab-menu-vertical">
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
      {toasts.map((t, i) => (
        <div key={t.id} style={{
          position: 'absolute',
          top: 30 + i * 60,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(24,24,40,0.95)',
          color: '#fff',
          border: '2px solid #ff36ba',
          borderRadius: 14,
          padding: '12px 32px',
          fontSize: 18,
          fontWeight: 600,
          zIndex: 1000,
          boxShadow: '0 4px 24px #ff36ba44',
          textAlign: 'center',
          minWidth: 220,
          transition: 'top 0.3s',
        }}>
          {t.msg}
        </div>
      ))}
      {showRotateWarning && (
        <div className="rotate-warning">
          Please rotate your device to landscape mode to play.<br/>
          <span style={{fontSize: '1.7em', marginTop: 16, display: 'block'}}>🔄</span>
        </div>
      )}
      <style jsx>{`
        .home-main-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: hsl(245, 86.70%, 2.90%);
          position: relative;
          /* overflow: hidden; */
        }
        .home-center-container {
          min-width: 855px;
          min-height: 570px;
          width: auto;
          height: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow-x: auto;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .home-image-row {
          min-width: 855px;
          width: auto;
          margin: 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .home-image-container {
          position: relative;
          width: 855px;
          height: 570px;
          min-width: 855px;
          min-height: 570px;
          border: 3px solid #ff36ba;
          border-radius: 32px;
          box-shadow: 0 0 28px rgba(255, 54, 186, 0.5);
          overflow: hidden;
          background: none !important;
          display: block;
          margin: 0 auto;
          padding: 0 !important;
          max-width: none;
        }
        .fab-rounded { border-radius: 32px !important; }
        .home-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .fab-menu-vertical {
          position: absolute;
          left: 13px;
          top: 42px;
          transform: none;
          width: 45px;
          align-items: stretch;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 20;
        }
        .fab-menu-btn {
          width: 45px;
          height: 45px;
        }
        .fab-menu-btn-pill-wrapper {
          display: flex;
          align-items: center;
          gap: 0;
          margin: 0;
          padding: 0;
          position: relative;
        }
        .fab-menu-btn {
          background: #181828;
          border: 2px solid #ff36ba;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff36ba;
          font-size: 1.5rem;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, color 0.2s;
          position: relative;
        }
        .fab-menu-btn:hover, .fab-menu-btn:focus {
          background: #ff36ba44;
          border-color: #ff36ba;
          color: #fff;
          box-shadow: 0 0 12px #ff36ba88;
        }
        .fab-menu-btn:active {
          background: #ff36ba88;
          border-color: #ff36ba;
          color: #fff;
          box-shadow: 0 0 18px #ff36ba;
        }
        .fab-menu-icon {
          width: 22px;
          height: 22px;
          color: #ffb9fa;
          opacity: 0.88;
          font-size: 1.05em;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fab-menu-pill {
          background: #ff36ba;
          color: #fff;
          border-radius: 12px;
          padding: 4px 12px;
          font-size: 1rem;
          font-weight: 500;
          margin-left: 8px;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transform: translateY(0) scaleX(0.92);
          transition: opacity 0.18s, transform 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        .fab-menu-btn-pill-wrapper:hover .fab-menu-pill,
        .fab-menu-btn-pill-wrapper:focus-within .fab-menu-pill {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scaleX(1);
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
        @media (max-width: 900px) {
          html, body {
            overflow: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;