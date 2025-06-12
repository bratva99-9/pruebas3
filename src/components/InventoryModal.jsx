import React, { useState, useEffect } from 'react';
import { UserService } from '../UserService';

const SCHEMAS = [
  { id: 'all', name: 'All' },
  { id: 'girls', name: 'Girls' },
  { id: 'photos', name: 'Photos' },
  { id: 'items', name: 'Items' },
  { id: 'videos', name: 'Videos' },
  { id: 'shards', name: 'Shards' }
];

const COLLECTION = 'nightclubnft';
const PAGE_SIZE = 10;

const InventoryModal = ({ onClose }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchNFTs();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
    if (selectedCategory === 'all') {
      setFilteredNfts(nfts);
    } else {
      setFilteredNfts(
        nfts.filter(
          nft => nft.schema && nft.schema.schema_name && nft.schema.schema_name.toLowerCase() === selectedCategory
        )
      );
    }
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
        {filteredNfts.length > displayCount && (
          <button className="load-more-btn" onClick={handleLoadMore}>Load more</button>
        )}
        <button className="close-btn" onClick={onClose}>Close</button>
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
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 24px;
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
        .load-more-btn {
          margin: 18px auto 0 auto;
          display: block;
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          background: linear-gradient(90deg, #ff6fd8, #f32cfc 80%);
          border: none;
          border-radius: 14px;
          padding: 8px 32px;
          cursor: pointer;
          box-shadow: 0 2px 14px #d43d9360;
          transition: background 0.18s, filter 0.18s;
        }
        .load-more-btn:hover {
          background: linear-gradient(90deg, #ff43c0, #d43d93 85%);
          filter: brightness(1.06);
        }
        .close-btn {
          position: fixed;
          left: 50%;
          bottom: 32px;
          transform: translateX(-50%);
          z-index: 10001;
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 8px 32px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .close-btn:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
        }
        @keyframes fadeInModal {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default InventoryModal; 