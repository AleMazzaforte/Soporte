import conn from "../db/db.js";

const impresorasController = {
  getImpresoras: async (req, res) => {
    const idMarca = req.params.idMarca;
    let nombreTabla = "";
    

    switch (idMarca.toString()) { // Convertir a string por si llega como número
      case "1":
        nombreTabla = "impresorasHpToner";
        break;
      case "2":
        nombreTabla = "impresorasBrotherToner";
        break;
      case "3":
        nombreTabla = "impresorasRicohToner";
        break;
      case "4":
        nombreTabla = "impresorasXeroxToner";
        break;
      case "5":
        nombreTabla = "impresorasSamsungToner";
        break;
      default:
        return res.status(400).json({
          success: false,
          error: { message: "Marca no válida" }
        });
    }
    

    let connection;
    try {
      connection = await conn.getConnection();
      
      const query = "SELECT id, nombre, idToner FROM ?? GROUP BY nombre ORDER BY nombre";
      const [rows] = await connection.query(query, [nombreTabla]);

      res.json({
        success: true,
        data: rows,
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
};

export default impresorasController;