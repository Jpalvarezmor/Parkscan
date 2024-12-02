// src/components/Estacionamiento/ModalPago.js

import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function ModalPago({ show, onClose, matriculaData, metodoPago, setMetodoPago, handlePago }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Matrícula: {matriculaData.matricula}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Estacionamiento:</strong> {matriculaData.nombre_estacionamiento}</p>
        <p><strong>Número de estacionamiento:</strong> {matriculaData.numero_estacionamiento}</p>
        <p><strong>Tiempo estacionado:</strong> {matriculaData.tiempo} minutos</p>
        <p><strong>Total a pagar:</strong> ${matriculaData.total}</p>

        <Form.Group controlId="formMetodoPago">
          <Form.Label>Método de Pago</Form.Label>
          <Form.Control
            as="select"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="app">App</option>
            <option value="otros">Otros</option>
          </Form.Control>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handlePago}>
          Procesar Pago
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalPago;
