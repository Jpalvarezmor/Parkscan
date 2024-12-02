// src/components/Perfil/ModalPerfil.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import config from '../config';

function ModalPerfil({ show, handleClose, user, userData }) {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
  });
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (show && userData) {
      setFormData({
        nombre: userData.nombre || '',
        correo: userData.correo || '',
        telefono: userData.telefono || '',
      });
    }
  }, [show, userData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmEdit = async (e) => {
    e.preventDefault();
    const updatedData = { ...formData, rut: user.rut };
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/users/updateUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedData, password }),
      });
      const result = await response.json();
      if (result.success) {
        alert('Datos actualizados correctamente');
        handleClose(updatedData);
        setPassword('');
      } else {
        alert(result.message || 'Error al actualizar los datos');
      }
    } catch (error) {
      console.error('Error al actualizar los datos del usuario:', error);
    }
  };

  const handleCancel = () => {
    handleClose();
    setPassword('');
  };

  return (
    <Modal show={show} onHide={handleCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Perfil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleConfirmEdit}>
          <Form.Group controlId="formNombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formCorreo">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formTelefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formPassword">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingresa tu contraseña para confirmar"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mt-3 d-flex justify-content-end">
            <Button variant="secondary" onClick={handleCancel} style={{ marginRight: '10px' }}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Confirmar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ModalPerfil;
