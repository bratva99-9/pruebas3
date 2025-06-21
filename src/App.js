// src/App.js

import React, { useEffect, useState } from 'react';
import './App.scss';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LandingPage from './pages/LandingPage';
import Page2 from './pages/Page2';
import Home from './pages/Home';
import ProtectedRoute from './ProtectedRoute';
import { UserService } from './UserService';
import { Buffer } from "buffer";
window.Buffer = Buffer;

function App() {
  const [loading, setLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Restauramos el método de inicialización original.
    const initialize = async () => {
      // La llamada a init se hace en index.js, pero mantenemos el spinner para la carga inicial de assets, etc.
      await new Promise(resolve => setTimeout(resolve, 1000)); // Un segundo para que todo cargue visualmente
      setIsFadingOut(true);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };
    initialize();
  }, []);

  if (loading) {
    return (
      <div className={`loading-screen ${isFadingOut ? 'fade-out' : ''}`}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Helmet>
        <html lang="en" />
        <title>Night Club Game</title>
        <meta name="description" content="The hottest NFT game on the blockchain. Collect, play, and earn with sexy NFT girls." />
      </Helmet>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <ProtectedRoute exact path="/page2" component={Page2} />
          <ProtectedRoute exact path="/home" component={Home} />
          {/* <Redirect to="/" /> // ELIMINADO: Esta línea era la causa raíz del problema de login en móvil */}
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
