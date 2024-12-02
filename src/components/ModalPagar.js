// src/components/ModalPagar.js
import React from 'react';
import { Modal, Card, Button } from 'react-bootstrap';

function ModalPagar({ show, onHide, estacionamientoNombre, metodosPago }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Pago - {estacionamientoNombre}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Métodos de Pago</h5>
        {metodosPago.map((metodo) => (
          <Card key={metodo.metodo_id} style={{ margin: '10px' }}>
            <Card.Body>
              <Card.Text>**** **** **** {metodo.numero_tarjeta.slice(-4)}</Card.Text>
              <Card.Text>{metodo.tipo_tarjeta === 'credito' ? 'Crédito' : 'Débito'}</Card.Text>
              <Card.Text>{metodo.nombre_en_tarjeta}</Card.Text>
              <Button variant="primary">Pagar</Button>
            </Card.Body>
          </Card>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalPagar;
