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
          <div className="mission-name-glow">{mission.name}</div>
          <div className="mission-description">{mission.description}</div>
          <div className="mission-details-card">
            <span className="mission-badge duration">
              <span role="img" aria-label="Duración">⏱️</span> {mission.duration ? `${mission.duration} min` : 'No disponible'}
            </span>
            <span className="mission-badge mults">
              <span role="img" aria-label="Multiplicadores">✨</span> {
                Array.isArray(mission.multipliers) && mission.multipliers.length > 0
                  ? mission.multipliers.map(m => {
                      if (typeof m === 'string') {
                        const match = m.match(/\d+/);
                        return match ? match[0] : m;
                      }
                      return m;
                    }).join(', ')
                  : 'No disponible'
              }
            </span>
          </div>
        </div>
        <div className="selected-count-badge" style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 0 0', width: '100%' }}>
          <span className="selected-count-style">Selected: {selectedNFTs.length}/{MAX_SELECTED}</span>
        </div>
        <div className="nfts-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', maxWidth: '1200px', margin: '0 auto', marginBottom: 0, marginTop: 0, position: 'relative' }}>
          <button 
            className="send-btn-alt"
            onClick={sendMission}
            disabled={selectedNFTs.length === 0 || sending}
            style={{ position: 'absolute', right: 0, top: '-54px', minWidth: 140, zIndex: 20 }}
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
        <div className="nft-modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <div style={{ flex: 1 }} />
          {filteredNFTs.length > displayCount && (
            <button className="load-more-btn neon-load" style={{marginLeft: 'auto'}} onClick={() => setDisplayCount(displayCount + 5)}>
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
        .mission-info-header .mission-name-glow {
          font-size: 2.1rem;
          font-weight: 700;
          color: #ff6fff;
          text-shadow: 0 0 12px #ff00ff99;
          margin-bottom: 8px;
          letter-spacing: 1.5px;
        }
        .mission-info-header .mission-description {
          color: #b0b0c3;
          font-size: 1.25rem;
          margin-bottom: 8px;
          margin-top: 0;
          text-align: center;
          font-weight: 400;
          text-shadow: none;
          line-height: 1.4;
          letter-spacing: 0.01em;
        }
        .nft-modal-actions {
          width: 100vw;
          max-width: 1200px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: fixed;
          left: 0;
          bottom: 38px;
          padding: 0 32px;
          z-index: 10001;
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
      `}</style>
    </div>
  );
};

export default NFTModal;