// src/components/Estacionamiento/handlePago.js

import config from '../config';

const handlePago = async (
  matriculaData,
  metodoPago,
  rut_usuario,
  setRefreshTrigger,
  setShowPagoModal
) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/estacionamiento/registrar-pago`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_estacionamiento: matriculaData.id_estacionamiento,
        matricula: matriculaData.matricula,
        fecha_ingreso: matriculaData.hora_ingreso,
        fecha_salida: new Date().toISOString(),
        tiempo_estacionado: matriculaData.tiempo,
        monto_total: matriculaData.total,
        metodo_pago: metodoPago,
        rut_usuario: rut_usuario,
        numero_estacionamiento: matriculaData.numero_estacionamiento,
      }),
    });
    const data = await response.json();
    if (data.success) {
      alert('Pago registrado y vehículo retirado');
      setShowPagoModal(false);
      setRefreshTrigger((prev) => !prev);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error al registrar el pago:', error);
    alert('Error al registrar el pago');
  }
};

export default handlePago;
