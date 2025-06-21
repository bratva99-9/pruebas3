// src/App.js

import React, { useEffect, useState } from 'react';
import './App.scss';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LandingPage from './pages/LandingPage';
import Page2 from './pages/Page2';
import Home from './pages/Home'; // SOLO UNA VEZ ESTA IMPORTACIÓN
import ProtectedRoute from './ProtectedRoute';
import { UserService } from './UserService';
import { Buffer } from "buffer";
window.Buffer = Buffer;

function App() {
  const [loading, setLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Pequeña pausa para que se vea el spinner
      await UserService.init();
      setIsFadingOut(true);
      setTimeout(() => {
        setLoading(false);
      }, 500); // Debe coincidir con la duración de la transición en CSS
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
          <Redirect to="/" />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
