// controllers/TrabajadorController.js

const db = require('../config/db');
const bcrypt = require('bcrypt');

// Función para agregar un trabajador
exports.addTrabajador = (req, res) => {
  const { rut, nombre, correo, telefono, id_estacionamiento } = req.body;
  const contraseña = rut; // Contraseña igual al RUT
  const rol = 1; // Rol de trabajador

  // Verificar si el RUT ya existe
  const checkUserSql = 'SELECT * FROM usuario WHERE rut = ?';
  db.query(checkUserSql, [rut], (error, results) => {
    if (error) {
      console.error('Error al verificar el usuario:', error);
      return res.status(500).json({ success: false, message: 'Error al verificar el usuario' });
    }

    if (results.length > 0) {
      const existingUser = results[0];
      if (existingUser.rol === 3) {
        // Si el usuario tiene rol 3, actualizarlo a rol 1
        const updateUserRoleSql = 'UPDATE usuario SET rol = ? WHERE rut = ?';
        db.query(updateUserRoleSql, [rol, rut], (updateError) => {
          if (updateError) {
            console.error('Error al actualizar el rol del usuario:', updateError);
            return res
              .status(500)
              .json({ success: false, message: 'Error al actualizar el rol del usuario' });
          }

          // Agregar relación en trabajador_estacionamiento
          addTrabajadorEstacionamiento(rut, id_estacionamiento, res);
        });
      } else {
        // Si el rol no es 3, solo agregar relación en trabajador_estacionamiento
        addTrabajadorEstacionamiento(rut, id_estacionamiento, res);
      }
    } else {
      // Crear nuevo usuario
      // Encriptar la contraseña
      const saltRounds = 10;
      bcrypt.hash(contraseña, saltRounds, (err, hash) => {
        if (err) {
          console.error('Error al encriptar la contraseña:', err);
          return res.status(500).json({ success: false, message: 'Error al encriptar la contraseña' });
        }

        const insertUserSql = `
          INSERT INTO usuario (rut, nombre, correo, telefono, contraseña, rol)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(insertUserSql, [rut, nombre, correo, telefono, hash, rol], (error) => {
          if (error) {
            console.error('Error al crear el usuario:', error);
            return res.status(500).json({ success: false, message: 'Error al crear el usuario' });
          }

          // Agregar relación en trabajador_estacionamiento
          addTrabajadorEstacionamiento(rut, id_estacionamiento, res);
        });
      });
    }
  });
};


// Función para agregar relación en trabajador_estacionamiento
const addTrabajadorEstacionamiento = (rut, id_estacionamiento, res) => {
  const checkRelationSql = `
    SELECT * FROM trabajador_estacionamiento
    WHERE rut_trabajador = ? AND id_estacionamiento = ?
  `;
  db.query(checkRelationSql, [rut, id_estacionamiento], (error, results) => {
    if (error) {
      console.error('Error al verificar la relación:', error);
      return res.status(500).json({ success: false, message: 'Error al verificar la relación' });
    }

    if (results.length > 0) {
      // La relación ya existe
      return res.json({ success: false, message: 'El trabajador ya está asociado a este estacionamiento' });
    } else {
      const insertRelationSql = `
        INSERT INTO trabajador_estacionamiento (rut_trabajador, id_estacionamiento)
        VALUES (?, ?)
      `;
      db.query(insertRelationSql, [rut, id_estacionamiento], (error) => {
        if (error) {
          console.error('Error al agregar la relación:', error);
          return res.status(500).json({ success: false, message: 'Error al agregar la relación' });
        }

        return res.json({ success: true, message: 'Trabajador añadido con éxito' });
      });
    }
  });
};

// Función para obtener trabajadores (con opción de búsqueda por nombre)
exports.getTrabajadores = (req, res) => {
  const { searchTerm, id_estacionamiento } = req.query; // Obtenemos id_estacionamiento y searchTerm
  let sql = `
    SELECT u.*, te.id_estacionamiento
    FROM usuario u
    INNER JOIN trabajador_estacionamiento te ON u.rut = te.rut_trabajador
    WHERE u.rol = 1 AND te.id_estacionamiento = ?
  `;
  
  const params = [parseInt(id_estacionamiento, 10)];
  
  if (searchTerm) {
    sql += ' AND u.nombre LIKE ?'; // Filtrar por nombre si hay un término de búsqueda
    params.push(`%${searchTerm}%`);
  }

  db.query(sql, params, (error, results) => {
    if (error) {
      console.error('Error al obtener trabajadores:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener trabajadores' });
    }
    return res.json({ success: true, trabajadores: results }); // Retorna los trabajadores filtrados
  });
};


// Función para eliminar la relación trabajador-estacionamiento
exports.deleteTrabajadorEstacionamiento = (req, res) => {
  const { rut_trabajador, id_estacionamiento } = req.body;

  const deleteRelationSql = `
    DELETE FROM trabajador_estacionamiento
    WHERE rut_trabajador = ? AND id_estacionamiento = ?
  `;

  db.query(deleteRelationSql, [rut_trabajador, id_estacionamiento], (error) => {
    if (error) {
      console.error('Error al eliminar la relación:', error);
      return res.status(500).json({ success: false, message: 'Error al eliminar la relación' });
    }

    return res.json({ success: true, message: 'Trabajador eliminado del estacionamiento con éxito' });
  });
};
