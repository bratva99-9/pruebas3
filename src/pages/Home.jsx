import React, { useState } from 'react';
import MissionModal from '../components/MissionModal';

const Home = () => {
  const [showMission, setShowMission] = useState(false);

  return (
    <div className="home">
      <h1>Welcome to Night Club App</h1>
      
      <button 
        className="mission-btn"
        onClick={() => setShowMission(true)}
      >
        Mission
      </button>

      {showMission && (
        <MissionModal onClose={() => setShowMission(false)} />
      )}

      <style jsx>{`
        .home {
          padding: 40px;
          text-align: center;
          background: linear-gradient(135deg, #0a0a2e 0%, #16213e 100%);
          min-height: 100vh;
          color: white;
        }

        .home h1 {
          font-size: 36px;
          color: #ff00ff;
          margin-bottom: 40px;
          text-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
        }

        .mission-btn {
          background: linear-gradient(45deg, #ff00ff, #00ffff);
          border: none;
          border-radius: 15px;
          padding: 20px 40px;
          font-size: 24px;
          font-weight: bold;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 0 5px 15px rgba(255, 0, 255, 0.3);
        }

        .mission-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(255, 0, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Home;