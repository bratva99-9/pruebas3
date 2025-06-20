import React, { useState, useEffect } from 'react';
import { swapService } from '../services/SwapService';

const SwapHistoryModal = ({ onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSwapHistory();
  }, []);

  const fetchSwapHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const swapHistory = await swapService.getUserSwapHistory();
      setHistory(swapHistory);
    } catch (err) {
      console.error('Error fetching swap history:', err);
      setError('Error al cargar historial de swaps');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount, decimals = 4) => {
    return parseFloat(amount).toFixed(decimals);
  };

  return (
    <div className="swap-history-modal-overlay" onClick={onClose}>
      <div className="swap-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="swap-history-modal-header">
          <h2>Historial de Swaps</h2>
          <button className="swap-history-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="swap-history-modal-content">
          {loading ? (
            <div className="swap-history-loading">
              <div className="loading-spinner"></div>
              <p>Cargando historial...</p>
            </div>
          ) : error ? (
            <div className="swap-history-error">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="swap-history-empty">
              <p>No tienes swaps realizados aún</p>
              <p>¡Haz tu primer swap para ver el historial aquí!</p>
            </div>
          ) : (
            <div className="swap-history-list">
              {history.map((swap, index) => (
                <div key={index} className="swap-history-item">
                  <div className="swap-history-main">
                    <div className="swap-history-tokens">
                      <span className="swap-token">
                        {formatAmount(swap.token_in.amount)} {swap.token_in.symbol}
                      </span>
                      <span className="swap-arrow">→</span>
                      <span className="swap-token">
                        {formatAmount(swap.token_out.amount)} {swap.token_out.symbol}
                      </span>
                    </div>
                    <div className="swap-history-date">
                      {formatDate(swap.timestamp)}
                    </div>
                  </div>
                  <div className="swap-history-details">
                    <a 
                      href={`https://wax.bloks.io/transaction/${swap.trx_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="swap-tx-link"
                    >
                      Ver en bloks.io
                    </a>
                    <span className="swap-status success">✓ Completado</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .swap-history-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(8px);
        }

        .swap-history-modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 2px solid #ff36ba;
          border-radius: 20px;
          padding: 24px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(255, 54, 186, 0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .swap-history-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 54, 186, 0.3);
        }

        .swap-history-modal-header h2 {
          color: #fff;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .swap-history-close-btn {
          background: none;
          border: none;
          color: #ff36ba;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .swap-history-close-btn:hover {
          background: rgba(255, 54, 186, 0.1);
          transform: scale(1.1);
        }

        .swap-history-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #fff;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 54, 186, 0.3);
          border-top: 3px solid #ff36ba;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .swap-history-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 16px;
          color: #ef4444;
          text-align: center;
        }

        .swap-history-empty {
          text-align: center;
          color: #b0b0b0;
          padding: 40px;
        }

        .swap-history-empty p {
          margin: 8px 0;
          font-size: 16px;
        }

        .swap-history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .swap-history-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 54, 186, 0.2);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s;
        }

        .swap-history-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 54, 186, 0.4);
        }

        .swap-history-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .swap-history-tokens {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          font-weight: 600;
        }

        .swap-token {
          color: #fff;
          padding: 4px 8px;
          background: rgba(255, 54, 186, 0.1);
          border-radius: 6px;
          border: 1px solid rgba(255, 54, 186, 0.3);
        }

        .swap-arrow {
          color: #ff36ba;
          font-weight: bold;
          font-size: 18px;
        }

        .swap-history-date {
          color: #b0b0b0;
          font-size: 14px;
        }

        .swap-history-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .swap-fee {
          color: #b0b0b0;
        }

        .swap-status {
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
        }

        .swap-status.success {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .swap-status.pending {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .swap-status.failed {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .swap-tx-link {
          color: #ff36ba;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s;
        }

        .swap-tx-link:hover {
          color: #fff;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default SwapHistoryModal; 