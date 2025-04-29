// Ejecutar desde la consola con node controllers/guardarTonersHp.js



import conn from "../db/db.js";

// Datos de los toners HP
const modelosTonersHP = [
"SAM101S",
"SAM104S",
"SAM108S",
"SAM111L",
"SAM115L",
"SAM203L",
"SAM205L"

];

async function insertarToners() {
  let connection;
  try {
    // Obtener conexión desde el pool
    connection = await conn.getConnection();
    console.log('Conexión a la base de datos establecida');

    // Iniciar transacción
    await connection.beginTransaction();

    // Preparar consulta de inserción
    const query = 'INSERT INTO toners (nombre) VALUES (?)';

    // Insertar cada modelo
    for (const modelo of modelosTonersHP) {
      try {
        await connection.query(query, [modelo]);
        console.log(`✓ Insertado: ${modelo}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⏩ Ya existía: ${modelo} (omitido)`);
        } else {
          throw error; // Relanzar otros errores
        }
      }
    }

    // Confirmar transacción
    await connection.commit();
    console.log('✅ Todos los toners HP han sido procesados correctamente');
  } catch (error) {
    // Revertir en caso de error
    if (connection) await connection.rollback();
    console.error('❌ Error al insertar los toners:', error.message);
  } finally {
    // Liberar conexión
    if (connection) {
      connection.release();
      console.log('🔌 Conexión liberada');
    }
  }
}

// Ejecutar la función y manejar la salida del proceso
insertarToners()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

