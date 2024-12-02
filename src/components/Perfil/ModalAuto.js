import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import config from '../config';

function ModalAuto({ show, onHide, user }) {
  const [matricula, setMatricula] = useState('');
  const [modelo, setModelo] = useState('');
  const [color, setColor] = useState('');
  const [error, setError] = useState('');


  const handleAddVehicle = async () => {
    // Validar que `user` y `user.rut` están definidos
    if (!user || !user.rut) {
      setError('No se ha encontrado el usuario. Por favor, inicia sesión.');
      return;
    }
  
    const formattedMatricula = matricula.replace(/\s+/g, '').toUpperCase();
    if (!/^[A-Z]{4}\d{2}$/.test(formattedMatricula)) {
      setError('Formato de matrícula incorrecto. Debe ser ABCD12');
      return;
    }
  
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/auto/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: formattedMatricula,
          usuario_id: user.rut,
          modelo,
          color,
        }),
      });
  
      const result = await response.json();
      console.log("Response from addVehiculo:", result); // Para depuración
  
      if (result.success) {
        alert('Vehículo añadido correctamente');
        resetForm();
        onHide(true); // Cierra el modal y refresca la lista en Autos
      } else {
        setError(result.message || 'Error al añadir el vehículo');
      }
    } catch (error) {
      console.error('Error al añadir el vehículo:', error);
      setError('Error en el servidor. Inténtalo de nuevo.');
    }
  };
  
  

  const resetForm = () => {
    setMatricula('');
    setModelo('');
    setColor('');
    setError('');
  };

  return (
    <Modal show={show} onHide={() => onHide(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Añadir Vehículo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formMatricula">
            <Form.Label>Matrícula</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej. ABCD12"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value.toUpperCase())}
            />
          </Form.Group>
          <Form.Group controlId="formModelo">
            <Form.Label>Modelo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej. Toyota Corolla"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formColor">
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej. Rojo"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </Form.Group>
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onHide(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleAddVehicle}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalAuto;
