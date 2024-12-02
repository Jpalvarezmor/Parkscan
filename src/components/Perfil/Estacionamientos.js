// Estacionamientos.js
import React, { useState, useEffect } from 'react';
import { Card, Button, InputGroup, FormControl } from 'react-bootstrap';
import ModalAddEstacionamiento from './ModalAddEstacionamiento';
import ModalEditEstacionamiento from './ModalEditEstacionamiento';
import ModalDetalleEstacionamiento from './ModalDetalleEstacionamiento';
import ModalDeleteEstacionamiento from './ModalDeleteEstacionamiento';
import config from '../config';

function Estacionamientos({ user }) {
  const [estacionamientos, setEstacionamientos] = useState([]);
  const [filteredEstacionamientos, setFilteredEstacionamientos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEstacionamiento, setSelectedEstacionamiento] = useState(null);

  // Obtener estacionamientos desde el backend
  useEffect(() => {
    fetchEstacionamientos();
  }, []);

  const fetchEstacionamientos = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/estacionamiento/estacionamientos`);
      const data = await response.json();
      setEstacionamientos(data);
      setFilteredEstacionamientos(data);
    } catch (error) {
      console.error('Error al obtener estacionamientos:', error);
    }
  };

  // Filtrar estacionamientos según el término de búsqueda
  useEffect(() => {
    const results = estacionamientos.filter((est) =>
      est.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEstacionamientos(results);
  }, [searchTerm, estacionamientos]);

  // Manejar cambios en el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Funciones para manejar la apertura de modales
  const handleShowDetailModal = (estacionamiento) => {
    setSelectedEstacionamiento(estacionamiento);
    setShowDetailModal(true);
  };

  const handleShowEditModal = (estacionamiento) => {
    setSelectedEstacionamiento(estacionamiento);
    setShowEditModal(true);
  };

  const handleShowDeleteModal = (estacionamiento) => {
    setSelectedEstacionamiento(estacionamiento);
    setShowDeleteModal(true);
  };

  // Funciones para manejar operaciones (añadir, editar, eliminar)
  const handleAddEstacionamiento = async (newEstacionamiento) => {
    try {
      if (!user || !user.rut) {
        console.error('El usuario no tiene un RUT definido.');
        return;
      }
  
      const response = await fetch(`${config.apiBaseUrl}/api/estacionamiento/estacionamientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEstacionamiento, rut_trabajador: user.rut }), // Incluye el RUT
      });
  
      if (response.ok) {
        fetchEstacionamientos();
        setShowAddModal(false);
      } else {
        console.error('Error al añadir estacionamiento');
      }
    } catch (error) {
      console.error('Error al añadir estacionamiento:', error);
    }
  };
  
  

  const handleEditEstacionamiento = async (updatedEstacionamiento) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/estacionamiento/estacionamientos/${updatedEstacionamiento.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEstacionamiento),
        }
      );

      if (response.ok) {
        fetchEstacionamientos();
        setShowEditModal(false);
      } else {
        console.error('Error al editar estacionamiento');
      }
    } catch (error) {
      console.error('Error al editar estacionamiento:', error);
    }
  };

  const handleDeleteEstacionamiento = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/estacionamiento/estacionamientos/${selectedEstacionamiento.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        fetchEstacionamientos();
        setShowDeleteModal(false);
      } else {
        console.error('Error al eliminar estacionamiento');
      }
    } catch (error) {
      console.error('Error al eliminar estacionamiento:', error);
    }
  };

  return (
    <div className="tab-content-background">
      <h3>Estacionamientos</h3>
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Buscar estacionamiento por nombre"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </InputGroup>
      <Button variant="primary" onClick={() => setShowAddModal(true)} className="mb-3">
        Añadir Estacionamiento
      </Button>
      {filteredEstacionamientos.map((est) => (
        <Card key={est.id} className="mb-3">
          <Card.Body>
            <Card.Title>{est.nombre}</Card.Title>
            <Card.Text>
              <strong>Dirección:</strong> {est.direccion} <br />
              <strong>Capacidad:</strong> {est.capacidad}
            </Card.Text>
            <Button variant="info" onClick={() => handleShowDetailModal(est)} className="mr-2">
              Ver Detalles
            </Button>
            <Button variant="warning" onClick={() => handleShowEditModal(est)} className="mr-2">
              Editar
            </Button>
            <Button variant="danger" onClick={() => handleShowDeleteModal(est)}>
              Eliminar
            </Button>
          </Card.Body>
        </Card>
      ))}

      {/* Modal para Añadir Estacionamiento */}
      <ModalAddEstacionamiento
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleAddEstacionamiento={handleAddEstacionamiento}
      />

      {/* Modal para Detalles del Estacionamiento */}
      <ModalDetalleEstacionamiento
        show={showDetailModal}
        handleClose={() => setShowDetailModal(false)}
        estacionamiento={selectedEstacionamiento}
        handleShowEditModal={handleShowEditModal}
        handleShowDeleteModal={handleShowDeleteModal}
      />

      {/* Modal para Editar Estacionamiento */}
      <ModalEditEstacionamiento
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        estacionamiento={selectedEstacionamiento}
        handleEditEstacionamiento={handleEditEstacionamiento}
      />

      {/* Modal de Confirmación para Eliminar Estacionamiento */}
      <ModalDeleteEstacionamiento
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        estacionamiento={selectedEstacionamiento}
        handleDeleteEstacionamiento={handleDeleteEstacionamiento}
      />
    </div>
  );
}

export default Estacionamientos;
