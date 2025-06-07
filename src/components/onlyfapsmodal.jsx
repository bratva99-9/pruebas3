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
        // Obtener NFTs poseídos por el usuario (fetch manual)
        const currentUser = UserService.getName();
        let userNFTs = [];
        if (currentUser) {
          const urlUser = `https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${currentUser}&collection_name=nightclubnft&schema_name=photos&limit=100`;
          const resUser = await fetch(urlUser);
          const dataUser = await resUser.json();
          userNFTs = dataUser.data || [];
        }
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
    return ownedNFTs.some(nft => nft.template && nft.template.template_id === templateId);
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
          <div className="photos-grid-full scrollable-nfts">
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
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : !photo.isPlaceholder && photo.immutable_data.img ? (
                    <img
                      src={`https://ipfs.io/ipfs/${photo.immutable_data.img}`}
                      alt={photo.name}
                      className="girl-media"
                      onError={(e) => {
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
          background: linear-gradient(135deg, #2a003f 0%, #ff36ba 100%);
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
          background: none;
          border: 2px solid #ff36ba;
          color: #ff36ba;
          font-size: 2.2rem;
          cursor: pointer;
          z-index: 10;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, border 0.2s, color 0.2s;
        }
        .modal-close-btn:hover {
          background: #ff36ba22;
          color: #fff;
          border-color: #b800a6;
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
          color: #ff36ba;
          text-align: center;
          font-size: 2.4rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: capitalize;
          margin: 0;
          text-shadow: 0 0 12px #b800a6cc;
        }
        .nav-btn {
          background: none;
          border: 2px solid #ff36ba;
          color: #ff36ba;
          font-size: 2rem;
          font-weight: 700;
          cursor: pointer;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, border 0.2s, color 0.2s;
        }
        .nav-btn:hover {
          background: #ff36ba22;
          color: #fff;
          border-color: #b800a6;
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
          padding: 0 20px 24px 20px;
          overflow-y: auto;
          max-height: 70vh;
        }
        .scrollable-nfts {
          overflow-y: auto;
          max-height: 70vh;
        }
        .photo-card {
          position: relative;
          aspect-ratio: 1/2;
          border-radius: 18px;
          overflow: hidden;
          background: #1a0022;
          box-shadow: 0 4px 20px #ff36ba33;
          transition: box-shadow 0.2s, border 0.2s;
          border: 2px solid transparent;
        }
        .photo-card:hover {
          box-shadow: 0 8px 30px #ff36ba55;
          border-color: #ff36ba;
        }
        .photo-card.locked {
          border: 2px solid #b800a6;
          box-shadow: 0 4px 20px #b800a655;
        }
        .photo-card.locked:hover {
          box-shadow: 0 8px 30px #b800a6aa;
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
          background: #2a003f;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b800a6;
          font-size: 1.2rem;
        }
        .lock-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(186, 0, 166, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(2px);
        }
        .lock-icon {
          width: 48px;
          height: 48px;
          fill: #ff36ba;
          filter: drop-shadow(0 0 10px #b800a6);
        }
        .photo-label-nft {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px 0 8px 0;
          background: linear-gradient(to top, #b800a6cc 0%, transparent 100%);
          color: #fff;
          font-size: 1.1rem;
          font-weight: 600;
          text-align: center;
          letter-spacing: 1px;
        }
        .loading {
          color: #ff36ba;
          text-align: center;
          font-size: 1.4rem;
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .photos-grid-full {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            max-height: 60vh;
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
