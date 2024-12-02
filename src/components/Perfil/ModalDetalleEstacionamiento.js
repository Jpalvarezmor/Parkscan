// ModalDetalleEstacionamiento.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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

function ModalDetalleEstacionamiento({
  show,
  handleClose,
  estacionamiento,
  handleShowEditModal,
  handleShowDeleteModal,
}) {
  return (
    <Modal show={show} onHide={handleClose}>
      {estacionamiento && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>{estacionamiento.nombre}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Dirección:</strong> {estacionamiento.direccion}
            </p>
            <p>
              <strong>Capacidad:</strong> {estacionamiento.capacidad}
            </p>
            <p>
              <strong>Estado:</strong> {estacionamiento.estado}
            </p>
            <p>
              <strong>Tarifa:</strong> ${estacionamiento.tarifa}
            </p>
            {/* Mapa pequeño con la ubicación */}
            <div style={{ height: '200px' }}>
              <MapContainer
                center={[estacionamiento.latitud, estacionamiento.longitud]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker
                  position={[estacionamiento.latitud, estacionamiento.longitud]}
                ></Marker>
              </MapContainer>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cerrar
            </Button>
            <Button
              variant="warning"
              onClick={() => {
                handleClose();
                handleShowEditModal(estacionamiento);
              }}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                handleClose();
                handleShowDeleteModal(estacionamiento);
              }}
            >
              Eliminar
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}

export default ModalDetalleEstacionamiento;
