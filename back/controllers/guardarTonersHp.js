// Ejecutar desde la consola con node controllers/guardarTonersHp.js



import conn from "../db/db.js";

// Datos de los toners HP
const modelosTonersHP = [
  "H103A",
  "H05A-H80A",
  "H105A",
  "H105A S/C",
  "H12A",
  "H136A",
  "H136A S/C",
  "H147A S/C",
  "H150A",
  "H150A S/C",
  "H151A",
  "H151A S/C",
  "H17A",
  "H215A-H2310A N S/C",
  "H215A-H2311A C S/C",
  "H215A-H2312A A S/C",
  "H215A-H2313A M S/C",
  "H26A",
  "H26X",
  "H30A",
  "H310A-H350A N",
  "H311A-H351A C",
  "H312A-H352A A",
  "H313A-H353A M",
  "H320A-H540A N",
  "H321A-H541A C",
  "H322A-H542A A",
  "H323A-H543A M",
  "H37A",
  "H414A-H2020A N S/C",
  "H414A-H2021A C S/C",
  "H414A-H2022A A S/C",
  "H414A-H2023A M S/C",
  "H42A",
  "H48A",
  "H49A-H53A",
  "H51A",
  "H55A",
  "H58A",
  "H58A S/C",
  "H64A-H90A",
  "H78A",
  "H79A",
  "H81A",
  "H83A",
  "H85A-H35A-H36A",
  "H87A",
  "H89A",
  "H89A S/C",
  "HCE410A N",
  "HCE411A C",
  "HCE412A A",
  "HCE413A M",
  "HCF410X N",
  "HCF411X C",
  "HCF412X A",
  "HCF413X M",
  "HCF510A N",
  "HCF511A C",
  "HCF512A A",
  "HCF513A M"
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
    const query = 'INSERT INTO tonersHp (nombre) VALUES (?)';

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

