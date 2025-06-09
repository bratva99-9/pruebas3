import React, { useState, useEffect } from 'react';
import NFTRewardNotification from './NFTRewardNotification';

const NFTRewardNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    console.log('Componente NFTRewardNotifications montado');
    
    const handleRewards = (event) => {
      console.log('Evento nftRewards recibido:', event.detail);
      const rewards = event.detail;
      setNotifications(prev => {
        console.log('Notificaciones actuales:', prev);
        console.log('Nuevas recompensas:', rewards);
        return [...prev, ...rewards];
      });
    };

    window.addEventListener('nftRewards', handleRewards);
    console.log('Event listener nftRewards registrado');

    return () => {
      console.log('Limpiando event listener nftRewards');
      window.removeEventListener('nftRewards', handleRewards);
    };
  }, []);

  const removeNotification = (index) => {
    console.log('Removiendo notificación:', index);
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  console.log('Renderizando notificaciones:', notifications);

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      alignItems: 'flex-end',
      pointerEvents: 'none'
    }}>
      {notifications.map((reward, index) => (
        <div key={reward.id ? `${reward.id}-${index}` : `empty-${index}`} style={{ pointerEvents: 'auto' }}>
          <NFTRewardNotification
            reward={reward}
            onClose={() => removeNotification(index)}
          />
        </div>
      ))}
    </div>
  );
};

export default NFTRewardNotifications; 