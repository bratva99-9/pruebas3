import React, { useState, useEffect, useCallback } from 'react';
import { UserService } from '../UserService';

const NFTModal = ({ mission, onClose }) => {
  const [nfts, setNfts] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [showSuccess, setShowSuccess] = useState(false);

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
        <div className="nfts-header-row">
          <span className="selected-count selected-style center-badge">Selected: {selectedNFTs.length}/{MAX_SELECTED}</span>
          <button 
            className="send-btn selected-style send-style"
            onClick={sendMission}
            disabled={selectedNFTs.length === 0 || sending}
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
          <>
            <div className="nfts-grid">
              {filteredNFTs.slice(0, displayCount).map((nft) => {
                const isSelected = selectedNFTs.includes(nft.asset_id);
                const videoUrl = nft.data.video.startsWith('Qm')
                  ? `https://ipfs.io/ipfs/${nft.data.video}`
                  : nft.data.video;
                return (
                  <div 
                    key={nft.asset_id}
                    className={`nft-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleNFTSelection(nft.asset_id)}
                    style={{
                      aspectRatio: '9/16',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px #0004',
                      minWidth: 88,
                      maxWidth: 132,
                      minHeight: 154,
                      maxHeight: 242,
                      background: 'transparent',
                      border: isSelected ? '3px solid #ff00ff' : '2px solid #00ffff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '0 auto',
                      padding: 0
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
                        borderRadius: '0',
                        margin: 0,
                        padding: 0
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
            {filteredNFTs.length > displayCount && (
              <button className="load-more-btn neon-load" onClick={() => setDisplayCount(displayCount + 5)}>
                Load More
              </button>
            )}
          </>
        )}
        <button className="cancel-btn" onClick={onClose}>Cancelar</button>
      </div>
      <style jsx>{`
        .nft-modal-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          background: linear-gradient(135deg, #0a0a2e 0%, #16213e 50%, #0f3460 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .nft-modal-content {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 48px;
        }
        .cancel-btn {
          margin: 0 auto;
          margin-top: 24px;
          display: block;
          font-size: 28px;
          font-weight: 600;
          color: #fff;
          background: rgba(36,0,56,0.10);
          border: 2.5px solid #00ffff;
          border-radius: 18px;
          padding: 18px 64px;
          box-shadow: 0 0 18px #00ffff55, 0 0 8px #ff00ff44;
          text-shadow: 0 0 8px #00ffff99;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .cancel-btn:hover {
          background: rgba(36,0,56,0.18);
          border-color: #ff00ff;
          color: #ff00ff;
          box-shadow: 0 0 32px #ff00ff99, 0 0 8px #00ffff44;
        }
      `}</style>
    </div>
  );
};

export default NFTModal;