// controllers/vehicleController.js
const db = require('../config/db'); // Asegúrate de que el archivo de configuración de la base de datos esté en 'config/db.js'

exports.addAuto = (req, res) => {
  const { matricula, usuario_id, modelo, color } = req.body;
  const sql = `INSERT INTO vehiculo (matricula, usuario_id, modelo, color) VALUES (?, ?, ?, ?)`;

  db.query(sql, [matricula, usuario_id, modelo, color], (error) => {
    if (error) {
      console.error('Error al insertar vehículo:', error);
      res.status(500).json({ success: false, message: 'Error al insertar vehículo' });
    } else {
      res.status(201).json({ success: true, message: 'Vehículo añadido correctamente' });
    }
  });
};

exports.deleteAuto = (req, res) => {
  const { matricula } = req.body;
  const sql = 'DELETE FROM vehiculo WHERE matricula = ?';

  db.query(sql, [matricula], (error) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error al eliminar vehículo' });
    } else {
      res.json({ success: true, message: 'Vehículo eliminado correctamente' });
    }
  });
};

exports.getAutosByUser = (req, res) => {
  const { rut } = req.query;
  const sql = `SELECT * FROM vehiculo WHERE usuario_id = ?`;

  db.query(sql, [rut], (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error al obtener vehículos' });
    } else {
      res.json({ success: true, autos: results });
    }
  });
};

exports.checkAutoStatus = (req, res) => {
  const { matricula } = req.query;
  const sql = `SELECT e.matricula, e.hora_ingreso, e.tarifa, es.nombre AS nombre_estacionamiento
FROM estacionado e
JOIN estacionamiento es ON e.Id_estacionamiento = es.id
WHERE e.matricula = ?`;

  db.query(sql, [matricula], (error, results) => {
    if (error) {
      console.error('Error al verificar el estado de estacionamiento del vehículo:', error);
      res.status(500).json({ success: false, message: 'Error al verificar el estado de estacionamiento' });
    } else if (results.length > 0) {
      res.json({ success: true, estacionado: results[0] });
    } else {
      res.json({ success: false, message: 'Vehículo no estacionado' });
    }
  });
};
exports.getEstacionadoByEstacionamiento = (req, res) => {
  const { id_estacionamiento } = req.query;
  const sql = `
    SELECT e.matricula, e.hora_ingreso, e.tarifa, est.nombre AS nombre_estacionamiento, e.id_estacionamiento
    FROM estacionado e
    INNER JOIN estacionamiento est ON e.id_estacionamiento = est.id
    WHERE e.id_estacionamiento = ?
  `;
  db.query(sql, [id_estacionamiento], (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error al obtener estacionados' });
    } else {
      res.json({ success: true, estacionado: results });
    }
  });
};

exports.getHistorialByEstacionamiento = (req, res) => {
  const { id_estacionamiento } = req.query;
  const sql = `
    SELECT p.*, est.nombre AS nombre_estacionamiento
    FROM pagos p
    INNER JOIN estacionamiento est ON p.id_estacionamiento = est.id
    WHERE p.id_estacionamiento = ?
  `;
  db.query(sql, [id_estacionamiento], (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error al obtener historial' });
    } else {
      res.json({ success: true, historial: results });
    }
  });
};