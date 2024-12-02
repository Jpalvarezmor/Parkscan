// controllers/tarifaController.js
const db = require('../config/db');
const refrescarTarifas = require('../tarifaScheduler');

// Obtener tarifas de un estacionamiento
exports.getTarifas = (req, res) => {
  const { id_estacionamiento } = req.query;

  const sql = 'SELECT * FROM tarifa WHERE id_estacionamiento = ?';
  db.query(sql, [id_estacionamiento], (error, results) => {
    if (error) {
      console.error('Error al obtener tarifas:', error);
      res.status(500).json({ success: false, message: 'Error al obtener tarifas' });
    } else {
      res.json({ success: true, tarifas: results });
    }
  });
};

// Añadir una tarifa
exports.addTarifa = (req, res) => {
  const {
    id_estacionamiento,
    nombre,
    dias_semana,
    hora_inicio,
    tarifa,
  } = req.body;

  const sql = 'INSERT INTO tarifa (id_estacionamiento, nombre, dias_semana, hora_inicio, tarifa) VALUES (?, ?, ?, ?, ?)';
  db.query(
    sql,
    [id_estacionamiento, nombre, dias_semana.join(','), hora_inicio, tarifa],
    (error, results) => {
      if (error) {
        console.error('Error al añadir tarifa:', error);
        res.status(500).json({ success: false, message: 'Error al añadir tarifa' });
      } else {
        res.json({ success: true, message: 'Tarifa añadida', id: results.insertId });
      }
    }
  );
};

// Modificar una tarifa
exports.updateTarifa = (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    dias_semana,
    hora_inicio,
    tarifa,
  } = req.body;

  const sql = 'UPDATE tarifa SET nombre = ?, dias_semana = ?, hora_inicio = ?, tarifa = ? WHERE id = ?';
  db.query(
    sql,
    [nombre, dias_semana.join(','), hora_inicio, tarifa, id],
    (error, results) => {
      if (error) {
        console.error('Error al actualizar tarifa:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar tarifa' });
      } else {
        res.json({ success: true, message: 'Tarifa actualizada' });
      }
    }
  );
};

// Eliminar una tarifa
exports.deleteTarifa = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM tarifa WHERE id = ?';
  db.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Error al eliminar tarifa:', error);
      res.status(500).json({ success: false, message: 'Error al eliminar tarifa' });
    } else {
      res.json({ success: true, message: 'Tarifa eliminada' });
    }
  });
};

exports.refreshTarifas = (req, res) => {
  refrescarTarifas.refrescarTarifas();
  res.json({ success: true, message: 'Tarifas actualizadas correctamente.' });
};