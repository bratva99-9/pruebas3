import React, { useEffect, useState } from "react";
import { UserService } from "../UserService";

const ENDPOINTS = [
  "https://wax.pink.gg",
  "https://api.waxsweden.org",
  "https://wax.greymass.com",
  "https://wax.cryptolions.io",
  "https://wax.eosrio.io"
];

export default function ClaimRewardsCard() {
  const [pending, setPending] = useState("0.0000");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!UserService.authName) return;
    fetchPendingRewards(UserService.authName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchFromAny = async (table) => {
    for (const endpoint of ENDPOINTS) {
      try {
        const res = await fetch(`${endpoint}/v1/chain/get_table_rows`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            json: true,
            code: "nightclub.gm",
            scope: "nightclub.gm",
            table,
            limit: 1000,
          }),
        });
        const data = await res.json();
        if (Array.isArray(data.rows) && data.rows.length > 0) {
          console.log(`✅ Tabla '${table}' cargada desde ${endpoint}`);
          return data.rows;
        } else {
          console.warn(`⚠️ Tabla '${table}' vacía desde ${endpoint}`);
        }
      } catch (err) {
        console.warn(`❌ Nodo fallido para '${table}': ${endpoint}`);
      }
      await sleep(500); // pequeña pausa entre nodos
    }
    throw new Error(`❌ No se pudo cargar la tabla '${table}' desde ningún nodo.`);
  };

  const fetchPendingRewards = async (user) => {
    setLoading(true);
    try {
      const now = Math.floor(Date.now() / 1000);

      const [assets, configRows, templates] = await Promise.all([
        fetchFromAny("assets"),
        fetchFromAny("config"),
        fetchFromAny("templates"),
      ]);

      const config = configRows[0];
      if (!config || !config.time_unit_length) throw new Error("❌ 'time_unit_length' no definido");
      const unitSeconds = parseInt(config.time_unit_length);

      const templatesMap = Object.fromEntries(
        templates.map((tpl) => [String(tpl.template_id), parseFloat(tpl.timeunit_rate)])
      );

      const userAssets = assets.filter((a) => a.owner === user);
      console.log("🔍 userAssets", userAssets);
      console.log("📦 templatesMap", templatesMap);
      console.log("⏱️ unitSeconds", unitSeconds);

      let totalReward = 0;

      for (const nft of userAssets) {
        const tplRate = templatesMap[String(nft.template_id)];
        const elapsed = now - nft.last_claim;
        const periods = Math.floor(elapsed / unitSeconds);

        console.log(`⛏️ NFT ${nft.asset_id}: elapsed=${elapsed}, periods=${periods}, rate=${tplRate}`);

        if (!tplRate) continue;
        totalReward += periods * tplRate;
      }

      setPending(totalReward.toFixed(4));
    } catch (err) {
      console.warn("⚠️ Error al calcular rewards:", err.message || err);
      setPending("0.0000");
    }
    setLoading(false);
  };

  const handleClaim = async () => {
    if (!UserService.isLogged()) return;

    setMensaje("Firmando transacción...");
    setLoading(true);

    try {
      await UserService.session.signTransaction(
        {
          actions: [
            {
              account: "nightclub.gm",
              name: "claim",
              authorization: [
                {
                  actor: UserService.authName,
                  permission: "active",
                },
              ],
              data: { user: UserService.authName },
            },
          ],
        },
        { blocksBehind: 3, expireSeconds: 60 }
      );

      setMensaje("✅ Claim exitoso.");
      setPending("0.0000");
    } catch (e) {
      setMensaje("❌ Error al reclamar: " + (e.message || e));
    }

    setLoading(false);
  };

  return (
    <div style={{
      background: "#1e1633", padding: 24, borderRadius: 18,
      color: "#fff", maxWidth: 320, boxShadow: "0 4px 20px #0006"
    }}>
      <h3 style={{ fontSize: 20 }}>Pending Rewards</h3>
      <div style={{ fontSize: 26, fontWeight: "bold", marginBottom: 16 }}>
        {pending} SEXY
      </div>
      <button
        onClick={handleClaim}
        disabled={loading || pending === "0.0000"}
        style={{
          background: "linear-gradient(90deg,#14b8a6,#3b82f6)",
          border: "none",
          borderRadius: 10,
          padding: "10px 28px",
          fontSize: 17,
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Reclamando..." : "Claim"}
      </button>
      {mensaje && <p style={{ marginTop: 12 }}>{mensaje}</p>}
    </div>
  );
}
