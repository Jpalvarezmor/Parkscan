// ModalEditEstacionamiento.js
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function ModalEditEstacionamiento({ show, handleClose, estacionamiento, handleEditEstacionamiento }) {
  const [markerPosition, setMarkerPosition] = useState({
    lat: estacionamiento?.latitud || -33.4489,
    lng: estacionamiento?.longitud || -70.6693,
  });
  const [direccion, setDireccion] = useState(estacionamiento?.direccion || '');
  const mapRef = useRef(null);

  useEffect(() => {
    if (estacionamiento) {
      setMarkerPosition({
        lat: estacionamiento.latitud,
        lng: estacionamiento.longitud,
      });
      setDireccion(estacionamiento.direccion);
    }
  }, [estacionamiento]);

  // Actualizar dirección cuando cambia la posición del marcador
  useEffect(() => {
    const reverseGeocode = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${markerPosition.lat}&lon=${markerPosition.lng}&addressdetails=1`
        );
        const data = await response.json();
        if (data && data.address) {
          const { road, house_number, city, state } = data.address;
          const formattedAddress = `${road || ''} ${house_number || ''}, ${city || ''}, ${state || ''}`;
          setDireccion(formattedAddress.trim());
        }
      } catch (error) {
        console.error('Error al obtener la dirección:', error);
      }
    };

    reverseGeocode();

    // Actualizar vista del mapa
    if (mapRef.current) {
      mapRef.current.setView(markerPosition);
    }
  }, [markerPosition]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedEstacionamiento = {
      ...estacionamiento,
      nombre: e.target.nombre.value,
      direccion: direccion,
      latitud: markerPosition.lat,
      longitud: markerPosition.lng,
      capacidad: parseInt(e.target.capacidad.value),
      estado: e.target.estado.value,
      tarifa: parseFloat(e.target.tarifa.value),
    };
    handleEditEstacionamiento(updatedEstacionamiento);
  };

  const handleAddressSearch = async () => {
    if (!direccion) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, address } = data[0];
        setMarkerPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });

        const { road, house_number, city, state } = address;
        const formattedAddress = `${road || ''} ${house_number || ''}, ${city || ''}, ${state || ''}`;
        setDireccion(formattedAddress.trim());
      } else {
        alert('No se encontraron resultados para la dirección proporcionada.');
      }
    } catch (error) {
      console.error('Error al buscar la dirección:', error);
      alert('Hubo un error al buscar la dirección.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      {estacionamiento && (
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Estacionamiento</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" defaultValue={estacionamiento.nombre} required />
            </Form.Group>
            <Form.Group controlId="direccion">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ingrese una dirección"
                required
              />
              <Button variant="primary" onClick={handleAddressSearch} className="mt-2">
                Buscar
              </Button>
            </Form.Group>
            {/* Mapa con marcador arrastrable y doble clic */}
            <div style={{ height: '300px', width: '100%', marginBottom: '1rem' }}>
              <MapContainer
                center={[markerPosition.lat, markerPosition.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                whenCreated={(mapInstance) => {
                  mapRef.current = mapInstance;
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <DraggableMarker position={markerPosition} setPosition={setMarkerPosition} />
                <MapEventsHandler setPosition={setMarkerPosition} />
              </MapContainer>
            </div>
            <Form.Group controlId="capacidad">
              <Form.Label>Capacidad</Form.Label>
              <Form.Control type="number" defaultValue={estacionamiento.capacidad} required />
            </Form.Group>
            <Form.Group controlId="estado">
              <Form.Label>Estado</Form.Label>
              <Form.Control as="select" defaultValue={estacionamiento.estado}>
                <option value="activo">Activo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="cerrado">Cerrado</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="tarifa">
              <Form.Label>Tarifa</Form.Label>
              <Form.Control type="number" step="any" defaultValue={estacionamiento.tarifa} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  );

  function DraggableMarker({ position, setPosition }) {
    const markerRef = useRef(null);
    const eventHandlers = React.useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            setPosition(marker.getLatLng());
          }
        },
      }),
      [setPosition]
    );

    return (
      <Marker draggable eventHandlers={eventHandlers} position={position} ref={markerRef} />
    );
  }

  function MapEventsHandler({ setPosition }) {
    useMapEvents({
      dblclick(e) {
        setPosition(e.latlng);
      },
    });
    return null;
  }
}

export default ModalEditEstacionamiento;
