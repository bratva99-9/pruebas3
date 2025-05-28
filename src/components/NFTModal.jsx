import React, { useState, useEffect, useCallback } from 'react';
import { UserService } from '../UserService';

const NFTModal = ({ mission, onClose }) => {
  const [nfts, setNfts] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sending, setSending] = useState(false);

  const LIMIT = 10;
  const MAX_SELECTED = 10;

  const fetchNFTs = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const currentUser = UserService.getName();
      if (!currentUser) {
        console.error('No user logged in');
        setLoading(false);
        return;
      }

      // Ajusta la tabla y parámetros según tu backend/NFTs
      const response = await UserService.rpc.get_table_rows({
        code: 'atomicassets',
        scope: currentUser,
        table: 'assets',
        limit: LIMIT,
        lower_bound: (pageNum - 1) * LIMIT,
      });

      const pageNFTs = response.rows || [];

      if (pageNum === 1) {
        setNfts(pageNFTs);
      } else {
        setNfts(prev => [...prev, ...pageNFTs]);
      }

      setHasMore(pageNFTs.length === LIMIT);
      setPage(pageNum);
      setLoading(false);
      setLoadingMore(false);

    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNFTs(1);
  }, [fetchNFTs]);

  const loadMoreNFTs = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchNFTs(page + 1);
    }
  };

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
      alert('¡Misión enviada con éxito!');
      onClose();
    } catch (error) {
      console.error('Error sending mission:', error);
      alert('Error: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const getNFTImage = (nft) => {
    // Priorizar video si existe
    if (nft.data && nft.data.video) {
      return nft.data.video;
    }
    // Fallback a imagen
    if (nft.data && nft.data.img) {
      return `https://ipfs.io/ipfs/${nft.data.img}`;
    }
    if (nft.data && nft.data.image) {
      return `https://ipfs.io/ipfs/${nft.data.image}`;
    }
    return null;
  };

  const isVideo = (url) => {
    return url && (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov'));
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
      <div className="nft-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
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

        {nfts.length === 0 ? (
          <div className="no-nfts">
            <p>No NFTs found in your collection</p>
            <p>Make sure you own NFTs from the 'nightclubapp' collection with 'girls' schema</p>
          </div>
        ) : (
          <>
            <div className="nfts-grid">
              {nfts.map((nft) => {
                const isSelected = selectedNFTs.includes(nft.asset_id);
                const mediaUrl = getNFTImage(nft);
                
                return (
                  <div 
                    key={nft.asset_id}
                    className={`nft-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleNFTSelection(nft.asset_id)}
                  >
                    <div className="nft-media">
                      {mediaUrl ? (
                        isVideo(mediaUrl) ? (
                          <video 
                            src={mediaUrl}
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            onError={(e) => {
                              console.error('Video error:', e);
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <img 
                            src={mediaUrl} 
                            alt={nft.data?.name || `NFT #${nft.asset_id}`}
                            onError={(e) => {
                              console.error('Image error:', e);
                              e.target.style.display = 'none';
                            }}
                          />
                        )
                      ) : (
                        <div className="no-media">
                          <div className="no-media-icon">🖼️</div>
                          <div className="no-media-text">No Media</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="nft-info">
                      <div className="nft-name">
                        {nft.data?.name || `NFT #${nft.asset_id}`}
                      </div>
                      <div className="nft-id">#{nft.asset_id}</div>
                    </div>
                    
                    {isSelected && (
                      <div className="selected-indicator">✓</div>
                    )}
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <button 
                className="load-more-btn"
                onClick={loadMoreNFTs}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}

        <div className="actions">
          <button 
            className="send-btn"
            onClick={sendMission}
            disabled={selectedNFTs.length === 0 || sending}
          >
            {sending ? 'Sending...' : `Enviar misión (${selectedNFTs.length} NFTs)`}
          </button>
        </div>
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
        }

        .close-btn {
          position: absolute;
          top: 15px;
          right: 25px;
          background: none;
          border: none;
          color: #fff;
          font-size: 30px;
          cursor: pointer;
          z-index: 10;
          transition: color 0.3s ease;
        }

        .close-btn:hover {
          color: #00ffff;
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

        .load-more-btn {
          display: block;
          margin: 0 auto 30px auto;
          background: rgba(0, 255, 255, 0.2);
          border: 2px solid #00ffff;
          border-radius: 15px;
          padding: 12px 30px;
          color: #00ffff;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .load-more-btn:hover:not(:disabled) {
          background: rgba(0, 255, 255, 0.3);
          box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
        }

        .load-more-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .actions {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .send-btn {
          background: linear-gradient(45deg, #ff00ff, #00ffff);
          border: none;
          border-radius: 25px;
          padding: 15px 40px;
          font-size: 18px;
          font-weight: bold;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255, 0, 255, 0.3);
          background: linear-gradient(45deg, #00ffff, #ff00ff);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #666;
        }

        .loading {
          text-align: center;
          color: white;
          font-size: 20px;
          padding: 40px;
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
      `}</style>
    </div>
  );
};

export default NFTModal;