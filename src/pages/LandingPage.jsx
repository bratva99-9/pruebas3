import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { UserService } from "../UserService";
import { setPlayerLogout } from "../GlobalState/UserReducer";
import fondo from "../imagenes/inicio1.webp"; // Importamos la imagen

export default function LandingPage() {
  const [showLoginUI, setShowLoginUI] = useState(true);
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
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `url(${fondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(0.6)",
      }}
    >
      {/* Capa de oscurecimiento adicional si quieres más contraste */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          zIndex: 0,
        }}
      />

      {/* Título + botón login */}
      {showLoginUI && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "'Pacifico', cursive",
              fontSize: "5vw",
              color: "#ff36ba",
              textShadow: "0 3px 24px #170415cc, 0 1.5px 8px #000c",
              letterSpacing: 2,
              userSelect: "none",
              fontWeight: "bold",
            }}
          >
            Night Club Game
          </h1>
          <button
            onClick={handleLogin}
            style={{
              marginTop: 24,
              padding: "14px 36px",
              fontSize: 18,
              backgroundColor: "#e11d48",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 24px #0004",
            }}
          >
            Login to Play
          </button>
        </div>
      )}
    </div>
  );
}
