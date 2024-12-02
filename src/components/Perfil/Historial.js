import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Row, Col } from 'react-bootstrap';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import ModalHistoria from './ModalHistoria';
import config from '../config';

dayjs.extend(isSameOrAfter);

function Historial({ user }) {
  const [pagos, setPagos] = useState([]);
  const [filteredPagos, setFilteredPagos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [selectedMatricula, setSelectedMatricula] = useState('');
  const [selectedFecha, setSelectedFecha] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);

  // Obtener las matrículas asociadas al usuario
  useEffect(() => {
    const fetchMatriculas = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/auto/user?rut=${user.rut}`);
        const result = await response.json();
        if (result.success) {
          setMatriculas(result.autos.map((auto) => auto.matricula));
        } else {
          console.error('Error al obtener las matrículas:', result.message);
        }
      } catch (error) {
        console.error('Error al obtener las matrículas:', error);
      }
    };

    fetchMatriculas();
  }, [user]);

  // Obtener el historial de pagos
  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/pago/historial_usuario?rut=${user.rut}`);
        const result = await response.json();

        if (result.success) {
          // Debugging: Verificar datos obtenidos
          console.log('Pagos obtenidos:', result.pagos);
          console.log('Vehículos del usuario:', result.vehiculos);

          // Filtrar pagos cuya fecha_ingreso sea posterior o igual a la fecha de registro del vehículo
          const pagosFiltradosPorRegistro = result.pagos.filter((pago) => {
            const vehiculo = result.vehiculos.find((auto) => auto.matricula === pago.matricula);
            if (!vehiculo) return false;

            // Usar `isSameOrAfter` para incluir pagos en la fecha de registro
            return dayjs(pago.fecha_ingreso).isSameOrAfter(dayjs(vehiculo.registro));
          });

          // Debugging: Verificar pagos después del filtrado
          console.log('Pagos filtrados por fecha de registro:', pagosFiltradosPorRegistro);

          setPagos(pagosFiltradosPorRegistro);
          setFilteredPagos(pagosFiltradosPorRegistro);
        } else {
          console.error('Error al obtener los pagos:', result.message);
        }
      } catch (error) {
        console.error('Error al obtener los pagos:', error);
      }
    };

    fetchPagos();
  }, [user]);

  // Función para filtrar los pagos en el frontend
  const filtrarPagos = () => {
    let pagosFiltrados = pagos;

    if (selectedMatricula) {
      pagosFiltrados = pagosFiltrados.filter((pago) => pago.matricula === selectedMatricula);
    }

    if (selectedFecha) {
      const fechaSeleccionada = dayjs(selectedFecha);
      pagosFiltrados = pagosFiltrados.filter((pago) =>
        dayjs(pago.fecha_ingreso).isSame(fechaSeleccionada, 'day')
      );
    }

    setFilteredPagos(pagosFiltrados);
  };

  // Ejecutar el filtrado cada vez que cambian los filtros o los pagos
  useEffect(() => {
    filtrarPagos();
  }, [selectedMatricula, selectedFecha, pagos]);

  const handleCardClick = (pago) => {
    setSelectedPago(pago);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPago(null);
  };

  return (
    <div className="tab-content-background">
      <h3>Historial</h3>
      {/* Filtros */}
      <Form className="mb-3">
        <Row>
          <Col xs={12} md={6}>
            <Form.Group controlId="filtroMatricula">
              <Form.Label>Matrícula</Form.Label>
              <Form.Control
                as="select"
                value={selectedMatricula}
                onChange={(e) => setSelectedMatricula(e.target.value)}
              >
                <option value="">Todas</option>
                {matriculas.map((matricula) => (
                  <option key={matricula} value={matricula}>
                    {matricula}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group controlId="filtroFecha">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={selectedFecha}
                onChange={(e) => setSelectedFecha(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      {/* Lista de pagos */}
      {filteredPagos.length === 0 ? (
        <p>No se encontraron pagos.</p>
      ) : (
        <div className="d-flex flex-column">
          {filteredPagos.map((pago) => (
            <Card
              key={`${pago.matricula}-${pago.fecha_ingreso}`}
              className="w-100 my-2"
              onClick={() => handleCardClick(pago)}
            >
              <Card.Body style={{ textAlign: 'left', cursor: 'pointer' }}>
                <Row>
                  <Col xs={12} md={6}>
                    <p><strong>Matrícula:</strong> {pago.matricula}</p>
                    <p><strong>Estacionamiento:</strong> {pago.nombre_estacionamiento}</p>
                  </Col>
                  <Col xs={12} md={6}>
                    <p><strong>Fecha de Ingreso:</strong> {dayjs(pago.fecha_ingreso).format('DD/MM/YYYY')}</p>
                    <p><strong>Hora de Ingreso:</strong> {dayjs(pago.fecha_ingreso).format('HH:mm:ss')}</p>
                    <p><strong>Monto Total:</strong> ${pago.monto_total}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
      {/* Modal */}
      {selectedPago && (
        <ModalHistoria
          show={showModal}
          onHide={handleCloseModal}
          pago={selectedPago}
          user={user} // Asegúrate de pasar el objeto user
        />
      )}
    </div>
  );
}

export default Historial;
