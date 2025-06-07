import React, { useEffect, useState } from 'react';
import { UserService } from '../UserService';

const GIRL_NAMES = [
  'sandra',
  'emily',
  'alissa',
  'becca',
  'ashley',
  'grace',
  'sophie',
  'megan',
  'rachel',
  'stella'
];

const OnlyFapsModal = ({ girlName, onClose }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentGirl, setCurrentGirl] = useState(girlName);
  const [ownedNFTs, setOwnedNFTs] = useState([]);

  useEffect(() => {
    setCurrentGirl(girlName.toLowerCase());
  }, [girlName]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener NFTs poseídos por el usuario
        const userNFTs = await UserService.getUserNFTs();
        console.log('NFTs poseídos:', userNFTs);
        setOwnedNFTs(userNFTs);

        // Obtener todas las fotos de la colección
        const url = `https://wax.api.atomicassets.io/atomicassets/v1/templates?collection_name=nightclubnft&schema_name=photos&limit=200`;
        const res = await fetch(url);
        const data = await res.json();
        
        // Filtrar y ordenar las fotos de la chica actual
        const girlPhotos = data.data
          .filter(t => {
            const name = t.name.toLowerCase();
            const currentGirlLower = currentGirl.toLowerCase();
            return name.startsWith(`${currentGirlLower} - collection photo #`);
          })
          .sort((a, b) => {
            const numA = parseInt(a.name.split('#')[1]);
            const numB = parseInt(b.name.split('#')[1]);
            return numA - numB;
          });

        // Asegurar que tenemos exactamente 20 fotos
        const allPhotos = Array(20).fill(null).map((_, index) => {
          const photoNumber = index + 1;
          const existingPhoto = girlPhotos.find(p => 
            parseInt(p.name.split('#')[1]) === photoNumber
          );
          
          if (existingPhoto) {
            return existingPhoto;
          }
          
          // Crear un placeholder para fotos faltantes
          return {
            template_id: `placeholder-${photoNumber}`,
            name: `${currentGirl} - collection photo #${photoNumber}`,
            immutable_data: {
              img: '',
              video: ''
            },
            isPlaceholder: true
          };
        });
        
        console.log('Fotos filtradas:', allPhotos);
        setPhotos(allPhotos);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setPhotos([]);
        setOwnedNFTs([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [currentGirl]);

  const girlIndex = GIRL_NAMES.indexOf(currentGirl.toLowerCase());
  const prevGirl = () => setCurrentGirl(GIRL_NAMES[(girlIndex - 1 + GIRL_NAMES.length) % GIRL_NAMES.length]);
  const nextGirl = () => setCurrentGirl(GIRL_NAMES[(girlIndex + 1) % GIRL_NAMES.length]);

  const isPhotoOwned = (templateId) => {
    if (templateId.startsWith('placeholder-')) return false;
    return ownedNFTs.some(nft => nft.template_id === templateId);
  };

  return (
    <div className="onlyfaps-modal-bg-full">
      <div className="onlyfaps-modal-full">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <div className="girl-nav">
          <button className="nav-btn" onClick={prevGirl} disabled={GIRL_NAMES.length === 0}>&lt;</button>
          <h2 className="girl-title">{currentGirl}</h2>
          <button className="nav-btn" onClick={nextGirl} disabled={GIRL_NAMES.length === 0}>&gt;</button>
        </div>
        {loading ? (
          <div className="loading">Cargando fotos...</div>
        ) : (
          <div className="photos-grid-full">
            {photos.map((photo, index) => {
              const isOwned = isPhotoOwned(photo.template_id);
              const photoNumber = index + 1;
              
              return (
                <div 
                  key={photo.template_id} 
                  className={`photo-card ${!isOwned ? 'locked' : ''}`}
                >
                  {!photo.isPlaceholder && photo.immutable_data.video ? (
                    <video
                      src={`https://ipfs.io/ipfs/${photo.immutable_data.video}`}
                      className="girl-media"
                      autoPlay
                      loop
                      muted
                      playsInline
                      onError={(e) => {
                        console.error('Error cargando video:', e);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : !photo.isPlaceholder && photo.immutable_data.img ? (
                    <img
                      src={`https://ipfs.io/ipfs/${photo.immutable_data.img}`}
                      alt={photo.name}
                      className="girl-media"
                      onError={(e) => {
                        console.error('Error cargando imagen:', e);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="placeholder-media">
                      <span>Foto #{photoNumber}</span>
                    </div>
                  )}
                  {!isOwned && (
                    <div className="lock-overlay">
                      <svg viewBox="0 0 24 24" className="lock-icon">
                        <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z"/>
                      </svg>
                    </div>
                  )}
                  <div className="photo-label-nft">#{photoNumber}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .onlyfaps-modal-bg-full {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.95);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .onlyfaps-modal-full {
          width: 100vw;
          height: 100vh;
          padding: 0;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .modal-close-btn {
          position: absolute;
          top: 28px;
          right: 38px;
          background: rgba(0, 255, 255, 0.1);
          border: 2px solid #00ffff;
          color: #00ffff;
          font-size: 2rem;
          cursor: pointer;
          z-index: 10;
          width: 48px;
          height: 48px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .modal-close-btn:hover {
          background: rgba(0, 255, 255, 0.2);
          transform: scale(1.05);
        }
        .girl-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 48px;
          margin-bottom: 32px;
          gap: 24px;
        }
        .girl-title {
          color: #00ffff;
          text-align: center;
          font-size: 2.4rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: capitalize;
          margin: 0;
          text-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        }
        .nav-btn {
          background: rgba(0, 255, 255, 0.1);
          border: 2px solid #00ffff;
          color: #00ffff;
          font-size: 1.8rem;
          font-weight: 700;
          cursor: pointer;
          width: 48px;
          height: 48px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .nav-btn:hover {
          background: rgba(0, 255, 255, 0.2);
          transform: scale(1.05);
        }
        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .photos-grid-full {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 24px;
          width: 90vw;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .photo-card {
          position: relative;
          aspect-ratio: 1/2;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 4px 20px rgba(0, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .photo-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 255, 255, 0.2);
        }
        .photo-card.locked {
          border: 2px solid #ff36ba;
          box-shadow: 0 4px 20px rgba(255, 54, 186, 0.2);
        }
        .photo-card.locked:hover {
          box-shadow: 0 8px 30px rgba(255, 54, 186, 0.3);
        }
        .girl-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .placeholder-media {
          width: 100%;
          height: 100%;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 1.2rem;
        }
        .lock-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        .lock-icon {
          width: 48px;
          height: 48px;
          fill: #ff36ba;
          filter: drop-shadow(0 0 10px rgba(255, 54, 186, 0.5));
        }
        .photo-label-nft {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 12px;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          color: #fff;
          font-size: 1rem;
          font-weight: 500;
          text-align: center;
        }
        .loading {
          color: #00ffff;
          text-align: center;
          font-size: 1.4rem;
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .photos-grid-full {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 16px;
          }
          .girl-title {
            font-size: 2rem;
          }
          .nav-btn, .modal-close-btn {
            width: 40px;
            height: 40px;
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OnlyFapsModal;
