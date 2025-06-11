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
  { icon: '🏠', label: 'Inicio', action: 'home' },
  { icon: '🎯', label: 'Misiones activas', action: 'missions' },
  { icon: '🎁', label: 'Reclamar recompensas', action: 'claim' },
  { icon: '🖼️', label: 'Inventario de NFTs', action: 'inventory' },
  { icon: '🛒', label: 'Comprar cartas', action: 'buy' },
  { icon: '🔧', label: 'Upgrade / Blends', action: 'upgrade' },
  { icon: '📜', label: 'Historial', action: 'history' },
  { icon: '⚙️', label: 'Configuración', action: 'settings' },
  { icon: '🚪', label: 'Cerrar sesión', action: 'logout' },
  { icon: '❓', label: 'Ayuda', action: 'help' },
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
        <div className={`side-menu${sidebarOpen ? ' open' : ''}`} style={{ height: '570px' }}>
          <button className="side-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="material-icons" style={{fontSize: 28, color: '#ff36ba', opacity: 0.7}}>{sidebarOpen ? 'chevron_left' : 'chevron_right'}</span>
          </button>
          <nav className="side-menu-nav">
            {menuOptions.map(opt => (
              <button
                key={opt.action}
                className={`side-menu-btn${sidebarOpen ? ' expanded' : ''}`}
                onClick={() => handleMenuClick(opt.action)}
                title={opt.label}
              >
                <span className="side-menu-icon">{opt.icon}</span>
                {sidebarOpen && <span className="side-menu-label">{opt.label}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="home-image-container">
          <div className="logout-ear small-ear" style={{display: 'none'}}></div>
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
        .side-menu {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
          background: #181828;
          border: 2px solid #ff36ba;
          border-radius: 18px 0 0 18px;
          box-shadow: 0 0 20px rgba(255, 54, 186, 0.18);
          padding: 18px 0 18px 0;
          margin-right: 0px;
          min-width: 62px;
          width: 62px;
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
          height: 570px;
          position: relative;
        }
        .side-menu.open {
          width: 210px;
        }
        .side-menu-toggle {
          background: none;
          border: none;
          outline: none;
          cursor: pointer;
          margin-bottom: 18px;
          align-self: flex-end;
          margin-right: 8px;
          transition: color 0.2s;
        }
        .side-menu-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: stretch;
        }
        .side-menu-btn {
          display: flex;
          align-items: center;
          gap: 0;
          background: none;
          border: none;
          color: #fff;
          font-size: 1.08rem;
          font-weight: 500;
          padding: 10px 0 10px 0;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
          outline: none;
          margin: 0 8px;
          justify-content: center;
        }
        .side-menu-btn.expanded {
          gap: 16px;
          justify-content: flex-start;
          padding: 10px 18px;
        }
        .side-menu-btn:hover {
          background: #ff36ba22;
          color: #ff36ba;
        }
        .side-menu-icon {
          font-size: 1.6em;
          width: 36px;
          text-align: center;
          color: #b0b3c6;
          opacity: 0.55;
          transition: color 0.2s, opacity 0.2s;
        }
        .side-menu-btn:hover .side-menu-icon {
          color: #ff36ba;
          opacity: 0.85;
        }
        .side-menu-label {
          margin-left: 10px;
          color: #fff;
          font-size: 1.08rem;
          font-weight: 500;
          opacity: 0.92;
          letter-spacing: 0.5px;
          transition: opacity 0.2s;
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
          .side-menu {
            height: 60vw;
            min-width: 52px;
            width: 52px;
          }
          .side-menu.open {
            width: 160px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;