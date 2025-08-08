import conn from "../db/db.js";

const consultaController = {
  getPrompts: async (req, res) => {
    let connection;
    try {
      connection = await conn.getConnection();

      const query = "SELECT * FROM prompt";
      const [rows] = await connection.query(query);

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("Error al obtener prompts papa:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Error al obtener los prompts",
          details: error.message,
        },
      });
    } finally {
      if (connection) connection.release();
    }
  },

  postGuardarConsulta: async (req, res) => {console.log('creando consulta');
  
    const {  pais, medio_compra, marca, modelo, falla, email, chat } = req.body;

    if (!pais || !medio_compra || !marca || !modelo || !falla || !email || !chat) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Faltan datos requeridos: pais, medio_compra, marca, modelo, falla, email o chat",
      },
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El formato del email no es válido",
      },
    });
  }
  const chatString = typeof chat === "string" ? chat : JSON.stringify(chat);

    let connection;
    try {console.log('creando pegada');
    
      connection = await conn.getConnection();

      const query = "INSERT INTO soporte_tecnico (pais, medio_compra, marca, modelo, falla, email, chat) VALUES (?, ?, ?, ?, ?, ?, ?)";
      const [result] = await connection.query(query, [pais, medio_compra, marca, modelo, falla, email, chatString]);

      res.status(201).json({
        success: true,
        data: {
         
          pais, 
          medio_compra, 
          marca, 
          modelo, 
          falla, 
          email, 
          chatString,
        },
        message: "Consulta creada correctamente",
      });
    } catch (error) {
      console.error("Error al crear prompt:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Error al guardar la consulta",
          details: error.message,
        },
      });
    } finally {
      if (connection) connection.release();
    }
  },

  putActualizarPrompt: async (req, res) => {
  
    const { id } = req.params;
    const { prompt, usarEste } = req.body;
      
      
    if (!prompt || (typeof usarEste !== 'boolean' && typeof usarEste !== 'number')) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Datos incompletos o inválidos",
        },
      });
    }

    let connection;
    try {
      connection = await conn.getConnection();

      const query = "UPDATE prompt SET prompt = ?, usarEste = ? WHERE id = ?";
      const [result] = await connection.query(query, [prompt, usarEste, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Prompt no encontrado",
          },
        });
      }

      res.json({
        success: true,
        message: "Prompt actualizado correctamente",
        data: {
          id,
          prompt,
          usarEste,
        },
      });
    } catch (error) {
      console.error("Error al actualizar prompt:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Error al actualizar el prompt",
          details: error.message,
        },
      });
    } finally {
      if (connection) connection.release();
    }
  },

  deleteEliminarPrompt: async (req, res) => {
    const { id } = req.params;

    let connection;
    try {
      connection = await conn.getConnection();

      const query = "DELETE FROM prompt WHERE id = ?";
      const [result] = await connection.query(query, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Prompt no encontrado",
          },
        });
      }

      res.json({
        success: true,
        message: "Prompt eliminado correctamente",
      });
    } catch (error) {
      console.error("Error al eliminar prompt:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Error al eliminar el prompt",
          details: error.message,
        },
      });
    } finally {
      if (connection) connection.release();
    }
  },
};

export default consultaController;