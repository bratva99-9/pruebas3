import React, { useState, useEffect } from 'react';
import NFTRewardNotification from './NFTRewardNotification';

const NFTRewardNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleRewards = (event) => {
      const rewards = event.detail;
      setNotifications(prev => [...prev, ...rewards]);
    };

    window.addEventListener('nftRewards', handleRewards);
    return () => window.removeEventListener('nftRewards', handleRewards);
  }, []);

  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {notifications.map((reward, index) => (
        <NFTRewardNotification
          key={`${reward.id}-${index}`}
          reward={reward}
          onClose={() => removeNotification(index)}
        />
      ))}
    </>
  );
};

export default NFTRewardNotifications; 