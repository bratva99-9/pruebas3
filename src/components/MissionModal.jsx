import React, { useState, useEffect, useCallback } from "react";
import { UserService } from "../UserService";

// Convierte IPFS URI o hash en URL pública
const ipfsify = (url) => {
  if (!url) return "";
  if (url.startsWith("ipfs://")) return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  if (/^Qm/.test(url)) return `https://ipfs.io/ipfs/${url}`;
  return url;
};

export default function MissionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const wallet = UserService.isLogged() ? UserService.getName() : null;

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const missionTypes = await UserService.getMissionTypes();
      const activeMissions = missionTypes.filter(m => m.is_active === 1);
      setMissions(activeMissions);
      if (!activeMissions.length) setMessage("No active missions at this time");
    } catch {
      setMessage("Error loading missions");
    } finally { setLoading(false); }
  }, []);

  const fetchUserNFTs = useCallback(async () => {
    if (!wallet) return;
    setLoading(true);
    setMessage("Loading your NFTs...");
    try {
      const res = await fetch(
        `https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${wallet}&collection_name=nightclubnft&schema_name=girls&limit=100`
      );
      const data = await res.json();
      if (data.data?.length) {
        setNfts(data.data);
        setMessage("");
      } else {
        setNfts([]);
        setMessage("You don't have any NFTs available for missions");
      }
    } catch {
      setNfts([]);
      setMessage("Error loading your NFTs");
    } finally { setLoading(false); }
  }, [wallet]);

  useEffect(() => {
    if (isOpen && step === 1) fetchMissions();
    if (isOpen && step === 2) fetchUserNFTs();
  }, [isOpen, step, fetchMissions, fetchUserNFTs]);

  const handleMissionSelect = (mission) => {
    setSelectedMission(mission);
    setStep(2);
  };

  const toggleNFTSelection = (assetId) => {
    setSelectedNFTs(prev =>
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };

  const handleSendToMission = async () => {
    if (!selectedMission || !selectedNFTs.length) return;
    setSending(true);
    setMessage("Sending NFTs to mission...");
    try {
      const memo = `mission:${selectedMission.id}`;
      await UserService.stakeNFTs(selectedNFTs, memo);
      setMessage("NFTs successfully sent to mission!");
      await UserService.reloadBalances();
      setTimeout(handleClose, 2000);
    } catch (e) {
      setMessage(`Error: ${e.message || "Could not send to mission"}`);
    } finally { setSending(false); }
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep(1);
    setSelectedMission(null);
    setSelectedNFTs([]);
    setMessage("");
    setNfts([]);
  };

  const formatDuration = (mins) => {
    if (mins < 60) return `${mins} minutes`;
    const h = Math.floor(mins/60), m = mins%60;
    return m>0? `${h}h ${m}m` : `${h} hours`;
  };

  return (
    <>
      {/* Botón principal */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <button
          onClick={() => setIsOpen(true)}
          disabled={!wallet}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 16,
            padding: "14px 32px",
            fontSize: 18,
            fontWeight: "bold",
            cursor: wallet ? "pointer" : "not-allowed",
            opacity: wallet ? 1 : 0.6,
            boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
            transition: "all 0.3s"
          }}
        >
          🚀 Send to Mission
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, backdropFilter: "blur(5px)"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1e1e2e 0%, #2d1b69 100%)",
            borderRadius: 24, width: "90%", maxWidth: 900, maxHeight: "90vh",
            overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
          }}>
            {/* Header */}
            <div style={{
              padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(0,0,0,0.2)"
            }}>
              <h2 style={{ margin:0, color:"#fff", fontSize:24, fontWeight:"bold" }}>
                {step===1? "🎯 Select a Mission" : "👥 Select your NFTs"}
              </h2>
              <button onClick={handleClose} style={{
                background:"transparent", border:"none", color:"#fff",
                fontSize:28, cursor:"pointer", opacity:0.7
              }}>×</button>
            </div>

            {/* Content */}
            <div style={{
              padding:"24px 32px", overflowY:"auto", maxHeight:"calc(90vh - 180px)"
            }}>
              {message && (
                <div style={{
                  background: message.includes("Error") ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)",
                  border: `1px solid ${message.includes("Error")? "#ef4444" : "#10b981"}`,
                  borderRadius:12, padding:"12px 20px", marginBottom:20,
                  color:"#fff", textAlign:"center"
                }}>
                  {message}
                </div>
              )}

              {/* Step 1 */}
              {step===1 && (
                loading
                  ? <div style={{textAlign:"center", color:"#fff", padding:40}}>Loading missions...</div>
                  : <div style={{
                      display:"grid",
                      gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))",
                      gap:20
                    }}>
                      {missions.map(m => (
                        <div key={m.id} onClick={()=>handleMissionSelect(m)} style={{
                          background:"rgba(255,255,255,0.05)",
                          border:"1px solid rgba(255,255,255,0.1)",
                          borderRadius:16, padding:20, cursor:"pointer",
                          transition:"all .3s"
                        }}>
                          <h3 style={{color:"#667eea", margin:"0 0 10px"}}>{m.name}</h3>
                          <p style={{color:"#ccc", fontSize:14, margin:"0 0 15px"}}>{m.description}</p>
                          <div style={{display:"flex", justifyContent:"space-between", fontSize:13}}>
                            <span style={{color:"#10b981"}}>⏱️ {formatDuration(m.duration_minutes)}</span>
                            <span style={{color:"#f59e0b"}}>💰 x{m.reward_multiplier}</span>
                            {m.nft_drop_multiplier>0 && <span style={{color:"#ec4899"}}>🎁 x{m.nft_drop_multiplier}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
              )}

              {/* Step 2 */}
              {step===2 && selectedMission && (
                <>
                  <div style={{
                    background:"rgba(102,126,234,0.2)",
                    border:"1px solid #667eea", borderRadius:12,
                    padding:16, marginBottom:20
                  }}>
                    <h4 style={{color:"#fff", margin:"0 0 8px"}}>
                      Selected mission: {selectedMission.name}
                    </h4>
                    <button onClick={()=>{ setStep(1); setSelectedNFTs([]); }} style={{
                      background:"transparent", border:"1px solid #667eea",
                      color:"#667eea", padding:"6px 16px", borderRadius:8,
                      cursor:"pointer", fontSize:14
                    }}>
                      Change mission
                    </button>
                  </div>

                  {loading
                    ? <div style={{textAlign:"center", color:"#fff", padding:40}}>Loading your NFTs...</div>
                    : nfts.length===0
                      ? <div style={{textAlign:"center", color:"#ccc", padding:40}}>You don't have any NFTs available for missions</div>
                      : <div style={{
                          display:"grid",
                          gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",
                          gap:20, padding:"10px 0"
                        }}>
                          {nfts.map(nft => {
  const mediaArr = nft.data?.media || [];
  const videoFromMedia = mediaArr.find(m => m.type?.includes("video") && m.url)?.url;

  const candidates = [
    videoFromMedia,
    nft.data.video,
    nft.data.video_url,
    nft.data.img,
    nft.data.image
  ];

  const raw = candidates.find(u => typeof u === "string" && u.length > 5) || "";
  const src = ipfsify(raw);
  const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
  const isSelected = selectedNFTs.includes(nft.asset_id); // <- ESTA línea es obligatoria aquí

  return (
    <div key={nft.asset_id} onClick={() => toggleNFTSelection(nft.asset_id)}>
      <div>
        {isVideo ? (
          <video src={src} controls autoPlay muted loop playsInline />
        ) : (
          <img src={src} alt={nft.name} />
        )}
        {isSelected && <div>✓</div>}
      </div>
    </div>
  );
})}

                  }
                </>
              )}
            </div>

            {/* Footer */}
            {step===2 && !loading && nfts.length>0 && (
              <div style={{
                padding:"20px 32px", borderTop:"1px solid rgba(255,255,255,0.1)",
                display:"flex", justifyContent:"space-between", alignItems:"center",
                background:"rgba(0,0,0,0.2)"
              }}>
                <div style={{color:"#ccc"}}>
                  {selectedNFTs.length} NFT{selectedNFTs.length!==1?'s':''} selected
                </div>
                <button
                  onClick={handleSendToMission}
                  disabled={!selectedNFTs.length || sending}
                  style={{
                    background: selectedNFTs.length
                      ? "linear-gradient(135deg,#667eea 0%,#764ba2 100%)"
                      : "#444",
                    color:"#fff", border:"none", borderRadius:12,
                    padding:"12px 28px", fontSize:16, fontWeight:"bold",
                    cursor: selectedNFTs.length && !sending ? "pointer" : "not-allowed",
                    opacity: selectedNFTs.length && !sending ? 1 : 0.5,
                    transition:"all .3s"
                  }}
                >
                  {sending ? "Sending..." : "Send to Mission"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn { from {opacity:0;} to{opacity:1;} }
        @keyframes slideIn { from{transform: translateY(20px);opacity:0;} to{transform:translateY(0);opacity:1;} }
        @keyframes spin { to{transform:rotate(360deg);} }
      `}</style>
    </>
  );
}
