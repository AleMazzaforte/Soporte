import conn from "../db/db.js";
import { switchNombreTabla } from "../utils/switchNombreTabla.js";

const impresorasController = {
  getImpresoras: async (req, res) => {
  
    const idMarca = req.params.idMarca;
    const nombreTabla = switchNombreTabla(idMarca);


    if (!nombreTabla) {
      return res.status(400).json({
        success: false,
        error: { message: "Marca no válida" },
      });
    }

    let connection;
    try {
      connection = await conn.getConnection();

      const query =
        "SELECT id, nombre, idToner1, idToner2, idToner3, idToner4 FROM ?? ORDER BY nombre";
      const [rows] = await connection.query(query, [nombreTabla]);
      

      
      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("Error al obtener impresoras:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Error al obtener impresoras",
          details: error.message,
        },
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  postGuardarImpresora: async (req, res) => {
    const { nombre, idToner1, idMarca, idToner2, idToner3, idToner4 } = req.body;

    const nombreTabla = switchNombreTabla(idMarca);

    if (!nombreTabla) {
      return res.status(400).json({
        success: false,
        error: { message: "Marca no válida" },
      });
    }    

    let connection;
    try {
      connection = await conn.getConnection();

      const query = `INSERT INTO \`${nombreTabla}\` (nombre, idToner1, idToner2, idToner3, idToner4 ) VALUES ( ?, ?, ?, ?, ?)`;

      await connection.query(query, [nombre, idToner1, idToner2, idToner3, idToner4]);

      res.status(200).json({
        success: true,
        message: "Impresora guardada correctamente",
      });
    } catch (error) {
      console.error("Error al guardar impresora:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Error al guardar impresora",
          details: error.message,
        },
      });
    } finally {
      if (connection) connection.release();
    }
  },

  postNoMostrada: async (req, res) => {
    const { nombre, idToner, idMarca } = req.body;
    
    const nombreTabla = "impresoraNoEncontrada";

    if (!nombreTabla) {
      return res.status(400).json({
        success: false,
        error: { message: "Marca no válida" },
      });
    }    

    let connection;
    try {
      connection = await conn.getConnection();

      const query = `INSERT INTO \`${nombreTabla}\` (nombre, idToner, idMarca) VALUES ( ?, ?, ?)`;

      await connection.query(query, [nombre, idToner, idMarca]);

      res.status(200).json({
        success: true,
        message: "Impresora guardada correctamente",
      });
    } catch (error) {
      console.error("Error al guardar impresora:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Error al guardar impresora",
          details: error.message,
        },
      });
    } finally {
      if (connection) connection.release();
    }
  },
};

export default impresorasController;
