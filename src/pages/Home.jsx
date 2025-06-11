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
        const allMissions = await UserService.getUserMissions();
        const userMissions = allMissions.filter(m => m.user === currentUser);
        const now = Math.floor(Date.now() / 1000);
        const pending = userMissions.filter(m => Number(m.end_time) > now);
        const completed = userMissions.filter(m => Number(m.end_time) <= now && !m.claimed);
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
      <aside className={`sidebar-menu${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">NightClub</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>&times;</button>
        </div>
        <nav className="sidebar-nav">
          {menuOptions.map(opt => (
            <button
              key={opt.action}
              className="sidebar-nav-btn"
              onClick={() => handleMenuClick(opt.action)}
            >
              <span className="sidebar-icon">{opt.icon}</span>
              <span className="sidebar-label">{opt.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span className="sidebar-hamburger"></span>
        <span className="sidebar-hamburger"></span>
        <span className="sidebar-hamburger"></span>
      </div>
      <div className="home-container">
        <div className="home-image-row">
          <div className="user-taps-vertical small-ears" style={{display: 'none'}}></div>
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
            flex-direction: row;
            background: hsl(245, 86.70%, 2.90%);
            position: relative;
            overflow: hidden;
          }
          .sidebar-menu {
            width: 260px;
            background: #181828;
            border-right: 2px solid #ff36ba;
            box-shadow: 0 0 20px rgba(255, 54, 186, 0.15);
            display: flex;
            flex-direction: column;
            align-items: stretch;
            padding: 0 0 24px 0;
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 10010;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          }
          .sidebar-menu.open {
            transform: translateX(0);
          }
          .sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 18px 12px 18px;
            border-bottom: 1px solid #ff36ba33;
          }
          .sidebar-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #ff36ba;
            letter-spacing: 2px;
          }
          .sidebar-close {
            background: none;
            border: none;
            color: #ff36ba;
            font-size: 2rem;
            cursor: pointer;
            line-height: 1;
          }
          .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 18px;
            padding: 0 12px;
          }
          .sidebar-nav-btn {
            display: flex;
            align-items: center;
            gap: 16px;
            background: none;
            border: none;
            color: #fff;
            font-size: 1.08rem;
            font-weight: 500;
            padding: 12px 18px;
            border-radius: 10px;
            cursor: pointer;
            transition: background 0.18s, color 0.18s;
            outline: none;
          }
          .sidebar-nav-btn:hover {
            background: #ff36ba22;
            color: #ff36ba;
          }
          .sidebar-icon {
            font-size: 1.35em;
            width: 28px;
            text-align: center;
          }
          .sidebar-label {
            flex: 1;
            text-align: left;
          }
          .sidebar-toggle-btn {
            position: fixed;
            top: 28px;
            left: 18px;
            z-index: 10020;
            display: none;
            flex-direction: column;
            gap: 5px;
            cursor: pointer;
          }
          .sidebar-hamburger {
            width: 32px;
            height: 4px;
            background: #ff36ba;
            border-radius: 2px;
            transition: all 0.2s;
          }
          @media (max-width: 900px) {
            .sidebar-menu {
              position: fixed;
              left: 0;
              top: 0;
              bottom: 0;
              z-index: 10010;
              width: 220px;
              transform: translateX(-100%);
            }
            .sidebar-menu.open {
              transform: translateX(0);
            }
            .sidebar-toggle-btn {
              display: flex;
            }
            .home-container {
              margin-left: 0 !important;
            }
          }
          @media (min-width: 901px) {
            .sidebar-menu {
              transform: translateX(0);
              position: relative;
              left: 0;
              top: 0;
              width: 260px;
            }
            .sidebar-toggle-btn {
              display: none;
            }
            .home-container {
              margin-left: 260px !important;
            }
          }
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
            width: 100%;
            transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1);
          }
        `}</style>
      </div>
    </div>
  );
};

export default Home;