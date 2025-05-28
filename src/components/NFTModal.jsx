import React, { useState, useEffect, useCallback } from 'react';
import { UserService } from '../UserService';

const NFTModal = ({ mission, onClose }) => {
  const [nfts, setNfts] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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
        setIsClosing(true);
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
      <div className="nft-modal-overlay">
        <div className="nft-modal">
          <div className="loading">Loading NFTs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-modal-overlay">
      {showSuccess && (
        <div className="success-toast">¡Misión enviada con éxito!</div>
      )}
      <div className={`nft-modal${isClosing ? ' closing' : ''}`}>
        <button className="close-btn neon-x" onClick={onClose} aria-label="Cerrar modal">×</button>
        <div className="nfts-header-row">
          <button className="back-btn neon-back" onClick={onClose} aria-label="Volver a seleccionar misión">Back</button>
          <div style={{ flex: 1 }} />
          <button 
            className="send-btn neon-send"
            onClick={sendMission}
            disabled={selectedNFTs.length === 0 || sending}
          >
            {sending ? 'Sending...' : `Send Bitchs !`}
          </button>
        </div>
        <div className="mission-header">
          <h2>Select NFTs for Mission</h2>
          <div className="mission-info">
            <h3>{mission.name}</h3>
            <p>Select up to {MAX_SELECTED} NFTs to send on this mission</p>
            <div className="selected-count">
              Selected: {selectedNFTs.length}/{MAX_SELECTED}
            </div>
          </div>
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
                      minWidth: 80,
                      maxWidth: 120,
                      minHeight: 140,
                      maxHeight: 220,
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
      </div>

      <style jsx>{`
        .nft-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
        }

        .nft-modal {
          background: linear-gradient(135deg, #0a0a2e 0%, #16213e 50%, #0f3460 100%);
          border-radius: 20px;
          padding: 30px;
          max-width: 1400px;
          width: 95%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          border: 2px solid #00ffff;
          box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
          opacity: 1;
          transform: scale(1);
          transition: opacity 0.5s cubic-bezier(.4,0,.2,1), transform 0.5s cubic-bezier(.4,0,.2,1);
        }

        .nft-modal.closing {
          opacity: 0;
          transform: scale(0.96);
        }

        .close-btn.neon-x {
          position: absolute;
          top: 18px;
          right: 28px;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ff00cc 0%, #a259f7 100%);
          color: #fff;
          border: none;
          border-radius: 50%;
          font-size: 32px;
          font-weight: bold;
          box-shadow: 0 2px 16px #a259f780, 0 0 8px #ff00cc80;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: box-shadow 0.2s, background 0.2s, color 0.2s;
          outline: none;
        }
        .close-btn.neon-x:hover {
          background: linear-gradient(135deg, #a259f7 0%, #ff00cc 100%);
          color: #fff;
          box-shadow: 0 4px 32px #ff00cc80, 0 0 16px #a259f7cc;
        }

        .mission-header {
          text-align: center;
          margin-bottom: 30px;
          color: white;
        }

        .mission-header h2 {
          font-size: 32px;
          color: #00ffff;
          margin-bottom: 15px;
          text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
        }

        .mission-info h3 {
          font-size: 24px;
          color: #ff00ff;
          margin-bottom: 10px;
        }

        .mission-info p {
          color: #ccc;
          margin-bottom: 10px;
        }

        .selected-count {
          font-size: 18px;
          font-weight: bold;
          color: #00ffff;
          background: rgba(0, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 20px;
          display: inline-block;
          border: 1px solid rgba(0, 255, 255, 0.3);
        }

        .no-nfts {
          text-align: center;
          color: #ccc;
          padding: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          border: 2px dashed #666;
        }

        .no-nfts p {
          margin-bottom: 10px;
          font-size: 16px;
        }

        .nfts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .nft-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid #444;
          border-radius: 15px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          position: relative;
        }

        .nft-card:hover {
          transform: translateY(-5px);
          border-color: #00ffff;
          box-shadow: 0 10px 25px rgba(0, 255, 255, 0.3);
        }

        .nft-card.selected {
          border-color: #ff00ff;
          box-shadow: 0 0 25px rgba(255, 0, 255, 0.5);
          background: rgba(255, 0, 255, 0.1);
        }

        .nft-media {
          width: 100%;
          height: 200px;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 15px;
          background: #333;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nft-media img,
        .nft-media video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-media {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
        }

        .no-media-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }

        .no-media-text {
          font-size: 14px;
        }

        .nft-info {
          color: white;
          text-align: center;
        }

        .nft-name {
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 16px;
          line-height: 1.2;
        }

        .nft-id {
          color: #aaa;
          font-size: 14px;
        }

        .selected-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff00ff;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .load-more-btn.neon-load {
          display: block;
          margin: 30px auto 0 auto;
          background: #181828;
          border: 2px solid #a259f7;
          border-radius: 18px;
          padding: 14px 38px;
          color: #a259f7;
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 1px;
          cursor: pointer;
          box-shadow: 0 2px 12px #a259f780;
          transition: all 0.2s;
        }
        .load-more-btn.neon-load:hover:not(:disabled) {
          background: #a259f7;
          color: #fff;
          box-shadow: 0 4px 24px #ff00cc80;
        }

        .send-btn.neon-send {
          padding: 16px 38px;
          font-size: 20px;
          border-radius: 30px;
          background: linear-gradient(90deg, #ff00cc 0%, #a259f7 100%);
          color: #fff;
          border: none;
          font-weight: bold;
          box-shadow: 0 4px 24px #a259f780, 0 0 8px #ff00cc80;
          text-shadow: 0 2px 8px #000a;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s, box-shadow 0.3s;
          text-transform: uppercase;
          margin-right: 10px;
        }
        .send-btn.neon-send:hover:not(:disabled) {
          background: linear-gradient(90deg, #a259f7 0%, #ff00cc 100%);
          box-shadow: 0 6px 32px #ff00cc80, 0 0 16px #a259f7cc;
          color: #fff;
        }
        .send-btn.neon-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #222;
          box-shadow: none;
        }

        .success-toast {
          position: fixed;
          top: 24px;
          right: 32px;
          z-index: 2000;
          background: #1ed760;
          color: #fff;
          padding: 18px 32px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: bold;
          box-shadow: 0 4px 24px #0006;
          animation: fadeInOut 3.5s;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .nft-modal {
            padding: 20px;
            width: 95%;
          }
          
          .mission-header h2 {
            font-size: 24px;
          }
          
          .nfts-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
          }
          
          .nft-media {
            height: 150px;
          }
        }

        /* Scrollbar elegante para el modal */
        .nft-modal::-webkit-scrollbar {
          width: 12px;
          background: rgba(0, 255, 255, 0.08);
          border-radius: 10px;
        }
        .nft-modal::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
          border-radius: 10px;
          box-shadow: 0 2px 8px #0006;
        }
        .nft-modal::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
        }

        .nfts-header-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 10px;
          width: 100%;
        }

        .back-btn.neon-back {
          background: #181828;
          border: 2px solid #a259f7;
          border-radius: 18px;
          padding: 14px 38px;
          color: #a259f7;
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 1px;
          cursor: pointer;
          box-shadow: 0 2px 12px #a259f780;
          transition: all 0.2s;
        }
        .back-btn.neon-back:hover:not(:disabled) {
          background: #a259f7;
          color: #fff;
          box-shadow: 0 4px 24px #ff00cc80;
        }
      `}</style>
    </div>
  );
};

export default NFTModal;