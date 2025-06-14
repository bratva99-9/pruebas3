import React, { useEffect, useState } from 'react';
import { UserService } from '../UserService';

// Nodo alternativo con CORS para desarrollo
const API_NFTREWHIST = 'https://corsproxy.io/?https://wax.greymass.com/v1/chain/get_table_rows';

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
        // Buscar video por template_id
        const withVideos = await Promise.all(rows.map(async (item) => {
          let video = '';
          if (item.template_id) {
            try {
              const tplRes = await fetch(`https://wax.api.atomicassets.io/atomicassets/v1/template/nightclubnft/${item.template_id}`);
              const tplData = await tplRes.json();
              video = tplData?.data?.immutable_data?.video || '';
            } catch {}
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
            <div className="loading">Cargando...</div>
          ) : history.length === 0 ? (
            <div className="no-history">No hay historial de gifts.</div>
          ) : (
            history.map((item, idx) => (
              <div className="gifthistory-row-noborder" key={item.id || idx}>
                <div className="gifthistory-video-noborder">
                  {item.video ? (
                    <video src={`https://ipfs.io/ipfs/${item.video}`} autoPlay loop muted playsInline style={{ width: 60, height: 106, borderRadius: 8, objectFit: 'cover', background: '#181828' }} />
                  ) : (
                    <div className="no-video">Sin video</div>
                  )}
                </div>
                <div className="gifthistory-info-noborder">
                  <div className="gifthistory-schema-noborder">Schema: <b>{item.schema}</b></div>
                  <div className="gifthistory-date-noborder">Fecha: <b>{item.timestamp ? new Date(item.timestamp * 1000).toLocaleString() : '-'}</b></div>
                  <div className="gifthistory-reward-noborder">Reward: <b>{item.reward_name}</b></div>
                </div>
              </div>
            ))
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
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px auto;
          position: relative;
        }
        .gifthistory-title-noborder {
          color: #ff36ba;
          font-size: 2.3rem;
          font-weight: 800;
          letter-spacing: 2px;
          text-shadow: 0 0 20px #ff36ba44;
          margin: 32px 0 18px 0;
          text-align: center;
          flex: 1;
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
          top: 38px;
        }
        .gifthistory-list-noborder {
          width: 100vw;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        .gifthistory-row-noborder {
          display: flex;
          flex-direction: row;
          align-items: center;
          background: none;
          border-radius: 0;
          padding: 0 0 0 0;
          gap: 18px;
          width: 100vw;
          max-width: 520px;
          margin: 0 auto;
          border-bottom: 1px solid #ff36ba33;
          min-height: 110px;
        }
        .gifthistory-video-noborder {
          flex-shrink: 0;
          margin-left: 12px;
        }
        .gifthistory-info-noborder {
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: #fff;
          font-size: 1.05rem;
        }
        .gifthistory-schema-noborder, .gifthistory-date-noborder, .gifthistory-reward-noborder {
          font-size: 1.05rem;
        }
        .loading, .no-history {
          color: #ff36ba;
          text-align: center;
          font-size: 1.2rem;
          margin: 32px 0;
        }
      `}</style>
    </div>
  );
};

export default GiftHistoryModal; 