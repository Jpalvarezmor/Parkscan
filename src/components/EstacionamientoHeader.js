// src/components/EstacionamientoHeader.js

import React from 'react';
import { Dropdown, Container, Row, Col } from 'react-bootstrap';
import ProgressBar from 'react-bootstrap/ProgressBar';

function EstacionamientoHeader({
  estacionamientos,
  selectedEstacionamiento,
  setSelectedEstacionamiento,
  currentTime,
  trabajadorNombre,
  porcentajeOcupacion,
  ocupacion,
  barVariant,
}) {
  return (
    <Container fluid>
      <Row className="align-items-center text-md-start text-center">
        <Col xs={12} md={4} className="mb-2 text-md-start text-center">
          <Dropdown
            onSelect={(id) =>
              setSelectedEstacionamiento(estacionamientos.find((est) => est.id === parseInt(id)))
            }
          >
            <Dropdown.Toggle variant="primary" id="dropdown-estacionamiento" style={{ width: '100%' }}>
              {selectedEstacionamiento ? selectedEstacionamiento.nombre : 'Seleccionar Estacionamiento'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {estacionamientos.map((est) => (
                <Dropdown.Item key={est.id} eventKey={est.id}>
                  {est.nombre}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>

        <Col
          xs={12}
          md={8}
          className="d-flex flex-column flex-md-row align-items-start align-items-md-center text-md-start text-center"
        >
          <p className="mb-1 mb-md-0 me-md-3">
            <strong>Fecha:</strong> {currentTime.format('DD/MM/YYYY')}
          </p>
          <p className="mb-1 mb-md-0 me-md-3">
            <strong>Hora:</strong> {currentTime.format('HH:mm:ss')}
          </p>
          <p className="mb-1 mb-md-0 me-md-3">
            <strong>Trabajador:</strong> {trabajadorNombre || 'Cargando...'}
          </p>
          <p className="mb-1 mb-md-0 me-md-3">
            <strong>Tarifa:</strong> ${selectedEstacionamiento?.tarifa || 'N/A'}
          </p>
        </Col>
      </Row>

      {/* Nueva fila para la capacidad y la barra de progreso */}
      <Row className="align-items-center text-md-start text-center mt-3">
        <Col xs={12} md={4} className="mb-2 text-md-start text-center">
          <p className="mb-1 mb-md-0 me-md-3">
            <strong>Capacidad:</strong>
          </p>
        </Col>
        <Col xs={12} md={8}>
          <ProgressBar
            now={porcentajeOcupacion}
            label={`${ocupacion}/${selectedEstacionamiento?.capacidad || 'N/A'}`}
            variant={barVariant}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default EstacionamientoHeader;
