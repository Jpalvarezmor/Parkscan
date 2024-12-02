import React, { useState, useEffect } from 'react';
import { Table, Form, Row, Col } from 'react-bootstrap';
import dayjs from 'dayjs';
import config from '../config';

function Historial({ selectedEstacionamiento, refreshTrigger }) {
  const [historial, setHistorial] = useState([]);
  const [filteredHistorial, setFilteredHistorial] = useState([]);

  // Estado para el filtro de fecha
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!selectedEstacionamiento) return;

      try {
        const response = await fetch(
          `${config.apiBaseUrl}/api/estacionamiento/historial?id_estacionamiento=${selectedEstacionamiento.id}`
        );
        const data = await response.json();
        if (data.success) {
          setHistorial(data.historial);
        } else {
          alert('Error al obtener el historial');
        }
      } catch (error) {
        console.error('Error al obtener el historial:', error);
        alert('Error al obtener el historial');
      }
    };

    fetchHistorial();
  }, [selectedEstacionamiento, refreshTrigger]);

  // Aplicar filtro por fecha
  useEffect(() => {
    let filtered = historial.map((pago) => {
      const fechaIngreso = dayjs(pago.fecha_ingreso);
      const fechaSalida = dayjs(pago.fecha_salida);
      return {
        ...pago,
        fechaIngreso,
        fechaSalida,
      };
    });

    if (fecha) {
      const selectedDate = dayjs(fecha);
      filtered = filtered.filter((pago) =>
        pago.fechaIngreso.isSame(selectedDate, 'day')
      );
    }

    setFilteredHistorial(filtered);
  }, [historial, fecha]);

  return (
    <div style={{ overflowX: 'auto' }} className="tab-content-background">
      {/* Filtros */}
      <Form>
        <Row className="mb-3">
          <Col>
            <Form.Label>Fecha</Form.Label>
            <Form.Control
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </Col>
        </Row>
      </Form>

      {/* Tabla */}
      <Table striped bordered hover responsive="md">
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Fecha</th>
            <th>Hora de Ingreso</th>
            <th>Hora de Salida</th>
            <th>Tiempo Estacionado (min)</th>
            <th>Monto Total ($)</th>
            <th>Método de Pago</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistorial.map((pago) => (
            <tr key={pago.pago_id}>
              <td>{pago.matricula}</td>
              <td>{pago.fechaIngreso.format('DD/MM/YYYY')}</td>
              <td>{pago.fechaIngreso.format('HH:mm:ss')}</td>
              <td>{pago.fechaSalida.format('HH:mm:ss')}</td>
              <td>{pago.tiempo_estacionado}</td>
              <td>${pago.monto_total}</td>
              <td>{pago.metodo_pago}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default Historial;
