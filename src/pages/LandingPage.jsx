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
  const timerRef = useRef();
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (!document.getElementById("ual-login")) {
      const divUal = document.createElement("div");
      divUal.setAttribute("id", "ual-login");
      divUal.style.position = "relative"; // importante para stacking
      divUal.style.zIndex = 99; // muy por encima del contenido de fondo
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
    UserService.login(() => {
      if (UserService.isLogged()) {
        history.push("/home");
      } else {
        dispatch(setPlayerLogout());
      }
    });
  };

  return (
    <div style={styles.container}>
      {/* Galería de fondo */}
      <div style={styles.galleryGrid}>
        {gallery.map((vid, idx) => (
          <div key={idx} style={styles.videoWrapper}>
            {vid ? (
              <video
                src={vid}
                autoPlay
                muted
                loop
                playsInline
                style={styles.video}
                onMouseEnter={e => e.currentTarget.style.filter = "blur(9px) brightness(1.05) saturate(1.1)"}
                onMouseLeave={e => e.currentTarget.style.filter = styles.video.filter}
              />
            ) : (
              <div style={styles.loading}>Loading...</div>
            )}
          </div>
        ))}
      </div>

      {/* Contenedor del título y botón */}
      <div style={styles.centerContent}>
        <h1 style={styles.title}>Night Club Game</h1>
        <button onClick={handleLogin} style={styles.loginButton}>
          Login to Play
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    position: "relative",
    overflow: "hidden",
    background: "#181824"
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    padding: "28px 2vw",
    zIndex: 0
  },
  videoWrapper: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  video: {
    width: "100%",
    height: "100%",
    aspectRatio: "9 / 16",
    objectFit: "cover",
    borderRadius: "28px",
    filter: "blur(18px) brightness(0.85) saturate(1.1)",
    transition: "filter 0.38s ease-in-out"
  },
  loading: {
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    paddingTop: "60%"
  },
  centerContent: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
    width: "100%",
    pointerEvents: "none"
  },
  title: {
    fontFamily: "'Pacifico', cursive, Arial",
    fontSize: "6vw",
    color: "#ff36ba",
    textShadow: "0 3px 24px #170415cc, 0 1.5px 8px #000c",
    letterSpacing: 2,
    userSelect: "none",
    fontWeight: "bold",
    textAlign: "center",
    margin: 0
  },
  loginButton: {
    padding: "16px 42px",
    fontSize: 18,
    backgroundColor: "#ff36ba",
    color: "#fff",
    border: "none",
    borderRadius: 20,
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 4px 24px #0005",
    transition: "all 0.3s ease",
    pointerEvents: "auto"
  }
};
