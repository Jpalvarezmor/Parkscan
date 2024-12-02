// routes/matriculaRoutes.js
const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/MatriculaController');

router.post('/check_matricula', matriculaController.checkMatricula);
router.post('/insert_matricula', matriculaController.insertMatricula);
router.post('/pagar', matriculaController.procesarPago);

module.exports = router;
