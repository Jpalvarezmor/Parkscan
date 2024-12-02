// src/components/Estacionamiento/ModalTarifa.js

import React from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

function ModalTarifa({
  showModal,
  setShowModal,
  modalTarifa,
  diasSemana,
  setDiasSemana,
  nombre,
  setNombre,
  horaInicio,
  setHoraInicio,
  tarifaMonto,
  setTarifaMonto,
  handleSubmit,
  handleDiasSemanaChange,
  handleDeleteTarifa,
  showWarning,
  setShowWarning,
}) {
  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  // Generar opciones de tiempo en intervalos de 10 minutos
  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 10) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        options.push(`${hour}:${minute}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTarifa ? 'Editar Tarifa' : 'Añadir Tarifa'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showWarning && (
            <Alert variant="info" onClose={() => setShowWarning(false)} dismissible>
              Los horarios de cambio de tarifa solo pueden configurarse en intervalos de 10 minutos.
            </Alert>
          )}
          <Form.Group controlId="nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="dias_semana">
            <Form.Label>Días de la Semana</Form.Label>
            <div>
              {dias.map((dia) => (
                <Form.Check
                  key={dia}
                  type="checkbox"
                  label={dia.charAt(0).toUpperCase() + dia.slice(1)}
                  value={dia}
                  onChange={handleDiasSemanaChange}
                  checked={diasSemana.includes(dia)}
                />
              ))}
            </div>
          </Form.Group>
          <Form.Group controlId="hora_inicio">
            <Form.Label>Hora de Inicio</Form.Label>
            <Form.Control
              as="select"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              required
              style={{
                maxHeight: '150px',
                overflowY: 'auto',
              }}
            >
              <option value="">Seleccione una hora</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="tarifa">
            <Form.Label>Tarifa ($)</Form.Label>
            <Form.Control
              type="text"
              value={tarifaMonto}
              onChange={(e) => setTarifaMonto(e.target.value.replace(/\D/g, ''))}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {modalTarifa && (
            <Button
              variant="danger"
              onClick={() => {
                setShowModal(false);
                handleDeleteTarifa(modalTarifa.id);
              }}
            >
              Eliminar
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalTarifa;
