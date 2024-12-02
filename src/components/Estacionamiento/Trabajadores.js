// src/components/Estacionamiento/Trabajadores.js

import React, { useState, useEffect } from 'react';
import { Card, Button, InputGroup, FormControl, Modal, Form } from 'react-bootstrap';
import config from '../config';

function Trabajadores({ selectedEstacionamiento }) {
  const [trabajadores, setTrabajadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrabajador, setNewTrabajador] = useState({
    rut: '',
    nombre: '',
    correo: '',
    telefono: '',
  });

  // Obtener trabajadores
  useEffect(() => {
    if (selectedEstacionamiento) {
      fetchTrabajadores();
    }
  }, [selectedEstacionamiento]);

  const fetchTrabajadores = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/trabajadores/list?id_estacionamiento=${selectedEstacionamiento.id}&searchTerm=${searchTerm}`
      ); // La URL ya pasa correctamente el id_estacionamiento
      const data = await response.json();
      if (data.success) {
        setTrabajadores(data.trabajadores);
      } else {
        console.error('Error al obtener trabajadores:', data.message);
      }
    } catch (error) {
      console.error('Error al obtener trabajadores:', error);
    }
  };
  
  // Manejar cambios en el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Buscar trabajadores cuando cambia el término de búsqueda
  useEffect(() => {
    fetchTrabajadores();
  }, [searchTerm]);

  // Manejar cambio en los campos del nuevo trabajador
  const handleNewTrabajadorChange = (e) => {
    setNewTrabajador({
      ...newTrabajador,
      [e.target.name]: e.target.value,
    });
  };

  // Manejar envío del formulario para agregar trabajador
  const handleAddTrabajador = async (e) => {
    e.preventDefault();

    const { rut, nombre, correo, telefono } = newTrabajador;

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/trabajadores/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut,
          nombre,
          correo,
          telefono,
          id_estacionamiento: selectedEstacionamiento.id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchTrabajadores();
        setShowAddModal(false);
        setNewTrabajador({ rut: '', nombre: '', correo: '', telefono: '' });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error al agregar trabajador:', error);
    }
  };

  // Manejar eliminación de la relación trabajador-estacionamiento
  const handleDeleteTrabajador = async (rut_trabajador) => {
    if (window.confirm('¿Estás seguro de eliminar este trabajador del estacionamiento?')) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/trabajadores/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rut_trabajador,
            id_estacionamiento: selectedEstacionamiento.id,
          }),
        });
        const data = await response.json();
        if (data.success) {
          fetchTrabajadores();
        } else {
          console.error('Error al eliminar trabajador:', data.message);
        }
      } catch (error) {
        console.error('Error al eliminar trabajador:', error);
      }
    }
  };

  return (
    <div>
      <h3>Trabajadores</h3>
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Buscar trabajador por nombre"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </InputGroup>
      <Button variant="primary" onClick={() => setShowAddModal(true)} className="mb-3">
        Añadir Trabajador
      </Button>
      {trabajadores.map((trabajador) => (
        <Card key={trabajador.rut} className="mb-3">
          <Card.Body>
            <Card.Title>{trabajador.nombre}</Card.Title>
            <Card.Text>
              <strong>RUT:</strong> {trabajador.rut} <br />
              <strong>Correo:</strong> {trabajador.correo} <br />
              <strong>Teléfono:</strong> {trabajador.telefono}
            </Card.Text>
            <Button variant="danger" onClick={() => handleDeleteTrabajador(trabajador.rut)}>
              Eliminar
            </Button>
          </Card.Body>
        </Card>
      ))}

      {/* Modal para Añadir Trabajador */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Form onSubmit={handleAddTrabajador}>
          <Modal.Header closeButton>
            <Modal.Title>Añadir Trabajador</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="rut">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={newTrabajador.rut}
                onChange={handleNewTrabajadorChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={newTrabajador.nombre}
                onChange={handleNewTrabajadorChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="correo">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                name="correo"
                value={newTrabajador.correo}
                onChange={handleNewTrabajadorChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="telefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="telefono"
                value={newTrabajador.telefono}
                onChange={handleNewTrabajadorChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Añadir
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Trabajadores;
