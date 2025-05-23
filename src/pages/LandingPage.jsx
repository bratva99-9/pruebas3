import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { UserService } from "../UserService";
import { setPlayerLogout } from "../GlobalState/UserReducer";

const CARD_COUNT = 4;
const CHANGE_INTERVAL = 5000;

export default function LandingPage() {
  const [videos, setVideos] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [isUALVisible, setIsUALVisible] = useState(false);
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

    // Observa cambios en el DOM para detectar el modal de UAL
    const observer = new MutationObserver(() => {
      const modal = document.querySelector(".ual-modal, .ual-container, .ual-content");
      setIsUALVisible(!!modal);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
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
    UserService.login(() => {
      if (UserService.isLogged()) {
        history.push("/home");
      } else {
        dispatch(setPlayerLogout());
      }
    });
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      position: "relative",
      overflow: "hidden",
      background: "#181824"
    }}>
      {/* Galería de fondo */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 24,
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        padding: "24px 2vw",
        zIndex: 0
      }}>
        {gallery.map((vid, idx) => (
          <video
            key={idx}
            src={vid}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 28,
              filter: "blur(16px) brightness(0.85)"
            }}
          />
        ))}
      </div>

      {/* Texto y botón (ocultos cuando el UAL modal está abierto) */}
      {!isUALVisible && (
        <>
          <h1 style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: "'Pacifico', cursive",
            fontSize: "6vw",
            color: "#ff36ba",
            textShadow: "0 3px 24px #0008",
            zIndex: 2,
            margin: 0
          }}>
            Night Club Game
          </h1>

          <div style={{
            position: "absolute",
            top: "58%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2
          }}>
            <button
              onClick={handleLogin}
              style={{
                padding: "14px 36px",
                fontSize: 18,
                backgroundColor: "#ff36ba",
                color: "#fff",
                border: "none",
                borderRadius: 16,
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 4px 24px #0005"
              }}
            >
              Login to Play
            </button>
          </div>
        </>
      )}
    </div>
  );
}
