import React, { useState, useRef, useEffect } from 'react';
import { StoreService } from '../services/StoreService';
import { Oval } from 'react-loader-spinner';

const StoreItemDetailModal = ({ item, atomicData, user, onClose, onSuccess, feedback, setFeedback, selectedCurrency }) => {
  const [purchasing, setPurchasing] = useState(false);
  const modalRef = useRef();

  // Estado para datos atomic actualizados
  const [atomicStats, setAtomicStats] = useState({ minted: null, burned: null, circulating: null });

  // Estado para mostrar el NFT comprado
  const [showSuccessNFT, setShowSuccessNFT] = useState(false);

  // Formateador de precio profesional
  const formatPriceForButton = (priceString) => {
    if (!priceString || typeof priceString !== 'string' || !priceString.includes(' ')) return 'N/A';
    const [amount, symbol] = priceString.split(' ');
    const number = parseFloat(amount);
    if (isNaN(number)) return 'N/A';
    return `${number.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${symbol}`;
  };

  // Fetch de datos atomic individuales (burned, minted, circulating)
  useEffect(() => {
    const fetchAtomicStats = async () => {
      try {
        const templateId = item.template_id || atomicData?.template_id;
        if (!templateId) return;
        // 1. Intentar obtener burned desde el endpoint de stats
        let burned = null;
        try {
          const statsUrl = `https://wax.api.atomicassets.io/atomicassets/v1/template/${item.collection || 'nightclubnft'}/${templateId}/stats`;
          const statsRes = await fetch(statsUrl);
          const statsData = await statsRes.json();
          if (statsData && statsData.data && typeof statsData.data.burned === 'number') {
            burned = statsData.data.burned;
          }
        } catch (e) { /* fallback abajo */ }
        // 2. Fallback al endpoint individual si stats no existe
        const url = `https://wax.api.atomicassets.io/atomicassets/v1/template/nightclubnft/${templateId}`;
        const res = await fetch(url);
        const data = await res.json();
        setAtomicStats({
          minted: data.data.issued_supply ? Number(data.data.issued_supply) : 0,
          burned: burned !== null ? burned : (data.data.burned ? Number(data.data.burned) : 0),
          circulating: data.data.circulating_supply ? Number(data.data.circulating_supply) : null
        });
      } catch (err) {
        setAtomicStats({ minted: 0, burned: 0, circulating: 0 });
      }
    };
    fetchAtomicStats();
  }, [item.template_id, atomicData?.template_id]);

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handlePurchase = async () => {
    if (!user || !user.getName()) {
      setFeedback({ message: 'You must be logged in to purchase items.', type: 'error' });
      return;
    }
    setPurchasing(true);
    setFeedback({ message: 'Please approve the transaction in your wallet...', type: 'info' });
    try {
      const price = item.prices[selectedCurrency];
      await StoreService.purchaseItem(user.getName(), item.item_id, selectedCurrency, price);
      setFeedback({ message: 'Transaction sent! Your item should appear in your inventory shortly.', type: 'success' });
      setTimeout(() => {
        setFeedback({ message: '', type: '' });
        setPurchasing(false);
      }, 3500);
    } catch (err) {
      setFeedback({ message: err.message || 'Purchase failed. Check your balance and try again.', type: 'error' });
      setTimeout(() => {
        setFeedback({ message: '', type: '' });
        setPurchasing(false);
      }, 3500);
      return;
    }
  };

  // Media
  const ipfsGateway = 'https://gateway.pinata.cloud/ipfs/';
  let mediaUrl = '';
  let isVideo = false;
  if (atomicData && atomicData.immutable_data) {
    const videoHash = atomicData.immutable_data.video;
    const imageHash = atomicData.immutable_data.img;
    if (videoHash) {
      mediaUrl = String(videoHash).startsWith('Qm') ? `${ipfsGateway}${videoHash}` : videoHash;
      isVideo = true;
    } else if (imageHash) {
      mediaUrl = String(imageHash).startsWith('Qm') ? `${ipfsGateway}${imageHash}` : imageHash;
    }
  }

  // Datos desde storeitems
  const name = item.title || atomicData?.name || 'NFT';
  const desc = item.description || atomicData?.immutable_data?.desc || atomicData?.immutable_data?.description || '';
  const templateId = item.template_id || atomicData?.template_id;
  const itemId = item.item_id;
  const stock = (typeof item.stock === 'number' || !isNaN(Number(item.stock))) ? Number(item.stock) : null;
  const sold = (typeof item.sold_count === 'number' || !isNaN(Number(item.sold_count))) ? Number(item.sold_count) : null;

  // Datos finales para mostrar
  const minted = (atomicStats.minted !== null && atomicStats.minted !== undefined && !isNaN(atomicStats.minted) && atomicStats.minted > 0)
    ? atomicStats.minted
    : (atomicData?.issued_supply && !isNaN(Number(atomicData.issued_supply)) && Number(atomicData.issued_supply) > 0 ? Number(atomicData.issued_supply) : '—');
  const burned = (atomicStats.burned !== null && atomicStats.burned !== undefined && !isNaN(atomicStats.burned))
    ? atomicStats.burned
    : (atomicData?.burned !== undefined && atomicData?.burned !== null && !isNaN(Number(atomicData.burned)) ? Number(atomicData.burned) : '—');
  const circulating = (atomicStats.circulating !== null && atomicStats.circulating !== undefined && !isNaN(atomicStats.circulating))
    ? atomicStats.circulating
    : (minted !== '—' && burned !== '—' ? minted - burned : '—');

  return (
    <div className="inventory-modal-fullscreen" style={{zIndex: 10001}}>
      <div className="detail-modal-flex" ref={modalRef} style={{position: 'relative'}}>
        {feedback.message && (
          <div className={`feedback-message ${feedback.type} feedback-inside-modal-centered`}>
            {feedback.message}
          </div>
        )}
        <div className="detail-media-col">
          {isVideo ? (
            <video src={mediaUrl} autoPlay loop muted playsInline className="item-media-modal" />
          ) : (
            <img src={mediaUrl} alt={name} className="item-media-modal" />
          )}
        </div>
        <div className="detail-info-col">
          <h1 className="inventory-title" style={{marginBottom: 10, fontSize: 28}}>{name}</h1>
          <div className="detail-desc" style={{marginBottom: 18}}>{desc}</div>
          <div className="detail-table detail-table-horizontal">
            <div className="detail-row-2col">
              <div className="detail-col-left">
                <div><span className="detail-label">Template ID:</span> <span>{templateId ?? '—'}</span></div>
                <div><span className="detail-label">Available:</span> <span>{stock !== null && stock >= 0 ? stock : '—'}</span></div>
                <div><span className="detail-label">Sold:</span> <span>{sold !== null && sold >= 0 ? sold : '—'}</span></div>
              </div>
            </div>
          </div>
          <div className="detail-btn-row">
            <button className="detail-btn same-btn" onClick={onClose}>Close</button>
            <button className="detail-btn same-btn" onClick={handlePurchase} disabled={purchasing || feedback.message}>
              {purchasing ? 'Processing...' : formatPriceForButton(item.prices[selectedCurrency])}
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .inventory-modal-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 10001;
          background: hsl(245, 86.70%, 2.90%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          animation: fadeInModal 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .detail-modal-flex {
          display: flex;
          flex-direction: row;
          background: rgba(24, 24, 40, 0.98);
          border-radius: 24px;
          box-shadow: 0 0 32px 0 #000a;
          max-width: 820px;
          min-width: 320px;
          width: 90vw;
          min-height: 340px;
          max-height: 90vh;
          overflow: hidden;
          margin: auto;
        }
        .detail-media-col {
          flex: 1.1;
          min-width: 210px;
          max-width: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #181828;
          padding: 32px 18px 32px 32px;
        }
        .item-media-modal {
          width: 100%;
          max-width: 198px;
          height: auto;
          max-height: 306px;
          aspect-ratio: 105/154;
          object-fit: contain;
          border-radius: 18px;
          box-shadow: 0 4px 32px 0 #000a;
          background: #000;
        }
        .detail-info-col {
          flex: 1.5;
          min-width: 220px;
          max-width: 420px;
          padding: 38px 32px 32px 18px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          color: #fff;
        }
        .inventory-title {
          text-align: left;
          font-size: 28px;
          font-weight: 700;
          color: #ff6fff;
          margin-bottom: 10px;
          text-shadow: 0 0 12px #ff00ff99;
          letter-spacing: 2px;
        }
        .detail-desc {
          font-size: 15px;
          color: #bfc2d1;
          margin-bottom: 0;
          margin-top: 0;
          text-align: left;
          min-height: 32px;
        }
        .detail-table {
          margin: 18px 0 0 0;
          width: 100%;
          font-size: 15px;
          color: #fff;
        }
        .detail-table > div {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 6px;
        }
        .detail-label {
          min-width: 90px;
          font-weight: 600;
          color: #00ffff;
          margin-right: 6px;
        }
        .detail-table-horizontal {
          width: 100%;
        }
        .detail-row-2col {
          display: flex;
          flex-direction: row;
          gap: 48px;
          width: 100%;
          margin-top: 10px;
          margin-bottom: 0;
          align-items: flex-start;
          justify-content: flex-start;
        }
        .detail-col-left, .detail-col-right {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .detail-col-left span, .detail-col-right span {
          font-size: 15px;
        }
        .detail-btn-row {
          display: flex;
          flex-direction: row;
          gap: 18px;
          margin-top: 48px;
          width: 100%;
          justify-content: center;
          align-items: flex-end;
        }
        .detail-btn.same-btn {
          min-width: 200px;
          max-width: 200px;
          width: 200px;
          font-size: 16px;
          height: 48px;
          line-height: 48px;
          padding: 0;
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          text-align: center;
          box-sizing: border-box;
          font-weight: 700;
          border: 2px solid #00ffff;
          background: rgba(0,255,255,0.10);
          color: #fff;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          box-shadow: none !important;
        }
        .detail-btn.same-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .detail-btn.same-btn:hover:not(:disabled) {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
          color: #fff;
        }
        @media (max-width: 1200px) {
          .detail-row-2col {
            flex-direction: column;
            gap: 10px;
          }
        }
        @media (max-width: 900px) {
          /* Elimino todos los overrides de layout para móvil horizontal */
        }
        @media (max-width: 900px) and (orientation: landscape) {
          .detail-modal-flex {
            transform: scale(0.8);
            transform-origin: center center;
            margin: auto !important;
            max-width: 90vw !important;
            width: 90vw !important;
          }
          .detail-btn.same-btn {
            min-width: 168px !important;
            max-width: 168px !important;
            width: 168px !important;
            height: 40px !important;
            font-size: 13.65px !important;
            line-height: 40px !important;
            padding: 0 !important;
          }
          .detail-btn-row {
            margin-top: 30px !important;
          }
          .detail-info-col {
            padding-left: 0 !important;
            padding-right: 32px !important;
          }
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .feedback-message.feedback-inside-modal-centered {
          position: absolute;
          top: 4px;
          left: 50%;
          transform: translateX(-50%);
          max-width: 95%;
          width: auto;
          text-align: center;
          font-size: 17px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: none;
          border: none;
          color: #fff;
          margin: 0;
          padding: 8px 0 0 0;
          z-index: 10;
        }
        .success-nft-modal {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
        }
        .success-nft-media {
          width: 340px;
          max-width: 80vw;
          height: auto;
          max-height: 60vh;
          border-radius: 18px;
          box-shadow: 0 0 32px 0 #ff00ff55;
          background: #000;
        }
        .success-nft-text {
          font-size: 2.2rem;
          color: #ff6fff;
          font-weight: 800;
          text-align: center;
          margin-top: 12px;
          text-shadow: 0 0 12px #ff00ff99;
        }
      `}</style>
    </div>
  );
};

export default StoreItemDetailModal; 