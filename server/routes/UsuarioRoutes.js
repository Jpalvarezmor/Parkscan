const express = require('express');
const router = express.Router();
const userController = require('../controllers/UsuarioController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/userdata', userController.getUserData);
router.post('/updateUser', userController.updateUser);
router.get('/trabajador_estacionamientos', userController.getWorkerParkingLots);

module.exports = router;
