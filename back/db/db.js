import dotenv from 'dotenv';
import mysql from 'mysql2';

dotenv.config(); // Cargar el archivo .env

// Verifica que las variables de entorno estén definidas
if (
    !process.env.DB_HOST ||
    !process.env.DB_USER ||
    !process.env.DB_PASSWORD ||
    !process.env.DB_NAME
) {
    throw new Error('Faltan variables de entorno para la conexión a la base de datos.');
}

const poolConnection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT,
    queueLimit: 0
});

const conn = poolConnection.promise();
export default conn;

// Verificación de conexión
(async () => {
  try {
      const connection = await poolConnection.promise().getConnection();
      connection.release();
  } catch (error) {
      console.error("❌ Error al conectar con la base de datos:", error.message);
  }
})();

