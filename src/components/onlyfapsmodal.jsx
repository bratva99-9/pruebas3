import React, { useEffect, useState } from 'react';
import { UserService } from '../UserService';
import girlTemplates from './girlTemplates';

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
  const [loading, setLoading] = useState(true);
  const [currentGirl, setCurrentGirl] = useState(girlName);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [templateData, setTemplateData] = useState([]); // [{template_id, img, video}]

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

        // Obtener los datos de los 20 templates de la chica actual
        const templates = girlTemplates[currentGirl] || [];
        // Solo buscar los que tengan template_id válido
        const validTemplates = templates.filter(id => id && id.length > 0);
        let templateInfo = Array(20).fill({ template_id: '', img: '', video: '' });
        if (validTemplates.length > 0) {
          // Fetch de todos los templates en paralelo
          const fetches = validTemplates.map(id =>
            fetch(`https://wax.api.atomicassets.io/atomicassets/v1/template/nightclubnft/${id}`)
              .then(res => res.json())
              .then(data => ({
                template_id: id,
                img: data.data?.immutable_data?.img || '',
                video: data.data?.immutable_data?.video || ''
              }))
              .catch(() => ({ template_id: id, img: '', video: '' }))
          );
          const results = await Promise.all(fetches);
          // Coloca cada resultado en la posición correcta
          templateInfo = templates.map((id, idx) => {
            if (!id || id.length === 0) return { template_id: '', img: '', video: '' };
            const found = results.find(r => r && r.template_id === id);
            return found || { template_id: id, img: '', video: '' };
          });
        }
        // Asegura que nunca haya nulls
        templateInfo = templateInfo.map(tpl => tpl || { template_id: '', img: '', video: '' });
        setTemplateData(templateInfo);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setOwnedNFTs([]);
        setTemplateData(Array(20).fill({ template_id: '', img: '', video: '' }));
      }
      setLoading(false);
    };
    fetchData();
  }, [currentGirl]);

  const girlIndex = GIRL_NAMES.indexOf(currentGirl.toLowerCase());
  const prevGirl = () => setCurrentGirl(GIRL_NAMES[(girlIndex - 1 + GIRL_NAMES.length) % GIRL_NAMES.length]);
  const nextGirl = () => setCurrentGirl(GIRL_NAMES[(girlIndex + 1) % GIRL_NAMES.length]);

  const isPhotoOwned = (templateId) => {
    if (!templateId) return false;
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
          <div className="photos-grid-full scrollable-nfts-fix grid-5-cols">
            {templateData.map((tplRaw, index) => {
              const tpl = tplRaw || { template_id: '', img: '', video: '' };
              const isOwned = isPhotoOwned(tpl.template_id);
              const photoNumber = index + 1;
              // Buscar el NFT del usuario para este template
              const userNFT = ownedNFTs.find(nft => nft.template && nft.template.template_id === tpl.template_id);
              // Usar el hash de video del NFT del usuario si lo tiene, si no, el del template
              const videoHash = userNFT && userNFT.data && userNFT.data.video && userNFT.data.video.length > 10
                ? userNFT.data.video
                : (tpl.video && tpl.video.length > 10 ? tpl.video : '');
              return (
                <div 
                  key={tpl.template_id || index} 
                  className={`photo-card ${!isOwned ? 'locked' : ''}`}
                >
                  {videoHash ? (
                    <video
                      src={`https://ipfs.io/ipfs/${videoHash}`}
                      className="girl-media"
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ width: '100%', height: '100%', aspectRatio: '1/2', objectFit: 'cover', display: 'block' }}
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
        .photos-grid-full.scrollable-nfts-fix.grid-5-cols {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
          width: 90vw;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 20px 24px 20px;
          overflow-y: auto;
          max-height: calc(100vh - 200px);
          justify-items: stretch;
          align-items: stretch;
        }
        .photo-card {
          position: relative;
          aspect-ratio: 1/2;
          width: 160px;
          border-radius: 18px;
          overflow: hidden;
          background: #1a0022;
          box-shadow: 0 4px 20px #ff36ba33;
          transition: box-shadow 0.2s, border 0.2s;
          border: 2px solid transparent;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
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
          aspect-ratio: 1/2;
          object-fit: cover;
          display: block;
        }
        .placeholder-media {
          width: 100%;
          height: 100%;
          aspect-ratio: 1/2;
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
