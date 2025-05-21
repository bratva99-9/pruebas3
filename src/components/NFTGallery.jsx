import React, { useEffect, useState } from "react";
import { UserService } from "../UserService";

const COLLECTION = "nightclubnft";
const STAKE_SCHEMAS = ["girls", "photos"];

const NFTGallery = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      setNfts([]);
      if (!UserService.authName) {
        setLoading(false);
        return;
      }

      try {
        const queries = STAKE_SCHEMAS.map((schema) =>
          fetch(
            `https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${UserService.authName}&collection_name=${COLLECTION}&schema_name=${schema}&limit=100`
          ).then((res) => res.json())
        );
        const results = await Promise.all(queries);
        const data = results.flatMap((r) => (Array.isArray(r.data) ? r.data : []));
        setNfts(data);
      } catch (err) {
        console.error("Error al obtener NFTs:", err);
        setNfts([]);
      }

      setLoading(false);
    };

    fetchNFTs();
  }, [UserService.authName]);

  const toggleSelect = (asset_id) => {
    setSelected((prev) =>
      prev.includes(asset_id) ? prev.filter((id) => id !== asset_id) : [...prev, asset_id]
    );
  };

  const stakeSelectedNFTs = async () => {
    if (!UserService.session) return alert("Debes iniciar sesión.");
    if (selected.length === 0) return alert("Selecciona al menos un NFT.");
    setMsg("Firmando transacción...");
    try {
      await UserService.stakeNFTs(selected);
      setMsg("¡NFTs stakeados exitosamente!");
      setSelected([]);
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("Error: " + (err.message || err));
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>NFT Gallery</h2>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={stakeSelectedNFTs}
          disabled={selected.length === 0}
        >
          Stake NFTs seleccionados
        </button>
        <button
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            marginLeft: 16
          }}
          onClick={async () => {
            try {
              await UserService.claimRewards();
              alert("¡Recompensas reclamadas!");
            } catch (err) {
              alert("Error al reclamar: " + (err.message || err));
            }
          }}
        >
          Claim
        </button>
        <button
          style={{
            background: "#e11d48",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            marginLeft: 16
          }}
          onClick={async () => {
            if (!UserService.authName) return alert("Conéctate primero.");
            const rpc = new (require('eosjs')).JsonRpc("https://wax.greymass.com");
            try {
              const response = await rpc.get_table_rows({
                json: true,
                code: 'nightclubapp',
                scope: 'nightclubapp',
                table: 'staked',
                lower_bound: UserService.authName,
                upper_bound: UserService.authName,
                limit: 1
              });
              if (response.rows.length === 0) return alert("No tienes NFTs en staking.");
              const assetIds = response.rows[0].asset_ids;
              const confirm = window.confirm(`¿Deseas hacer unstake de ${assetIds.length} NFTs?`);
              if (!confirm) return;
              await UserService.unstakeNFTs(assetIds);
              alert("Unstake completado.");
            } catch (err) {
              alert("Error al hacer unstake: " + (err.message || err));
            }
          }}
        >
          Unstake NFTs
        </button>
      </div>

      {msg && <div>{msg}</div>}

      {loading ? (
        <div>Cargando NFTs...</div>
      ) : nfts.length === 0 ? (
        <div>No tienes NFTs disponibles.</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {nfts.map((nft) => {
            const mediaUrl = nft.data?.img
              ? `https://ipfs.io/ipfs/${nft.data.img}`
              : "";
            return (
              <div
                key={nft.asset_id}
                style={{
                  border: selected.includes(nft.asset_id)
                    ? "2px solid blue"
                    : "1px solid gray",
                  padding: 10,
                  cursor: "pointer",
                }}
                onClick={() => toggleSelect(nft.asset_id)}
              >
                <img src={mediaUrl} alt="NFT" width={150} />
                <div>{nft.name}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NFTGallery;
