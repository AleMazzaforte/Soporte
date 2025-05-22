const tonersRicoh = [
  {
    modelo: "RIC310-RIC377",
    impresoras: ["SP 311DNw", "SP 311SFNw", "SP 377SFNwX", "SP 377DNwX"]
  },
  {
    modelo: "RIC3710",
    impresoras: ["SP 3710DN", "SP 3710SF"]
  }
];


  //const conn = require('./tuArchivoDeConexion.js'); // Ajusta la ruta según donde esté tu conexión
import conn from '../db/db.js'
async function guardarImpresorasHp() {
  let connection;
  try {
      connection = await conn.getConnection();
      console.log('Conexión a la base de datos establecida');

      // Iterar sobre cada modelo de toner
      for (const toner of tonersRicoh) {
          // Buscar el id del toner en la tabla tonersHp
          const [tonerRows] = await connection.query(
              'SELECT id FROM toners WHERE nombre = ?', 
              [toner.modelo]
          );

          if (tonerRows.length === 0) {
              console.log(`No se encontró el toner ${toner.modelo} en la base de datos`);
              continue;
          }

          const idToner = tonerRows[0].id;

          // Insertar cada impresora asociada a este toner
          for (const impresora of toner.impresoras) {
              try {
                  await connection.query(
                      'INSERT INTO impresorasRicohToner (nombre, idToner) VALUES (?, ?)',
                      [impresora, idToner]
                  );
                  console.log(`Insertada impresora: ${impresora} con toner ID: ${idToner}`);
              } catch (error) {
                  if (error.code === 'ER_DUP_ENTRY') {
                      console.log(`La impresora ${impresora} ya existe en la base de datos`);
                  } else {
                      console.error(`Error al insertar ${impresora}:`, error);
                  }
              }
          }
      }

      console.log('Proceso completado exitosamente');
  } catch (error) {
      console.error('Error en el proceso:', error);
  } finally {
      if (connection) {
          connection.release(); // Liberar la conexión al pool
          console.log('Conexión liberada');
      }
  }
}

guardarImpresorasHp();