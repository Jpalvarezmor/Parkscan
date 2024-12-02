// routes/reseñaRoutes.js
const express = require('express');
const { addResena, getResena, updateResena } = require('../controllers/ResenaController')

const router = express.Router();

router.post('/add', addResena);
router.get('/get', getResena);
router.post('/update', updateResena);

module.exports = router;
