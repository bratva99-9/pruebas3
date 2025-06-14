import React, { useState, useEffect, useCallback } from 'react';
import { UserService } from '../UserService';
import { useHistory } from 'react-router-dom';
import MissionStatus from './missionstatus';

const NFTModal = ({ mission, onClose, onForceCloseAll }) => {
  const [nfts, setNfts] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [showMissionStatus, setShowMissionStatus] = useState(false);
  const [cooldowns, setCooldowns] = useState({});
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  const MAX_SELECTED = 10;
  const history = useHistory();

  const fetchNFTs = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = UserService.getName();
      console.log('Usuario actual:', currentUser);
      if (!currentUser) {
        console.error('No user logged in');
        setLoading(false);
        return;
      }

      // Usar la API pública de AtomicAssets
      const url = `https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${currentUser}&collection_name=nightclubnft&limit=100`;
      const res = await fetch(url);
      const data = await res.json();
      const nfts = data.data || [];
      console.log('NFTs recibidos:', nfts);

      setNfts(nfts);
      // Cooldowns
      const cooldownRows = await UserService.getCooldowns();
      const cooldownMap = {};
      cooldownRows.forEach(row => {
        cooldownMap[row.asset_id] = row.last_claim_time;
      });
      setCooldowns(cooldownMap);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  // Actualizar el tiempo actual cada segundo para el temporizador de cooldown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar NFTs por colección, schema y que tengan video
  const filteredNFTs = nfts.filter(nft =>
    nft.collection && 
    nft.collection.collection_name === 'nightclubnft' &&
    nft.schema && 
    nft.schema.schema_name === 'girls' &&
    nft.data && 
    nft.data.video
  );

  const toggleNFTSelection = (assetId) => {
    console.log('Toggling NFT selection:', assetId);
    if (selectedNFTs.includes(assetId)) {
      setSelectedNFTs(prev => prev.filter(id => id !== assetId));
    } else {
      if (selectedNFTs.length < MAX_SELECTED) {
        setSelectedNFTs(prev => [...prev, assetId]);
      } else {
        alert(`Maximum ${MAX_SELECTED} NFTs can be selected`);
      }
    }
  };

  const sendMission = async () => {
    if (selectedNFTs.length === 0) return;

    setSending(true);
    setShowLoadingOverlay(true);
    try {
      const memo = `mission:${mission.id}`;
      console.log('Sending mission with NFTs:', selectedNFTs, 'memo:', memo);
      await UserService.stakeNFTs(selectedNFTs, memo);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
      setTimeout(() => {
        const girlsCount = selectedNFTs.length;
        const msg = `${girlsCount} Girl${girlsCount === 1 ? '' : 's'} sent successfully!`;
        sessionStorage.setItem('missionToast', msg);
        setShowLoadingOverlay(false);
        setTimeout(() => {
          if (onForceCloseAll) onForceCloseAll();
          else if (onClose) onClose();
          history.push('/home');
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Error sending mission:', error);
      alert('Error: ' + error.message);
      setShowLoadingOverlay(false);
    } finally {
      setSending(false);
    }
  };

  // Utilidad para mostrar minutos en horas si es posible
  const formatDuration = (minutes) => {
    if (!minutes) return 'No disponible';
    if (minutes % 60 === 0) {
      return `${minutes / 60}h`;
    }
    if (minutes > 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m}min`;
    }
    return `${minutes} min`;
  };

  // Utilidad para mostrar enteros si no hay decimales
  const formatNumber = (num, suffix = '') => {
    if (num === undefined || num === null) return 'No disponible';
    return Number(num) % 1 === 0 ? `${Number(num)}${suffix}` : `${Number(num).toFixed(1)}${suffix}`;
  };

  if (loading) {
    return (
      <div className="nft-modal-fullscreen">
        <div className="nft-modal-content">
          <div className="loading">Loading NFTs...</div>
        </div>
      </div>
    );
  }

  if (showMissionStatus) {
    return <MissionStatus onClose={() => setShowMissionStatus(false)} />;
  }

  return (
    <div className="nft-modal-fullscreen" style={showLoadingOverlay ? { filter: 'grayscale(1)', pointerEvents: 'none' } : {}}>
      {showLoadingOverlay && (
        <div className="nftmodal-loading-overlay">
          <div className="nftmodal-loading-spinner">
            <div className="spinner spinner-pink-slow"></div>
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="success-toast">Mission sent successfully!</div>
      )}
      <div className="nft-modal-content">
        <div className="mission-info-header">
          <h1 className="mission-title-nftmodal" style={{marginBottom: 10}}>{mission.name}</h1>
          <div className="mission-description-large" style={{marginTop: 10, marginBottom: 0, paddingTop: 0}}>{mission.description}</div>
          <div className="mission-stats-horizontal" style={{marginBottom: '11px'}}>
            <div className="stat stat-large">
              <span className="stat-icon stat-icon-large">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="16" stroke="#bfc2d1" strokeWidth="2.5"/><path d="M18 9.5V18L24 22" stroke="#bfc2d1" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </span>
              <span className="stat-text stat-text-large">{mission.duration_minutes ? formatDuration(mission.duration_minutes) : 'No disponible'}</span>
            </div>
            <div className="stat stat-large">
              <span className="stat-icon stat-icon-large">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="22" cy="22" r="18" fill="#ffe066" stroke="#ff00ff" strokeWidth="3"/>
                  <circle cx="22" cy="22" r="14" fill="#fffbe6" fillOpacity="0.7"/>
                  <path d="M22 30.4c-4.4-3.2-8-6.2-8-9.4a4 4 0 0 1 8-2.2A4 4 0 0 1 30 21c0 3.2-3.6 6.2-8 9.4z" fill="#ff00ff" stroke="#ff00ff" strokeWidth="1.2"/>
                </svg>
              </span>
              <span className="stat-text stat-text-large">{mission.reward_multiplier !== undefined ? formatNumber(mission.reward_multiplier, ' SEXY') : 'No disponible'}</span>
            </div>
            <div className="stat stat-large">
              <span className="stat-icon stat-icon-large">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="9" y="19" width="26" height="14" rx="4" fill="#ff00ff" fillOpacity="0.13" stroke="#ff00ff" strokeWidth="2.5"/>
                  <rect x="17" y="9" width="10" height="10" rx="3" fill="#ff00ff" fillOpacity="0.18" stroke="#ff00ff" strokeWidth="2"/>
                  <path d="M9 24H35" stroke="#ff00ff" strokeWidth="2"/>
                  <path d="M22 19V33" stroke="#ff00ff" strokeWidth="2"/>
                  <path d="M17 14C15 11 20 8 22 14" stroke="#ff00ff" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M27 14C29 11 24 8 22 14" stroke="#ff00ff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="stat-text stat-text-large stat-gift-chance">{mission.nft_drop_multiplier !== undefined ? formatNumber(mission.nft_drop_multiplier, '% Gift Chance') : 'No disponible'}</span>
            </div>
          </div>
          <div className="nftmodal-divider" />
        </div>
        {/* Botones superiores */}
        <div className="nftmodal-top-buttons-bar compact-width" style={{marginBottom: '6px'}}>
          <button className="btn-square btn-small btn-status-mission" onClick={() => setShowMissionStatus(true)}>Mission Status</button>
          <div className="nftmodal-top-center-btns">
            <span className={`selected-count-style selected-count-btn btn-small${selectedNFTs.length === MAX_SELECTED ? ' maxed' : ''}`}>Selected: {selectedNFTs.length}/{MAX_SELECTED}</span>
          </div>
          <button 
            className="btn-square btn-small send-btn-alt"
            onClick={sendMission}
            disabled={selectedNFTs.length === 0 || sending}>
            {sending ? 'Sending...' : `Send Bitchs !`}
          </button>
        </div>
        {filteredNFTs.length === 0 ? (
          <div className="no-nfts unified-width compact-width">
            <p>No NFTs found in your collection</p>
            <p>Make sure you own NFTs from the 'nightclubnft' collection with schema 'girls'</p>
          </div>
        ) : (
          <div className="nfts-grid unified-width compact-width">
            {filteredNFTs.slice(0, displayCount).map((nft) => {
              const isSelected = selectedNFTs.includes(nft.asset_id);
              const videoUrl = nft.data.video.startsWith('Qm')
                ? `https://ipfs.io/ipfs/${nft.data.video}`
                : nft.data.video;
              const cooldownEnd = cooldowns[nft.asset_id];
              const inCooldown = cooldownEnd && now < cooldownEnd;
              let cooldownLeft = '';
              if (inCooldown) {
                const diff = cooldownEnd - now;
                const h = Math.floor(diff / 3600);
                const m = Math.floor((diff % 3600) / 60) % 60;
                const s = diff % 60;
                cooldownLeft = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
              }
              return (
                <div 
                  key={nft.asset_id}
                  className={`nft-card${isSelected ? ' selected' : ''}`}
                  onClick={() => { if (!inCooldown) toggleNFTSelection(nft.asset_id); }}
                  style={{
                    minWidth: 139,
                    maxWidth: 139,
                    width: 139,
                    height: 236,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 18,
                    boxShadow: 'none',
                    overflow: 'hidden',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'border 0.32s cubic-bezier(0.4,0,0.2,1)',
                    zIndex: isSelected ? 99999 : 21,
                    cursor: inCooldown ? 'not-allowed' : 'pointer',
                  }}
                >
                  <video
                    src={videoUrl}
                    loop
                    muted
                    playsInline
                    autoPlay
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      background: 'black',
                      borderRadius: 18,
                      margin: 0,
                      padding: 0,
                      boxShadow: isSelected ? '0 0 18px 4px #ff36ba66' : 'none',
                      border: isSelected ? '4px solid #ff00ffcc' : 'none',
                      backgroundColor: 'black',
                      filter: inCooldown ? 'grayscale(1) blur(2.5px)' : 'none',
                      transform: 'none',
                      transition: 'box-shadow 0.32s cubic-bezier(0.4,0,0.2,1), border 0.32s cubic-bezier(0.4,0,0.2,1)',
                      zIndex: isSelected ? 99999 : 21,
                    }}
                    preload="none"
                    controls={false}
                    onError={e => {
                      console.error('Video error:', e);
                      e.target.style.display = 'none';
                    }}
                  />
                  {inCooldown && (
                    <div className="cooldown-overlay-minimal">
                      <span className="cooldown-text-minimal">{cooldownLeft}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* Botones inferiores */}
        <div className="nftmodal-bottom-buttons unified-width compact-width fixed-bottom-btns">
          <button className="btn-square btn-small btn-select-mission" onClick={onClose}>Select Mission</button>
          <button className="btn-square btn-small btn-cancel" onClick={() => {
            if (onForceCloseAll) onForceCloseAll();
            else if (onClose) onClose();
            history.push('/home');
          }}>Cancel</button>
          {filteredNFTs.length > displayCount ? (
            <button className="btn-square btn-small btn-load-more" onClick={() => setDisplayCount(displayCount + 5)}>
              Load More NFTs
            </button>
          ) : <button className="btn-square btn-small btn-load-more" disabled style={{opacity:0.5, cursor:'not-allowed'}}>Load More NFTs</button>}
        </div>
      </div>
      <style jsx>{`
        .nft-modal-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          background: hsl(245, 86.70%, 2.90%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          scrollbar-color: #ff00ff #181828;
          scrollbar-width: thin;
        }
        .nft-modal-content {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 12px;
        }
        .nfts-grid {
          display: flex;
          flex-direction: row;
          gap: 36px !important;
          overflow-x: auto;
          padding-bottom: 18px;
          margin-bottom: 0;
          margin-top: 22px;
          padding-top: 34px;
          scrollbar-color: #ff00ff #181828;
          scrollbar-width: thin;
          justify-content: center;
          width: 100vw;
          max-width: 1200px;
          padding-left: 32px;
          padding-right: 32px;
          margin-left: auto;
          margin-right: auto;
        }
        .nft-card {
          min-width: 139px;
          max-width: 139px;
          width: 139px;
          height: 236px;
          border: 1.2px solid #ff36ba99;
          border-radius: 18px;
          box-shadow: 0 0 14px 3px #ff36ba33, 0 0 0 1.2px #ff00ff33;
          background: transparent;
          overflow: hidden;
          padding: 0;
          margin: 0;
          display: flex;
          alignItems: center;
          justifyContent: center;
          position: relative;
          transition: box-shadow 0.32s cubic-bezier(0.4,0,0.2,1), border 0.32s cubic-bezier(0.4,0,0.2,1), transform 0.44s cubic-bezier(0.4,0,0.2,1);
          z-index: 21;
        }
        .nft-card.selected {
          border: 2px solid #ff36ba;
          box-shadow: 0 0 18px 4px #ff36ba66, 0 0 0 2.5px #ff00ff99 !important;
          background: linear-gradient(135deg, rgba(255,0,255,0.08) 0%, rgba(0,255,255,0.08) 100%) !important;
        }
        .nft-card:hover {
          box-shadow: 0 0 20px 0px rgba(255, 0, 255, 0.4);
          border: 1px solid rgba(255, 0, 255, 0.6);
          background: linear-gradient(45deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1));
          transform: translateY(-2px);
        }
        .mission-title-nftmodal {
          text-align: center;
          font-size: 38px;
          font-weight: 700;
          color: #ff6fff;
          margin-bottom: 10px;
          text-shadow: 0 0 12px #ff00ff99;
          letter-spacing: 2px;
        }
        .mission-description-large {
          font-size: 1.2rem;
          color: #bfc2d1;
          text-align: center;
          margin-bottom: 0px;
          margin-top: 10px;
          padding: 0 24px;
          line-height: 1.4;
          letter-spacing: 0.02em;
        }
        .mission-stats-horizontal {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: 24px;
          margin: 2px 0 6px 0;
        }
        .stat-large {
          font-size: 2.1rem;
          gap: 18px;
        }
        .stat-icon-large {
          font-size: 2.1rem;
          width: 44px;
          height: 44px;
        }
        .stat-text-large {
          font-size: 2.1rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.03em;
          text-shadow: 0 0 8px #ff00ff44;
        }
        .selected-count-style {
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
          white-space: nowrap;
        }
        .selected-count-btn {
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
        .selected-send-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          width: 100%;
          margin: 0 0 0 0;
          position: relative;
          top: -8px;
          min-height: 48px;
        }
        .selected-count-style.selected-count-btn.btn-small {
          margin: 0 auto 0 0;
          display: block;
          position: relative;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
        }
        .nftmodal-top-buttons-bar {
          width: 900px !important;
          max-width: 900px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 0;
          margin-bottom: 8px;
        }
        .nftmodal-top-center-btns {
          flex: 1;
          display: flex;
          justify-content: center;
        }
        .btn-status-mission {
          min-width: 140px;
        }
        .nftmodal-bottom-buttons {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 32px;
          gap: 32px;
          z-index: 10001;
        }
        .btn-square {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          background: rgba(0,255,255,0.10);
          border: 2px solid #00ffff;
          border-radius: 12px;
          padding: 6px 20px;
          box-shadow: none;
          text-shadow: none;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          margin: 0 8px;
          white-space: nowrap;
        }
        .btn-square:hover {
          background: rgba(255,0,255,0.13);
          border-color: #ff00ff;
          color: #fff;
          box-shadow: none;
        }
        .unified-width {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nfts-grid.unified-width.compact-width {
          gap: 10px;
          justify-content: space-between;
          margin-top: 0 !important;
        }
        .compact-width {
          width: 900px !important;
          max-width: 900px !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        .fixed-bottom-btns {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 32px;
          gap: 32px;
          z-index: 10001;
          width: 900px !important;
          max-width: 900px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
        .nftmodal-divider {
          width: 900px;
          max-width: 900px;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,0,255,0.12) 0%, rgba(0,255,255,0.12) 100%);
          margin: 11px auto 11px auto;
          border-radius: 2px;
        }
        .selected-count-style.selected-count-btn.btn-small.maxed {
          border-color: #ff36ba !important;
          color: #ff36ba !important;
          background: rgba(255,0,255,0.10) !important;
          box-shadow: 0 0 8px 2px #ff36ba55 !important;
        }
        .nft-modal-fullscreen::-webkit-scrollbar {
          width: 8px;
          background: #181828;
        }
        .nft-modal-fullscreen::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ff00ff 0%, #00ffff 100%);
          border-radius: 8px;
        }
        .nft-modal-fullscreen::-webkit-scrollbar-track {
          background: #181828;
        }
        .nftmodal-loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, rgba(40,40,50,0.82) 0%, rgba(80,80,90,0.72) 100%);
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        .nftmodal-loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .spinner {
          width: 64px;
          height: 64px;
          border: 6px solid #ff36ba44;
          border-top: 6px solid #ff00ff;
          border-radius: 50%;
          animation: spin 1.1s linear infinite;
          margin-bottom: 18px;
          box-shadow: 0 0 24px 4px #ff36ba55;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner-pink-slow {
          border: 6px solid #ff36ba33;
          border-top: 6px solid #ff36ba;
          border-right: 6px solid #b266ff;
          border-radius: 50%;
          animation: spin 2.2s cubic-bezier(0.4,0,0.2,1) infinite;
          width: 64px;
          height: 64px;
          margin-bottom: 18px;
          box-shadow: 0 0 24px 4px #ff36ba55;
        }
        .cooldown-overlay-minimal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(24, 24, 40, 0.38);
          border-radius: 10px;
          padding: 4px 18px;
          z-index: 120;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .cooldown-text-minimal {
          color: #bfc2d1;
          font-size: 0.98rem;
          font-weight: 400;
          letter-spacing: 1.2px;
          opacity: 0.85;
          text-shadow: 0 1px 4px #000a;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          padding: 0;
          margin: 0;
        }
        @media (max-width: 900px) and (orientation: landscape) {
          .mission-info-header {
            margin-bottom: 0 !important;
          }
          .nftmodal-divider {
            margin-top: 0 !important;
            margin-bottom: 4px !important;
          }
          .nftmodal-top-buttons-bar {
            margin-top: 0 !important;
          }
          .mission-title-nftmodal {
            font-size: 26.6px !important;
            margin-bottom: 0px !important;
            line-height: 1.05 !important;
            padding-bottom: 0 !important;
          }
          .mission-description-large {
            font-size: 0.84rem !important;
            margin-top: 0px !important;
            margin-bottom: 0px !important;
            padding: 0 8px !important;
            line-height: 1.10 !important;
          }
          .mission-stats-horizontal {
            font-size: 1.1rem !important;
            gap: 2px !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .nft-modal-content {
            padding-top: 0 !important;
            margin-top: 5px !important;
          }
          .nfts-grid {
            gap: 15.2px !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            margin-top: -24px !important;
            max-width: 100vw !important;
            width: 100vw !important;
            min-width: 100vw !important;
            justify-content: flex-start !important;
            display: flex !important;
          }
          .nft-card {
            min-width: 92.09px !important;
            max-width: 92.09px !important;
            width: 92.09px !important;
            height: 157.87px !important;
          }
          .nftmodal-top-buttons-bar {
            width: 100vw !important;
            max-width: 100vw !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .fixed-bottom-btns {
            width: 100vw !important;
            max-width: 100vw !important;
            gap: 25.6px !important;
          }
          .nftmodal-divider {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }
          .unified-width {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }
          .compact-width {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }
          .nfts-grid {
            margin-top: -50px !important;
            padding-top: 9px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NFTModal;