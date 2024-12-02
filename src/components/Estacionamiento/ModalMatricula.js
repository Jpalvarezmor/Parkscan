// ModalMatricula.js

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

function ModalMatricula({
  show,
  onClose,
  matriculaInicial = '',
  espacioInicial = null,
  espaciosDisponibles = [],
  handleEstacionar,
}) {
  const [matricula, setMatricula] = useState(matriculaInicial);
  const [numeroEstacionamiento, setNumeroEstacionamiento] = useState(espacioInicial || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setMatricula(matriculaInicial);
    setNumeroEstacionamiento(espacioInicial || '');
  }, [matriculaInicial, espacioInicial]);

  const handleSubmit = () => {
    if (!matricula || !numeroEstacionamiento) {
      setError('Debe ingresar matrícula y número de estacionamiento.');
      return;
    }

    if (!espaciosDisponibles.includes(parseInt(numeroEstacionamiento))) {
      setError('El número de estacionamiento no es válido o no está disponible.');
      return;
    }

    handleEstacionar(matricula, numeroEstacionamiento);
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Ingresar Matrícula</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group controlId="matricula">
            <Form.Label>Matrícula</Form.Label>
            <Form.Control
              type="text"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              readOnly={!!matriculaInicial && !espacioInicial} // Solo lectura si viene de 'Ingrese Matrícula'
            />
          </Form.Group>
          <Form.Group controlId="numero_estacionamiento">
            <Form.Label>Número de Estacionamiento</Form.Label>
            {espacioInicial ? (
              <Form.Control type="text" value={numeroEstacionamiento} readOnly />
            ) : (
              <Form.Control
                as="select"
                value={numeroEstacionamiento || ''}
                onChange={(e) => setNumeroEstacionamiento(e.target.value)}
              >
                <option value="" disabled>
                  Seleccione un estacionamiento
                </option>
                {espaciosDisponibles.map((espacio) => (
                  <option key={espacio} value={espacio}>
                    {espacio}
                  </option>
                ))}
              </Form.Control>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Estacionar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalMatricula;
