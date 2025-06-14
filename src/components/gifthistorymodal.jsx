import React, { useEffect, useState } from 'react';

const API_NFTREWHIST = 'https://wax.greymass.com/v1/chain/get_table_rows';
const API_TEMPLATE = 'https://wax.api.atomicassets.io/atomicassets/v1/template/nightclubnft/';

const GiftHistoryModal = ({ onClose, user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Obtener los últimos 10 registros de la tabla nftrewhist para el usuario
        const res = await fetch(API_NFTREWHIST, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'nightclubapp',
            scope: 'nightclubapp',
            table: 'nftrewhist',
            limit: 10,
            reverse: true,
            json: true
          })
        });
        const data = await res.json();
        let rows = data.rows || [];
        // Si hay filtro por usuario, filtrar aquí
        if (user) {
          rows = rows.filter(row => row.user === user);
        }
        // Para cada registro, buscar el video del template
        const withVideos = await Promise.all(rows.map(async (item) => {
          let video = '';
          if (item.template_id) {
            try {
              const tplRes = await fetch(`${API_TEMPLATE}${item.template_id}`);
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
  }, [user]);

  return (
    <div className="gifthistory-modal-bg">
      <div className="gifthistory-modal-content">
        <div className="gifthistory-header-row">
          <h1 className="gifthistory-title">Gift History</h1>
          <button className="close-x-gifthistory" onClick={onClose} aria-label="Cerrar">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6L22 22" stroke="#ff36ba" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M22 6L6 22" stroke="#ff36ba" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="gifthistory-list">
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : history.length === 0 ? (
            <div className="no-history">No hay historial de gifts.</div>
          ) : (
            history.map((item, idx) => (
              <div className="gifthistory-item" key={item.asset_id || idx}>
                <div className="gifthistory-video">
                  {item.video ? (
                    <video src={`https://ipfs.io/ipfs/${item.video}`} autoPlay loop muted playsInline style={{ width: 80, height: 142, borderRadius: 8, objectFit: 'cover', background: '#181828' }} />
                  ) : (
                    <div className="no-video">Sin video</div>
                  )}
                </div>
                <div className="gifthistory-info">
                  <div className="gifthistory-schema">Schema: <b>{item.schema}</b></div>
                  <div className="gifthistory-date">Fecha: <b>{item.timestamp ? new Date(item.timestamp * 1000).toLocaleString() : '-'}</b></div>
                  <div className="gifthistory-reward">Reward: <b>{item.reward_name}</b></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <style jsx>{`
        .gifthistory-modal-bg {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: #09081a;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gifthistory-modal-content {
          width: 98vw;
          max-width: 600px;
          background: #181828;
          border-radius: 18px;
          box-shadow: 0 0 24px 4px #ff36ba33;
          padding: 32px 24px 24px 24px;
          position: relative;
        }
        .gifthistory-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .gifthistory-title {
          color: #ff36ba;
          font-size: 2.1rem;
          font-weight: 800;
          letter-spacing: 2px;
          text-shadow: 0 0 20px #ff36ba44;
          margin: 0;
        }
        .close-x-gifthistory {
          background: none;
          border: none;
          outline: none;
          box-shadow: none;
          cursor: pointer;
          padding: 0;
          margin: 0;
        }
        .gifthistory-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .gifthistory-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          background: #23234a;
          border-radius: 12px;
          padding: 10px 18px;
          gap: 18px;
        }
        .gifthistory-video {
          flex-shrink: 0;
        }
        .gifthistory-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #fff;
          font-size: 1.1rem;
        }
        .gifthistory-schema, .gifthistory-date, .gifthistory-reward {
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