// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomNavbar from './navbar';
import Index from './pages/index';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import Perfil from './components/Perfil';
import Estacionamiento from './components/Estacionamiento';
import ModalPagar from './components/ModalPagar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';

function App() {
  // Estado de autenticación
  const [user, setUser] = useState({
    isLoggedIn: false,
    role: null,
    rut: null,
  });

  const [showModalPagar, setShowModalPagar] = useState(false);
  const [paymentData, setPaymentData] = useState(null);


  // Cargar el estado de autenticación desde localStorage al montar el componente
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Función para iniciar sesión
  const login = (userData) => {
    const newUser = {
      isLoggedIn: true,
      role: Number(userData.role),
      rut: userData.rut,
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser({ isLoggedIn: false, role: null, rut: null });
    localStorage.removeItem('user');
  };

  // Estados para mostrar/ocultar los modales
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleShowLogin = () => setShowLogin(true);
  const handleCloseLogin = () => setShowLogin(false);

  const handleShowRegister = () => setShowRegister(true);
  const handleCloseRegister = () => setShowRegister(false);

  return (
    <Router>
      <div className="App">
        <CustomNavbar
          user={user}
          logout={logout}
          handleShowLogin={handleShowLogin}
          handleShowRegister={handleShowRegister}
        />

        {/* Modales de Inicio de Sesión y Registro */}
        <LoginModal
          show={showLogin}
          handleClose={handleCloseLogin}
          login={login}
        />
        <RegisterModal
          show={showRegister}
          handleClose={handleCloseRegister}
        />

        {/* Modal de Pago en Tiempo Real */}
        {showModalPagar && (
          <ModalPagar
            show={showModalPagar}
            onHide={() => setShowModalPagar(false)}
            estacionamientoNombre={paymentData?.estacionamientoNombre}
            metodosPagar={user.metodosPagar || []}
          />
        )}

        {/* Contenedor Principal con un margin-top */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<div>Acerca de</div>} />
            <Route path="/perfil" element={<Perfil user={user} />} />
            <Route path="/estacionamiento" element={<Estacionamiento user={user} />} />
            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
