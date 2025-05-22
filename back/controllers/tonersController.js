import conn from "../db/db.js";

const tonersController = {
  getToners: async (req, res) => {
    const idToner = req.params.idToner;
    let nombreTabla = "toners";

    let connection;
    try {
      connection = await conn.getConnection();
      
      const query = "SELECT id, nombre FROM ?? WHERE id = ? ORDER BY nombre";
      const [rows] = await connection.query(query, [nombreTabla, idToner]);

      res.json({
        success: true,
        data: rows[0],
      });
      
    } catch (error) {
      console.error("Error al obtener impresoras:", error);
      res.status(500).json({
        success: false,
        error: { message: "Error al obtener impresoras", details: error.message },
      });
    } finally {
      if (connection) {
        connection.release(); // Liberar la conexión al pool
      }
    }
  },

  getAllToners: async (req, res) => {
    let nombreTabla = "toners";

    let connection;
    try {
      connection = await conn.getConnection();
      
      const query = "SELECT id, nombre FROM ?? ORDER BY nombre";
      const [rows] = await connection.query(query, [nombreTabla]);

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("Error al obtener Toner/Cartucho:", error);
      res.status(500).json({
        success: false,
        error: { message: "Error al obtener Toner/Cartucho", details: error.message },
      });
    } finally {
      if (connection) {
        connection.release(); // Liberar la conexión al pool
      }
    }
    
    
  },
};

export default tonersController;