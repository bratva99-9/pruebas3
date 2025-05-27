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
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h} hours`;
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <button onClick={() => setIsOpen(true)} disabled={!wallet}>🚀 Send to Mission</button>
      </div>

      {isOpen && (
        <div>
          <div>
            <h2>{step === 1 ? "🎯 Select a Mission" : "👥 Select your NFTs"}</h2>
            <button onClick={handleClose}>×</button>
          </div>

          <div>
            {message && <div>{message}</div>}

            {step === 1 && (
              loading ? <div>Loading missions...</div> : (
                <div>
                  {missions.map(m => (
                    <div key={m.id} onClick={() => handleMissionSelect(m)}>
                      <h3>{m.name}</h3>
                      <p>{m.description}</p>
                      <div>
                        <span>⏱️ {formatDuration(m.duration_minutes)}</span>
                        <span>💰 x{m.reward_multiplier}</span>
                        {m.nft_drop_multiplier > 0 && <span>🎁 x{m.nft_drop_multiplier}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {step === 2 && selectedMission && (
              <>
                <div>
                  <h4>Selected mission: {selectedMission.name}</h4>
                  <button onClick={() => { setStep(1); setSelectedNFTs([]); }}>Change mission</button>
                </div>

                {loading ? <div>Loading your NFTs...</div> : (
                  nfts.length === 0 ? <div>No NFTs available</div> : (
                    <div>
                      {nfts.map(nft => {
                        const data = nft.data || {};
                        const allStrings = Object.values(data).filter(v => typeof v === "string");
                        const videoField = allStrings.find(u => /\.(mp4|webm|ogg)$/i.test(u));
                        const ipfsField = allStrings.find(u => /^Qm/.test(u) || u.startsWith("ipfs://"));
                        const raw = videoField || ipfsField || "";
                        const src = ipfsify(raw);
                        const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
                        const isSelected = selectedNFTs.includes(nft.asset_id);

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
                    </div>
                  )
                )}
              </>
            )}
          </div>

          {step === 2 && !loading && nfts.length > 0 && (
            <div>
              <div>{selectedNFTs.length} NFT(s) selected</div>
              <button onClick={handleSendToMission} disabled={!selectedNFTs.length || sending}>
                {sending ? "Sending..." : "Send to Mission"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
