import React, { useEffect, useState } from 'react';
import { UserService } from '../UserService';

// Nodo alternativo con CORS para desarrollo
const API_NFTREWHIST = 'https://api.waxsweden.org/v1/chain/get_table_rows';

const GiftHistoryModal = ({ onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const user = UserService.getName();
        if (!user) {
          setHistory([]);
          setLoading(false);
          return;
        }
        // Fetch manual a la tabla nftrewhist
        const res = await fetch(API_NFTREWHIST, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'nightclubapp',
            scope: 'nightclubapp',
            table: 'nftrewhist',
            limit: 100,
            reverse: true,
            json: true
          })
        });
        const data = await res.json();
        let rows = data.rows || [];
        // Filtrar por usuario y tomar los 10 últimos
        rows = rows.filter(row => row.user === user).slice(0, 10);
        // Buscar video por asset_id (igual que MissionStatus)
        const withVideos = await Promise.all(rows.map(async (item) => {
          let video = '';
          let collection = item.collection_name;
          let templateId = item.template_id ? String(item.template_id).trim() : '';
          // Si no hay collection_name pero hay asset_id, buscar la colección primero
          if (!collection && item.asset_id) {
            try {
              const assetRes = await fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets/${item.asset_id}`);
              const assetData = await assetRes.json();
              collection = assetData?.data?.collection?.collection_name;
              // Si no hay template_id, intentar obtenerlo del asset
              if (!templateId && assetData?.data?.template?.template_id) {
                templateId = String(assetData.data.template.template_id).trim();
              }
            } catch (err) {
              console.error('Error fetching asset for collection/template:', err);
            }
          }
          // Buscar el video por template si hay collection y templateId
          if (collection && templateId) {
            try {
              const templateRes = await fetch(`https://wax.api.atomicassets.io/atomicassets/v1/template/${collection}/${templateId}`);
              const templateData = await templateRes.json();
              video = templateData?.data?.immutable_data?.video || '';
            } catch (err) {
              console.error('Error fetching template data:', err);
              video = '';
            }
          } else if (item.asset_id) {
            // Fallback: buscar video por asset
            try {
              const assetRes = await fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets/${item.asset_id}`);
              const assetData = await assetRes.json();
              video = assetData && assetData.data && assetData.data.data && assetData.data.data.video ? assetData.data.data.video : '';
            } catch (err) {
              console.error('Error fetching asset data:', err);
              video = '';
            }
          }
          return { ...item, video };
        }));
        setHistory(withVideos);
      } catch (err) {
        setHistory([]);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  return (
    <div className="nft-modal-fullscreen">
      <div className="nft-modal-content gifthistory-modal-content-noborder">
        <div className="gifthistory-header-row-noborder">
          <h1 className="gifthistory-title-noborder">Gift History</h1>
          <button className="close-x-gifthistory" onClick={onClose} aria-label="Cerrar">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6L22 22" stroke="#ff36ba" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M22 6L6 22" stroke="#ff36ba" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="gifthistory-list-noborder">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : history.length === 0 ? (
            <div className="no-history">No gift history.</div>
          ) : (
            <div className="gifthistory-scroll-list">
              <div className="gifthistory-row-noborder responsive-row header-row">
                <span className="schema">Schema</span>
                <span className="reward">Reward</span>
                <span className="date">Date</span>
              </div>
              {history.slice(0, 10).map((item, idx) => (
                <div className="gifthistory-row-noborder responsive-row" key={item.id || idx}>
                  <span className="schema">{item.schema}</span>
                  <span className="reward">{item.reward_name}</span>
                  <span className="date">{item.timestamp ? new Date(item.timestamp * 1000).toLocaleString() : '-'}</span>
                </div>
              ))}
            </div>
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
          padding-top: 5px;
        }
        .nft-modal-content.gifthistory-modal-content-noborder {
          width: 100vw;
          max-width: 600px;
          background: none;
          border-radius: 0;
          box-shadow: none;
          padding: 0;
          margin: 0 auto;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .gifthistory-header-row-noborder {
          width: 100vw;
          max-width: 600px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          margin: 0 auto 10px auto;
          position: relative;
          height: 48px;
        }
        .gifthistory-title-noborder {
          color: #ff36ba;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: 2px;
          text-shadow: 0 0 20px #ff36ba44;
          margin: 5px 0 5px 0;
          text-align: center;
          flex: 1;
          line-height: 48px;
        }
        .close-x-gifthistory {
          background: none;
          border: none;
          outline: none;
          box-shadow: none;
          cursor: pointer;
          padding: 0;
          margin: 0;
          position: absolute;
          right: 32px;
          top: 5px;
        }
        .gifthistory-list-noborder {
          width: 100vw;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 80vh;
          overflow: hidden;
        }
        .gifthistory-scroll-list {
          width: 100vw;
          max-width: 600px;
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          scrollbar-width: thin;
          scrollbar-color: #ff00ff #181828;
        }
        .gifthistory-scroll-list::-webkit-scrollbar {
          width: 8px;
          background: #181828;
        }
        .gifthistory-scroll-list::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ff00ff 0%, #b266ff 100%);
          border-radius: 8px;
        }
        .gifthistory-scroll-list::-webkit-scrollbar-track {
          background: #181828;
        }
        .gifthistory-row-noborder.responsive-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          background: none;
          border-radius: 0;
          padding: 0 12px;
          gap: 12px;
          width: 100vw;
          max-width: 520px;
          margin: 0 auto;
          border-bottom: 1px solid #ff36ba33;
          min-height: 38px;
          font-size: 1.08rem;
          color: #fff;
        }
        .gifthistory-row-noborder.responsive-row.header-row {
          font-weight: 900;
          color: #ff36ba;
          border-bottom: 2px solid #ff36ba99;
          background: none;
          min-height: 32px;
          font-size: 1.08rem;
        }
        .schema {
          flex: 1 1 30%;
          font-weight: 700;
          color: #ffb6ff;
          text-align: left;
        }
        .reward {
          flex: 1 1 30%;
          font-weight: 600;
          color: #fff;
          text-align: center;
        }
        .date {
          flex: 1 1 40%;
          font-weight: 400;
          color: #bfc2d1;
          text-align: right;
          font-size: 0.98rem;
        }
        @media (max-width: 600px) {
          .gifthistory-row-noborder.responsive-row {
            font-size: 0.98rem;
            padding: 0 4px;
            gap: 6px;
          }
          .schema, .reward, .date {
            font-size: 0.93rem;
          }
        }
      `}</style>
    </div>
  );
};

export default GiftHistoryModal; 