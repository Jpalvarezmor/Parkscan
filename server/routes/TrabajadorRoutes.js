// routes/TrabajadorRoutes.js

const express = require('express');
const {
  addTrabajador,
  getTrabajadores,
  deleteTrabajadorEstacionamiento,
} = require('../controllers/TrabajadorController');

const router = express.Router();

// Ruta para agregar un trabajador
router.post('/add', addTrabajador);

// Ruta para obtener trabajadores (con búsqueda)
router.get('/list', getTrabajadores);

// Ruta para eliminar la relación trabajador-estacionamiento
router.post('/delete', deleteTrabajadorEstacionamiento);

module.exports = router;
