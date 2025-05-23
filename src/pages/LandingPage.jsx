import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { UserService } from "../UserService";
import { setPlayerLogout } from "../GlobalState/UserReducer";

const CARD_COUNT = 4;
const CHANGE_INTERVAL = 5000;

export default function LandingPage() {
  const [videos, setVideos] = useState([]);
  const [gallery, setGallery] = useState(Array(CARD_COUNT).fill(null));
  const [showLoginUI, setShowLoginUI] = useState(true);
  const timerRef = useRef();
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (!document.getElementById("ual-login")) {
      const divUal = document.createElement("div");
      divUal.setAttribute("id", "ual-login");
      document.body.appendChild(divUal);
    }
    UserService.init();
  }, []);

  useEffect(() => {
    fetch("https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=nightclubnft&schema_name=photos&page=1&limit=100")
      .then(res => res.json())
      .then(json => {
        const vids = json.data
          .map(a => a.data?.video || a.data?.img || null)
          .filter(Boolean)
          .map(ipfs => ipfs.startsWith("Qm") ? `https://ipfs.io/ipfs/${ipfs}` : ipfs);
        setVideos(vids);
        setGallery(Array(CARD_COUNT).fill(0).map(() => vids[Math.floor(Math.random() * vids.length)]));
      });
  }, []);

  useEffect(() => {
    if (!videos.length) return;
    timerRef.current = setInterval(() => {
      setGallery(prev => {
        const idx = Math.floor(Math.random() * CARD_COUNT);
        const newGallery = [...prev];
        let newVideo;
        do {
          newVideo = videos[Math.floor(Math.random() * videos.length)];
        } while (newVideo === newGallery[idx] && videos.length > 1);
        newGallery[idx] = newVideo;
        return newGallery;
      });
    }, CHANGE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [videos]);

  const handleLogin = () => {
    setShowLoginUI(false);
    UserService.login(() => {
      if (UserService.isLogged()) {
        history.push('/home');
      } else {
        setShowLoginUI(true);
        dispatch(setPlayerLogout());
      }
    });
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", background: "#181824" }}>
      {/* Video Background */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", height: "100%", gap: "24px", padding: "28px 2vw", position: "absolute", top: 0, left: 0, zIndex: 0 }}>
        {gallery.map((vid, idx) => (
          <div key={idx} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {vid ? (
              <video src={vid} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "32px", filter: "blur(18px) brightness(0.85) saturate(1.1)" }} />
            ) : (
              <div style={{ color: "#fff", fontSize: 24, textAlign: "center", paddingTop: "60%" }}>Cargando...</div>
            )}
          </div>
        ))}
      </div>

      {/* Centered Title */}
      {showLoginUI && (
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1, textAlign: "center" }}>
          <span style={{
            fontFamily: "'Pacifico', cursive",
            fontSize: "5vw",
            color: "#ff36ba",
            textShadow: "0 3px 24px #170415cc, 0 1.5px 8px #000c",
            letterSpacing: 2,
            userSelect: "none",
            fontWeight: "bold"
          }}>
            Night Club Game
          </span>
          <div style={{ marginTop: 24 }}>
            <button
              onClick={handleLogin}
              style={{
                padding: "14px 36px",
                fontSize: 18,
                backgroundColor: "#e11d48",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 4px 24px #0004"
              }}
            >
              Login to Play
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
