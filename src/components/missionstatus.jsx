import React, { useEffect, useState } from 'react';
import { UserService } from '../UserService';

function formatReward(reward) {
  if (!reward) return '0';
  const [num] = reward.split(' ');
  return Number(num) % 1 === 0 ? parseInt(num) : Number(num);
}

function formatDropChance(chance) {
  if (!chance) return '0%';
  return `${parseInt(Number(chance))}%`;
}

function getTimeLeft(endTime) {
  const now = Math.floor(Date.now() / 1000);
  const diff = endTime - now;
  if (diff <= 0) return '¡Completada!';
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const MissionStatus = ({ onClose }) => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const fetchMissions = async () => {
      setLoading(true);
      try {
        const currentUser = UserService.getName();
        if (!currentUser) {
          console.error('No hay usuario logueado');
          setMissions([]);
          setLoading(false);
          return;
        }
        // Obtener todas las misiones y filtrar por usuario
        const allMissions = await UserService.getUserMissions();
        const userMissions = allMissions.filter(m => m.user === currentUser);
        setMissions(userMissions);
      } catch (err) {
        console.error('Error al obtener misiones:', err);
        setMissions([]);
      }
      setLoading(false);
    };
    fetchMissions();
  }, []);

  // Actualizar cada segundo para la cuenta regresiva
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Puedes separar en completadas/pendientes si tienes ese campo, si no, muestra todas

  return (
    <div className="nft-modal-fullscreen">
      <div className="nft-modal-content">
        <h1 className="mission-title-nftmodal">Misiones activas</h1>
        {loading ? (
          <div className="loading">Cargando misiones...</div>
        ) : (
          <div className="mission-status-section">
            {missions.length === 0 ? (
              <div className="no-missions">No tienes misiones activas</div>
            ) : (
              missions.map(mission => (
                <div key={mission.asset_id} className="mission-status-card">
                  <div className="mission-status-fields">
                    <div><b>Reward:</b> {formatReward(mission.reward)} SEXY</div>
                    <div><b>NFT Drop Chance:</b> {formatDropChance(mission.nft_drop_chance)}</div>
                    <div><b>Tiempo restante:</b> {getTimeLeft(Number(mission.end_time))}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        <div className="nftmodal-bottom-buttons unified-width compact-width fixed-bottom-btns">
          <button className="btn-square btn-small" onClick={onClose}>Back</button>
          <button className="btn-square btn-small">Refresh</button>
          <button className="btn-square btn-small">Claim All</button>
        </div>
      </div>
      <style jsx>{`
        .nft-modal-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          background: hsl(245, 86.70%, 2.90%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }
        .nft-modal-content {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 12px;
          overflow-y: auto;
        }
        .mission-title-nftmodal {
          text-align: center;
          font-size: 38px;
          font-weight: 700;
          color: #ff6fff;
          margin-bottom: 10px;
          text-shadow: 0 0 12px #ff00ff99;
          letter-spacing: 2px;
        }
        .mission-status-section {
          margin-bottom: 32px;
          width: 100%;
          max-width: 900px;
          padding: 0 20px;
        }
        .mission-status-card {
          background: rgba(36,0,56,0.10);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 18px 24px;
          margin-bottom: 18px;
          box-shadow: 0 2px 12px #ff36ba22;
        }
        .mission-status-fields {
          color: #bfc2d1;
          font-size: 1.1rem;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .nftmodal-bottom-buttons {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 32px;
          gap: 32px;
          z-index: 10001;
          width: 900px !important;
          max-width: 900px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
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
        .loading {
          color: #fff;
          font-size: 1.2rem;
          margin-top: 40px;
        }
        .no-missions {
          color: #bfc2d1;
          font-size: 1rem;
          text-align: center;
          padding: 20px;
          background: rgba(36,0,56,0.05);
          border-radius: 12px;
          border: 1px solid rgba(0,255,255,0.1);
        }
      `}</style>
    </div>
  );
};

export default MissionStatus;
