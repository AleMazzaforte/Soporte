import conn from "../db/db.js";

const tonersController = {
  getTonersBulk: async (req, res) => {
  const { ids } = req.body; // Esperamos un array: ["1", "2", "3"]

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: "Se requiere un array de IDs" },
    });
  }

  // Validar que todos los IDs sean strings o números válidos
  const validIds = ids.filter(id => id && (typeof id === 'string' || typeof id === 'number'));
  if (validIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: "IDs inválidos" },
    });
  }

  let connection;
  try {
    connection = await conn.getConnection();
    const query = "SELECT id, nombre FROM ?? WHERE id IN (?) ORDER BY nombre";
    const [rows] = await connection.query(query, ["toners", validIds]);

    // Convertir a objeto para acceso rápido si lo deseas, o mantener como array
    res.json({
      success: true,
      data: rows, // [{ id: "1", nombre: "Toner X" }, ...]
    });
  } catch (error) {
    console.error("Error al obtener toners en bulk:", error);
    res.status(500).json({
      success: false,
      error: { message: "Error al obtener toners", details: error.message },
    });
  } finally {
    if (connection) {
      connection.release();
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