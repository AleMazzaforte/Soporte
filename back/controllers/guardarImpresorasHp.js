const tonersBrother = [
  {
    modelo: "SAM101S",
    impresoras: [
      "ML-2160",
      "ML-2161",
      "ML-2162",
      "ML-2164",
      "ML-2164W",
      "ML-2165",
      "ML-2166",
      "ML-2167",
      "ML-2168",
      "ML-2168w",
      "SCX-3405",
      "SCX-3400",
      "SCX-3405F",
      "SCX-3405FW",
      "SCX-3405W",
      "SCX-3407",
      "SF-760P"
    ]
  },
  {
    modelo: "SAM104S",
    impresoras: [
      "ML-1660",
      "ML-1665",
      "ML-1860",
      "ML-1861",
      "ML-1865",
      "ML-1670",
      "ML-1667",
      "ML-1671",
      "ML-1675",
      "ML-1676",
      "ML-1677",
      "ML-1674",
      "ML-1678",
      "ML-1864",
      "ML-1867",
      "SCX-3200",
      "SCX-3205",
      "SCX-3210",
      "SCX-3207"
    ]
  },
  {
    modelo: "SAM108S",
    impresoras: [
      "ML-1640",
      "ML-2240"
    ]
  },
  {
    modelo: "SAM111L",
    impresoras: [
      "Xpress SL-M2020",
      "Xpress SL-M2020W",
      "Xpress SL-M2021",
      "Xpress SL-M2021W",
      "Xpress SL-M2022",
      "Xpress SL-M2022W",
      "Xpress SL-M2070",
      "Xpress SL-M2070F",
      "Xpress SL-M2070FW",
      "Xpress SL-M2071",
      "Xpress SL-M2071FH",
      "Xpress SL-M2071HW",
      "Xpress SL-M2071W",
      "Xpress SL-M2078",
      "Xpress SL-M2078F",
      "Xpress SL-M2078FW",
      "Xpress SL-M2078W"
    ]
  },
  {
    modelo: "SAM115L",
    impresoras: [
      "SL-M2620",
      "SL-M2670",
      "SL-M2820",
      "SL-M2870"
    ]
  },
  {
    modelo: "SAM203L",
    impresoras: [
      "ProXpress SL-M4020ND",
      "ProXpress SL-M4070FR",
      "ProXpress SL-M4070FW"
    ]
  },
  {
    modelo: "SAM205L",
    impresoras: [
      "ML-3310",
      "ML-3312",
      "ML-3710",
      "ML-3712ND",
      "SCX-4833HD",
      "SCX-5737",
      "SCX-5639"
    ]
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
      for (const toner of tonersBrother) {
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
                      'INSERT INTO impresorasBrotherToner (nombre, idToner) VALUES (?, ?)',
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