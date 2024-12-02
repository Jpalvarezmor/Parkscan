import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import dayjs from 'dayjs';
import config from '../config';

import ModalMatricula from './ModalMatricula';
import ModalPago from './ModalPago';

function MatriculaForm({ selectedEstacionamiento, user, setRefreshTrigger }) {
  const [matricula, setMatricula] = useState('');
  const [showModalMatricula, setShowModalMatricula] = useState(false);
  const [showModalPago, setShowModalPago] = useState(false);
  const [espaciosDisponibles, setEspaciosDisponibles] = useState([]);
  const [matriculaData, setMatriculaData] = useState({});
  const [metodoPago, setMetodoPago] = useState('efectivo');

  useEffect(() => {
    const fetchEspaciosDisponibles = async () => {
      if (!selectedEstacionamiento) return;

      try {
        const response = await fetch(
          `${config.apiBaseUrl}/api/estacionamiento/estacionamientos/${selectedEstacionamiento.id}/espacios-disponibles`
        );
        const data = await response.json();
        if (data.success) {
          setEspaciosDisponibles(data.espaciosDisponibles);
        } else {
          console.error('Error al obtener espacios disponibles:', data.message);
        }
      } catch (error) {
        console.error('Error al obtener espacios disponibles:', error);
      }
    };

    fetchEspaciosDisponibles();
  }, [selectedEstacionamiento]);

  const handleMatriculaSubmit = async () => {
    const formattedMatricula = matricula.replace(/\s+/g, '').toUpperCase();

    if (!/^[A-Z]{4}\d{2}$/.test(formattedMatricula)) {
      alert('Matrícula incorrecta');
      return;
    }

    if (!selectedEstacionamiento) {
      alert('Por favor selecciona un estacionamiento.');
      return;
    }

    try {
      const checkResponse = await fetch(`${config.apiBaseUrl}/api/matricula/check_matricula`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: formattedMatricula,
          rut_trabajador: user.rut,
        }),
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        if (checkData.access) {
          obtenerDatosPago(formattedMatricula);
        } else {
          alert(checkData.message);
        }
      } else {
        setMatricula(formattedMatricula);
        setShowModalMatricula(true);
      }
    } catch (error) {
      console.error('Error al verificar matrícula:', error);
      alert('Error al verificar matrícula');
    }
  };

  const obtenerDatosPago = async (matriculaVehiculo) => {
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
        setShowModalPago(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error al obtener datos de pago:', error);
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
        setShowModalPago(false);
        setRefreshTrigger((prev) => !prev);
        setMatricula('');
      } else {
        alert('Error al procesar el pago: ' + data.message);
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
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
        setRefreshTrigger((prev) => !prev);
        setMatricula('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error al estacionar el vehículo:', error);
    }
  };

  return (
    <>
      <Form.Group style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
        <Form.Control
          type="text"
          placeholder="Ingrese la matrícula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <Button variant="warning" onClick={handleMatriculaSubmit} style={{ color: 'black' }}>
          Confirmar
        </Button>
      </Form.Group>

      <ModalMatricula
        show={showModalMatricula}
        onClose={() => setShowModalMatricula(false)}
        matriculaInicial={matricula}
        espaciosDisponibles={espaciosDisponibles}
        handleEstacionar={handleEstacionar}
      />

      <ModalPago
        show={showModalPago}
        onClose={() => setShowModalPago(false)}
        matriculaData={matriculaData}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        handlePago={handlePago}
      />
    </>
  );
}

export default MatriculaForm;
