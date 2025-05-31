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
        
        // Obtener información de los NFTs para cada misión
        const missionsWithNFTs = await Promise.all(userMissions.map(async (mission) => {
          try {
            const response = await fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets/${mission.asset_id}`);
            const data = await response.json();
            if (data.data && data.data.data && data.data.data.video) {
              return {
                ...mission,
                video_url: data.data.data.video
              };
            }
          } catch (err) {
            console.error('Error al obtener información del NFT:', err);
          }
          return mission;
        }));

        setMissions(missionsWithNFTs);
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

  return (
    <div className="nft-modal-fullscreen">
      <div className="nft-modal-content">
        <h1 className="mission-title-nftmodal">Misiones activas</h1>
        {loading ? (
          <div className="loading">Cargando misiones...</div>
        ) : (
          <div className="mission-status-section">
            <span style={{display: 'none'}}>{now}</span>
            {missions.length === 0 ? (
              <div className="no-missions">No tienes misiones activas</div>
            ) : (
              missions.map(mission => {
                let videoUrl = mission.video_url;
                if (videoUrl && videoUrl.startsWith('Qm')) {
                  videoUrl = `https://ipfs.io/ipfs/${videoUrl}`;
                }
                return (
                  <div key={mission.asset_id} className="mission-status-card">
                    <div className="mission-video-container">
                      {videoUrl ? (
                        <video 
                          className="mission-video"
                          src={videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          onError={(e) => {
                            console.error('Error al cargar el video:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="mission-video-placeholder">
                          <span>Video no disponible</span>
                        </div>
                      )}
                      <div className="mission-info-overlay">
                        <div className="mission-info-content">
                          <div className="mission-stat">
                            <span className="stat-icon">
                              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="11" cy="11" r="9" fill="#ffe066" stroke="#ff00ff" strokeWidth="2"/>
                                <circle cx="11" cy="11" r="7" fill="#fffbe6" fillOpacity="0.7"/>
                                <path d="M11 15.2c-2.2-1.6-4-3.1-4-4.7a2 2 0 0 1 4-1.1A2 2 0 0 1 15 10.5c0 1.6-1.8 3.1-4 4.7z" fill="#ff00ff" stroke="#ff00ff" strokeWidth="0.7"/>
                              </svg>
                            </span>
                            <span className="stat-text">{formatReward(mission.reward)} SEXY</span>
                          </div>
                          <div className="mission-stat">
                            <span className="stat-icon">
                              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4.5" y="9.5" width="13" height="7" rx="2" fill="#ff00ff" fillOpacity="0.13" stroke="#ff00ff" strokeWidth="1.7"/>
                                <rect x="8.5" y="4.5" width="5" height="5" rx="1.5" fill="#ff00ff" fillOpacity="0.18" stroke="#ff00ff" strokeWidth="1.3"/>
                                <path d="M4.5 12H17.5" stroke="#ff00ff" strokeWidth="1.3"/>
                                <path d="M11 9.5V16" stroke="#ff00ff" strokeWidth="1.3"/>
                                <path d="M8.5 7C7.5 5.5 10 4 11 7" stroke="#ff00ff" strokeWidth="1.2" strokeLinecap="round"/>
                                <path d="M13.5 7C14.5 5.5 12 4 11 7" stroke="#ff00ff" strokeWidth="1.2" strokeLinecap="round"/>
                              </svg>
                            </span>
                            <span className="stat-text">{formatDropChance(mission.nft_drop_chance)}</span>
                          </div>
                          <div className="mission-stat">
                            <span className="stat-icon">
                              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="10" r="8.5" stroke="#bfc2d1" strokeWidth="1.5"/>
                                <path d="M10 5.5V10L13 12" stroke="#bfc2d1" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </span>
                            <span className="stat-text">{getTimeLeft(Number(mission.end_time))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mission-status-actions">
                      <button className="btn-mission-action">Claim</button>
                      <button className="btn-mission-action btn-mission-cancel">Cancel</button>
                    </div>
                  </div>
                );
              })
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
          overflow: hidden;
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
          position: relative;
          z-index: 10000;
        }
        .mission-title-nftmodal {
          text-align: center;
          font-size: 38px;
          font-weight: 700;
          color: #ff6fff;
          margin-bottom: 10px;
          text-shadow: 0 0 12px #ff00ff99;
          letter-spacing: 2px;
          position: relative;
          z-index: 10001;
        }
        .mission-status-section {
          margin-bottom: 32px;
          width: 100%;
          max-width: 900px;
          padding: 0 20px;
          position: relative;
          z-index: 10001;
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          justify-content: flex-start;
        }
        .mission-status-card {
          background: rgba(36,0,56,0.22);
          border: none;
          border-radius: 22px;
          padding: 8px 8px 18px 8px;
          margin-bottom: 18px;
          box-shadow: 0 2px 18px 0 #0008, 0 0 0 1.5px #ff36ba22;
          overflow: hidden;
          position: relative;
          z-index: 10001;
          width: 162px;
          height: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
        }
        .mission-video-container {
          position: relative;
          width: 108px;
          height: 192px;
          border-radius: 18px;
          overflow: hidden;
          background: rgba(0,0,0,0.32);
          z-index: 10001;
          margin-bottom: 8px;
        }
        .mission-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: relative;
          z-index: 10001;
          border-radius: 18px;
        }
        .mission-video-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #bfc2d1;
          font-size: 1.1rem;
          background: rgba(0,0,0,0.2);
          position: relative;
          z-index: 10001;
        }
        .mission-info-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(0deg, rgba(10,10,46,0.92) 80%, rgba(10,10,46,0.0) 100%);
          padding: 14px 10px 10px 10px;
          border-radius: 0 0 18px 18px;
          z-index: 10002;
        }
        .mission-info-content {
          display: flex;
          flex-direction: column;
          gap: 7px;
          align-items: flex-start;
          position: relative;
          z-index: 10002;
        }
        .mission-stat {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #fff;
          position: relative;
          z-index: 10002;
          font-size: 15px;
        }
        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
          position: relative;
          z-index: 10002;
        }
        .stat-text {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          text-shadow: 0 0 8px rgba(255,0,255,0.3);
          position: relative;
          z-index: 10002;
        }
        .nftmodal-bottom-buttons {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 32px;
          gap: 32px;
          z-index: 10002;
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
          position: relative;
          z-index: 10002;
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
          position: relative;
          z-index: 10001;
        }
        .no-missions {
          color: #bfc2d1;
          font-size: 1rem;
          text-align: center;
          padding: 20px;
          background: rgba(36,0,56,0.05);
          border-radius: 12px;
          border: 1px solid rgba(0,255,255,0.1);
          position: relative;
          z-index: 10001;
        }
        .mission-status-actions {
          display: flex;
          flex-direction: row;
          gap: 8px;
          align-items: center;
          width: 100%;
          margin-top: 10px;
          justify-content: center;
        }
        .btn-mission-action {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 10px;
          padding: 5px 0;
          min-width: 60px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          margin: 0;
          white-space: nowrap;
        }
        .btn-mission-action:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
          color: #fff;
        }
        .btn-mission-cancel {
          background: rgba(255,0,0,0.13);
          border: 2px solid #ff0033;
          color: #fff;
        }
        .btn-mission-cancel:hover {
          background: rgba(255,0,0,0.22);
          border-color: #ff0033;
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default MissionStatus;
