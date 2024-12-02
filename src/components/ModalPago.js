// ModalPago.js

import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function ModalPago({ show, onClose, matriculaData, metodoPago, setMetodoPago, handlePago }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Detalles de Matrícula</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h3>{matriculaData.matricula}</h3>
        <p><strong>Fecha:</strong> {matriculaData.fecha}</p>
        <p><strong>Hora:</strong> {matriculaData.hora}</p>
        <p><strong>Número de Estacionamiento:</strong> {matriculaData.numero_estacionamiento}</p>
        <p><strong>Tarifa:</strong> ${matriculaData.tarifa}</p>
        <p><strong>Tiempo Estacionado (min):</strong> {matriculaData.tiempo}</p>
        <p><strong>Total:</strong> ${matriculaData.total}</p>

        <Form.Group controlId="metodoPago">
          <Form.Label>Método de Pago</Form.Label>
          <Form.Control
            as="select"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="otroos">Otros</option>
          </Form.Control>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handlePago}>Pagar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalPago;
