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
          <div className="mission-description">{mission.description}</div>
          <div className="mission-stats-bottom-nftmodal">
            <div className="stat">
              <span className="stat-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8.5" stroke="#bfc2d1" strokeWidth="1.5"/><path d="M10 5.5V10L13 12" stroke="#bfc2d1" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </span>
              <span className="stat-text">{mission.duration_minutes ? `${mission.duration_minutes} min` : 'No disponible'}</span>
            </div>
            <div className="stat-separator"></div>
            <div className="stat">
              <span className="stat-icon">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="9" fill="#ffe066" stroke="#ff00ff" strokeWidth="2"/>
                  <circle cx="11" cy="11" r="7" fill="#fffbe6" fillOpacity="0.7"/>
                  <path d="M11 15.2c-2.2-1.6-4-3.1-4-4.7a2 2 0 0 1 4-1.1A2 2 0 0 1 15 10.5c0 1.6-1.8 3.1-4 4.7z" fill="#ff00ff" stroke="#ff00ff" strokeWidth="0.7"/>
                </svg>
              </span>
              <span className="stat-text">{mission.reward_multiplier !== undefined ? `${Number(mission.reward_multiplier).toFixed(1)} SEXY` : 'No disponible'}</span>
            </div>
            <div className="stat">
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
              <span className="stat-text stat-gift-chance">{mission.nft_drop_multiplier !== undefined ? `${Number(mission.nft_drop_multiplier).toFixed(1)}% Gift Chance` : 'No disponible'}</span>
            </div>
          </div>
        </div>
        <div className="selected-count-badge" style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 0 0', width: '100%' }}>
          <span className="selected-count-style selected-count-btn btn-small">Selected: {selectedNFTs.length}/{MAX_SELECTED}</span>
        </div>
        <div className="nfts-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', maxWidth: '1200px', margin: '0 auto', marginBottom: 0, marginTop: 0, position: 'relative' }}>
          <button 
            className="send-btn-alt send-btn-align btn-small"
            onClick={sendMission}
            disabled={selectedNFTs.length === 0 || sending}
            style={{ position: 'absolute', right: 'calc(50vw - 600px + 36px)', top: '-54px', zIndex: 20 }}
          >
            {sending ? 'Sending...' : `Send Bitchs !`}
          </button>
        </div>
        {filteredNFTs.length === 0 ? (
          <div className="no-nfts">
            <p>No NFTs found in your collection</p>
            <p>Make sure you own NFTs from the 'nightclubnft' collection with schema 'girls'</p>
          </div>
        ) : (
          <div className="nfts-grid">
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
        <div className="nft-modal-actions" style={{ display: 'flex', width: '100vw', maxWidth: '1200px', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', left: 0, bottom: 38, padding: '0 32px', zIndex: 10001 }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0, marginLeft: 'calc(50vw - 600px + 0px)' }}>
            <button className="cancel-btn btn-small" onClick={onClose}>Cancel</button>
          </div>
          {filteredNFTs.length > displayCount && (
            <button className="load-more-btn neon-load load-more-align btn-small" style={{right: 'calc(50vw - 600px + 36px)'}} onClick={() => setDisplayCount(displayCount + 5)}>
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
          padding-top: 18px;
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
          margin-bottom: 18px;
          text-shadow: 0 0 12px #ff00ff99;
          letter-spacing: 2px;
        }
        .mission-stats-bottom-nftmodal {
          width: 100%;
          background: rgba(30, 30, 50, 0.30);
          border-radius: 0 0 18px 18px;
          box-shadow: 0 2px 12px 0 #0002;
          padding-bottom: 18px;
          padding-top: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 15;
          margin-bottom: 18px;
        }
        .stat {
          color: #bfc2d1;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 400;
          text-shadow: none;
          margin-bottom: 4px;
          letter-spacing: 0.01em;
        }
        .stat-text {
          color: #bfc2d1;
          font-size: 15px;
          font-weight: 400;
          letter-spacing: 0.01em;
          text-shadow: none;
          opacity: 0.85;
        }
        .stat-icon {
          font-size: 18px;
          width: 22px;
          text-align: center;
          opacity: 0.55;
          filter: grayscale(1) brightness(1.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }
        .stat-separator {
          width: 60%;
          height: 1.5px;
          background: linear-gradient(90deg, #e0e0e055 0%, #fff0 100%);
          margin: 2px auto 6px auto;
          border: none;
          border-radius: 1.5px;
        }
        .stat-gift-chance {
          color: #bfc2d1;
          font-weight: 400;
          opacity: 0.95;
          letter-spacing: 0.01em;
          font-size: 15px;
          text-shadow: none;
        }
        .selected-count-badge {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 0;
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
        .load-more-align {
          min-width: 80px;
          font-size: 14px;
          padding: 7px 18px;
          border-radius: 14px;
          position: relative;
          right: 160px;
        }
        .send-btn-align {
          min-width: 80px;
          font-size: 14px;
          padding: 7px 18px;
          border-radius: 14px;
          position: absolute;
          right: 160px;
          top: -54px;
        }
        .send-btn-alt {
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
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .send-btn-alt:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
          color: #fff;
          box-shadow: none;
        }
        .cancel-btn {
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
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .cancel-btn:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
          color: #fff;
          box-shadow: none;
        }
        .load-more-btn {
          font-size: 18px;
          font-weight: 500;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 10px 32px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 1px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .load-more-btn:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
          color: #fff;
          box-shadow: none;
        }
        .btn-small {
          font-size: 14px !important;
          padding: 7px 18px !important;
          min-width: 80px !important;
          border-radius: 14px !important;
        }
      `}</style>
    </div>
  );
};

export default NFTModal;