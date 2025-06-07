import React, { useEffect, useState } from 'react';

const OnlyFapsModal = ({ girlName, onClose }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        // Llama a la API de AtomicAssets para obtener los templates del schema 'photos' de la colección 'nightclubnft'
        const url = `https://wax.api.atomicassets.io/atomicassets/v1/templates?collection_name=nightclubnft&schema_name=photos&limit=200`;
        const res = await fetch(url);
        const data = await res.json();
        // Filtra y ordena los templates de la chica
        const girlPhotos = data.data
          .filter(t => t.name.startsWith(`${girlName} - collection photo #`))
          .sort((a, b) => {
            const numA = parseInt(a.name.split('#')[1]);
            const numB = parseInt(b.name.split('#')[1]);
            return numA - numB;
          });
        setPhotos(girlPhotos);
      } catch (err) {
        setPhotos([]);
      }
      setLoading(false);
    };
    fetchPhotos();
  }, [girlName]);

  return (
    <div className="onlyfaps-modal-bg">
      <div className="onlyfaps-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2 className="girl-title">{girlName}</h2>
        {loading ? (
          <div className="loading">Cargando fotos...</div>
        ) : (
          <div className="photos-grid">
            {photos.map(photo => (
              <div key={photo.template_id} className="photo-cell">
                <img src={`https://ipfs.io/ipfs/${photo.immutable_data.img}`} alt={photo.name} className="girl-photo" />
                <div className="photo-label">{photo.name.split('#')[1]}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .onlyfaps-modal-bg {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.7);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .onlyfaps-modal {
          background: #181828;
          border-radius: 18px;
          padding: 32px 28px 24px 28px;
          min-width: 600px;
          max-width: 90vw;
          box-shadow: 0 0 32px #ff36ba55;
          position: relative;
        }
        .close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          background: none;
          border: none;
          color: #ff36ba;
          font-size: 2rem;
          cursor: pointer;
        }
        .girl-title {
          color: #ff36ba;
          text-align: center;
          margin-bottom: 18px;
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(4, 1fr);
          gap: 12px;
        }
        .photo-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .girl-photo {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 10px;
          border: 2px solid #ff36ba33;
          box-shadow: 0 2px 8px #0005;
        }
        .photo-label {
          margin-top: 4px;
          color: #b0b3c6;
          font-size: 0.95rem;
        }
        .loading {
          color: #ff36ba;
          text-align: center;
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
};

export default OnlyFapsModal;
