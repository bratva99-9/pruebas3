import React, { useEffect, useState } from 'react';

const OnlyFapsModal = ({ girlName, onClose }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [girlNames, setGirlNames] = useState([]);
  const [currentGirl, setCurrentGirl] = useState(girlName);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    setCurrentGirl(girlName);
  }, [girlName]);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const url = `https://wax.api.atomicassets.io/atomicassets/v1/templates?collection_name=nightclubnft&schema_name=photos&limit=200`;
        const res = await fetch(url);
        const data = await res.json();
        
        // Extraer nombres únicos de chicas y ordenarlos alfabéticamente
        const names = Array.from(new Set(
          data.data.map(t => t.name.split(' - collection photo #')[0])
        )).sort();
        
        setGirlNames(names);
        
        // Filtrar y ordenar las fotos de la chica actual
        const girlPhotos = data.data
          .filter(t => t.name.startsWith(`${currentGirl} - collection photo #`))
          .sort((a, b) => {
            const numA = parseInt(a.name.split('#')[1]);
            const numB = parseInt(b.name.split('#')[1]);
            return numA - numB;
          });
        
        setPhotos(girlPhotos);
      } catch (err) {
        console.error('Error al cargar fotos:', err);
        setPhotos([]);
        setGirlNames([]);
      }
      setLoading(false);
    };
    fetchPhotos();
  }, [currentGirl]);

  const girlIndex = girlNames.indexOf(currentGirl);
  const prevGirl = () => setCurrentGirl(girlNames[(girlIndex - 1 + girlNames.length) % girlNames.length]);
  const nextGirl = () => setCurrentGirl(girlNames[(girlIndex + 1) % girlNames.length]);

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const closePhotoView = () => {
    setSelectedPhoto(null);
  };

  return (
    <div className="onlyfaps-modal-bg-full">
      <div className="onlyfaps-modal-full">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="girl-nav">
          <button className="girl-arrow" onClick={prevGirl} disabled={girlNames.length === 0}>&lt;</button>
          <h2 className="girl-title">{currentGirl}</h2>
          <button className="girl-arrow" onClick={nextGirl} disabled={girlNames.length === 0}>&gt;</button>
        </div>
        {loading ? (
          <div className="loading">Cargando fotos...</div>
        ) : (
          <div className="photos-grid-full">
            {photos.map(photo => (
              <div 
                key={photo.template_id} 
                className="photo-media-cell"
                onClick={() => handlePhotoClick(photo)}
              >
                {photo.immutable_data.video ? (
                  <video
                    src={`https://ipfs.io/ipfs/${photo.immutable_data.video}`}
                    className="girl-media"
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ aspectRatio: '1/2' }}
                  />
                ) : (
                  <img
                    src={`https://ipfs.io/ipfs/${photo.immutable_data.img}`}
                    alt={photo.name}
                    className="girl-media"
                    style={{ aspectRatio: '1/2' }}
                  />
                )}
                <div className="photo-label-nft">{photo.name.split('#')[1]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div className="photo-viewer-overlay" onClick={closePhotoView}>
          <div className="photo-viewer-content" onClick={e => e.stopPropagation()}>
            <button className="photo-viewer-close" onClick={closePhotoView}>×</button>
            {selectedPhoto.immutable_data.video ? (
              <video
                src={`https://ipfs.io/ipfs/${selectedPhoto.immutable_data.video}`}
                className="photo-viewer-media"
                autoPlay
                loop
                muted
                playsInline
                controls
              />
            ) : (
              <img
                src={`https://ipfs.io/ipfs/${selectedPhoto.immutable_data.img}`}
                alt={selectedPhoto.name}
                className="photo-viewer-media"
              />
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .onlyfaps-modal-bg-full {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: hsl(245, 86.70%, 2.90%);
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
        .close-btn {
          position: absolute;
          top: 28px;
          right: 38px;
          background: none;
          border: none;
          color: #ff36ba;
          font-size: 2.5rem;
          cursor: pointer;
          z-index: 10;
          transition: color 0.2s;
        }
        .close-btn:hover {
          color: #fff;
        }
        .girl-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 48px;
          margin-bottom: 24px;
        }
        .girl-title {
          color: #ff36ba;
          text-align: center;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: 1px;
          margin: 0 32px;
        }
        .girl-arrow {
          background: none;
          border: none;
          color: #ff36ba;
          font-size: 2.2rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0 18px;
          transition: color 0.2s;
        }
        .girl-arrow:hover {
          color: #fff;
        }
        .photos-grid-full {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 18px;
          width: 90vw;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .photo-media-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: none;
          border: none;
          box-shadow: none;
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .photo-media-cell:hover {
          transform: scale(1.05);
        }
        .girl-media {
          width: 100%;
          height: auto;
          object-fit: cover;
          border-radius: 10px;
          background: #000;
          display: block;
          box-shadow: 0 4px 12px rgba(255, 54, 186, 0.2);
        }
        .photo-label-nft {
          margin-top: 8px;
          color: #b0b3c6;
          font-size: 0.9rem;
          font-weight: 500;
          text-align: center;
        }
        .loading {
          color: #ff36ba;
          text-align: center;
          font-size: 1.2rem;
        }
        .photo-viewer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .photo-viewer-content {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
        }
        .photo-viewer-media {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 12px;
        }
        .photo-viewer-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: none;
          border: none;
          color: #ff36ba;
          font-size: 2.5rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .photo-viewer-close:hover {
          color: #fff;
        }
        @media (max-width: 768px) {
          .photos-grid-full {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 12px;
          }
          .girl-title {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OnlyFapsModal;
