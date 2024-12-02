<?php
// Configuración de la conexión a la base de datos
$host = 'localhost';      // Dirección del servidor, generalmente 'localhost' para desarrollo local
$dbname = 'PARKSCAN';     // Nombre de la base de datos que has creado
$username = 'root';       // Usuario de la base de datos, en este caso 'root'
$password = 'root';         // Contraseña del usuario

try {
    // Crear una nueva conexión usando PDO
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    // Configurar el modo de error de PDO para lanzar excepciones
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Conexión exitosa a la base de datos"; // Confirmación de conexión exitosa (puedes eliminar esta línea después de probar)
} catch (PDOException $e) {
    // Manejo de errores
    echo 'Error de conexión: ' . $e->getMessage();
}
?>
