// server/index.js

const express = require('express');
const cors = require('cors');
const http = require('http');
const db = require('./config/db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Importar rutas
const userRoutes = require('./routes/UsuarioRoutes');
const vehicleRoutes = require('./routes/AutoRoutes');
const paymentRoutes = require('./routes/PagoRoutes');
const estacionamientoRoutes = require('./routes/EstacionamientoRoutes');
const matriculaRoutes = require('./routes/MatriculaRoutes');
const resenaRoutes = require('./routes/ResenaRoutes');
const tarifaRoutes = require('./routes/TarifaRoutes');
const trabajadorRoutes = require('./routes/TrabajadorRoutes');

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/auto', vehicleRoutes);
app.use('/api/pago', paymentRoutes);
app.use('/api/estacionamiento', estacionamientoRoutes);
app.use('/api/matricula', matriculaRoutes);
app.use('/api/resenas', resenaRoutes);
app.use('/api', tarifaRoutes); //
app.use('/api/trabajadores', trabajadorRoutes);



require('./tarifaScheduler');

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
