import React from "react";
import fondo from "../images/inicio1.webp";
import { useHistory } from "react-router-dom";
import { UserService } from "../UserService";
import { useDispatch } from "react-redux";
import { setPlayerLogout } from "../GlobalState/UserReducer";

export default function LandingPage() {
  const history = useHistory();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      await UserService.login(() => {
        if (UserService.isLogged()) {
          history.push("/home");
        } else {
          dispatch(setPlayerLogout());
          alert("Error al iniciar sesión");
        }
      });
    } catch (err) {
      alert("Hubo un error en el login: " + err.message);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${fondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        filter: "brightness(0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
          Night Club Game
        </h1>
        <button
          onClick={handleLogin}
          style={{
            padding: "14px 36px",
            fontSize: "18px",
            backgroundColor: "#e11d48",
            color: "#fff",
            border: "none",
            borderRadius: "14px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 24px #0004",
          }}
        >
          Login to Play
        </button>
      </div>
    </div>
  );
}
