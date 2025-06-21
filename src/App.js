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

  useEffect(() => {
    const checkInitialization = async () => {
      // Esperamos activamente hasta que el servicio de usuario confirme que ha terminado.
      // Esto es más robusto que un temporizador fijo.
      while (UserService.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Consultamos cada 100ms
      }
      setLoading(false); // Ocultamos el spinner solo cuando esté listo
    };
    checkInitialization();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
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
