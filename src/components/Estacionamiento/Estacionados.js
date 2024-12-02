import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import dayjs from 'dayjs';
import config from '../config';

function Estacionados({ selectedEstacionamiento, handleRowClick, refreshTrigger }) {
  const [estacionados, setEstacionados] = useState([]);

  useEffect(() => {
    const fetchEstacionados = async () => {
      if (!selectedEstacionamiento) return;

      try {
        const response = await fetch(
          `${config.apiBaseUrl}/api/estacionamiento/estacionado?id_estacionamiento=${selectedEstacionamiento.id}`
        );
        const data = await response.json();
        if (data.success) {
          setEstacionados(data.estacionado);
        } else {
          alert('Error al obtener los autos estacionados');
        }
      } catch (error) {
        console.error('Error al obtener los autos estacionados:', error);
        alert('Error al obtener los autos estacionados');
      }
    };

    fetchEstacionados();
  }, [selectedEstacionamiento, refreshTrigger]);

  return (
    <div style={{ overflowX: 'auto' }} className="tab-content-background">
      {/* Tabla */}
      <Table striped bordered hover responsive="md">
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Tarifa</th>
            <th>Tiempo Estacionado (min)</th>
            <th>Total Parcial ($)</th>
          </tr>
        </thead>
        <tbody>
          {estacionados.map((est) => (
            <tr
              key={est.matricula}
              onClick={() =>
                handleRowClick({
                  matricula: est.matricula,
                  fecha: dayjs(est.hora_ingreso).format('DD/MM/YYYY'),
                  tarifa: est.tarifa,
                  tiempo: est.tiempo_estacionado,
                  total: est.monto_total,
                  id_estacionamiento: est.id_estacionamiento,
                  nombre_estacionamiento: est.nombre_estacionamiento,
                  numero_estacionamiento: est.numero_estacionamiento,
                })
              }
            >
              <td>{est.matricula}</td>
              <td>{dayjs(est.hora_ingreso).format('DD/MM/YYYY')}</td>
              <td>{dayjs(est.hora_ingreso).format('HH:mm:ss')}</td>
              <td>${est.tarifa}</td>
              <td>{est.tiempo_estacionado}</td>
              <td>${est.monto_total}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default Estacionados;
