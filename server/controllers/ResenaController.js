// controllers/reseñaController.js
const db = require('../config/db');

exports.addResena = (req, res) => {
  const { id_estacionamiento, usuario_id, matricula, fecha_ingreso, calificacion, comentario } = req.body;

  // Formatear la fecha de ingreso correctamente
  const fechaIngresoFormatted = fecha_ingreso ? fecha_ingreso.replace('Z', '') : null;

  const insertReseñaSql = `
    INSERT INTO reseñas (id_estacionamiento, usuario_id, matricula, fecha_ingreso, calificacion, comentario)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Ejecuta la consulta con el valor de fecha_ingreso formateado
  db.query(
    insertReseñaSql,
    [id_estacionamiento, usuario_id, matricula, fechaIngresoFormatted, calificacion, comentario],
    (error, results) => {
      if (error) {
        console.error('Error al insertar la reseña:', error);
        res.status(500).json({ success: false, message: 'Error al insertar la reseña' });
      } else {
        res.json({ success: true, message: 'Reseña añadida con éxito' });
      }
    }
  );
};


exports.getResena = (req, res) => {
  const { usuario_id, matricula, fecha_ingreso } = req.query;

  const getReseñaSql = `
    SELECT * FROM reseñas
    WHERE usuario_id = ? AND matricula = ? AND fecha_ingreso = ?
  `;

  db.query(getReseñaSql, [usuario_id, matricula, fecha_ingreso], (error, results) => {
    if (error) {
      console.error('Error al obtener la reseña:', error);
      res.status(500).json({ success: false, message: 'Error al obtener la reseña' });
    } else if (results.length > 0) {
      res.json({ success: true, reseña: results[0] });
    } else {
      res.json({ success: true, reseña: null });
    }
  });
};

exports.updateResena = (req, res) => {
  const { id_estacionamiento, usuario_id, matricula, fecha_ingreso, calificacion, comentario } = req.body;

  const updateReseñaSql = `
    UPDATE reseñas
    SET calificacion = ?, comentario = ?
    WHERE id_estacionamiento = ? AND usuario_id = ? AND matricula = ? AND fecha_ingreso = ?
  `;

  db.query(
    updateReseñaSql,
    [calificacion, comentario, id_estacionamiento, usuario_id, matricula, fecha_ingreso],
    (error, results) => {
      if (error) {
        console.error('Error al actualizar la reseña:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar la reseña' });
      } else {
        res.json({ success: true, message: 'Reseña actualizada con éxito' });
      }
    }
  );
};

