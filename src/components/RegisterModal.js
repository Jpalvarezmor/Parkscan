import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import config from './config';

function RegisterModal({ show, handleClose }) {
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [rol, setRol] = useState(3); // Estado para el rol, 3 por defecto

  const handleRegister = (e) => {
    e.preventDefault();

    const newUser = {
      rut,
      nombre,
      correo,
      telefono,
      contraseña,
      rol,
    };

    fetch(`${config.apiBaseUrl}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Error al registrar usuario');
      })
      .then((data) => {
        console.log('Usuario registrado:', data);
        handleClose();
      })
      .catch((error) => console.error('Error al registrar usuario:', error));
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Registrarse</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3" controlId="formRut">
            <Form.Label>RUT</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa tu RUT"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formNombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCorreo">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formTelefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa tu teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formContraseña">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingresa una contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Rol</Form.Label>
            <Form.Check
              type="switch"
              id="rol-switch"
              label={rol === 3 ? 'Usuario' : 'Administrador'}
              checked={rol === 2}
              onChange={() => setRol(rol === 3 ? 2 : 3)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Registrarse
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default RegisterModal;
