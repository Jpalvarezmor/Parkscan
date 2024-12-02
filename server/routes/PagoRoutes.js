// routes/pagoRoutes.js
const express = require('express');
const {
  getPagoMethods,
  addPagoMethod,
  deletePagoMethod,
  requestPago,
  getHistorialUsuario
} = require('../controllers/PagoController');

const router = express.Router();

router.get('/methods', getPagoMethods);           // Obtener métodos de pago de un usuario
router.post('/add', addPagoMethod);         // Añadir un método de pago
router.post('/delete', deletePagoMethod);   // Eliminar un método de pago
router.post('/request', requestPago);             // Solicitud de pago
router.get('/historial_usuario', getHistorialUsuario); // Obtener historial de pagos del usuario

module.exports = router;
