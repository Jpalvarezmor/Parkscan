// src/components/Estacionamiento/Estacionar.js

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import config from '../config';
import autoImg from './auto2.png'; // Asegúrate de tener "auto2.png" en el directorio correcto
import ModalMatricula from './ModalMatricula';
import ModalPago from './ModalPago';
import dayjs from 'dayjs';
import handlePago from './handlePago';

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 200px); /* Ajusta la altura según sea necesario */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4c4c4c;
  overflow: hidden;
`;

const ScrollableArea = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: #888 #4c4c4c;

  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }

  &::-webkit-scrollbar-track {
    background-color: #4c4c4c;
  }
`;

const GridContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'dimensionX',
})`
  display: grid;
  grid-template-columns: repeat(${(props) => props.dimensionX}, 120px);
  grid-auto-rows: 60px;
  background-color: #4c4c4c;
`;

const GridCell = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isParkingSpace',
})`
  width: 120px;
  height: 60px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.isParkingSpace ? 'pointer' : 'default')};
  border: ${(props) => (props.isParkingSpace ? '2px solid white' : 'none')};
`;

const NumeroEspacio = styled.span`
  color: white;
  font-size: 14px;
  font-weight: bold;
  position: absolute;
  left: 45px;
  z-index: 2;
`;

const IconoAuto = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
  position: absolute;
  transform: rotate(90deg);
  z-index: 1;
`;

function Estacionar({ selectedEstacionamiento, currentTime, user, setRefreshTrigger }) {
  const [dimensionX, setDimensionX] = useState(0);
  const [dimensionY, setDimensionY] = useState(0);
  const [distribucion, setDistribucion] = useState([]);
  const [ocupados, setOcupados] = useState({});
  const [showModalMatricula, setShowModalMatricula] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [currentEspacio, setCurrentEspacio] = useState(null);
  const [matriculaData, setMatriculaData] = useState({});
  const [metodoPago, setMetodoPago] = useState('efectivo');

  useEffect(() => {
    if (selectedEstacionamiento) {
      fetchEstadoEspacios();
    }
  },  [selectedEstacionamiento, setRefreshTrigger]);

  const fetchEstadoEspacios = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/estacionamiento/estacionamientos/${selectedEstacionamiento.id}/estado-espacios`
      );
      const data = await response.json();
      if (data.success) {
        setDimensionX(data.distribucion[0].length);
        setDimensionY(data.distribucion.length);
        setDistribucion(data.distribucion);
        setOcupados(data.ocupados);
      } else {
        console.error('Error al obtener el estado de los espacios:', data.message);
      }
    } catch (error) {
      console.error('Error al obtener el estado de los espacios:', error);
    }
  };

  const handleCellClick = (numeroEspacio) => {
    if (ocupados[numeroEspacio]) {
      const matriculaVehiculo = ocupados[numeroEspacio];
      obtenerDatosPago(matriculaVehiculo, numeroEspacio);
    } else {
      setCurrentEspacio(numeroEspacio);
      setShowModalMatricula(true);
    }
  };

  const obtenerDatosPago = async (matriculaVehiculo, numeroEspacio) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/estacionamiento/estacionamientos/obtener-datos-pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: matriculaVehiculo,
          id_estacionamiento: selectedEstacionamiento.id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMatriculaData({
          matricula: matriculaVehiculo,
          fecha: dayjs(data.hora_ingreso).format('DD/MM/YYYY'),
          hora: dayjs(data.hora_ingreso).format('HH:mm:ss'),
          tarifa: data.tarifa,
          tiempo: data.tiempo_estacionado,
          total: data.monto_total,
          numero_estacionamiento: data.numero_estacionamiento,
          id_estacionamiento: selectedEstacionamiento.id,
          nombre_estacionamiento: selectedEstacionamiento.nombre,
        });
        setMetodoPago('efectivo');
        setShowPagoModal(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error al obtener datos de pago:', error);
    }
  };

  const handleEstacionar = async (matriculaIngresada, numeroEstacionamiento) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/estacionamiento/estacionamientos/${selectedEstacionamiento.id}/estacionar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matricula: matriculaIngresada,
            numero_estacionamiento: numeroEstacionamiento,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setShowModalMatricula(false);
        fetchEstadoEspacios();
        setRefreshTrigger((prev) => !prev);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error al estacionar el vehículo:', error);
    }
  };

  const handlePago = async () => {
    try {
      const {
        matricula,
        id_estacionamiento,
        numero_estacionamiento,
      } = matriculaData;
  
      const response = await fetch(`${config.apiBaseUrl}/api/matricula/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estacionamiento,
          matricula,
          metodo_pago: metodoPago,
          numero_estacionamiento,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        alert('Pago procesado correctamente.');
        setShowPagoModal(false);
        
        // Actualizar estado y vista
        setRefreshTrigger((prev) => !prev);
        fetchEstadoEspacios(); // Llamada adicional para refrescar la distribución y ocupados
      } else {
        alert('Error al procesar el pago: ' + data.message);
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
    }
  };
  
  
  return (
    <Container>
      <ScrollableArea>
        <GridContainer dimensionX={dimensionX}>
          {distribucion.map((row, rowIndex) =>
            row.map((numeroEspacio, colIndex) => (
              <GridCell
                key={`${rowIndex}-${colIndex}`}
                isParkingSpace={numeroEspacio > 0}
                onClick={() => numeroEspacio > 0 && handleCellClick(numeroEspacio)}
              >
                {numeroEspacio > 0 && (
                  <>
                    {ocupados[numeroEspacio] ? (
                      <>
                        <IconoAuto src={autoImg} alt="auto" />
                        <NumeroEspacio>{numeroEspacio}</NumeroEspacio>
                      </>
                    ) : (
                      <NumeroEspacio>{numeroEspacio}</NumeroEspacio>
                    )}
                  </>
                )}
              </GridCell>
            ))
          )}
        </GridContainer>
      </ScrollableArea>

      {/* ModalMatricula */}
      <ModalMatricula
        show={showModalMatricula}
        onClose={() => setShowModalMatricula(false)}
        matriculaInicial=""
        espacioInicial={currentEspacio}
        espaciosDisponibles={[currentEspacio]}
        handleEstacionar={handleEstacionar}
      />

      {/* ModalPago */}
      <ModalPago
        show={showPagoModal}
        onClose={() => setShowPagoModal(false)}
        matriculaData={matriculaData}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        handlePago={handlePago}
      />
    </Container>
  );
}

export default Estacionar;
