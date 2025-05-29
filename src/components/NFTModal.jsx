import React, { useState, useEffect, useCallback } from 'react';
import { UserService } from '../UserService';

const NFTModal = ({ mission, onClose }) => {
  const [nfts, setNfts] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);

  const MAX_SELECTED = 10;

  const fetchNFTs = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = UserService.getName();
      console.log('Usuario actual:', currentUser);
      if (!currentUser) {
        console.error('No user logged in');
        setLoading(false);
        return;
      }

      // Usar la API pública de AtomicAssets
      const url = `https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${currentUser}&collection_name=nightclubnft&limit=100`;
      const res = await fetch(url);
      const data = await res.json();
      const nfts = data.data || [];
      console.log('NFTs recibidos:', nfts);

      setNfts(nfts);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  // Filtrar NFTs por colección, schema y que tengan video
  const filteredNFTs = nfts.filter(nft =>
    nft.collection && 
    nft.collection.collection_name === 'nightclubnft' &&
    nft.schema && 
    nft.schema.schema_name === 'girls' &&
    nft.data && 
    nft.data.video
  );

  const toggleNFTSelection = (assetId) => {
    console.log('Toggling NFT selection:', assetId);
    if (selectedNFTs.includes(assetId)) {
      setSelectedNFTs(prev => prev.filter(id => id !== assetId));
    } else {
      if (selectedNFTs.length < MAX_SELECTED) {
        setSelectedNFTs(prev => [...prev, assetId]);
      } else {
        alert(`Maximum ${MAX_SELECTED} NFTs can be selected`);
      }
    }
  };

  const sendMission = async () => {
    if (selectedNFTs.length === 0) return;

    setSending(true);
    try {
      const memo = `mission:${mission.id}`;
      console.log('Sending mission with NFTs:', selectedNFTs, 'memo:', memo);
      await UserService.stakeNFTs(selectedNFTs, memo);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
      setTimeout(() => {
        setTimeout(() => onClose(), 500);
      }, 1200);
    } catch (error) {
      console.error('Error sending mission:', error);
      alert('Error: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="nft-modal-fullscreen">
        <div className="nft-modal-content">
          <div className="loading">Loading NFTs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-modal-fullscreen">
      {showSuccess && (
        <div className="success-toast">¡Misión enviada con éxito!</div>
      )}
      <div className="nft-modal-content">
        <div className="mission-info-header">
          <h1 className="mission-title-nftmodal">{mission.name}</h1>
          <div className="mission-description-large" style={{marginTop: '0px', marginBottom: '-6px'}}>{mission.description}</div>
          <div className="mission-stats-horizontal">
            <div className="stat stat-large">
              <span className="stat-icon stat-icon-large">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="16" stroke="#bfc2d1" strokeWidth="2.5"/><path d="M18 9.5V18L24 22" stroke="#bfc2d1" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </span>
              <span className="stat-text stat-text-large">{mission.duration_minutes ? `${mission.duration_minutes} min` : 'No disponible'}</span>
            </div>
            <div className="stat stat-large">
              <span className="stat-icon stat-icon-large">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="22" cy="22" r="18" fill="#ffe066" stroke="#ff00ff" strokeWidth="3"/>
                  <circle cx="22" cy="22" r="14" fill="#fffbe6" fillOpacity="0.7"/>
                  <path d="M22 30.4c-4.4-3.2-8-6.2-8-9.4a4 4 0 0 1 8-2.2A4 4 0 0 1 30 21c0 3.2-3.6 6.2-8 9.4z" fill="#ff00ff" stroke="#ff00ff" strokeWidth="1.2"/>
                </svg>
              </span>
              <span className="stat-text stat-text-large">{mission.reward_multiplier !== undefined ? `${Number(mission.reward_multiplier).toFixed(1)} SEXY` : 'No disponible'}</span>
            </div>
            <div className="stat stat-large">
              <span className="stat-icon stat-icon-large">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="9" y="19" width="26" height="14" rx="4" fill="#ff00ff" fillOpacity="0.13" stroke="#ff00ff" strokeWidth="2.5"/>
                  <rect x="17" y="9" width="10" height="10" rx="3" fill="#ff00ff" fillOpacity="0.18" stroke="#ff00ff" strokeWidth="2"/>
                  <path d="M9 24H35" stroke="#ff00ff" strokeWidth="2"/>
                  <path d="M22 19V33" stroke="#ff00ff" strokeWidth="2"/>
                  <path d="M17 14C15 11 20 8 22 14" stroke="#ff00ff" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M27 14C29 11 24 8 22 14" stroke="#ff00ff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="stat-text stat-text-large stat-gift-chance">{mission.nft_drop_multiplier !== undefined ? `${Number(mission.nft_drop_multiplier).toFixed(1)}% Gift Chance` : 'No disponible'}</span>
            </div>
          </div>
        </div>
        {/* Botones superiores */}
        <div className="nftmodal-top-buttons">
          <div className="nftmodal-top-center">
            <span className="selected-count-style selected-count-btn btn-small">Selected: {selectedNFTs.length}/{MAX_SELECTED}</span>
          </div>
          <div className="nftmodal-top-right">
            <button 
              className="btn-square send-btn-alt btn-small"
              onClick={sendMission}
              disabled={selectedNFTs.length === 0 || sending}>
              {sending ? 'Sending...' : `Send Bitchs !`}
            </button>
          </div>
        </div>
        {filteredNFTs.length === 0 ? (
          <div className="no-nfts">
            <p>No NFTs found in your collection</p>
            <p>Make sure you own NFTs from the 'nightclubnft' collection with schema 'girls'</p>
          </div>
        ) : (
          <div className="nfts-grid" style={{marginTop: '12px'}}>
            {filteredNFTs.slice(0, displayCount).map((nft) => {
              const isSelected = selectedNFTs.includes(nft.asset_id);
              const videoUrl = nft.data.video.startsWith('Qm')
                ? `https://ipfs.io/ipfs/${nft.data.video}`
                : nft.data.video;
              return (
                <div 
                  key={nft.asset_id}
                  className={`nft-card${isSelected ? ' selected' : ''}`}
                  onClick={() => toggleNFTSelection(nft.asset_id)}
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
                    transition: 'border 0.32s cubic-bezier(0.4,0,0.2,1)',
                    zIndex: isSelected ? 99999 : 21,
                  }}
                >
                  <video
                    src={videoUrl}
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
                      boxShadow: isSelected ? '0 0 18px 4px #ff36ba66' : 'none',
                      border: isSelected ? '4px solid #ff00ffcc' : 'none',
                      backgroundColor: 'black',
                      filter: 'none',
                      transform: 'none',
                      transition: 'box-shadow 0.32s cubic-bezier(0.4,0,0.2,1), border 0.32s cubic-bezier(0.4,0,0.2,1)',
                      zIndex: isSelected ? 99999 : 21,
                    }}
                    preload="none"
                    controls={false}
                    onError={e => {
                      console.error('Video error:', e);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
        {/* Botones inferiores */}
        <div className="nftmodal-bottom-buttons">
          <button className="btn-square btn-select-mission" onClick={onClose}>Select Mission</button>
          <button className="btn-square btn-cancel-missionmodal" onClick={() => onClose && onClose()}>Cancel</button>
          {filteredNFTs.length > displayCount && (
            <button className="btn-square btn-load-more" onClick={() => setDisplayCount(displayCount + 5)}>
              Load More NFTs
            </button>
          )}
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
        .nfts-grid {
          display: flex;
          flex-direction: row;
          gap: 36px;
          overflow-x: auto;
          padding-bottom: 18px;
          margin-bottom: 0;
          margin-top: 32px;
          padding-top: 16px;
          scrollbar-color: #ff00ff #181828;
          scrollbar-width: thin;
          justify-content: center;
          width: 100vw;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .nft-card {
          min-width: 139px;
          max-width: 139px;
          width: 139px;
          height: 236px;
          border: none;
          border-radius: 18px;
          box-shadow: none;
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
        .nft-card.selected {
          z-index: 99999;
        }
        .nft-card.selected video {
          border: 4px solid #ff00ffcc !important;
          box-shadow: 0 0 18px 4px #ff36ba66 !important;
        }
        .nft-card:hover {
          /* Sin efecto de hover */
        }
        .mission-title-nftmodal {
          text-align: center;
          font-size: 38px;
          font-weight: 700;
          color: #ff6fff;
          margin-bottom: 8px;
          text-shadow: 0 0 12px #ff00ff99;
          letter-spacing: 2px;
        }
        .mission-description-large {
          font-size: 1.2rem;
          color: #bfc2d1;
          text-align: center;
          margin-bottom: 4px;
          margin-top: 0px;
          padding: 0 24px;
          line-height: 1.4;
          letter-spacing: 0.02em;
        }
        .mission-stats-horizontal {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: 48px;
          margin: 12px 0 18px 0;
        }
        .stat-large {
          font-size: 2.1rem;
          gap: 18px;
        }
        .stat-icon-large {
          font-size: 2.1rem;
          width: 44px;
          height: 44px;
        }
        .stat-text-large {
          font-size: 2.1rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.03em;
          text-shadow: 0 0 8px #ff00ff44;
        }
        .selected-count-style {
          font-size: 18px;
          font-weight: 500;
          color: #fff;
          background: rgba(36,0,56,0.10);
          border: 2.5px solid #00ffff;
          border-radius: 14px;
          padding: 10px 32px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 1px;
          cursor: default;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          margin-bottom: 0;
        }
        .selected-count-btn {
          font-size: 18px;
          font-weight: 500;
          color: #fff;
          background: rgba(36,0,56,0.10);
          border: 2.5px solid #00ffff;
          border-radius: 14px;
          padding: 10px 32px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 1px;
          cursor: default;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          margin-bottom: 0;
          min-width: 140px;
        }
        .selected-send-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          width: 100%;
          margin: 0 0 0 0;
          position: relative;
          top: -8px;
          min-height: 48px;
        }
        .selected-count-style.selected-count-btn.btn-small {
          margin: 0 auto;
          display: block;
          position: relative;
          left: 0;
          right: 0;
        }
        .nftmodal-top-buttons {
          width: 100vw;
          max-width: 1200px;
          margin: 0 auto 8px auto;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding-left: 260px;
          padding-right: 260px;
        }
        .nftmodal-top-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }
        .nftmodal-top-right {
          display: flex;
          justify-content: flex-end;
        }
        .nftmodal-bottom-buttons {
          width: 100vw;
          max-width: 1200px;
          margin: 12px auto 0 auto;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding-left: 260px;
          padding-right: 260px;
        }
        .btn-square {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 8px 32px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 1px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          margin: 0 8px;
        }
        .btn-square:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
          color: #fff;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default NFTModal;