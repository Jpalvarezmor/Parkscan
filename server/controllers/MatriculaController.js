// controllers/matriculaController.js
const db = require('../config/db');


exports.checkMatricula = (req, res) => {
  const { matricula, rut_trabajador } = req.body;
  const checkSql = `
    SELECT e.id_estacionamiento, e.hora_ingreso, e.tarifa, est.nombre AS nombre_estacionamiento
    FROM estacionado e
    INNER JOIN estacionamiento est ON e.id_estacionamiento = est.id
    WHERE e.matricula = ?
  `;
  db.query(checkSql, [matricula], (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error al verificar matrícula' });
    } else if (results.length > 0) {
      const estacionamientoId = results[0].id_estacionamiento;
      const accessSql = `
        SELECT *
        FROM trabajador_estacionamiento
        WHERE rut_trabajador = ? AND id_estacionamiento = ?
      `;
      db.query(accessSql, [rut_trabajador, estacionamientoId], (accessError, accessResults) => {
        if (accessError) {
          res.status(500).json({ success: false, message: 'Error al verificar acceso' });
        } else if (accessResults.length > 0) {
          res.json({
            exists: true,
            access: true,
            data: {
              id_estacionamiento: results[0].id_estacionamiento,
              hora_ingreso: results[0].hora_ingreso,
              tarifa: results[0].tarifa,
              nombre_estacionamiento: results[0].nombre_estacionamiento,
            },
            message: 'Matrícula ya ingresada y tienes acceso',
          });
        } else {
          res.json({
            exists: true,
            access: false,
            message: 'No tienes acceso a este estacionamiento',
          });
        }
      });
    } else {
      res.json({ exists: false });
    }
  });
};


exports.insertMatricula = (req, res) => {
  const { matricula, id_estacionamiento } = req.body;

  // Obtener la tarifa del estacionamiento
  const tarifaSql = 'SELECT tarifa FROM estacionamiento WHERE id = ?';

  db.query(tarifaSql, [id_estacionamiento], (error, tarifaResults) => {
    if (error) {
      console.error('Error al obtener la tarifa del estacionamiento:', error);
      res.status(500).json({ success: false, message: 'Error al obtener la tarifa del estacionamiento' });
      return;
    }

    if (tarifaResults.length === 0) {
      res.status(404).json({ success: false, message: 'Estacionamiento no encontrado' });
      return;
    }

    const tarifa = tarifaResults[0].tarifa;

    // Capturar la hora actual como hora de ingreso
    const hora_ingreso = new Date();


    // Inserción en la tabla 'estacionado'
    const insertSql = `
      INSERT INTO estacionado (matricula, id_estacionamiento, hora_ingreso, tarifa)
      VALUES (?, ?, ?, ?)
    `;

    const insertParams = [matricula, id_estacionamiento, hora_ingreso, tarifa];

    db.query(insertSql, insertParams, (insertError) => {
      if (insertError) {
        console.error('Error al registrar matrícula:', insertError);
        res.status(500).json({ success: false, message: 'Error al registrar matrícula' });
      } else {
        res.json({ success: true, message: 'Matrícula registrada correctamente' });
      }
    });
  });
};


exports.procesarPago = (req, res) => { 
  const { id_estacionamiento, matricula, metodo_pago, numero_estacionamiento } = req.body;

  // Consulta para obtener datos de la tabla 'estacionado', incluyendo el 'Id_estacionamiento'
  const getEstacionadoSql = `
    SELECT 
      Id_estacionamiento, 
      hora_ingreso, 
      tiempo_estacionado, 
      monto_total 
    FROM estacionado 
    WHERE Matricula = ?
  `;
  
  db.query(getEstacionadoSql, [matricula], (error, results) => {
    if (error) {
      console.error('Error al obtener datos de estacionados:', error);
      res.status(500).json({ success: false, message: 'Error al obtener datos de estacionados' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ success: false, message: 'Vehículo no encontrado en el estacionamiento' });
      return;
    }

    // Imprimir los resultados obtenidos para depuración


    let { Id_estacionamiento, hora_ingreso, tiempo_estacionado, monto_total } = results[0];

    // Verificar si los valores son válidos
    if (tiempo_estacionado === null || tiempo_estacionado === undefined) {
      tiempo_estacionado = 0; // O el valor por defecto que consideres
    }
    if (monto_total === null || monto_total === undefined) {
      monto_total = 0; // O el valor por defecto que consideres
    }

    // Asegurarse de que los valores sean numéricos
    tiempo_estacionado = Number(tiempo_estacionado);
    monto_total = Number(monto_total);

    const fecha_salida = new Date(); // Fecha actual

    // Inserción en la tabla 'pagos'
    const sqlInsertPago = `
      INSERT INTO pagos (id_estacionamiento, matricula, fecha_ingreso, fecha_salida, tiempo_estacionado, monto_total, metodo_pago, numero_estacionamiento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      Id_estacionamiento, // Aquí usamos el valor obtenido de la consulta
      matricula,
      hora_ingreso,
      fecha_salida,
      tiempo_estacionado,
      monto_total,
      metodo_pago,
      numero_estacionamiento
    ];

    // Imprimir los parámetros de inserción para depuración
    console.log('Parámetros para insertar en pagos:', insertParams);

    db.query(sqlInsertPago, insertParams, (insertError) => {
      if (insertError) {
        console.error('Error al procesar el pago:', insertError);
        res.status(500).json({ success: false, message: 'Error al procesar el pago' });
        return;
      }

      // Eliminación del registro de 'estacionado'
      const sqlEliminarEstacionado = `
        DELETE FROM estacionado 
        WHERE Matricula = ?
      `;

      db.query(sqlEliminarEstacionado, [matricula], (deleteError) => {
        if (deleteError) {
          console.error('Error al eliminar el registro de estacionados:', deleteError);
          res.status(500).json({ success: false, message: 'Error al eliminar el registro de estacionados' });
        } else {
          res.json({ success: true, message: 'Pago procesado y registro eliminado correctamente' });
        }
      });
    });
  });
};


exports.obtenerDatosPago = (req, res) => {
  const { matricula, id_estacionamiento } = req.body;

  const sql = `
    SELECT
      e.hora_ingreso,
      e.tarifa,
      e.numero_estacionamiento
    FROM estacionado e
    WHERE e.matricula = ? AND e.Id_estacionamiento = ?
  `;
  db.query(sql, [matricula, id_estacionamiento], (error, results) => {
    if (error) {
      console.error('Error al obtener datos de pago:', error);
      res.status(500).json({ success: false, message: 'Error al obtener datos de pago' });
    } else if (results.length > 0) {
      const estacionado = results[0];
      const horaIngreso = new Date(estacionado.hora_ingreso);
      const horaActual = new Date();
      const tiempoEstacionado = Math.ceil((horaActual - horaIngreso) / (1000 * 60)); // en minutos
      const montoTotal = tiempoEstacionado * estacionado.tarifa;

      res.json({
        success: true,
        hora_ingreso: estacionado.hora_ingreso,
        tarifa: estacionado.tarifa,
        tiempo_estacionado: tiempoEstacionado,
        monto_total: montoTotal,
        numero_estacionamiento: estacionado.numero_estacionamiento,
      });
    } else {
      res.status(404).json({ success: false, message: 'Vehículo no encontrado' });
    }
  });
};
