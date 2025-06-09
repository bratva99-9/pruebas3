import React, { useEffect } from 'react';

const NFTRewardNotification = ({ reward, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose, reward]);

  if (reward.empty) {
    return (
      <div className="nft-reward-notification" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, rgba(40,40,50,0.95) 0%, rgba(80,80,90,0.95) 100%)',
        border: '2px solid #ff36ba',
        borderRadius: '12px',
        padding: '16px',
        color: '#fff',
        zIndex: 10000,
        boxShadow: '0 4px 24px rgba(255, 54, 186, 0.2)',
        animation: 'slideIn 0.3s ease-out',
        maxWidth: '320px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 4px 0',
              color: '#ff36ba',
              fontSize: '1.1rem',
              fontWeight: 600
            }}>No has ganado ningún NFT esta vez.</h3>
          </div>
        </div>
        <style jsx>{`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="nft-reward-notification" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, rgba(40,40,50,0.95) 0%, rgba(80,80,90,0.95) 100%)',
      border: '2px solid #ff36ba',
      borderRadius: '12px',
      padding: '16px',
      color: '#fff',
      zIndex: 10000,
      boxShadow: '0 4px 24px rgba(255, 54, 186, 0.2)',
      animation: 'slideIn 0.3s ease-out',
      maxWidth: '320px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          background: 'rgba(255, 54, 186, 0.1)',
          borderRadius: '50%',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 4px 0',
            color: '#ff36ba',
            fontSize: '1.1rem',
            fontWeight: 600
          }}>¡Nuevo NFT Ganado!</h3>
          <p style={{
            margin: '0 0 4px 0',
            color: '#fff',
            fontSize: '0.95rem'
          }}>{reward.reward_name || 'NFT Desconocido'}</p>
          <span style={{
            color: '#00ffff',
            fontSize: '0.85rem',
            opacity: 0.8
          }}>{reward.schema || 'Schema Desconocido'}</span>
        </div>
      </div>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NFTRewardNotification; 