import React, { useEffect, useState } from 'react';
import { UserService } from '../UserService';
import girlTemplates from './girlTemplates';
import girlBonuses from './girlBonuses';

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
  const [currentGirl, setCurrentGirl] = useState(girlName);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [templateData, setTemplateData] = useState([]); // [{template_id, img, video}]
  const girlData = girlBonuses[currentGirl] || {};

  useEffect(() => {
    setCurrentGirl(girlName.toLowerCase());
  }, [girlName]);

  useEffect(() => {
    const fetchData = async () => {
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
        <div className="onlyfaps-modal-inner">
          {/* Encabezado estilo NFTModal */}
          <div className="girl-header-nftmodal">
            <div className="girl-header-title-row">
              <button className="nav-btn" onClick={prevGirl} disabled={GIRL_NAMES.length === 0}>&lt;</button>
              <h1 className="girl-header-title">{girlData.name || currentGirl}</h1>
              <button className="nav-btn" onClick={nextGirl} disabled={GIRL_NAMES.length === 0}>&gt;</button>
            </div>
            <div className="girl-header-description">{girlData.description}</div>
            <div className="girl-header-stats">
              <div className="girl-header-stat">
                <span className="stat-icon">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="9.5" stroke="#bfc2d1" strokeWidth="1.5"/><path d="M11 5.5V11L14 13" stroke="#bfc2d1" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </span>
                <span className="stat-text">{girlData.stats?.time}</span>
              </div>
              <div className="girl-header-stat">
                <span className="stat-icon">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="9.5" stroke="#ffe066" strokeWidth="1.5"/><text x="11" y="15" textAnchor="middle" fontSize="10" fill="#ffe066">S</text></svg>
                </span>
                <span className="stat-text">{girlData.stats?.token}</span>
              </div>
              <div className="girl-header-stat">
                <span className="stat-icon">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4.5" y="9.5" width="13" height="7" rx="2" fill="#ff00ff" fillOpacity="0.13" stroke="#ff00ff" strokeWidth="1.7"/><rect x="8.5" y="4.5" width="5" height="5" rx="1.5" fill="#ff00ff" fillOpacity="0.18" stroke="#ff00ff" strokeWidth="1.3"/><path d="M4.5 12H17.5" stroke="#ff00ff" strokeWidth="1.3"/><path d="M11 9.5V16" stroke="#ff00ff" strokeWidth="1.3"/><path d="M8.5 7C7.5 5.5 10 4 11 7" stroke="#ff00ff" strokeWidth="1.2" strokeLinecap="round"/><path d="M13.5 7C14.5 5.5 12 4 11 7" stroke="#ff00ff" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </span>
                <span className="stat-text">{girlData.stats?.giftChance}</span>
              </div>
            </div>
            <div className="nftmodal-divider" />
            <div className="nft-count-center-row">
              <span className="selected-count-style selected-count-btn btn-small">
                {ownedNFTs.filter(nft => nft.template && templateData.some(tpl => tpl.template_id === nft.template.template_id)).length}/{templateData.filter(tpl => tpl.template_id).length} Collected
              </span>
            </div>
          </div>
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
                      style={{ width: '100%', height: '100%', aspectRatio: '9/16', objectFit: 'cover', display: 'block' }}
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
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>

      <style jsx>{`
        .onlyfaps-modal-bg-full {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: #09081a;
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
        .onlyfaps-modal-inner {
          width: 100%;
          max-width: 1200px;
          height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-y: auto;
          background: none;
        }
        .modal-close-btn {
          position: absolute;
          top: 28px;
          right: 38px;
          background: none !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          color: #ff36ba;
          font-size: 2.5rem;
          cursor: pointer;
          z-index: 10;
          padding: 0 !important;
          margin: 0 !important;
          line-height: 1;
          transition: color 0.3s ease;
        }
        .modal-close-btn:hover {
          color: #b800a6;
          background: none !important;
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
          background: none !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          color: #ff36ba;
          font-size: 2.5rem;
          font-weight: 400;
          cursor: pointer;
          padding: 0 !important;
          margin: 0 !important;
          line-height: 1;
          transition: color 0.3s ease;
        }
        .nav-btn:hover {
          color: #b800a6;
          background: none !important;
        }
        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .photos-grid-full.scrollable-nfts-fix.grid-5-cols {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 22px;
          width: 90vw;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 20px 24px 20px;
          overflow-y: auto;
          max-height: calc(100vh - 120px);
          justify-items: stretch;
          align-items: stretch;
          scrollbar-width: thin;
          scrollbar-color: #ff00ff #181828;
        }
        .photos-grid-full.scrollable-nfts-fix.grid-5-cols::-webkit-scrollbar {
          width: 10px;
          background: #181828;
        }
        .photos-grid-full.scrollable-nfts-fix.grid-5-cols::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ff00ff 0%, #00ffff 100%);
          border-radius: 8px;
        }
        .photos-grid-full.scrollable-nfts-fix.grid-5-cols::-webkit-scrollbar-track {
          background: #181828;
        }
        .photo-card {
          position: relative;
          aspect-ratio: 10/20;
          height: 304px;
          border-radius: 12px;
          overflow: hidden;
          background: none;
          transition: transform 0.2s;
        }
        .photo-card:hover {
          transform: translateY(-5px);
        }
        .photo-card.locked {
          filter: brightness(0.5);
        }
        .girl-media {
          width: 100%;
          height: 95%;
          aspect-ratio: 10/20;
          object-fit: cover;
          display: block;
          border-radius: 12px;
          background: #19191d;
        }
        .placeholder-media {
          width: 100%;
          height: 95%;
          aspect-ratio: 10/20;
          background: #2a003f;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b800a6;
          font-size: 1.2rem;
          border-radius: 12px;
        }
        .lock-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          border-radius: 12px;
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
          border-radius: 0 0 12px 12px;
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
            font-size: 2rem;
          }
        }
        .cancel-btn {
          position: static;
          margin: 24px auto 0 auto;
          display: block;
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 14px;
          padding: 8px 32px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 1px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .cancel-btn:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
          color: #fff;
          box-shadow: none;
        }
        .bonus-btn.left-top-btn {
          display: none;
        }
        .nft-count-btn.right-top-btn {
          display: none;
        }
        .nft-count-center-row {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 0 18px 0;
        }
        .selected-count-style.selected-count-btn.btn-small {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          background: rgba(36,0,56,0.10);
          border: 2px solid #00ffff;
          border-radius: 12px;
          padding: 6px 20px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 0.5px;
          cursor: default;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          margin-bottom: 0;
          min-width: 120px;
          white-space: nowrap;
        }
        /* Barra de navegación rosada vertical estilo NFTModal */
        .vertical-pink-bar {
          position: absolute;
          left: 0;
          top: 0;
          width: 8px;
          height: 100%;
          background: linear-gradient(180deg, #ff00ff 0%, #00ffff 100%);
          border-radius: 8px;
          box-shadow: 0 0 18px 4px #ff36ba66;
          z-index: 2;
        }
        /* Estilos para el encabezado tipo NFTModal */
        .girl-header-nftmodal {
          width: 100%;
          max-width: 900px;
          margin: 0 auto 12px auto;
          padding: 18px 0 0 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .girl-header-title-row {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 8px;
          margin-top: 0;
        }
        .girl-header-title {
          color: #ff36ba;
          font-size: 2.6rem;
          font-weight: 800;
          letter-spacing: 2px;
          text-shadow: 0 0 20px #ff36ba44;
          margin: 0 12px 0 12px;
          text-transform: capitalize;
          line-height: 1.1;
        }
        .girl-header-description {
          color: #bfc2d1;
          font-size: 1.2rem;
          font-weight: 400;
          margin: 6px 0 18px 0;
          text-align: center;
          max-width: 700px;
        }
        .girl-header-stats {
          display: flex;
          gap: 32px;
          margin-bottom: 18px;
        }
        .nftmodal-divider {
          width: 900px;
          max-width: 900px;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,0,255,0.12) 0%, rgba(0,255,255,0.12) 100%);
          margin: 18px auto 18px auto;
          border-radius: 2px;
        }
        .girl-header-stat {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .stat-icon {
          font-size: 18px;
          width: 22px;
          text-align: center;
          opacity: 0.85;
          filter: grayscale(1) brightness(1.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-text {
          color: #bfc2d1;
          font-size: 1.1rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          text-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default OnlyFapsModal;
