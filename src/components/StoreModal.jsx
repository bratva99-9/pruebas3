import React, { useState, useEffect, useCallback } from 'react';
import { StoreService } from '../services/StoreService';
import { Oval } from 'react-loader-spinner';
import StoreItemDetailModal from './StoreItemDetailModal';

const StoreModal = ({ user, onClose, onSuccess }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeLoading, setFadeLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('WAX');
  const [purchasing, setPurchasing] = useState(null);
  const [atomicData, setAtomicData] = useState({});
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [closingDetail, setClosingDetail] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setFadeLoading(false);
      const storeItems = await StoreService.getStoreItems();
      const templateIds = storeItems.map(item => item.template_id).filter(id => id);
      
      if (templateIds.length > 0) {
        const atomicData = await fetchAtomicData(templateIds);
        setAtomicData(atomicData);
      }
      
      setItems(storeItems);
    } catch (err) {
      setError('Failed to load store items.');
      console.error(err);
    } finally {
      setFadeLoading(true);
      setTimeout(() => setLoading(false), 400);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const fetchAtomicData = async (templates) => {
    try {
      const templateIds = templates.join(',');
      const url = `https://wax.api.atomicassets.io/atomicassets/v1/templates?ids=${templateIds}&page=1&limit=100`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        const map = data.data.reduce((acc, template) => {
          acc[template.template_id] = template;
          return acc;
        }, {});
        return map;
      }
    } catch (err) {
      console.error("Error fetching atomic template data:", err);
    }
    return {};
  };

  const handlePurchase = async (item) => {
    if (!user || !user.getName()) {
      setError("You must be logged in to purchase items.");
      return;
    }
    setPurchasing(item.item_id);
    setError('');
    setFeedback({ message: 'Please approve the transaction in your wallet...', type: 'info' });

    try {
      const price = item.prices[selectedCurrency];
      if (!price) {
          throw new Error('Selected currency not available for this item.');
      }
      await StoreService.purchaseItem(user.getName(), item.item_id, selectedCurrency, price);
      setFeedback({ message: 'Transaction sent! Your item should appear in your inventory shortly.', type: 'success' });
      onSuccess();
    } catch (err) {
      if (err.message && err.message.includes('The Cloud Wallet was closed')) {
        console.log('Transaction cancelled by user.');
        setFeedback({ message: 'Transaction cancelled.', type: 'error' });
      } else {
        console.error('Purchase Error:', err);
        const errorMessage = err.message || 'Purchase failed. Check your balance and try again.';
        setFeedback({ message: errorMessage, type: 'error' });
      }
    } finally {
      setPurchasing(null);
      setTimeout(() => {
        setFeedback({ message: '', type: '' });
      }, 5000);
    }
  };

  const formatPriceForButton = (priceString) => {
    if (!priceString || typeof priceString !== 'string' || !priceString.includes(' ')) return 'N/A';
    const [amount, symbol] = priceString.split(' ');
    const number = parseFloat(amount);
    if (isNaN(number)) return 'N/A';
    return `${number.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 })} ${symbol}`;
  };

  let filteredItems = items.filter(item => {
      const price = item.prices[selectedCurrency];
      if (!price || typeof price !== 'string') return false;
      const amount = parseFloat(price.split(' ')[0]);
      return amount > 0;
  });

  // Filtro de shards (si se selecciona, no mostrar nada)
  if (selectedCurrency === 'SHARDS') {
    filteredItems = [];
  }

  const renderItemMedia = (item) => {
    const data = atomicData[item.template_id];
    if (!data || !data.immutable_data) {
        return <div className="media-placeholder" />;
    }

    const ipfsGateway = 'https://gateway.pinata.cloud/ipfs/';
    
    const videoHash = data.immutable_data.video;
    const imageHash = data.immutable_data.img;

    let mediaUrl = '';
    let isVideo = false;

    if (videoHash) {
        mediaUrl = String(videoHash).startsWith('Qm') ? `${ipfsGateway}${videoHash}` : videoHash;
        isVideo = true;
    } else if (imageHash) {
        mediaUrl = String(imageHash).startsWith('Qm') ? `${ipfsGateway}${imageHash}` : imageHash;
    }

    if (!mediaUrl) {
        return <div className="media-placeholder" />;
    }

    if (isVideo) {
        return <video src={mediaUrl} autoPlay loop muted playsInline className="item-media" onError={(e) => { e.target.style.display = 'none'; }} />;
    }
    return <img src={mediaUrl} alt={data.name || 'NFT Image'} className="item-media" onError={(e) => { e.target.style.display = 'none'; }} />;
  };

  const handleCloseDetail = () => {
    setClosingDetail(true);
    setTimeout(() => {
      setSelectedItem(null);
      setClosingDetail(false);
    }, 380);
  };

  return (
    <div className="inventory-modal-fullscreen">
      <div className="inventory-modal-content">
        <h1 className="inventory-title">Store</h1>
        <div className="category-filters">
            {['WAX', 'SEXY', 'WAXXX'].map(currency => (
                <button 
                    key={currency}
                    className={`category-btn ${selectedCurrency === currency ? 'active' : ''}`}
                    onClick={() => setSelectedCurrency(currency)}
                >
                    {currency}
                </button>
            ))}
        </div>

        {loading ? (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'320px',width:'100%'}}>
            <div className="loading-spinner"></div>
          </div>
        ) : feedback.message && (
          <div className={`feedback-message ${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        {!loading && (
        <div className="nfts-grid">
            {error ? (
                <div style={{color:'#fff', gridColumn:'1/-1', textAlign:'center', fontSize:'1.2rem', opacity:0.7}}>{error}</div>
            ) : filteredItems.length > 0 ? filteredItems.map(item => (
              <div key={item.item_id} className="item-wrapper-store">
                <div className="nft-media" onClick={() => setSelectedItem(item)}>
                    {renderItemMedia(item)}
                </div>
                <button 
                  className="buy-button-store" 
                  onClick={() => setSelectedItem(item)}
                  disabled={purchasing === item.item_id || feedback.message}
                >
                  <span>{purchasing === item.item_id 
                      ? 'Processing...'
                      : formatPriceForButton(item.prices[selectedCurrency])
                  }</span>
                </button>
              </div>
            )) : (
                <div style={{color:'#fff', gridColumn:'1/-1', textAlign:'center', fontSize:'1.2rem', opacity:0.7}}>
                    No items available for {selectedCurrency}.
                </div>
            )}
        </div>
        )}
        
        <div className="modal-bottom-bar">
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
      {selectedItem && (
        <div className={`store-detail-modal-fade-scale${closingDetail ? ' closing' : ''}`}>
          <StoreItemDetailModal
            item={selectedItem}
            atomicData={atomicData[selectedItem.template_id]}
            user={user}
            onClose={handleCloseDetail}
            onSuccess={onSuccess}
            feedback={feedback}
            setFeedback={setFeedback}
            selectedCurrency={selectedCurrency}
          />
        </div>
      )}
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
          overflow: hidden;
        }
        .inventory-modal-content {
          width: 100%;
          max-width: 1200px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          overflow-y: hidden;
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
          padding: 8px 24px;
          border: 2px solid #ff00ff;
          background: rgba(255, 0, 255, 0.1);
          color: #fff;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 16px;
          font-weight: 600;
        }
        .category-btn:hover, .category-btn.active {
          background: linear-gradient(90deg, #ff6fd8, #f32cfc 80%);
          color: #fff;
          border-color: #ff00ff;
        }
        .feedback-message {
          width: 100%;
          max-width: 600px;
          padding: 12px;
          margin-bottom: 16px;
          border-radius: 8px;
          text-align: center;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .feedback-message.info {
          background-color: rgba(0, 255, 255, 0.1);
          border: 1px solid #00ffff;
          color: #00ffff;
        }
        .feedback-message.success {
          background-color: rgba(0, 255, 0, 0.1);
          border: 1px solid #00ff00;
          color: #00ff00;
        }
        .feedback-message.error {
          background-color: rgba(255, 80, 80, 0.15);
          border: 1px solid #ff5050;
          color: #ff5050;
        }
        .nfts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
          gap: 20px;
          align-items: start;
          width: 100%;
          padding: 0 24px;
          margin-bottom: 80px;
          flex-grow: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #ff00ff #181828;
        }
        .nfts-grid::-webkit-scrollbar {
          width: 12px;
          background: #181828;
        }
        .nfts-grid::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ff00ff 0%, #7f36ff 100%);
          border-radius: 8px;
          border: 2px solid #ff6fff;
        }
        .item-wrapper-store {
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: center;
          padding: 8px;
          border: 1px solid #4a4a5a;
          border-radius: 22px;
          background: rgba(40, 40, 60, 0.2);
          transition: border-color 0.2s;
        }
        .item-wrapper-store:hover {
            border-color: #6a6a7a;
        }
        .nft-media {
          width: 100%;
          border-radius: 18px;
          overflow: hidden;
          background: #000;
        }
        .item-media, .media-placeholder {
            width: 100%;
            height: auto;
            object-fit: cover;
            display: block;
        }
        .buy-button-store {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 12px;
          padding: 0 10px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          width: 110px;
          min-width: 110px;
          max-width: 110px;
          height: 32px;
          min-height: 32px;
          max-height: 32px;
          margin-top: 0;
          text-align: center;
          white-space: normal;
          word-break: break-word;
          overflow-wrap: break-word;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .buy-button-store:hover:not(:disabled) {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
          color: #fff;
          box-shadow: none;
        }
        .buy-button-store:disabled {
          background: #444;
          border-color: #666;
          cursor: not-allowed;
          filter: none;
        }
        .buy-button-store span {
          display: block;
          width: 100%;
          font-size: inherit;
          font-weight: inherit;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 180px) {
          .buy-button-store { font-size: 10px; }
        }
        @media (max-width: 900px) and (orientation: landscape) {
          .inventory-modal-fullscreen {
            overflow: hidden !important;
          }
          .inventory-modal-content {
            height: 100% !important;
            padding: 8px 24px 0 24px !important;
            overflow: hidden !important;
          }
          .inventory-title {
            font-size: 172% !important;
            margin-top: -8px !important;
            margin-bottom: 14px !important;
            letter-spacing: 0.5px !important;
          }
          .category-filters {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            gap: 4px !important;
            font-size: 115% !important;
            padding-top: 0px !important;
          }
          .category-btn {
            font-size: 10.5px !important;
            padding: 2px 7px !important;
            border-radius: 7px !important;
          }
          .nfts-grid {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            gap: 8px !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 10px 0 10px !important;
            margin: 0 !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
            margin-top: 0px !important;
            scrollbar-color: #ff00ff #181828 !important;
            scrollbar-width: thin !important;
            flex: 1 1 auto !important;
          }
          .item-wrapper-store {
            transform: scale(0.8);
            margin-right: 0 !important;
            margin-left: 0 !important;
          }
          .modal-bottom-bar {
            bottom: 18px !important;
          }
        }
        .modal-bottom-bar {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: fixed;
          left: 50%;
          bottom: 32px;
          transform: translateX(-50%);
          z-index: 100;
        }
        .close-btn {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 12px;
          padding: 10px 40px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .close-btn:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
          color: #fff;
          box-shadow: none;
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .loading-spinner {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 6px solid rgba(255, 54, 186, 0.2);
          border-top-color: #ff00ff;
          border-right-color: #b266ff;
          animation: spin 1.2s cubic-bezier(0.6, 0, 0.4, 1) infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .store-detail-modal-fade-scale {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          pointer-events: auto;
          background: none;
          animation: fadeScaleIn 0.38s cubic-bezier(.4,0,.2,1);
        }
        .store-detail-modal-fade-scale.closing {
          animation: fadeScaleOut 0.38s cubic-bezier(.4,0,.2,1) forwards;
        }
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeScaleOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.92); }
        }
      `}</style>
    </div>
  );
};
export default StoreModal;
