const express = require('express');
const router = express.Router();
const estacionamientoController = require('../controllers/EstacionamientoController');

router.get('/estacionamientos', estacionamientoController.getEstacionamientos);
router.post('/estacionamientos', estacionamientoController.addEstacionamiento);
router.put('/estacionamientos/:id', estacionamientoController.updateEstacionamiento);
router.delete('/estacionamientos/:id', estacionamientoController.deleteEstacionamiento);

router.get('/estacionado', estacionamientoController.getEstacionadoByEstacionamiento);
router.get('/historial', estacionamientoController.getHistorialByEstacionamiento);
router.get('/ocupacion', estacionamientoController.getEstacionamientoOcupacion);

router.get('/estacionamientos/:id/distribucion', estacionamientoController.getDistribucion);
router.put('/estacionamientos/:id/distribucion', estacionamientoController.updateDistribucion);

router.get('/estacionamientos/:id_estacionamiento/estado-espacios', estacionamientoController.getEstadoEspacios);
router.post('/estacionamientos/:id_estacionamiento/estacionar', estacionamientoController.estacionarVehiculo);
router.post('/estacionamientos/:id_estacionamiento/procesar-pago', estacionamientoController.procesarPago);

router.get('/estacionamientos/:id_estacionamiento/espacios-disponibles', estacionamientoController.getEspaciosDisponibles);
router.post('/estacionamientos/obtener-datos-pago', estacionamientoController.obtenerDatosPago);

module.exports = router;
