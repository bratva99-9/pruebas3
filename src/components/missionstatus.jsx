import React, { useEffect, useState } from 'react';
import { UserService } from '../UserService';

const MissionStatus = ({ onClose }) => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

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
                <div key={mission.id} className="mission-status-card">
                  <div className="mission-status-header">
                    <span className="mission-status-name">ID: {mission.id}</span>
                    <span className="mission-status-desc">Usuario: {mission.user}</span>
                  </div>
                  <div className="mission-status-fields">
                    <div>Asset ID: {mission.asset_id}</div>
                    <div>Template ID: {mission.template_id}</div>
                    <div>Mission Type ID: {mission.mission_type_id}</div>
                    <div>Start Time: {mission.start_time}</div>
                    <div>End Time: {mission.end_time}</div>
                    <div>Reward: {mission.reward}</div>
                    <div>NFT Drop Chance: {mission.nft_drop_chance}</div>
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
        .mission-status-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .mission-status-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #ffb9fa;
        }
        .mission-status-desc {
          font-size: 1rem;
          color: #bfc2d1;
        }
        .mission-status-fields {
          color: #bfc2d1;
          font-size: 1rem;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
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
