import React, { useEffect, useState } from "react";
import { UserService } from "../UserService";
import { JsonRpc } from "eosjs";

const COLLECTION = "nightclubnft";
const STAKE_SCHEMAS = ["girls", "photos"];
const CONTRACT_ACCOUNT = "nightclubapp";
const RPC_ENDPOINT = "https://wax.greymass.com";

const rpc = new JsonRpc(RPC_ENDPOINT);

const NFTGallery = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
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
        if (isUnstaking) {
          const stakedData = await rpc.get_table_rows({
            json: true,
            code: CONTRACT_ACCOUNT,
            scope: CONTRACT_ACCOUNT,
            table: "staked",
            lower_bound: UserService.authName,
            upper_bound: UserService.authName,
            limit: 1,
          });

          if (stakedData.rows.length > 0) {
            const assetIds = stakedData.rows[0].asset_ids;
            const assetDetailsPromises = assetIds.map((id) =>
              fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets/${id}`).then((res) => res.json())
            );
            const assetsData = await Promise.all(assetDetailsPromises);
            const assets = assetsData.map((res) => res.data);
            setNfts(assets);
          } else {
            setNfts([]);
          }
        } else {
          const queries = STAKE_SCHEMAS.map((schema) =>
            fetch(
              `https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${UserService.authName}&collection_name=${COLLECTION}&schema_name=${schema}&limit=100`
            ).then((res) => res.json())
          );
          const results = await Promise.all(queries);
          const data = results.flatMap((r) => (Array.isArray(r.data) ? r.data : []));
          setNfts(data);
        }
      } catch (err) {
        console.error("Error al obtener NFTs:", err);
        setNfts([]);
      }

      setLoading(false);
    };

    fetchNFTs();
  }, [UserService.authName, isUnstaking]);

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
      if (isUnstaking) {
        await UserService.unstakeNFTs(selected);
      } else {
        await UserService.stakeNFTs(selected);
      }
      setMsg("¡NFTs procesados exitosamente!");
      setShowModal(false);
      setIsUnstaking(false);
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
        <button onClick={() => { setIsUnstaking(false); setShowModal(true); }}>
          Stake NFTs
        </button>
        <button onClick={() => { setIsUnstaking(true); setShowModal(true); }}>
          Unstake NFTs
        </button>
        <button
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

      {showModal && (
        <div style={{ marginTop: 24 }}>
          <h3>{isUnstaking ? "Unstake NFTs seleccionados" : "Stakear NFTs seleccionados"}</h3>
          <button onClick={stakeSelectedNFTs}>
            Confirmar
          </button>
          <button
            onClick={() => {
              setShowModal(false);
              setIsUnstaking(false);
              setSelected([]);
            }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default NFTGallery;
