// src/components/Estacionamiento.js

import React, { useState, useEffect } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Navigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import Estacionados from './Estacionamiento/Estacionados';
import Historial from './Estacionamiento/Historial';
import ModalPago from './Estacionamiento/ModalPago';
import MatriculaForm from './Estacionamiento/MatriculaForm';
import config from './config';

import EstacionamientoHeader from './EstacionamientoHeader';

import Tarifas from './Estacionamiento/Tarifas';
import Trabajadores from './Estacionamiento/Trabajadores';
import Distribucion from './Estacionamiento/Distribucion';
import Estacionar from './Estacionamiento/Estacionar';

function Estacionamiento({ user }) {
  const [estacionamientos, setEstacionamientos] = useState([]);
  const [selectedEstacionamiento, setSelectedEstacionamiento] = useState(null);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [trabajadorNombre, setTrabajadorNombre] = useState('');
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMatricula, setSelectedMatricula] = useState({});
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [ocupacion, setOcupacion] = useState(0);
  const [porcentajeOcupacion, setPorcentajeOcupacion] = useState(0);

  const location = useLocation();

  // Función para obtener la vista inicial desde el parámetro 'tab' en la URL
  const getInitialView = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'estacionados';
  };

  const [selectedView, setSelectedView] = useState(getInitialView());

  // Actualizar la vista seleccionada cuando cambia el parámetro 'tab' en la URL
  useEffect(() => {
    setSelectedView(getInitialView());
  }, [location.search]);

  // Actualizar la hora cada segundo
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Obtener nombre del trabajador
  useEffect(() => {
    const fetchTrabajadorNombre = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/users/userdata?rut=${user.rut}`);
        const data = await response.json();
        if (data.success && data.data) {
          setTrabajadorNombre(data.data.nombre);
        } else {
          console.error('Error al obtener el nombre del trabajador');
        }
      } catch (error) {
        console.error('Error al obtener el nombre del trabajador:', error);
      }
    };

    if (user && user.rut) {
      fetchTrabajadorNombre();
    }
  }, [user]);

  // Obtener estacionamientos asignados al trabajador
  useEffect(() => {
    const fetchEstacionamientos = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/api/users/trabajador_estacionamientos?rut=${user.rut}`
        );
        const data = await response.json();
        if (data.success) {
          setEstacionamientos(data.estacionamientos);
          setSelectedEstacionamiento(data.estacionamientos[0] || null);
        } else {
          alert('Error al obtener los estacionamientos');
        }
      } catch (error) {
        console.error('Error al obtener estacionamientos:', error);
      }
    };

    fetchEstacionamientos();
  }, [user]);

  // Obtener ocupación del estacionamiento cada minuto
  useEffect(() => {
    let interval;
    const fetchOcupacion = async () => {
      if (!selectedEstacionamiento) return;
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/api/estacionamiento/ocupacion?id_estacionamiento=${selectedEstacionamiento.id}`
        );
        const data = await response.json();
        if (data.success) {
          setOcupacion(data.ocupacion);

          // Calcular el porcentaje de ocupación solo si la capacidad es mayor a 0
          const capacidad = selectedEstacionamiento.capacidad;
          if (capacidad > 0) {
            const porcentaje = (data.ocupacion / capacidad) * 100;
            setPorcentajeOcupacion(porcentaje);
          } else {
            setPorcentajeOcupacion(0); // Evitar divisiones por cero
          }
        } else {
          console.error('Error al obtener la ocupación del estacionamiento');
        }
      } catch (error) {
        console.error('Error al obtener la ocupación del estacionamiento:', error);
      }
    };

    fetchOcupacion();
    interval = setInterval(fetchOcupacion, 60000); // Actualiza cada minuto

    return () => clearInterval(interval);
  }, [selectedEstacionamiento, refreshTrigger]);

  // Determinar el color de la barra
  const getBarVariant = (porcentaje) => {
    if (porcentaje <= 25) return 'success'; // Verde
    if (porcentaje <= 50) return 'info'; // Azul
    if (porcentaje <= 75) return 'warning'; // Amarillo
    return 'danger'; // Rojo
  };

  const barVariant = getBarVariant(porcentajeOcupacion);

  const handleRowClick = (matriculaData) => {
    setSelectedMatricula(matriculaData);
    setMetodoPago('efectivo'); // Restablecer método de pago
    setShowModal(true);
  };

  const handlePago = async () => {
    try {
      const {
        matricula,
        id_estacionamiento,
        numero_estacionamiento,
      } = selectedMatricula;
  
      const response = await fetch(`${config.apiBaseUrl}/api/matricula/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estacionamiento,
          matricula,
          rut_trabajador: user.rut,
          metodo_pago: metodoPago,
          numero_estacionamiento,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        alert('Pago procesado correctamente.');
        setShowModal(false);
        setRefreshTrigger((prev) => !prev); // Actualiza las vistas
      } else {
        alert('Error al procesar el pago: ' + data.message);
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
    }
  };
  

  if (redirectToHome) {
    return <Navigate to="/" replace />;
  }

  const tabContentStyle = {
    marginTop: '-10px',
    marginLeft: '-10px',
    backgroundColor: '#d9d9d9',
    padding: '10px',
    borderRadius: '4px',
  };

  // Verificar si 'selectedEstacionamiento' está definido
  if (!selectedEstacionamiento) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#d9d9d9', padding: '20px' }}>
        <h2>Gestión de Estacionamiento</h2>
        <p>Cargando estacionamientos o no tiene estacionamientos asignados.</p>
      </div>
    );
    
  }
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#d9d9d9', padding: '20px' }}>
      <h2>Gestión de Estacionamiento</h2>
  
      <EstacionamientoHeader
        estacionamientos={estacionamientos}
        selectedEstacionamiento={selectedEstacionamiento}
        setSelectedEstacionamiento={setSelectedEstacionamiento}
        currentTime={currentTime}
        trabajadorNombre={trabajadorNombre}
        porcentajeOcupacion={porcentajeOcupacion}
        ocupacion={ocupacion}
        barVariant={barVariant}
      />
  
      <MatriculaForm
        selectedEstacionamiento={selectedEstacionamiento}
        currentTime={currentTime}
        user={user}
        handleRowClick={handleRowClick}
        setRefreshTrigger={setRefreshTrigger}
      />
  
      <hr />
  
      <Tabs
        activeKey={selectedView}
        onSelect={(k) => setSelectedView(k)}
        className="mb-3"
        id="tabs"
      >
        <Tab eventKey="estacionados" title="Estacionados">
          <div style={tabContentStyle}>
            <Estacionados
              selectedEstacionamiento={selectedEstacionamiento}
              currentTime={currentTime}
              handleRowClick={handleRowClick}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </Tab>
        <Tab eventKey="historial" title="Historial">
          <div style={tabContentStyle}>
            <Historial
              selectedEstacionamiento={selectedEstacionamiento}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </Tab>
        {user.role === 2 && (
        <Tab eventKey="tarifa" title="Tarifa">
          <div style={tabContentStyle}>
            <Tarifas
              selectedEstacionamiento={selectedEstacionamiento}
              user={user}
              setRefreshTrigger={setRefreshTrigger}
            />
          </div>
        </Tab>)}
        {user.role === 2 && (
        <Tab eventKey="trabajadores" title="Trabajadores">
          <div style={tabContentStyle}>
            <Trabajadores
              selectedEstacionamiento={selectedEstacionamiento}
              user={user}
              setRefreshTrigger={setRefreshTrigger}
            />
          </div>
        </Tab>)}
        {user.role === 2 && (
        <Tab eventKey="distribucion" title="Distribución">
          <div style={tabContentStyle}>
            <Distribucion
              selectedEstacionamiento={selectedEstacionamiento}
              user={user}
              setRefreshTrigger={setRefreshTrigger}
            />
          </div>
        </Tab>)}
        {user.role === 1 && (
          <Tab eventKey="estacionar" title="Estacionar">
            <div style={tabContentStyle}>
              <Estacionar
                selectedEstacionamiento={selectedEstacionamiento}
                currentTime={currentTime}
                user={user}
                setRefreshTrigger={setRefreshTrigger}
              />
            </div>
          </Tab>
        )}
      </Tabs>
  
      <ModalPago
        show={showModal}
        onClose={() => setShowModal(false)}
        matriculaData={selectedMatricula}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        handlePago={handlePago}
      />
    </div>
  );
}

export default Estacionamiento;
