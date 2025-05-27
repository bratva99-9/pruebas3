import React, { useEffect, useState } from "react";
import { UserService } from "../UserService";

const COLLECTION = "nightclubnft";
const MISSION_TYPES = [
  { id: 1, label: "Recon Club" },
  { id: 2, label: "Escort VIP" },
  { id: 3, label: "Photoshoot" },
  { id: 4, label: "After Party" },
  { id: 5, label: "Challenge Semanal" }
];

export default function MissionsModal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const wallet = UserService.isLogged() ? UserService.getName() : null;

  // Convierte hash de IPFS o URI a URL válida
  const resolveIpfs = (hashOrUrl) => {
    if (!hashOrUrl) return null;
    if (hashOrUrl.startsWith("http")) return hashOrUrl;
    const cleaned = hashOrUrl.replace(/^ipfs:\/\//, "");
    return `https://ipfs.io/ipfs/${cleaned}`;
  };

  // Carga cartas del esquema 'girls' cuando se elige misión
  useEffect(() => {
    if (!modalOpen || !wallet || !selectedMission) return;

    const fetchNFTs = async () => {
      setMensaje("Cargando cartas...");
      setLoading(true);
      try {
        const response = await fetch(
          `https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=${COLLECTION}&owner=${wallet}&schema_name=girls&limit=100`
        );
        const json = await response.json();
        console.log("NFT data api:", json.data);
        setNfts(Array.isArray(json.data) ? json.data : []);
        setMensaje("");
      } catch (e) {
        console.error(e);
        setMensaje("Error cargando cartas.");
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [modalOpen, wallet, selectedMission]);

  // Selección de hasta 5 cartas
  const toggleSelect = (assetId) => {
    if (loading) return;
    if (selected.includes(assetId)) {
      setSelected(prev => prev.filter(id => id !== assetId));
      setMensaje("");
    } else {
      if (selected.length >= 5) {
        setMensaje("Máximo 5 cartas por envío.");
        return;
      }
      setSelected(prev => [...prev, assetId]);
      setMensaje("");
    }
  };

  // Envía staking con memo de misión
  const handleStake = async () => {
    if (!wallet || !selectedMission || selected.length === 0) return;
    setMensaje("Firmando misión...");
    setLoading(true);
    try {
      const memo = `mission:${selectedMission}`;
      console.log("Staking NFTs:", selected, "memo:", memo);
      await UserService.stakeNFTs(selected, memo);
      setMensaje("¡Misión enviada con éxito!");
      setSelected([]);
      setSelectedMission(null);
      setTimeout(() => setModalOpen(false), 1700);
    } catch (e) {
      console.error(e);
      setMensaje("Error al enviar: " + (e.message || e));
    }
    setLoading(false);
  };

  return (
    <>
      <div style={{ textAlign: 'center', margin: '42px 0' }}>
        <button
          onClick={() => setModalOpen(true)}
          disabled={!wallet}
          style={{
            background: 'linear-gradient(90deg,#a259ff 30%,#ff36ba 100%)',
            color: '#fff', padding: '12px 38px', border: 'none',
            borderRadius: 14, fontWeight: 'bold', fontSize: 18,
            cursor: wallet ? 'pointer' : 'not-allowed', opacity: wallet ? 1 : 0.6
          }}
        >
          Misiones
        </button>
      </div>

      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99,
          background: 'rgba(19,15,24,0.96)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#201b2c', borderRadius: 24, maxWidth: 700,
            width: '95vw', padding: 32, position: 'relative'
          }}>
            <button
              onClick={() => {
                setModalOpen(false);
                setSelected([]);
                setSelectedMission(null);
                setMensaje("");
              }}
              style={{
                position: 'absolute', top: 16, right: 20,
                fontSize: 33, color: '#cfc', background: 'none',
                border: 'none', cursor: 'pointer'
              }}
              disabled={loading}
            >&times;</button>

            {/* Selección de misión */}
            {!selectedMission ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {MISSION_TYPES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMission(m.id)}
                    style={{
                      flex: '1 1 calc(40% - 24px)', padding: '14px 20px',
                      borderRadius: 12, border: '2px solid #433f58',
                      color: '#fff', background: '#1c1932',
                      fontSize: 16, fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16, color: '#c8a0f5', fontWeight: 600 }}>
                  Misión: <span style={{ color: '#fff' }}>
                    {MISSION_TYPES.find(m => m.id === selectedMission)?.label}
                  </span>
                </div>

                {mensaje && (
                  <div style={{
                    background: '#3b2548', color: '#fff', borderRadius: 9,
                    padding: '10px 18px', margin: '10px 0 16px', textAlign: 'center'
                  }}>{mensaje}</div>
                )}

                {/* Grid de cartas */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))',
                  gap: 16
                }}>
                  {loading ? (
                    <div style={{ color: '#fff' }}>Cargando...</div>
                  ) : nfts.length === 0 ? (
                    <div style={{ color: '#eee' }}>No tienes cartas.</div>
                  ) : nfts.map(nft => {
                    // Determina URL del media
                    const mediaHash = nft.data.video || nft.data.img || nft.data.image;
                    const mediaUrl = resolveIpfs(mediaHash);
                    if (!mediaUrl) return null;

                    return (
                      <div
                        key={nft.asset_id}
                        onClick={() => toggleSelect(nft.asset_id)}
                        style={{
                          border: selected.includes(nft.asset_id)
                            ? '3px solid #ff36ba' : '2px solid #252241',
                          borderRadius: 20, overflow: 'hidden', cursor: 'pointer'
                        }}
                      >
                        <video
                          src={mediaUrl}
                          autoPlay muted loop playsInline
                          style={{ width: '100%', height: 'auto' }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Botón enviar misión */}
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <button
                    onClick={handleStake}
                    disabled={selected.length === 0 || loading}
                    style={{
                      background: 'linear-gradient(90deg,#a259ff 30%,#ff36ba 100%)',
                      color: '#fff', padding: '12px 32px', border: 'none',
                      borderRadius: 10, fontWeight: 'bold', fontSize: 17,
                      cursor: selected.length > 0 && !loading ? 'pointer' : 'not-allowed',
                      opacity: selected.length > 0 && !loading ? 1 : 0.65
                    }}
                  >
                    Enviar a misión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
