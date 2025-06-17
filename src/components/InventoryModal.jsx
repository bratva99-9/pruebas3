import React, { useState, useEffect } from 'react';
import { UserService } from '../UserService';

const SCHEMAS = [
  { id: 'girls', name: 'Girls' },
  { id: 'photos', name: 'Photos' },
  { id: 'items', name: 'Items' },
  { id: 'videos', name: 'Videos' },
  { id: 'shards', name: 'Shards' },
  { id: 'packs', name: 'Packs' }
];

const COLLECTION = 'nightclubnft';
const PAGE_SIZE = 10;

const InventoryModal = ({ onClose }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('girls');
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchNFTs();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
    setFilteredNfts(
      nfts.filter(
        nft => nft.schema && nft.schema.schema_name && nft.schema.schema_name.toLowerCase() === selectedCategory
      )
    );
  }, [selectedCategory, nfts]);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      const user = UserService.authName || (UserService.getName && UserService.getName());
      if (!user) {
        setNfts([]);
        setFilteredNfts([]);
        setLoading(false);
        return;
      }
      // Fetch NFTs from all schemas
      const queries = SCHEMAS.filter(s => s.id !== 'all').map(schema =>
        fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${user}&collection_name=${COLLECTION}&schema_name=${schema.id}&limit=100`)
          .then(res => res.json())
      );
      const results = await Promise.all(queries);
      const nftsData = results.flatMap(r => Array.isArray(r.data) ? r.data : []);
      setNfts(nftsData);
      setFilteredNfts(nftsData);
      setLoading(false);
    } catch (error) {
      setNfts([]);
      setFilteredNfts([]);
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + PAGE_SIZE);
  };

  if (loading) {
    return (
      <div className="inventory-modal-fullscreen">
        <div className="inventory-modal-content">
          <div className="loading">Loading inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-modal-fullscreen">
      <div className="inventory-modal-content">
        <h1 className="inventory-title">INVENTORY</h1>
        <div className="category-filters">
          {SCHEMAS.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        {selectedCategory === 'packs' && (
          <div style={{width:'100%',display:'flex',justifyContent:'flex-start',marginBottom:16}}>
            <a
              href="https://neftyblocks.com/collection/nightclubnft/packs"
              target="_blank"
              rel="noopener noreferrer"
              className="packs-link-btn"
              style={{textDecoration:'none'}}
            >
              Go to Packs
            </a>
          </div>
        )}
        <div className="nfts-grid">
          {filteredNfts.length === 0 ? (
            <div style={{color:'#fff', gridColumn:'1/-1', textAlign:'center', fontSize:'1.2rem', opacity:0.7}}>No NFTs in this category.</div>
          ) : filteredNfts.slice(0, displayCount).map(nft => {
            const videoHash = nft.data && nft.data.video && nft.data.video.length > 10 ? nft.data.video : null;
            const imgHash = nft.data && nft.data.img && nft.data.img.length > 10 ? nft.data.img : null;
            const fileUrl = videoHash
              ? (videoHash.startsWith('http') ? videoHash : `https://ipfs.io/ipfs/${videoHash}`)
              : (imgHash ? (imgHash.startsWith('http') ? imgHash : `https://ipfs.io/ipfs/${imgHash}`) : '');
            return (
              <div key={nft.asset_id} className="nft-card">
                <div className="nft-media">
                  {videoHash ? (
                    <video
                      src={fileUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '9/16', borderRadius: '18px', background: '#19191d', display: 'block', maxHeight: '420px', minHeight: '240px' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : imgHash ? (
                    <img src={fileUrl} alt="NFT" style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '9/16', borderRadius: '18px', background: '#19191d', display: 'block', maxHeight: '420px', minHeight: '240px' }} />
                  ) : (
                    <div style={{width:'100%',height:'100%',background:'#181828',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center', aspectRatio:'9/16', borderRadius:'18px'}}>No media</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="modal-bottom-bar">
          {selectedCategory === 'packs' && (
            <a
              href="https://neftyblocks.com/collection/nightclubnft/packs"
              target="_blank"
              rel="noopener noreferrer"
              className="open-packs-btn"
              style={{textDecoration:'none', pointerEvents:'auto', position:'static', marginRight:'auto'}}
            >
              Open Packs
            </a>
          )}
          <div className="modal-bottom-center-btns">
            <button className="close-btn" onClick={onClose}>Close</button>
          </div>
          <button
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={displayCount >= filteredNfts.length}
          >
            Load more NFTs
          </button>
        </div>
      </div>
      <style jsx>{`
        .inventory-modal-fullscreen {
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
          animation: fadeInModal 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .inventory-modal-content {
          width: 100%;
          max-width: 1200px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          overflow-y: auto;
        }
        .inventory-title {
          text-align: center;
          font-size: 38px;
          font-weight: 700;
          color: #ff6fff;
          margin-bottom: 24px;
          text-shadow: 0 0 12px #ff00ff99;
          letter-spacing: 2px;
        }
        .category-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .category-btn {
          padding: 8px 16px;
          border: 2px solid #ff00ff;
          background: rgba(255, 0, 255, 0.1);
          color: #fff;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
        }
        .category-btn:hover, .category-btn.active {
          background: linear-gradient(90deg, #ff6fd8, #f32cfc 80%);
          color: #fff;
          border-color: #ff00ff;
          box-shadow: 0 0 12px #ff00ff44;
        }
        .nfts-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 32px;
          width: 100%;
          padding: 0 12px;
          margin-bottom: 18px;
          scrollbar-width: thin;
          scrollbar-color: #ff00ff #181828;
          max-height: 70vh;
          overflow-y: auto;
        }
        .nfts-grid::-webkit-scrollbar {
          width: 12px;
          background: #181828;
        }
        .nfts-grid::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ff00ff 0%, #7f36ff 100%);
          border-radius: 8px;
          border: 2px solid #ff6fff;
          min-height: 40px;
        }
        .nfts-grid::-webkit-scrollbar-track {
          background: #181828;
        }
        .nft-card {
          background: none;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: none;
          padding: 0;
          margin: 0;
          display: flex;
          align-items: stretch;
          justify-content: center;
          min-width: 0;
          height: 272px;
          aspect-ratio: 9/16;
        }
        .nft-media {
          width: 100%;
          height: 100%;
          aspect-ratio: 9/16;
          border-radius: 18px;
          overflow: hidden;
          background: #19191d;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-bottom-bar {
          width: 100%;
          max-width: 1200px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          position: fixed;
          left: 50%;
          bottom: 32px;
          transform: translateX(-50%);
          z-index: 10001;
          padding: 0 24px;
          pointer-events: none;
        }
        .modal-bottom-bar > * {
          pointer-events: auto;
        }
        .modal-bottom-center-btns {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .close-btn {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 8px 32px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 0 24px;
        }
        .close-btn:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
        }
        .load-more-btn {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 8px 32px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-left: auto;
          margin-right: 24px;
        }
        .load-more-btn:hover:enabled {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
        }
        .load-more-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .packs-link-btn {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          background: #00cfff;
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 8px 32px;
          box-shadow: 0 0 12px #00ffff44;
          text-shadow: none;
          letter-spacing: 1px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          margin-right: 18px;
          margin-bottom: 0;
          display: inline-block;
        }
        .packs-link-btn:hover {
          background: #00aaff;
          border-color: #00ffff;
          color: #fff;
          box-shadow: 0 0 18px #00ffff99;
        }
        .open-packs-btn {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 8px 32px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-right: auto;
          margin-left: 0;
          text-align: center;
          display: inline-block;
          position: static;
        }
        .open-packs-btn:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
        }
        @keyframes fadeInModal {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 900px) and (orientation: landscape) {
          .inventory-title {
            font-size: 22px !important;
            margin-top: 8px !important;
            margin-bottom: 10px !important;
            letter-spacing: 1px !important;
          }
          .category-filters {
            margin-top: 0 !important;
            margin-bottom: 10px !important;
            gap: 6px !important;
          }
          .category-btn {
            font-size: 11px !important;
            padding: 4px 10px !important;
            border-radius: 8px !important;
          }
          .nfts-grid {
            display: flex !important;
            flex-direction: row !important;
            gap: 18px !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
            width: 100vw !important;
            max-width: 100vw !important;
            padding: 30px 10px 30px 10px !important;
            margin: 0 !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
            scrollbar-color: #ff00ff #181828 !important;
            scrollbar-width: thin !important;
          }
          .nfts-grid::-webkit-scrollbar {
            height: 10px;
            background: #181828;
          }
          .nfts-grid::-webkit-scrollbar-thumb {
            background: linear-gradient(90deg, #ff00ff 0%, #b266ff 100%);
            border-radius: 8px;
          }
          .nfts-grid::-webkit-scrollbar-track {
            background: #181828;
          }
          .nft-card {
            min-width: 84px !important;
            max-width: 84px !important;
            width: 84px !important;
            height: 149px !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 14px !important;
            box-shadow: 0 2px 10px 0 #ff36ba33;
            background: rgba(36,0,56,0.22);
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-end !important;
          }
          .nft-media video, .nft-media img, .nft-media div {
            border-radius: 12px !important;
            min-width: 100% !important;
            min-height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            object-fit: cover !important;
            aspect-ratio: 9/16 !important;
          }
          .nfts-grid > div[style*='No NFTs in this category.'] {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100vh !important;
            width: 100vw !important;
            font-size: 1.2rem !important;
            opacity: 0.7 !important;
            color: #fff !important;
            text-align: center !important;
          }
        }
        @media (min-width: 901px) {
          .nfts-grid {
            gap: 32px;
          }
          .nft-card {
            height: 272px;
            aspect-ratio: 9/16;
            min-width: unset !important;
            max-width: unset !important;
            width: unset !important;
            border-radius: 18px;
          }
          .nft-media {
            border-radius: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default InventoryModal; 