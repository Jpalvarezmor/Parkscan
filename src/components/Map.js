import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import config from '../config';

function Map() {
  const [estacionamientos, setEstacionamientos] = useState([]);

  // Fetch datos de la API real
  useEffect(() => {
    const fetchEstacionamientos = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/estacionamiento/estacionamientos`); // Cambia esto por tu endpoint real
        if (!response.ok) {
          throw new Error('Error al obtener los datos de la API');
        }
        const data = await response.json();
        setEstacionamientos(data);
      } catch (error) {
        console.error('Error al obtener los estacionamientos:', error);
      }
      
    };

    fetchEstacionamientos();
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={[-33.4489, -70.6693]} // Coordenadas iniciales (Santiago, Chile)
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Capa de Mapa */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />

        {/* Marcadores de Estacionamientos */}
        {estacionamientos.map((estacionamiento) => (
          <Marker
            key={estacionamiento.id}
            position={[estacionamiento.latitud, estacionamiento.longitud]}
          >
            <Popup>
              <h4>{estacionamiento.nombre}</h4>
              <p><strong>Dirección:</strong> {estacionamiento.direccion}</p>
              <p><strong>Capacidad:</strong> {estacionamiento.capacidad}</p>
              <p><strong>Estado:</strong> {estacionamiento.estado}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;
