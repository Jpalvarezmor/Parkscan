// controllers/paymentController.js
const db = require('../config/db');

exports.getPagoMethods = (req, res) => {
  const { usuario_id } = req.query;
  const sql = `
    SELECT mp.metodo_id, mp.numero_tarjeta, mp.nombre_en_tarjeta, mp.tipo_tarjeta, mp.fecha_expiracion
    FROM metodos_pago mp
    JOIN usuario_metodo_pago ump ON mp.metodo_id = ump.metodo_id
    WHERE ump.usuario_id = ?
  `;

  db.query(sql, [usuario_id], (error, results) => {
    if (error) {
      console.error('Error al obtener métodos de pago:', error);
      res.status(500).json({ success: false, message: 'Error al obtener métodos de pago' });
    } else {
      res.json({ success: true, metodos: results });
    }
  });
};

exports.addPagoMethod = (req, res) => {
  const { usuario_id, numero_tarjeta, nombre_en_tarjeta, tipo_tarjeta, fecha_expiracion } = req.body;
  const insertMetodoPagoSql = `
    INSERT INTO metodos_pago (numero_tarjeta, nombre_en_tarjeta, tipo_tarjeta, fecha_expiracion)
    VALUES (?, ?, ?, ?)
  `;

  db.query(insertMetodoPagoSql, [numero_tarjeta, nombre_en_tarjeta, tipo_tarjeta, fecha_expiracion], (error, result) => {
    if (error) {
      console.error('Error al añadir método de pago:', error);
      res.status(500).json({ success: false, message: 'Error al añadir método de pago' });
      return;
    }

    const metodoId = result.insertId;
    const insertUsuarioMetodoPagoSql = `
      INSERT INTO usuario_metodo_pago (usuario_id, metodo_id) VALUES (?, ?)
    `;

    db.query(insertUsuarioMetodoPagoSql, [usuario_id, metodoId], (assocError) => {
      if (assocError) {
        console.error('Error al asociar método de pago con el usuario:', assocError);
        res.status(500).json({ success: false, message: 'Error al asociar método de pago' });
      } else {
        res.status(201).json({ success: true, message: 'Método de pago añadido correctamente' });
      }
    });
  });
};

exports.deletePagoMethod = (req, res) => {
  const { metodo_id } = req.body;

  if (!metodo_id) {
    return res.status(400).json({ success: false, message: 'ID de método de pago no proporcionado' });
  }

  const deleteAssociationSql = 'DELETE FROM usuario_metodo_pago WHERE metodo_id = ?';
  db.query(deleteAssociationSql, [metodo_id], (assocError) => {
    if (assocError) {
      console.error('Error al eliminar la asociación del método de pago:', assocError);
      return res.status(500).json({ success: false, message: 'Error al eliminar asociación del método de pago' });
    }

    const deleteMetodoPagoSql = 'DELETE FROM metodos_pago WHERE metodo_id = ?';
    db.query(deleteMetodoPagoSql, [metodo_id], (deleteError) => {
      if (deleteError) {
        console.error('Error al eliminar método de pago:', deleteError);
        return res.status(500).json({ success: false, message: 'Error al eliminar método de pago' });
      }

      res.json({ success: true, message: 'Método de pago eliminado correctamente' });
    });
  });
};

exports.requestPago = (req, res) => {
  const { matricula, estacionamientoNombre } = req.body;
  const sql = `
    SELECT u.rut
    FROM Vehiculo v
    JOIN Usuario u ON u.rut = v.usuario_id
    WHERE v.matricula = ?
  `;

  db.query(sql, [matricula], (error, results) => {
    if (error) {
      console.error('Error al obtener usuarios del vehículo:', error);
      res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    } else {
      const usuariosIds = results.map(user => user.rut);
      usuariosIds.forEach((usuarioId) => {
        io.to(usuarioId).emit("requestPago", {
          matricula,
          estacionamientoNombre
        });
      });

      res.json({ success: true, message: 'Solicitud de pago enviada' });
    }
  });
};

exports.getHistorialUsuario = (req, res) => { 
  const { rut } = req.query;

  // Primero, obtener los vehículos del usuario con sus fechas de registro
  const getVehiculosSql = `SELECT matricula, registro FROM vehiculo WHERE usuario_id = ?`;
  db.query(getVehiculosSql, [rut], (vehiculosError, vehiculosResults) => {
    if (vehiculosError) {
      console.error('Error al obtener los vehículos del usuario:', vehiculosError);
      return res.status(500).json({ success: false, message: 'Error al obtener los vehículos del usuario' });
    }

    // Si el usuario no tiene vehículos, devolver una respuesta vacía
    if (vehiculosResults.length === 0) {
      return res.json({ success: true, pagos: [], vehiculos: [] });
    }

    // Arreglo de promesas para realizar una consulta por cada vehículo
    const pagosPromises = vehiculosResults.map((vehiculo) => {
      const { matricula, registro } = vehiculo;
      
      // Consulta para obtener los pagos cuyo `fecha_ingreso` sea posterior o igual a `registro`
      const getPagosSql = `
        SELECT p.*, e.nombre AS nombre_estacionamiento
        FROM pagos p
        INNER JOIN estacionamiento e ON p.id_estacionamiento = e.id
        WHERE p.matricula = ? AND DATE(p.fecha_ingreso) >= DATE(?)
      `;

      return new Promise((resolve, reject) => {
        db.query(getPagosSql, [matricula, registro], (pagosError, pagosResults) => {
          if (pagosError) {
            console.error(`Error al obtener pagos para el vehículo ${matricula}:`, pagosError);
            return reject('Error al obtener los pagos');
          }
          resolve(pagosResults);
        });
      });
    });

    // Ejecutar todas las promesas y consolidar los resultados
    Promise.all(pagosPromises)
      .then((pagosArray) => {
        const allPagos = pagosArray.flat(); // Combina los pagos en un solo arreglo
        res.json({ success: true, pagos: allPagos, vehiculos: vehiculosResults });
      })
      .catch((error) => {
        res.status(500).json({ success: false, message: error });
      });
  });
};
