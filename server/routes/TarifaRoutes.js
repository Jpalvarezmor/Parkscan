// routes/tarifaRoutes.js
const express = require('express');
const router = express.Router();
const tarifaController = require('../controllers/TarifaController');

router.get('/tarifas', tarifaController.getTarifas);
router.post('/tarifas', tarifaController.addTarifa);
router.put('/tarifas/:id', tarifaController.updateTarifa);
router.delete('/tarifas/:id', tarifaController.deleteTarifa);
router.post('/tarifas/refresh', tarifaController.refreshTarifas);

module.exports = router;
