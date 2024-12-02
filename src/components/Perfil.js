// src/components/Perfil.js
import React, { useState, useEffect } from 'react';
import { Button, Tab, Tabs } from 'react-bootstrap';
import { Navigate, useLocation } from 'react-router-dom';
import Historial from './Perfil/Historial';
import Autos from './Perfil/Autos';
import Pago from './Perfil/Pago';
import ModalPerfil from './Perfil/ModalPerfil';
import Estacionamientos from './Perfil/Estacionamientos';
import config from './config';

function Perfil({ user }) {
  const [userData, setUserData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
  });
  const [showModalPerfil, setShowModalPerfil] = useState(false);
  const location = useLocation();
  
  // Determina la pestaña inicial basándose en el parámetro `tab` en la URL
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'autos';
  };

  const [selectedTab, setSelectedTab] = useState(getInitialTab);

  useEffect(() => {
    // Actualiza la pestaña seleccionada cuando cambia el parámetro `tab` en la URL
    setSelectedTab(getInitialTab());
  }, [location.search]);

  useEffect(() => {
    if (!user || !user.isLoggedIn || !user.rut) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/users/userdata?rut=${user.rut}`);
        const result = await response.json();

        if (result.success && result.data) {
          setUserData(result.data);
        } else {
          alert(result.message || 'Error al obtener los datos del usuario');
        }
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user || !user.isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const handleEdit = () => setShowModalPerfil(true);

  const handleCloseModal = (updatedData) => {
    if (updatedData) {
      setUserData(updatedData);
    }
    setShowModalPerfil(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#d9d9d9', padding: '20px' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <h2 style={{ textAlign: 'left', margin: 0 }}>Información Personal</h2>
  <Button 
    onClick={handleEdit}
    style={{
      backgroundColor: '#ffc107',
      color: 'black',
      borderColor: '#ffc107',
    }}
  >
    Editar
  </Button>
</div>

<>
  <p style={{ textAlign: 'left' }}><strong>Nombre:</strong> {userData.nombre || "No disponible"}</p>
  <p style={{ textAlign: 'left' }}><strong>Correo:</strong> {userData.correo || "No disponible"}</p>
  <p style={{ textAlign: 'left' }}><strong>Teléfono:</strong> {userData.telefono || "No disponible"}</p>
</>


      {/* Modal de edición del perfil */}
      <ModalPerfil
        show={showModalPerfil}
        handleClose={handleCloseModal}
        user={user}
        userData={userData}
      />

      <hr />

      <Tabs
  activeKey={selectedTab}
  onSelect={(k) => setSelectedTab(k)}
  className="mb-3"
  id="tabs"
>
  <Tab eventKey="historial" title="Historial">
    <Historial user={user} />
  </Tab>
  <Tab eventKey="autos" title="Autos">
    <Autos user={user} />
  </Tab>
  {/* Mostrar la pestaña de Estacionamientos solo para dueños (rol 2) */}
  {user.role === 2 && (
    <Tab eventKey="estacionamientos" title="Estacionamientos">
      <div className="tab-content-background">
        <Estacionamientos user={user} />
      </div>
    </Tab>
  )}
</Tabs>
    </div>
  );
}

export default Perfil;
