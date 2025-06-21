// src/App.js

import React, { useEffect } from 'react';
import './App.scss';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Page2 from './pages/Page2';
import Home from './pages/Home'; // SOLO UNA VEZ ESTA IMPORTACIÓN
import ProtectedRoute from './ProtectedRoute';
import { UserService } from './UserService';
import { Buffer } from "buffer";
window.Buffer = Buffer;

function App() {
  useEffect(() => {
    UserService.init();
  }, []);

  return (
    <div className="App">
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
