// ModalDeleteEstacionamiento.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function ModalDeleteEstacionamiento({
  show,
  handleClose,
  estacionamiento,
  handleDeleteEstacionamiento,
}) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro de que deseas eliminar el estacionamiento{' '}
        <strong>{estacionamiento?.nombre}</strong>?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDeleteEstacionamiento}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalDeleteEstacionamiento;
