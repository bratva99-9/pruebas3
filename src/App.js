// src/App.js

import React from 'react';
import './App.scss';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LandingPage from './pages/LandingPage';
import Page2 from './pages/Page2';
import Home from './pages/Home';
import ProtectedRoute from './ProtectedRoute';
import { Buffer } from "buffer";
window.Buffer = Buffer;

function App() {
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
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
