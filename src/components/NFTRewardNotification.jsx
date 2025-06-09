import React, { useEffect } from 'react';

const NFTRewardNotification = ({ reward, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="nft-reward-notification">
      <div className="nft-reward-content">
        <div className="nft-reward-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700"/>
          </svg>
        </div>
        <div className="nft-reward-info">
          <h3>¡Nuevo NFT Ganado!</h3>
          <p>{reward.reward_name}</p>
          <span className="nft-reward-schema">{reward.schema}</span>
        </div>
      </div>

      <style jsx>{`
        .nft-reward-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, rgba(40,40,50,0.95) 0%, rgba(80,80,90,0.95) 100%);
          border: 2px solid #ff36ba;
          border-radius: 12px;
          padding: 16px;
          color: #fff;
          z-index: 10000;
          box-shadow: 0 4px 24px rgba(255, 54, 186, 0.2);
          animation: slideIn 0.3s ease-out;
          max-width: 320px;
        }

        .nft-reward-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nft-reward-icon {
          background: rgba(255, 54, 186, 0.1);
          border-radius: 50%;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nft-reward-info {
          flex: 1;
        }

        .nft-reward-info h3 {
          margin: 0 0 4px 0;
          color: #ff36ba;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .nft-reward-info p {
          margin: 0 0 4px 0;
          color: #fff;
          font-size: 0.95rem;
        }

        .nft-reward-schema {
          color: #00ffff;
          font-size: 0.85rem;
          opacity: 0.8;
        }

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