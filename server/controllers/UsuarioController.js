// controllers/UsuarioController.js

const db = require('../config/db');
const bcrypt = require('bcrypt');

// Registro de usuario
const registerUser = (req, res) => {
  const { rut, nombre, correo, telefono, contraseña, rol } = req.body;

  if (![2, 3].includes(rol)) {
    return res.status(400).json({ message: 'Rol no válido' });
  }

  const saltRounds = 10;
  bcrypt.hash(contraseña, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error al encriptar la contraseña:', err);
      res.status(500).json({ message: 'Error al encriptar la contraseña' });
      return;
    }

    const sql = `INSERT INTO usuario (rut, nombre, correo, telefono, contraseña, rol) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [rut, nombre, correo, telefono, hash, rol], (error, results) => {
      if (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error al registrar usuario' });
      } else {
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
      }
    });
  });
};

// Inicio de sesión
const loginUser = (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT rut, rol, contraseña FROM usuario WHERE correo = ?`;

  db.query(sql, [email], (error, results) => {
    if (error) {
      console.error('Error al validar usuario:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
      return;
    }

    if (results.length > 0) {
      const user = results[0];

      // Comparar la contraseña ingresada con la almacenada
      bcrypt.compare(password, user.contraseña, (err, isMatch) => {
        if (err) {
          console.error('Error al comparar contraseñas:', err);
          res.status(500).json({ success: false, message: 'Error en el servidor' });
          return;
        }

        if (isMatch) {
          res.json({ success: true, role: user.rol, rut: user.rut });
        } else {
          res.json({ success: false, message: 'Credenciales incorrectas' });
        }
      });
    } else {
      res.json({ success: false, message: 'Credenciales incorrectas' });
    }
  });
};

// Obtener datos del usuario
const getUserData = (req, res) => {
  const userRut = req.query.rut;
  const sql = 'SELECT nombre, correo, telefono FROM usuario WHERE rut = ?';

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
};

// Actualizar datos del usuario (incluyendo contraseña)
const updateUser = (req, res) => {
  const { rut, nombre, correo, telefono, password, newPassword } = req.body;

  const sqlGetPassword = 'SELECT contraseña FROM usuario WHERE rut = ?';
  db.query(sqlGetPassword, [rut], (error, results) => {
    if (error) {
      console.error('Error al obtener la contraseña:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
      return;
    }

    if (results.length > 0) {
      const hashedPassword = results[0].contraseña;

      // Verificar la contraseña actual
      bcrypt.compare(password, hashedPassword, (err, isMatch) => {
        if (err) {
          console.error('Error al comparar contraseñas:', err);
          res.status(500).json({ success: false, message: 'Error en el servidor' });
          return;
        }

        if (isMatch) {
          // Si se proporciona una nueva contraseña, encriptarla
          if (newPassword) {
            bcrypt.hash(newPassword, 10, (err, newHashedPassword) => {
              if (err) {
                console.error('Error al encriptar la nueva contraseña:', err);
                res.status(500).json({ success: false, message: 'Error en el servidor' });
                return;
              }

              const sqlUpdate = 'UPDATE usuario SET nombre = ?, correo = ?, telefono = ?, contraseña = ? WHERE rut = ?';
              db.query(sqlUpdate, [nombre, correo, telefono, newHashedPassword, rut], (error, results) => {
                if (error) {
                  console.error('Error al actualizar los datos del usuario:', error);
                  res.status(500).json({ success: false, message: 'Error al actualizar los datos' });
                } else {
                  res.json({ success: true, message: 'Datos actualizados correctamente' });
                }
              });
            });
          } else {
            // Si no se proporciona una nueva contraseña, mantener la actual
            const sqlUpdate = 'UPDATE usuario SET nombre = ?, correo = ?, telefono = ? WHERE rut = ?';
            db.query(sqlUpdate, [nombre, correo, telefono, rut], (error, results) => {
              if (error) {
                console.error('Error al actualizar los datos del usuario:', error);
                res.status(500).json({ success: false, message: 'Error al actualizar los datos' });
              } else {
                res.json({ success: true, message: 'Datos actualizados correctamente' });
              }
            });
          }
        } else {
          res.json({ success: false, message: 'Contraseña incorrecta' });
        }
      });
    } else {
      res.json({ success: false, message: 'Usuario no encontrado' });
    }
  });
};

// Obtener estacionamientos del trabajador
const getWorkerParkingLots = (req, res) => {
  const { rut } = req.query;
  const sql = `SELECT e.id, e.nombre, e.tarifa, e.capacidad FROM estacionamiento e
               JOIN trabajador_estacionamiento te ON e.id = te.id_estacionamiento
               WHERE te.rut_trabajador = ?`;
  db.query(sql, [rut], (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error al obtener estacionamientos' });
    } else {
      res.json({ success: true, estacionamientos: results });
    }
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserData,
  updateUser,
  getWorkerParkingLots
};
