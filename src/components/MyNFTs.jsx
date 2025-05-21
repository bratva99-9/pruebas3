import React, { useEffect, useState } from 'react';
import { UserService } from '../UserService';

const COLLECTION = "nightclubnft";
const STAKE_SCHEMAS = ["girls", "photos"];
const CONTRACT_ACCOUNT = "nightclubapp";

const MyNFTs = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      if (!UserService.authName) {
        setNfts([]);
        setLoading(false);
        return;
      }
      try {
        if (isUnstaking) {
          const rpc = new (require('eosjs')).JsonRpc("https://wax.greymass.com");
          const response = await rpc.get_table_rows({
            json: true,
            code: CONTRACT_ACCOUNT,
            scope: CONTRACT_ACCOUNT,
            table: "staked",
            lower_bound: UserService.authName,
            upper_bound: UserService.authName,
            limit: 1
          });
          if (response.rows.length > 0) {
            const assetIds = response.rows[0].asset_ids;
            const promises = assetIds.map(id =>
              fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets/${id}`).then(res => res.json())
            );
            const data = await Promise.all(promises);
            setNfts(data.map(r => r.data));
          } else {
            setNfts([]);
          }
        } else {
          const queries = STAKE_SCHEMAS.map(
            schema => fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${UserService.authName}&collection_name=${COLLECTION}&schema_name=${schema}&limit=100`)
              .then(res => res.json())
          );
          const results = await Promise.all(queries);
          const nftsData = results.flatMap(r => Array.isArray(r.data) ? r.data : []);
          setNfts(nftsData);
        }
      } catch (err) {
        setNfts([]);
      }
      setLoading(false);
    };
    fetchNFTs();
  }, [UserService.authName, isUnstaking]);

  const toggleSelect = (asset_id) => {
    setSelected(prev =>
      prev.includes(asset_id) ? prev.filter(id => id !== asset_id) : [...prev, asset_id]
    );
  };

  const stakeSelectedNFTs = async () => {
    if (!UserService.session) return alert("Debes iniciar sesión.");
    if (selected.length === 0) return alert("Selecciona al menos un NFT.");
    try {
      if (isUnstaking) {
        await UserService.unstakeNFTs(selected);
      } else {
        await UserService.stakeNFTs(selected);
      }
      alert(`Operación realizada correctamente.`);
      setShowModal(false);
      setIsUnstaking(false);
      setSelected([]);
    } catch (err) {
      alert("Error al realizar la operación: " + (err.message || err));
    }
  };

  return (
    <div>
      <h2 style={{color: "#fff", marginTop: 30}}>Tus NFTs Stakables</h2>
      <button
        style={{
          margin: "20px 0",
          padding: "10px 25px",
          background: "#5325e9",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontWeight: "bold",
          fontSize: 18,
          cursor: "pointer"
        }}
        onClick={() => { setIsUnstaking(true); setShowModal(true); }}
        disabled={nfts.length === 0}
      >
        Unstake NFTs
      </button>

      <button
        style={{
          margin: "20px 10px",
          padding: "10px 25px",
          background: "#10b981",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontWeight: "bold",
          fontSize: 18,
          cursor: "pointer"
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
        Reclamar recompensas
      </button>

      {showModal && (
        <div style={{
          background: "#1a133a",
          borderRadius: 18,
          padding: 20,
          marginTop: 10,
          marginBottom: 20,
          boxShadow: "0 6px 24px #000b",
        }}>
          <h3 style={{color:"#fff"}}>Selecciona los NFTs para {isUnstaking ? "Unstake" : "Staking"}</h3>
          {loading ? <div>Cargando NFTs...</div> :
            nfts.length === 0 ? <div>No tienes NFTs disponibles.</div> :
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 28}}>
              {nfts.map(nft => {
                const vidHash = nft.data && nft.data.video;
                const imgHash = nft.data && nft.data.img;
                const fileUrl =
                  vidHash && vidHash.length > 10
                    ? (vidHash.startsWith("http") ? vidHash : `https://ipfs.io/ipfs/${vidHash}`)
                    : (imgHash && imgHash.length > 10
                        ? (imgHash.startsWith("http") ? imgHash : `https://ipfs.io/ipfs/${imgHash}`)
                        : '');

                return (
                  <div
                    key={nft.asset_id}
                    style={{
                      width: 200, borderRadius: 16,
                      background: selected.includes(nft.asset_id) ? "#302170" : "#222",
                      padding: 8, boxShadow: "0 2px 12px #000a", display:"flex", flexDirection:"column", alignItems:"center"
                    }}
                    onClick={() => toggleSelect(nft.asset_id)}
                  >
                    {fileUrl.endsWith('.mp4') || fileUrl.includes('video')
                      ? <video
                          src={fileUrl}
                          style={{width:"100%", height:270, borderRadius:12, background:"#19191d"}}
                          autoPlay loop muted playsInline
                        />
                      : <img
                          src={fileUrl}
                          alt="NFT"
                          style={{width:"100%", height:270, borderRadius:12, background:"#19191d", objectFit:'cover'}}
                        />
                    }
                    <input
                      type="checkbox"
                      checked={selected.includes(nft.asset_id)}
                      onChange={() => toggleSelect(nft.asset_id)}
                      style={{marginTop:8}}
                    /> Seleccionar
                  </div>
                );
              })}
            </div>
          }
          <button
            style={{
              marginTop: 18,
              padding: "8px 22px",
              background: "#ff36ba",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer"
            }}
            onClick={stakeSelectedNFTs}
            disabled={selected.length === 0}
          >
            {isUnstaking ? "Unstakear seleccionados" : "Stakear seleccionados"}
          </button>
          <button
            style={{
              marginLeft: 16,
              marginTop: 18,
              padding: "8px 18px",
              background: "#5b5b5b",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: "bold",
              fontSize: 15,
              cursor: "pointer"
            }}
            onClick={() => {setShowModal(false); setIsUnstaking(false); setSelected([]);}}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default MyNFTs;
