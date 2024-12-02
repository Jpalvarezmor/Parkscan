// routes/autoRoutes.js
const express = require('express');
const {
  addAuto,
  deleteAuto,
  getAutosByUser,
  checkAutoStatus,
  getEstacionadoByEstacionamiento,
  getHistorialByEstacionamiento
} = require('../controllers/AutoController');

const router = express.Router();

router.post('/add', addAuto);               // Ruta para añadir un vehículo
router.post('/delete', deleteAuto);          // Ruta para eliminar un vehículo
router.get('/user', getAutosByUser);         // Ruta para obtener vehículos de un usuario
router.get('/status', checkAutoStatus);      // Ruta para verificar el estado de estacionamiento de un vehículo
router.get('/estacionados', getEstacionadoByEstacionamiento); 
router.get('/historial', getHistorialByEstacionamiento); 
module.exports = router;
