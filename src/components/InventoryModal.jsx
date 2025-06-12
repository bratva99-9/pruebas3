import React, { useState, useEffect } from 'react';
import { UserService } from '../UserService';

const InventoryModal = ({ onClose }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredNfts, setFilteredNfts] = useState([]);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'girls', name: 'Girls' },
    { id: 'photos', name: 'Photos' },
    { id: 'items', name: 'Items' },
    { id: 'videos', name: 'Videos' },
    { id: 'shards', name: 'Shards' }
  ];

  useEffect(() => {
    fetchNFTs();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredNfts(nfts);
    } else {
      setFilteredNfts(nfts.filter(nft => nft.schema === selectedCategory));
    }
  }, [selectedCategory, nfts]);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      // Aquí deberás implementar la llamada a tu API para obtener los NFTs
      // Por ahora usamos datos de ejemplo
      const mockNFTs = [
        { id: 1, name: 'NFT #1', schema: 'girls', image: 'url_to_image' },
        { id: 2, name: 'NFT #2', schema: 'photos', image: 'url_to_image' },
        // ... más NFTs
      ];
      setNfts(mockNFTs);
      setFilteredNfts(mockNFTs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setLoading(false);
    }
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
          {categories.map(category => (
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
          {filteredNfts.map(nft => (
            <div key={nft.id} className="nft-card">
              <div className="nft-image">
                <img src={nft.image} alt={nft.name} />
              </div>
              <div className="nft-info">
                <h3>{nft.name}</h3>
                <span className="nft-schema">{nft.schema}</span>
              </div>
            </div>
          ))}
        </div>

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
          background: rgba(10, 6, 22, 0.95);
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

        .category-btn:hover {
          background: rgba(255, 0, 255, 0.2);
          transform: translateY(-2px);
        }

        .category-btn.active {
          background: rgba(255, 0, 255, 0.3);
          box-shadow: 0 0 12px #ff00ff44;
        }

        .nfts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 24px;
          width: 100%;
          padding: 0 12px;
        }

        .nft-card {
          background: rgba(18, 10, 40, 0.92);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s ease;
          border: 1px solid rgba(255, 0, 255, 0.2);
        }

        .nft-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 14px 3px #ff36ba44;
          border-color: #ff00ff99;
        }

        .nft-image {
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
        }

        .nft-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .nft-info {
          padding: 12px;
          text-align: center;
        }

        .nft-info h3 {
          color: #fff;
          margin: 0 0 4px 0;
          font-size: 16px;
        }

        .nft-schema {
          color: #ff00ff;
          font-size: 12px;
          text-transform: uppercase;
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