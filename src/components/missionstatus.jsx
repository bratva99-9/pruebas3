import React, { useEffect, useState } from 'react';
import { UserService } from '../UserService';

const MissionStatus = ({ onClose }) => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      setLoading(true);
      try {
        const data = await UserService.getUserActiveMissions();
        setMissions(data || []);
      } catch (err) {
        setMissions([]);
      }
      setLoading(false);
    };
    fetchMissions();
  }, []);

  const pendingMissions = missions.filter(m => !m.completed);
  const completedMissions = missions.filter(m => m.completed);

  const renderNFTCard = (nft) => (
    <div
      key={nft.asset_id}
      className="nft-card"
      style={{
        minWidth: 139,
        maxWidth: 139,
        width: 139,
        height: 236,
        background: 'transparent',
        border: 'none',
        borderRadius: 18,
        boxShadow: 'none',
        overflow: 'hidden',
        padding: 0,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 21,
      }}
    >
      <video
        src={nft.data && nft.data.video ? (nft.data.video.startsWith('Qm') ? `https://ipfs.io/ipfs/${nft.data.video}` : nft.data.video) : ''}
        loop
        muted
        playsInline
        autoPlay
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          background: 'black',
          borderRadius: 18,
          margin: 0,
          padding: 0,
          boxShadow: 'none',
          border: 'none',
          backgroundColor: 'black',
          filter: 'none',
          transform: 'none',
          zIndex: 21,
        }}
        preload="none"
        controls={false}
        onError={e => {
          e.target.style.display = 'none';
        }}
      />
    </div>
  );

  return (
    <div className="nft-modal-fullscreen">
      <div className="nft-modal-content">
        <h1 className="mission-title-nftmodal">Mission Status</h1>
        {loading ? (
          <div className="loading">Loading missions...</div>
        ) : (
          <>
            <div className="mission-status-section">
              <h2 className="mission-status-title">Pending Missions</h2>
              {pendingMissions.length === 0 ? (
                <div className="no-missions">No pending missions</div>
              ) : (
                pendingMissions.map(mission => (
                  <div key={mission.id} className="mission-status-card">
                    <div className="mission-status-header">
                      <span className="mission-status-name">{mission.name}</span>
                      <span className="mission-status-desc">{mission.description}</span>
                    </div>
                    <div className="nfts-grid unified-width compact-width" style={{gap: 18, marginTop: 12}}>
                      {mission.nfts && mission.nfts.length > 0 ? mission.nfts.map(renderNFTCard) : <span>No NFTs</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mission-status-section">
              <h2 className="mission-status-title">Completed Missions</h2>
              {completedMissions.length === 0 ? (
                <div className="no-missions">No completed missions</div>
              ) : (
                completedMissions.map(mission => (
                  <div key={mission.id} className="mission-status-card completed">
                    <div className="mission-status-header">
                      <span className="mission-status-name">{mission.name}</span>
                      <span className="mission-status-desc">{mission.description}</span>
                    </div>
                    <div className="nfts-grid unified-width compact-width" style={{gap: 18, marginTop: 12}}>
                      {mission.nfts && mission.nfts.length > 0 ? mission.nfts.map(renderNFTCard) : <span>No NFTs</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
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
        }
        .mission-status-title {
          color: #00ffff;
          font-size: 1.5rem;
          margin-bottom: 8px;
          margin-top: 18px;
        }
        .mission-status-card {
          background: rgba(36,0,56,0.10);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 18px 24px;
          margin-bottom: 18px;
          box-shadow: 0 2px 12px #ff36ba22;
        }
        .mission-status-card.completed {
          border: 2px solid #ff36ba;
          background: rgba(255,0,255,0.07);
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
        .nft-card {
          min-width: 139px;
          max-width: 139px;
          width: 139px;
          height: 236px;
          border: 1.2px solid #ff36ba99;
          border-radius: 18px;
          box-shadow: 0 0 14px 3px #ff36ba33, 0 0 0 1.2px #ff00ff33;
          background: transparent;
          overflow: hidden;
          padding: 0;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: box-shadow 0.32s cubic-bezier(0.4,0,0.2,1), border 0.32s cubic-bezier(0.4,0,0.2,1), transform 0.44s cubic-bezier(0.4,0,0.2,1);
          z-index: 21;
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
      `}</style>
    </div>
  );
};

export default MissionStatus;
