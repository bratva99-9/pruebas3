import React, { useEffect, useState } from 'react';

const girlNames = [
  "Sandra", "Ashley", "Rachel", "Jessica", "Emily", "Sophia", "Mia", "Olivia", "Ava", "Chloe"
];

const OnlyFapsModal = ({ girlName, onClose }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentGirl, setCurrentGirl] = useState(girlName);

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
        const girlPhotos = data.data
          .filter(t => t.name.startsWith(`${currentGirl} - collection photo #`))
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
  }, [currentGirl]);

  const girlIndex = girlNames.indexOf(currentGirl);
  const prevGirl = () => setCurrentGirl(girlNames[(girlIndex - 1 + girlNames.length) % girlNames.length]);
  const nextGirl = () => setCurrentGirl(girlNames[(girlIndex + 1) % girlNames.length]);

  return (
    <div className="onlyfaps-modal-bg-full">
      <div className="onlyfaps-modal-full">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="girl-nav">
          <button className="girl-arrow" onClick={prevGirl}>&lt;</button>
          <h2 className="girl-title">{currentGirl}</h2>
          <button className="girl-arrow" onClick={nextGirl}>&gt;</button>
        </div>
        {loading ? (
          <div className="loading">Cargando fotos...</div>
        ) : (
          <div className="photos-grid-full">
            {photos.map(photo => (
              <div key={photo.template_id} className="photo-card-nftmodal">
                {photo.immutable_data.video ? (
                  <video
                    src={`https://ipfs.io/ipfs/${photo.immutable_data.video}`}
                    className="girl-photo-nft"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={`https://ipfs.io/ipfs/${photo.immutable_data.img}`}
                    alt={photo.name}
                    className="girl-photo-nft"
                  />
                )}
                <div className="photo-label-nft">{photo.name.split('#')[1]}</div>
              </div>
            ))}
          </div>
        )}
      </div>
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
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(4, 1fr);
          gap: 18px;
          width: 80vw;
          max-width: 1200px;
          margin: 0 auto;
        }
        .photo-card-nftmodal {
          background: #181828;
          border-radius: 14px;
          box-shadow: 0 2px 12px #ff36ba22;
          border: 2px solid #ff36ba33;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 6px 8px 6px;
        }
        .girl-photo-nft {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 10px;
          background: #000;
        }
        .photo-label-nft {
          margin-top: 6px;
          color: #b0b3c6;
          font-size: 1rem;
          font-weight: 500;
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
