// controllers/estacionamientoController.js

const db = require('../config/db');

exports.getEstacionamientos = (req, res) => {
  const sql = 'SELECT * FROM estacionamiento';
  console.log("holi");
  db.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener estacionamientos:', error);
      res.status(500).json({ message: 'Error al obtener estacionamientos' });
    } else {
      res.json(results);
    }
  });
};

exports.getEstacionadoByEstacionamiento = (req, res) => {
  const { id_estacionamiento } = req.query;
  const sql = `
    SELECT 
      e.matricula, 
      e.hora_ingreso, 
      e.tarifa, 
      e.numero_estacionamiento, 
      e.tiempo_estacionado, 
      e.monto_total, 
      est.nombre AS nombre_estacionamiento
    FROM estacionado e
    INNER JOIN estacionamiento est ON e.Id_estacionamiento = est.id
    WHERE e.Id_estacionamiento = ?
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
    SELECT matricula, fecha_ingreso, fecha_salida, tiempo_estacionado, monto_total, metodo_pago, numero_estacionamiento
    FROM pagos
    WHERE id_estacionamiento = ?
  `;
  db.query(sql, [id_estacionamiento], (error, results) => {
    if (error) {
      console.error('Error al obtener el historial:', error);
      res.status(500).json({ success: false, message: 'Error al obtener el historial' });
    } else {
      res.json({ success: true, historial: results });
    }
  });
};

exports.getEstacionamientoOcupacion = (req, res) => {
  const { id_estacionamiento } = req.query;

  const sql = `SELECT COUNT(*) AS ocupacion FROM estacionado WHERE Id_estacionamiento = ?`;
  db.query(sql, [id_estacionamiento], (error, results) => {
    if (error) {
      console.error('Error al obtener ocupación del estacionamiento:', error);
      res.status(500).json({ success: false, message: 'Error al obtener ocupación del estacionamiento' });
    } else {
      res.json({ success: true, ocupacion: results[0].ocupacion });
    }
  });
};

exports.addEstacionamiento = (req, res) => {
  const {
    nombre,
    direccion,
    latitud,
    longitud,
    capacidad,
    estado,
    dueño,
    tarifa,
    rut_trabajador,
  } = req.body;

  const sqlEstacionamiento =
    'INSERT INTO estacionamiento (nombre, direccion, latitud, longitud, capacidad, estado, dueño, tarifa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(
    sqlEstacionamiento,
    [nombre, direccion, latitud, longitud, capacidad, estado, rut_trabajador, tarifa],
    (error, results) => {
      if (error) {
        console.error('Error al añadir estacionamiento:', error);
        res.status(500).json({ message: 'Error al añadir estacionamiento' });
      } else {
        const estacionamientoId = results.insertId;

        // Añadir el registro a la tabla trabajador_estacionamiento
        const sqlTrabajadorEstacionamiento =
          'INSERT INTO trabajador_estacionamiento (rut_trabajador, id_estacionamiento) VALUES (?, ?)';
        db.query(
          sqlTrabajadorEstacionamiento,
          [rut_trabajador, estacionamientoId],
          (error) => {
            if (error) {
              console.error(
                'Error al añadir relación trabajador-estacionamiento:',
                error
              );
              res.status(500).json({
                message: 'Error al añadir relación trabajador-estacionamiento',
              });
            } else {
              res.json({
                success: true,
                message: 'Estacionamiento añadido y relación registrada',
                id: estacionamientoId,
              });
            }
          }
        );
      }
    }
  );
};


exports.updateEstacionamiento = (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    direccion,
    latitud,
    longitud,
    capacidad,
    estado,
    dueño,
    tarifa,
  } = req.body;

  const sql =
    'UPDATE estacionamiento SET nombre = ?, direccion = ?, latitud = ?, longitud = ?, capacidad = ?, estado = ?, dueño = ?, tarifa = ? WHERE id = ?';

  db.query(
    sql,
    [nombre, direccion, latitud, longitud, capacidad, estado, dueño, tarifa, id],
    (error, results) => {
      if (error) {
        console.error('Error al actualizar estacionamiento:', error);
        res.status(500).json({ message: 'Error al actualizar estacionamiento' });
      } else {
        res.json({ success: true, message: 'Estacionamiento actualizado' });
      }
    }
  );
};

exports.deleteEstacionamiento = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM estacionamiento WHERE id = ?';

  db.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Error al eliminar estacionamiento:', error);
      res.status(500).json({ message: 'Error al eliminar estacionamiento' });
    } else {
      res.json({ success: true, message: 'Estacionamiento eliminado' });
    }
  });
};

exports.getDistribucion = (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT dimension_x, dimension_y, distribucion FROM estacionamiento WHERE id = ?';

  db.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Error al obtener la distribución:', error);
      res.status(500).json({ success: false, message: 'Error al obtener la distribución' });
    } else if (results.length > 0) {
      const estacionamiento = results[0];
      res.json({ success: true, distribucion: estacionamiento });
    } else {
      res.status(404).json({ success: false, message: 'Estacionamiento no encontrado' });
    }
  });
};

// Actualizar la distribución de un estacionamiento
exports.updateDistribucion = (req, res) => {
  const { id } = req.params;
  const { dimension_x, dimension_y, distribucion } = req.body;

  // Validar los datos
  if (!dimension_x || !dimension_y || !distribucion) {
    return res.status(400).json({ success: false, message: 'Datos incompletos' });
  }

  const sql = `
    UPDATE estacionamiento
    SET dimension_x = ?, dimension_y = ?, distribucion = ?
    WHERE id = ?
  `;

  db.query(sql, [dimension_x, dimension_y, JSON.stringify(distribucion), id], (error, results) => {
    if (error) {
      console.error('Error al actualizar la distribución:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar la distribución' });
    } else {
      res.json({ success: true, message: 'Distribución actualizada con éxito' });
    }
  });
};

exports.getEstadoEspacios = (req, res) => {
  const { id_estacionamiento } = req.params;

  // Obtener la distribución del estacionamiento
  const sqlDistribucion = 'SELECT distribucion FROM estacionamiento WHERE id = ?';

  db.query(sqlDistribucion, [id_estacionamiento], (error, results) => {
    if (error) {
      console.error('Error al obtener la distribución:', error);
      res.status(500).json({ success: false, message: 'Error al obtener la distribución' });
    } else if (results.length > 0) {
      const distribucion = JSON.parse(results[0].distribucion);

      // Obtener los espacios ocupados
      const sqlOcupados = `
        SELECT numero_estacionamiento, matricula
        FROM estacionado
        WHERE Id_estacionamiento = ?
      `;
      db.query(sqlOcupados, [id_estacionamiento], (error, ocupados) => {
        if (error) {
          console.error('Error al obtener los espacios ocupados:', error);
          res.status(500).json({ success: false, message: 'Error al obtener los espacios ocupados' });
        } else {
          // Crear un mapa de espacios ocupados
          const mapaOcupados = {};
          ocupados.forEach((espacio) => {
            mapaOcupados[espacio.numero_estacionamiento] = espacio.matricula;
          });

          res.json({ success: true, distribucion, ocupados: mapaOcupados });
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'Estacionamiento no encontrado' });
    }
  });
};

exports.estacionarVehiculo = (req, res) => {
  const { id_estacionamiento } = req.params;
  const { matricula, numero_estacionamiento } = req.body;

  // Verificar que el espacio está libre
  const sqlVerificar = `
    SELECT * FROM estacionado
    WHERE Id_estacionamiento = ? AND numero_estacionamiento = ?
  `;

  db.query(sqlVerificar, [id_estacionamiento, numero_estacionamiento], (error, results) => {
    if (error) {
      console.error('Error al verificar el espacio:', error);
      res.status(500).json({ success: false, message: 'Error al verificar el espacio' });
    } else if (results.length > 0) {
      res.status(400).json({ success: false, message: 'El espacio ya está ocupado' });
    } else {
      // Capturar la hora actual como hora de ingreso
      const hora_ingreso = new Date();

      // Obtener la tarifa del estacionamiento
      const sqlTarifa = `SELECT tarifa FROM estacionamiento WHERE id = ?`;

      db.query(sqlTarifa, [id_estacionamiento], (tarifaError, tarifaResults) => {
        if (tarifaError) {
          console.error('Error al obtener la tarifa del estacionamiento:', tarifaError);
          res.status(500).json({ success: false, message: 'Error al obtener la tarifa del estacionamiento' });
          return;
        }

        if (tarifaResults.length === 0) {
          res.status(404).json({ success: false, message: 'Estacionamiento no encontrado' });
          return;
        }

        const tarifa = tarifaResults[0].tarifa;

        // Registrar el estacionamiento
        const sqlInsert = `
          INSERT INTO estacionado (matricula, Id_estacionamiento, numero_estacionamiento, hora_ingreso, tarifa)
          VALUES (?, ?, ?, ?, ?)
        `;

        const insertParams = [matricula.toUpperCase(), id_estacionamiento, numero_estacionamiento, hora_ingreso, tarifa];

        db.query(sqlInsert, insertParams, (insertError) => {
          if (insertError) {
            console.error('Error al registrar el vehículo:', insertError);
            res.status(500).json({ success: false, message: 'Error al registrar el vehículo' });
          } else {
            res.json({ success: true, message: 'Vehículo estacionado con éxito' });
          }
        });
      });
    }
  });
};


exports.procesarPago = (req, res) => {
  const { matricula, id_estacionamiento, metodo_pago, numero_estacionamiento } = req.body;

  // Obtener datos del estacionamiento
  const sqlSelect = `
    SELECT *
    FROM estacionado
    WHERE matricula = ? AND Id_estacionamiento = ? AND numero_estacionamiento = ?
  `;
  db.query(sqlSelect, [matricula, id_estacionamiento, numero_estacionamiento], (error, results) => {
    if (error) {
      console.error('Error al obtener datos del estacionamiento:', error);
      res.status(500).json({ success: false, message: 'Error al obtener datos del estacionamiento' });
    } else if (results.length > 0) {
      const estacionado = results[0];
      // Calcular tiempo y monto
      const horaIngreso = new Date(estacionado.hora_ingreso);
      const horaSalida = new Date();
      const tiempoEstacionado = Math.ceil((horaSalida - horaIngreso) / (1000 * 60)); // en minutos
      const montoTotal = tiempoEstacionado * estacionado.tarifa;

      // Registrar pago
      const sqlInsertPago = `
        INSERT INTO pagos (matricula, id_estacionamiento, fecha_ingreso, fecha_salida, tiempo_estacionado, monto_total, metodo_pago, numero_estacionamiento)
        VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)
      `;
      db.query(
        sqlInsertPago,
        [matricula, id_estacionamiento, estacionado.hora_ingreso, tiempoEstacionado, montoTotal, metodo_pago, numero_estacionamiento],
        (error) => {
          if (error) {
            console.error('Error al registrar el pago:', error);
            res.status(500).json({ success: false, message: 'Error al registrar el pago' });
          } else {
            // Eliminar el registro de estacionado
            const sqlDelete = `
              DELETE FROM estacionado
              WHERE matricula = ? AND Id_estacionamiento = ? AND numero_estacionamiento = ?
            `;
            db.query(sqlDelete, [matricula, id_estacionamiento, numero_estacionamiento], (error) => {
              if (error) {
                console.error('Error al eliminar el estacionamiento:', error);
                res.status(500).json({ success: false, message: 'Error al liberar el espacio' });
              } else {
                res.json({ success: true, message: 'Pago procesado y espacio liberado' });
              }
            });
          }
        }
      );
    } else {
      res.status(404).json({ success: false, message: 'Vehículo no encontrado en el estacionamiento' });
    }
  });
};

exports.getEspaciosDisponibles = (req, res) => {
  const { id_estacionamiento } = req.params;

  // Obtener la distribución del estacionamiento
  const sqlDistribucion = 'SELECT distribucion FROM estacionamiento WHERE id = ?';

  db.query(sqlDistribucion, [id_estacionamiento], (error, results) => {
    if (error) {
      console.error('Error al obtener la distribución:', error);
      res.status(500).json({ success: false, message: 'Error al obtener la distribución' });
    } else if (results.length > 0) {
      const rawDistribucion = results[0].distribucion;
      const distribucion = rawDistribucion ? JSON.parse(rawDistribucion) : null;

      if (!Array.isArray(distribucion)) {
        return res
          .status(500)
          .json({ success: false, message: 'La distribución no es válida' });
      }

      // Obtener los espacios ocupados
      const sqlOcupados = `
        SELECT numero_estacionamiento
        FROM estacionado
        WHERE Id_estacionamiento = ?
      `;
      db.query(sqlOcupados, [id_estacionamiento], (error, ocupados) => {
        if (error) {
          console.error('Error al obtener los espacios ocupados:', error);
          res
            .status(500)
            .json({ success: false, message: 'Error al obtener los espacios ocupados' });
        } else {
          const espaciosOcupados = ocupados.map((espacio) => espacio.numero_estacionamiento);

          // Verificar que la distribución sea válida antes de usar flat()
          try {
            const espaciosTotales = distribucion.flat().filter((num) => num > 0);
            const espaciosDisponibles = espaciosTotales.filter(
              (num) => !espaciosOcupados.includes(num)
            );
            res.json({ success: true, espaciosDisponibles });
          } catch (error) {
            console.error('Error al procesar la distribución:', error);
            res.status(500).json({
              success: false,
              message: 'Error al procesar la distribución del estacionamiento',
            });
          }
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'Estacionamiento no encontrado' });
    }
  });
};


exports.obtenerDatosPago = (req, res) => {
  const { matricula, id_estacionamiento } = req.body;

  const sql = `
    SELECT
      e.hora_ingreso,
      e.tarifa,
      e.tiempo_estacionado,
      e.monto_total,
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

      res.json({
        success: true,
        hora_ingreso: estacionado.hora_ingreso,
        tarifa: estacionado.tarifa,
        tiempo_estacionado: estacionado.tiempo_estacionado,
        monto_total: estacionado.monto_total,
        numero_estacionamiento: estacionado.numero_estacionamiento,
      });
    } else {
      res.status(404).json({ success: false, message: 'Vehículo no encontrado' });
    }
  });
};

