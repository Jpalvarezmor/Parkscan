// server/index.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const PORT = 5000;
const PORT2 = 5001;

app.use(cors()); // Permitir solicitudes del frontend
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Cambia al origen de tu frontend
    methods: ["GET", "POST"]
  }
});

const db = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'root',
  database: 'parkscan'
});

// Ruta para obtener los estacionamientos
app.get('/api/estacionamientos', (req, res) => {
  const sql = 'SELECT * FROM Estacionamiento';
  db.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener estacionamientos:', error);
      res.status(500).json({ message: 'Error al obtener estacionamientos' });
    } else {
      res.json(results);
    }
  });
});

// Ruta para registrar un nuevo usuario
app.post('/api/register', (req, res) => {
  const { rut, nombre, correo, telefono, contraseña } = req.body;
  const sql = `INSERT INTO Usuario (rut, nombre, correo, telefono, contraseña, rol) VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.query(sql, [rut, nombre, correo, telefono, contraseña, 3], (error, results) => {
    if (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ message: 'Error al registrar usuario' });
    } else {
      res.status(201).json({ message: 'Usuario registrado exitosamente' });
    }
  });
});

// Ruta para verificar inicio de sesión
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT rut, rol FROM Usuario WHERE correo = ? AND contraseña = ?`;

  db.query(sql, [email, password], (error, results) => {
    if (error) {
      console.error('Error al validar usuario:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
      return;
    }

    if (results.length > 0) {
      // Usuario encontrado y credenciales válidas
      const user = results[0];
      res.json({ success: true, role: user.rol, rut: user.rut });
    } else {
      // Usuario no encontrado o credenciales inválidas
      res.json({ success: false, message: 'Credenciales incorrectas' });
    }
  });
});

// Ruta para obtener datos del usuario
app.get('/api/userdata', (req, res) => {
  const userRut = req.query.rut;
  const sql = 'SELECT nombre, correo, telefono FROM Usuario WHERE rut = ?';

  db.query(sql, [userRut], (error, results) => {
    if (error) {
      console.error('Error al obtener datos del usuario:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
    } else if (results.length > 0) {
      res.json({ success: true, data: results[0] });
    } else {
      res.json({ success: false, message: 'Usuario no encontrado' });
    }
  });
});

// Ruta para actualizar datos del usuario
app.post('/api/updateUser', (req, res) => {
  const { rut, nombre, correo, telefono, password } = req.body;

  // Verificar la contraseña del usuario
  const sqlVerifyPassword = 'SELECT contraseña FROM Usuario WHERE rut = ?';
  db.query(sqlVerifyPassword, [rut], (error, results) => {
    if (error) {
      console.error('Error al verificar la contraseña:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
    } else if (results.length > 0 && results[0].contraseña === password) {
      // Contraseña correcta, proceder a actualizar los datos
      const sqlUpdate = 'UPDATE Usuario SET nombre = ?, correo = ?, telefono = ? WHERE rut = ?';
      db.query(sqlUpdate, [nombre, correo, telefono, rut], (error, results) => {
        if (error) {
          console.error('Error al actualizar los datos del usuario:', error);
          res.status(500).json({ success: false, message: 'Error al actualizar los datos' });
        } else {
          res.json({ success: true, message: 'Datos actualizados correctamente' });
        }
      });
    } else {
      res.json({ success: false, message: 'Contraseña incorrecta' });
    }
  });
});

app.get('/api/trabajador_estacionamientos', (req, res) => {
  const { rut } = req.query;
  const sql = `SELECT e.id, e.nombre, e.tarifa FROM Estacionamiento e
               JOIN Trabajador_Estacionamiento te ON e.id = te.id_estacionamiento
               WHERE te.rut_trabajador = ?`;
  db.query(sql, [rut], (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error al obtener estacionamientos' });
    } else {
      res.json({ success: true, estacionamientos: results });
    }
  });
});

// Ruta para verificar si la matrícula ya existe
app.post('/api/check_matricula', (req, res) => {
  const { matricula } = req.body;
  const checkSql = `
    SELECT id_estacionamiento, hora_ingreso, tarifa 
    FROM estacionado 
    WHERE matricula = ?
  `;

  db.query(checkSql, [matricula], (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error al verificar matrícula' });
    } else if (results.length > 0) {
      // Si existe, devolvemos los detalles de `hora_ingreso`, `tarifa`, y `id_estacionamiento`
      res.json({
        exists: true,
        data: {
          id_estacionamiento: results[0].id_estacionamiento,
          hora_ingreso: results[0].hora_ingreso,
          tarifa: results[0].tarifa
        },
        message: 'Matrícula ya ingresada'
      });
    } else {
      res.json({ exists: false });
    }
  });
});

app.post('/api/insert_matricula', (req, res) => {
  const { matricula, id_estacionamiento } = req.body;
  const insertSql = 'INSERT INTO Estacionado (matricula, id_estacionamiento, hora_ingreso, tarifa) VALUES (?, ?, NOW(), ?)';

  // Obtener la tarifa del estacionamiento
  const tarifaSql = 'SELECT tarifa FROM Estacionamiento WHERE id = ?';
  
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

    // Insertar la matrícula con la tarifa obtenida
    db.query(insertSql, [matricula, id_estacionamiento, tarifa], (insertError) => {
      if (insertError) {
        console.error('Error al registrar matrícula:', insertError);
        res.status(500).json({ success: false, message: 'Error al registrar matrícula' });
      } else {
        res.json({ success: true, message: 'Matrícula registrada correctamente' });
      }
    });
  });
});

// Ruta para obtener las matrículas estacionadas en un estacionamiento específico
app.get('/api/estacionado', (req, res) => {
  const { id_estacionamiento } = req.query;
  const sql = `
    SELECT matricula, hora_ingreso, tarifa
    FROM estacionado
    WHERE id_estacionamiento = ?
  `;

  db.query(sql, [id_estacionamiento], (error, results) => {
    if (error) {
      console.error('Error al obtener los estacionado:', id_estacionamiento);
      res.status(500).json({ success: false, message: 'Error al obtener los estacionado' });
    } else {
      res.json({ success: true, estacionado: results });
    }
  });
});

// Ruta para obtener el historial de pagos de un estacionamiento específico
app.get('/api/historial', (req, res) => {
  const { id_estacionamiento } = req.query;
  const sql = `
    SELECT matricula, fecha_ingreso, fecha_salida, tiempo_estacionado, monto_total, metodo_pago
    FROM Pagos
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
});

app.post('/api/pagar', (req, res) => {
  const { id_estacionamiento, matricula, rut_trabajador, fecha_salida, tiempo_estacionado, monto_total, metodo_pago } = req.body;

  // Primero obtener la hora_ingreso de la tabla Estacionado
  const getHoraIngresoSql = `SELECT hora_ingreso FROM Estacionado WHERE matricula = ? AND id_estacionamiento = ?`;

  db.query(getHoraIngresoSql, [matricula, id_estacionamiento], (error, ingresoResults) => {
    if (error) {
      console.error('Error al obtener la hora de ingreso:', error);
      res.status(500).json({ success: false, message: 'Error al obtener la hora de ingreso' });
      return;
    }

    if (ingresoResults.length === 0) {
      res.status(404).json({ success: false, message: 'Registro de ingreso no encontrado' });
      return;
    }

    const fecha_ingreso = ingresoResults[0].hora_ingreso;

    // Insertar en la tabla de Pagos usando la hora_ingreso obtenida
    const sqlInsertPago = `
      INSERT INTO Pagos (id_estacionamiento, matricula, rut_trabajador, fecha_ingreso, fecha_salida, tiempo_estacionado, monto_total, metodo_pago)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sqlInsertPago, [id_estacionamiento, matricula, rut_trabajador, fecha_ingreso, fecha_salida, tiempo_estacionado, monto_total, metodo_pago], (insertError) => {
      if (insertError) {
        console.error('Error al procesar el pago:', insertError);
        res.status(500).json({ success: false, message: 'Error al procesar el pago' });
        return;
      }

      // Después de insertar en `Pagos`, eliminar de la tabla `Estacionado`
      const sqlEliminarEstacionado = 'DELETE FROM Estacionado WHERE matricula = ? AND id_estacionamiento = ?';
      db.query(sqlEliminarEstacionado, [matricula, id_estacionamiento], (deleteError) => {
        if (deleteError) {
          console.error('Error al eliminar el registro de Estacionado:', deleteError);
          res.status(500).json({ success: false, message: 'Error al eliminar el registro de Estacionado' });
        } else {
          res.json({ success: true, message: 'Pago procesado y registro eliminado correctamente' });
        }
      });
    });
  });
});

app.post('/api/addVehiculo', (req, res) => {
  const { matricula, usuario_id, modelo, color } = req.body;

  // Mostrar en consola los datos recibidos para verificar
  console.log("Datos recibidos en /api/addVehiculo:", { matricula, usuario_id, modelo, color });

  const sql = `INSERT INTO Vehiculo (matricula, usuario_id, modelo, color) VALUES (?, ?, ?, ?)`;

  db.query(sql, [matricula, usuario_id, modelo, color], (error) => {
    if (error) {
      // Mostrar el error completo en la consola
      console.error('Error al insertar vehículo:', error.message, error.sqlMessage);
      // Enviar al frontend un mensaje detallado solo en modo de desarrollo
      res.status(500).json({ 
        success: false, 
        message: `Error al insertar vehículo: ${error.sqlMessage}` 
      });
    } else {
      res.status(201).json({ success: true, message: 'Vehículo añadido correctamente' });
    }
  });
});


app.post('/api/addVehiculo', (req, res) => {
  const { matricula, usuario_id, modelo, color } = req.body;
  console.log("Datos recibidos en /api/addVehiculo:", { matricula, usuario_id, modelo, color });

  const sql = `INSERT INTO Vehiculo (matricula, usuario_id, modelo, color) VALUES (?, ?, ?, ?)`;

  db.query(sql, [matricula, usuario_id, modelo, color], (error) => {
    if (error) {
      console.error('Error al insertar vehículo:', error);
      res.status(500).json({ success: false, message: 'Error al insertar vehículo' });
    } else {
      res.status(201).json({ success: true, message: 'Vehículo añadido correctamente' });
    }
  });
});





// Ruta para eliminar un vehículo
app.post('/api/deleteVehiculo', (req, res) => {
  const { matricula } = req.body;
  const sql = 'DELETE FROM Vehiculo WHERE matricula = ?';
  
  db.query(sql, [matricula], (error) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error al eliminar vehículo' });
    } else {
      res.json({ success: true, message: 'Vehículo eliminado correctamente' });
    }
  });
});

// Ruta para obtener vehículos del usuario
app.get('/api/vehiculos', (req, res) => {
  const { rut } = req.query;
  const sql = `SELECT v.* 
               FROM Vehiculo v 
               WHERE v.usuario_id = ?`;

  db.query(sql, [rut], (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error al obtener vehículos' });
    } else {
      res.json({ success: true, autos: results });
    }
  });
});



// Ruta para obtener el estado de estacionamiento de un vehículo por matrícula
app.get('/api/vehiculo/estacionado', (req, res) => {
  const { matricula } = req.query;
  const sql = `
    SELECT matricula, hora_ingreso, tarifa
    FROM Estacionado
    WHERE matricula = ?
  `;

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
});

// server/index.js

// Ruta para obtener los métodos de pago de un usuario
app.get('/api/metodos_pago', (req, res) => {
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
});


app.post('/api/deleteMetodoPago', (req, res) => {
  const { metodo_id } = req.body;
  
  if (!metodo_id) {
    return res.status(400).json({ success: false, message: 'ID de método de pago no proporcionado' });
  }

  // First, delete the association with the user (if using a join table)
  const deleteAssociationSql = 'DELETE FROM usuario_metodo_pago WHERE metodo_id = ?';
  db.query(deleteAssociationSql, [metodo_id], (assocError) => {
    if (assocError) {
      console.error('Error al eliminar la asociación del método de pago:', assocError);
      return res.status(500).json({ success: false, message: 'Error al eliminar asociación del método de pago' });
    }

    // Then, delete the payment method itself
    const deleteMetodoPagoSql = 'DELETE FROM metodos_pago WHERE metodo_id = ?';
    db.query(deleteMetodoPagoSql, [metodo_id], (deleteError) => {
      if (deleteError) {
        console.error('Error al eliminar método de pago:', deleteError);
        return res.status(500).json({ success: false, message: 'Error al eliminar método de pago' });
      }

      res.json({ success: true, message: 'Método de pago eliminado correctamente' });
    });
  });
});


// Ruta para añadir un método de pago
app.post('/api/addMetodoPago', (req, res) => {
  const { usuario_id, numero_tarjeta, nombre_en_tarjeta, tipo_tarjeta, fecha_expiracion } = req.body;

  // Primero, insertar el método de pago en la tabla `metodos_pago`
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

    const metodoId = result.insertId;  // Obtener el ID del método recién insertado

    // Luego, insertar la relación entre el usuario y el método de pago
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
});

// Evento para manejar la solicitud de pago
app.post('/api/requestPayment', (req, res) => {
  const { matricula, estacionamientoNombre } = req.body;

  // Consultar los usuarios que tienen registrado el vehículo con la matrícula
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

      // Emitir un evento para cada usuario con el detalle del cobro
      usuariosIds.forEach((usuarioId) => {
        io.to(usuarioId).emit("requestPayment", {
          matricula,
          estacionamientoNombre
        });
      });

      res.json({ success: true, message: 'Solicitud de pago enviada' });
    }
  });
});

// Conexión de socket.io para cada usuario logeado
io.on('connection', (socket) => {
  const usuarioId = socket.handshake.query.usuarioId;
  socket.join(usuarioId);

  console.log(`Usuario ${usuarioId} conectado`);

  socket.on('disconnect', () => {
    console.log(`Usuario ${usuarioId} desconectado`);
  });
});

server.listen(PORT2, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT2}`);
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
