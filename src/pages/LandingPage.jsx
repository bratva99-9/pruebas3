import React from "react";
import { useHistory } from "react-router-dom";
import { UserService } from "../UserService";
import { Helmet } from 'react-helmet';
import './LandingPage.css'; // Asumiendo que crearás este archivo para los estilos
import logo from '../images/3DK_LOGO.png';

const LandingPage = () => {
  const history = useHistory();

  const handleLogin = () => {
    // Eliminamos async/await para mejorar la compatibilidad en móviles.
    // La redirección debe ser un resultado más directo del evento de clic.
    UserService.login()
      .then(session => {
        if (session) {
          history.push("/home");
        }
        // Si la sesión es nula (el usuario cerró el popup), no hacemos nada.
      })
      .catch(err => {
        // El error "The user rejected the request" es normal si el usuario cancela.
        // No lo mostramos en consola para no generar ruido.
        if (err.message && !err.message.includes('The user rejected the request')) {
             console.error("Login failed:", err);
        }
      });
  };

  return (
    <>
      <Helmet>
        <title>Night Club Game - Welcome to the Pleasure Dome</title>
        <meta name="description" content="Enter the world of Night Club Game. Collect sexy NFT girls, complete missions, and earn rewards in this exciting blockchain experience." />
        <meta property="og:title" content="Night Club Game - Welcome" />
        <meta property="og:description" content="Collect, play, and earn with sexy NFT girls in the Night Club Game." />
        <meta property="og:image" content="https://nightclub.game/logo512.png" />
        <meta property="og:url" content="https://nightclub.game" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="landing-container">
        <div className="landing-box">
          <h1 className="landing-title">Night Club Game</h1>
          <button onClick={handleLogin} className="landing-button">
            Login to Play
          </button>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
