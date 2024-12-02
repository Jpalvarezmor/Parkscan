const db = require('./config/db');

db.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conexión exitosa a la base de datos!');
  }
  db.end(); // Cierra la conexión tras la prueba
});
