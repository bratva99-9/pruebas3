<div className="home-container">
  <img src="/home1.png" alt="Home Background" className="home-background-image" />
  <div className="user-info">
    <h1>Welcome, {userName}</h1>
    <p>Balance: {balance} SEXY</p>
    <button className="btn-logout" onClick={handleLogout}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 16L21 12M21 12L17 8M21 12H9M9 21H7C5.93913 21 4.92172 20.5786 4.17157 19.8284C3.42143 19.0783 3 18.0609 3 17V7C3 5.93913 3.42143 4.92172 4.17157 4.17157C4.92172 3.42143 5.93913 3 7 3H9" stroke="#ff00ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  </div>
</div>

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
.home-background-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 800px;
  height: auto;
  border-radius: 20px;
  border: 2px solid #ff36ba;
  box-shadow: 0 0 20px rgba(255, 54, 186, 0.5);
  z-index: 1;
  object-fit: contain;
}
.btn-logout {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.btn-logout:hover {
  transform: scale(1.1);
} 