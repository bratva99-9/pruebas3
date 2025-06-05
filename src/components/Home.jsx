import React from 'react';

export default function Home({ userName, balance, handleLogout }) {
  return (
    <div className="home-container">
      <div className="home-image-container">
        <img src="/Mapa1.png" alt="Map Background" className="home-image" />
      </div>
      <div className="user-info">
        <h1>Welcome, {userName}</h1>
        <p>Balance: {balance} SEXY</p>
        <button className="btn-logout" onClick={handleLogout}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 16L21 12M21 12L17 8M21 12H9M9 21H7C5.93913 21 4.92172 20.5786 4.17157 19.8284C3.42143 19.0783 3 18.0609 3 17V7C3 5.93913 3.42143 4.92172 4.17157 4.17157C4.92172 3.42143 5.93913 3 7 3H9" stroke="#ff00ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <style jsx>{`
        .home-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 20px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          position: relative;
          overflow: hidden;
        }
        .home-image-container {
          width: 80%;
          max-width: 800px;
          margin: 32px auto 24px auto;
          border-radius: 20px;
          border: 2px solid #ff36ba;
          box-shadow: 0 0 20px rgba(255, 54, 186, 0.5);
          overflow: hidden;
          background: #181828;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .home-image {
          width: 100%;
          height: auto;
          display: block;
        }
        .user-info {
          background: rgba(0, 255, 255, 0.13);
          border: 2px solid #00ffff;
          border-radius: 12px;
          padding: 20px 32px;
          margin-top: 20px;
          text-align: center;
          color: #fff;
          font-weight: 500;
          font-size: 1.1rem;
          box-shadow: 0 2px 12px 0 #00ffff22;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .btn-logout {
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
          box-shadow: none;
          margin-top: 8px;
          /* Sin cursor pointer ni efectos */
          cursor: default;
        }
      `}</style>
    </div>
  );
} 