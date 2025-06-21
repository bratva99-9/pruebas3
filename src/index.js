import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserService } from './UserService';

// Creamos una función asíncrona para poder usar await
const renderApp = async () => {
  // Primero, esperamos a que el servicio de usuario se inicialice.
  // Esto es crucial para que `sessionKit.restore()` funcione con redirecciones.
  await UserService.init();

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Llamamos a la función para que se ejecute.
renderApp();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
