import React, { useState, useEffect, useCallback } from "react";
import { UserService } from "../UserService";
import { JsonRpc } from "eosjs";

const rpc = new JsonRpc("https://wax.greymass.com");

export default function MissionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [step, setStep] = useState(1); // 1: Select Mission, 2: Select NFTs
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const wallet = UserService.isLogged() ? UserService.getName() : null;

  // Fetch missions from blockchain
  const fetchMissions = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await rpc.get_table_rows({
        json: true,
        code: "nightclubapp",
        scope: "nightclubapp",
        table: "missiontypes",
        limit: 100
      });
      
      // Filter only active missions
      const activeMissions = response.rows.filter(m => m.is_active === 1);
      setMissions(activeMissions);
      
      if (activeMissions.length === 0) {
        setMessage("No hay misiones activas en este momento");
      }
    } catch (error) {
      console.error("Error fetching missions:", error);
      setMessage("Error al cargar las misiones");
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's NFTs (girls schema only)
  const fetchUserNFTs = useCallback(async () => {
    if (!wallet) return;
    
    setLoading(true);
    setMessage("Cargando tus NFTs...");
    
    try {
      const response = await fetch(
        `https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${wallet}&collection_name=nightclubnft&schema_name=girls&limit=100`
      );
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        setNfts(data.data);
        setMessage("");
      } else {
        setNfts([]);
        setMessage("No tienes NFTs disponibles para enviar a misión");
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setMessage("Error al cargar tus NFTs");
      setNfts([]);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  // Load missions when modal opens
  useEffect(() => {
    if (isOpen && step === 1) {
      fetchMissions();
    } else if (isOpen && step === 2 && selectedMission) {
      fetchUserNFTs();
    }
  }, [isOpen, step, selectedMission, fetchMissions, fetchUserNFTs]);

  // Handle mission selection
  const handleMissionSelect = (mission) => {
    setSelectedMission(mission);
    setStep(2);
  };

  // Toggle NFT selection
  const toggleNFTSelection = (assetId) => {
    setSelectedNFTs(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  // Send NFTs to mission
  const handleSendToMission = async () => {
    if (!selectedMission || selectedNFTs.length === 0) return;
    
    setSending(true);
    setMessage("Enviando NFTs a misión...");
    
    try {
      // Use the existing stakeNFTs method with mission memo
      const memo = `mission:${selectedMission.id}`;
      await UserService.stakeNFTs(selectedNFTs, memo);
      
      setMessage("¡NFTs enviados a misión exitosamente!");
      
      // Close modal after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error sending to mission:", error);
      setMessage(`Error: ${error.message || "No se pudo enviar a misión"}`);
    } finally {
      setSending(false);
    }
  };

  // Close modal and reset state
  const handleClose = () => {
    setIsOpen(false);
    setStep(1);
    setSelectedMission(null);
    setSelectedNFTs([]);
    setMessage("");
    setNfts([]);
  };

  // Format duration for display
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} horas`;
  };

  return (
    <>
      {/* Main Button */}
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
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
            transition: "all 0.3s ease",
            transform: "translateY(0)"
          }}
          onMouseEnter={(e) => wallet && (e.target.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => wallet && (e.target.style.transform = "translateY(0)")}
        >
          🚀 Enviar a Misión
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          backdropFilter: "blur(5px)",
          animation: "fadeIn 0.3s ease-out"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1e1e2e 0%, #2d1b69 100%)",
            borderRadius: 24,
            width: "90%",
            maxWidth: 800,
            maxHeight: "85vh",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            animation: "slideIn 0.3s ease-out"
          }}>
            {/* Header */}
            <div style={{
              padding: "24px 32px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(0, 0, 0, 0.2)"
            }}>
              <h2 style={{
                margin: 0,
                color: "#fff",
                fontSize: 24,
                fontWeight: "bold"
              }}>
                {step === 1 ? "🎯 Selecciona una Misión" : "👥 Selecciona tus NFTs"}
              </h2>
              <button
                onClick={handleClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: 28,
                  cursor: "pointer",
                  opacity: 0.7,
                  transition: "opacity 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.opacity = 1}
                onMouseLeave={(e) => e.target.style.opacity = 0.7}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{
              padding: "24px 32px",
              overflowY: "auto",
              maxHeight: "calc(85vh - 180px)"
            }}>
              {/* Message */}
              {message && (
                <div style={{
                  background: message.includes("Error") ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                  border: `1px solid ${message.includes("Error") ? "#ef4444" : "#10b981"}`,
                  borderRadius: 12,
                  padding: "12px 20px",
                  marginBottom: 20,
                  color: "#fff",
                  textAlign: "center"
                }}>
                  {message}
                </div>
              )}

              {/* Step 1: Mission Selection */}
              {step === 1 && (
                <>
                  {loading ? (
                    <div style={{ textAlign: "center", color: "#fff", padding: 40 }}>
                      <div style={{
                        width: 50,
                        height: 50,
                        border: "3px solid rgba(255, 255, 255, 0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        margin: "0 auto 20px",
                        animation: "spin 1s linear infinite"
                      }} />
                      Cargando misiones...
                    </div>
                  ) : (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: 20
                    }}>
                      {missions.map((mission) => (
                        <div
                          key={mission.id}
                          onClick={() => handleMissionSelect(mission)}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: 16,
                            padding: 20,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            transform: "scale(1)"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                            e.currentTarget.style.transform = "scale(1.02)";
                            e.currentTarget.style.borderColor = "#667eea";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                          }}
                        >
                          <h3 style={{ color: "#667eea", margin: "0 0 10px 0" }}>
                            {mission.name}
                          </h3>
                          <p style={{ color: "#ccc", fontSize: 14, margin: "0 0 15px 0" }}>
                            {mission.description}
                          </p>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: "#10b981" }}>
                              ⏱️ {formatDuration(mission.duration_minutes)}
                            </span>
                            <span style={{ color: "#f59e0b" }}>
                              💰 x{mission.reward_multiplier} rewards
                            </span>
                            {mission.nft_drop_multiplier > 0 && (
                              <span style={{ color: "#ec4899" }}>
                                🎁 x{mission.nft_drop_multiplier} drops
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Step 2: NFT Selection */}
              {step === 2 && selectedMission && (
                <>
                  {/* Selected Mission Info */}
                  <div style={{
                    background: "rgba(102, 126, 234, 0.2)",
                    border: "1px solid #667eea",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 20
                  }}>
                    <h4 style={{ color: "#fff", margin: "0 0 8px 0" }}>
                      Misión seleccionada: {selectedMission.name}
                    </h4>
                    <button
                      onClick={() => {
                        setStep(1);
                        setSelectedNFTs([]);
                      }}
                      style={{
                        background: "transparent",
                        border: "1px solid #667eea",
                        color: "#667eea",
                        padding: "6px 16px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 14
                      }}
                    >
                      Cambiar misión
                    </button>
                  </div>

                  {/* NFT Grid */}
                  {loading ? (
                    <div style={{ textAlign: "center", color: "#fff", padding: 40 }}>
                      Cargando tus NFTs...
                    </div>
                  ) : nfts.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#ccc", padding: 40 }}>
                      No tienes NFTs disponibles para enviar a misión
                    </div>
                  ) : (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: 16
                    }}>
                      {nfts.map((nft) => {
                        const isSelected = selectedNFTs.includes(nft.asset_id);
                        const mediaUrl = nft.data?.video || nft.data?.img || "";
                        const ipfsUrl = mediaUrl.startsWith("Qm") 
                          ? `https://ipfs.io/ipfs/${mediaUrl}` 
                          : mediaUrl;
                        
                        return (
                          <div
                            key={nft.asset_id}
                            onClick={() => toggleNFTSelection(nft.asset_id)}
                            style={{
                              position: "relative",
                              borderRadius: 12,
                              overflow: "hidden",
                              cursor: "pointer",
                              border: isSelected ? "3px solid #667eea" : "3px solid transparent",
                              transition: "all 0.3s ease",
                              transform: isSelected ? "scale(0.95)" : "scale(1)"
                            }}
                          >
                            {mediaUrl.includes("video") || mediaUrl.endsWith(".mp4") ? (
                              <video
                                src={ipfsUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                style={{
                                  width: "100%",
                                  height: 180,
                                  objectFit: "cover",
                                  display: "block"
                                }}
                              />
                            ) : (
                              <img
                                src={ipfsUrl}
                                alt={nft.name}
                                style={{
                                  width: "100%",
                                  height: 180,
                                  objectFit: "cover",
                                  display: "block"
                                }}
                              />
                            )}
                            
                            {/* Selection overlay */}
                            {isSelected && (
                              <div style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(102, 126, 234, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}>
                                <div style={{
                                  background: "#667eea",
                                  borderRadius: "50%",
                                  width: 40,
                                  height: 40,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#fff",
                                  fontSize: 20
                                }}>
                                  ✓
                                </div>
                              </div>
                            )}
                            
                            {/* NFT Name */}
                            <div style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: "rgba(0, 0, 0, 0.7)",
                              color: "#fff",
                              padding: "4px 8px",
                              fontSize: 12,
                              textAlign: "center"
                            }}>
                              {nft.name || `#${nft.template_mint}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Actions */}
            {step === 2 && !loading && nfts.length > 0 && (
              <div style={{
                padding: "20px 32px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(0, 0, 0, 0.2)"
              }}>
                <div style={{ color: "#ccc" }}>
                  {selectedNFTs.length} NFT{selectedNFTs.length !== 1 ? 's' : ''} seleccionado{selectedNFTs.length !== 1 ? 's' : ''}
                </div>
                <button
                  onClick={handleSendToMission}
                  disabled={selectedNFTs.length === 0 || sending}
                  style={{
                    background: selectedNFTs.length > 0 
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "#444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "12px 28px",
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: selectedNFTs.length > 0 && !sending ? "pointer" : "not-allowed",
                    opacity: selectedNFTs.length > 0 && !sending ? 1 : 0.5,
                    transition: "all 0.3s ease"
                  }}
                >
                  {sending ? "Enviando..." : "Enviar a Misión"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}