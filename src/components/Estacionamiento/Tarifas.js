// src/components/Estacionamiento/Tarifas.js

import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Card } from 'react-bootstrap';
import config from '../config';
import ModalTarifa from './ModalTarifa'; // Importamos el modal modularizado
import styled from 'styled-components';
import { FaSyncAlt } from 'react-icons/fa';

const TarifasContainer = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
`;

const DiaColumn = styled.div`
  flex: 1;
  min-width: 100px;
  scroll-snap-align: start;
  margin-right: 10px;

  @media (max-width: 768px) {
    flex: none;
    width: 100%;
    margin-right: 0;
  }
`;

const DiaTarifas = styled.div`
  border: 1px solid #ccc;
  height: 1440px; /* Altura para cubrir las 24 horas */
  position: relative;
`;

function Tarifas({ selectedEstacionamiento, user, setRefreshTrigger }) {
  const [tarifas, setTarifas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTarifa, setModalTarifa] = useState(null); // null para añadir, objeto para editar
  const [diasSemana, setDiasSemana] = useState([]);
  const [nombre, setNombre] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [tarifaMonto, setTarifaMonto] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  useEffect(() => {
    if (selectedEstacionamiento) {
      fetchTarifas();
    }
  }, [selectedEstacionamiento]);

  const fetchTarifas = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/tarifas?id_estacionamiento=${selectedEstacionamiento.id}`
      );
      const data = await response.json();
      if (data.success) {
        setTarifas(data.tarifas);
      } else {
        console.error('Error al obtener tarifas:', data.message);
      }
    } catch (error) {
      console.error('Error al obtener tarifas:', error);
    }
  };

  const handleAddTarifa = () => {
    setModalTarifa(null);
    setNombre('');
    setDiasSemana([]);
    setHoraInicio('');
    setTarifaMonto('');
    setShowModal(true);
    setShowWarning(true);
  };

  const handleEditTarifa = (tarifa) => {
    setModalTarifa(tarifa);
    setNombre(tarifa.nombre);
    setDiasSemana(tarifa.dias_semana.split(','));
    setHoraInicio(tarifa.hora_inicio.slice(0, 5)); // Aseguramos el formato HH:mm
    setTarifaMonto(tarifa.tarifa);
    setShowModal(true);
    setShowWarning(true);
  };

  const handleDeleteTarifa = async (tarifaId) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarifa?')) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/tarifas/${tarifaId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          fetchTarifas();
          setRefreshTrigger((prev) => !prev);
        } else {
          console.error('Error al eliminar tarifa:', data.message);
        }
      } catch (error) {
        console.error('Error al eliminar tarifa:', error);
      }
    }
  };

  const handleRefresh = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/tarifas/refresh`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        fetchTarifas();
        setRefreshTrigger((prev) => !prev);
        alert('Tarifas actualizadas.');
      } else {
        console.error('Error al refrescar tarifas:', data.message);
      }
    } catch (error) {
      console.error('Error al refrescar tarifas:', error);
    }
  };

  // Función para manejar la selección de días
  const handleDiasSemanaChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setDiasSemana([...diasSemana, value]);
    } else {
      setDiasSemana(diasSemana.filter((dia) => dia !== value));
    }
  };

  // Función para ajustar la hora al siguiente múltiplo de 10 minutos
  const adjustTimeToNearestTenMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const adjustedMinutes = Math.ceil(minutes / 10) * 10;
    const adjustedHours = adjustedMinutes === 60 ? (hours + 1) % 24 : hours;
    const finalMinutes = adjustedMinutes === 60 ? 0 : adjustedMinutes;

    return `${adjustedHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  };

  // Obtener tarifas por día y ordenar por hora de inicio
  const tarifasPorDia = (dia) => {
    return tarifas
      .filter((tarifa) => tarifa.dias_semana.includes(dia))
      .sort((a, b) => (a.hora_inicio > b.hora_inicio ? 1 : -1));
  };

  // Generar opciones de tiempo en incrementos de 10 minutos
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // **Definición de handleSubmit**
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ajustar hora a múltiplos de 10 minutos
    const adjustedHoraInicio = adjustTimeToNearestTenMinutes(horaInicio);

    const nuevaTarifa = {
      id_estacionamiento: selectedEstacionamiento.id,
      nombre: nombre,
      dias_semana: diasSemana,
      hora_inicio: adjustedHoraInicio,
      tarifa: parseInt(tarifaMonto, 10),
    };

    try {
      if (modalTarifa) {
        // Editar tarifa
        const response = await fetch(`${config.apiBaseUrl}/api/tarifas/${modalTarifa.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevaTarifa),
        });
        const data = await response.json();
        if (data.success) {
          fetchTarifas();
          setShowModal(false);
          setRefreshTrigger((prev) => !prev);
        } else {
          console.error('Error al actualizar tarifa:', data.message);
        }
      } else {
        // Añadir tarifa
        const response = await fetch(`${config.apiBaseUrl}/api/tarifas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevaTarifa),
        });
        const data = await response.json();
        if (data.success) {
          fetchTarifas();
          setShowModal(false);
          setRefreshTrigger((prev) => !prev);
        } else {
          console.error('Error al añadir tarifa:', data.message);
        }
      }
    } catch (error) {
      console.error('Error al guardar tarifa:', error);
    }
  };

  return (
    <div>
      <Button variant="primary" onClick={handleAddTarifa} className="mb-3">
        Añadir Tarifa
      </Button>
      <Button variant="info" onClick={handleRefresh} className="mb-3 ms-2">
        <FaSyncAlt /> Refrescar Tarifas
      </Button>
      <TarifasContainer>
        {dias.map((dia) => (
          <DiaColumn key={dia}>
            <h5 className="text-center">{dia.charAt(0).toUpperCase() + dia.slice(1)}</h5>
            <DiaTarifas>
              {tarifasPorDia(dia).map((tarifa, index, arr) => {
                // Calcular posición y altura de la tarjeta
                const totalMinutes = 24 * 60; // Total de minutos en un día
                const startMinutes =
                  parseInt(tarifa.hora_inicio.split(':')[0]) * 60 +
                  parseInt(tarifa.hora_inicio.split(':')[1]);
                let endMinutes = totalMinutes;

                // Si hay una siguiente tarifa, su hora de inicio es la hora de fin de la tarifa actual
                if (index < arr.length - 1) {
                  const nextTarifa = arr[index + 1];
                  endMinutes =
                    parseInt(nextTarifa.hora_inicio.split(':')[0]) * 60 +
                    parseInt(nextTarifa.hora_inicio.split(':')[1]);
                }

                const top = (startMinutes / totalMinutes) * 100;
                const height = ((endMinutes - startMinutes) / totalMinutes) * 100;

                return (
                  <Card
                    key={tarifa.id}
                    style={{
                      position: 'absolute',
                      top: `${top}%`,
                      height: `${height}%`,
                      width: '100%',
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                    onClick={() => handleEditTarifa(tarifa)}
                  >
                    <Card.Body>
                      <Card.Title>{tarifa.nombre}</Card.Title>
                      <Card.Text>
                        {tarifa.hora_inicio.slice(0, 5)} -{' '}
                        {index < arr.length - 1 ? arr[index + 1].hora_inicio.slice(0, 5) : '24:00'}
                      </Card.Text>
                      <Card.Text>${parseInt(tarifa.tarifa)}</Card.Text>
                    </Card.Body>
                  </Card>
                );
              })}
            </DiaTarifas>
          </DiaColumn>
        ))}
      </TarifasContainer>

      {/* Modal para añadir/editar tarifa */}
      <ModalTarifa
        showModal={showModal}
        setShowModal={setShowModal}
        modalTarifa={modalTarifa}
        setModalTarifa={setModalTarifa}
        diasSemana={diasSemana}
        setDiasSemana={setDiasSemana}
        nombre={nombre}
        setNombre={setNombre}
        horaInicio={horaInicio}
        setHoraInicio={setHoraInicio}
        tarifaMonto={tarifaMonto}
        setTarifaMonto={setTarifaMonto}
        handleSubmit={handleSubmit}
        handleDiasSemanaChange={handleDiasSemanaChange}
        timeOptions={timeOptions}
        handleDeleteTarifa={handleDeleteTarifa}
        showWarning={showWarning}
        setShowWarning={setShowWarning}
      />
    </div>
  );
}

export default Tarifas;
