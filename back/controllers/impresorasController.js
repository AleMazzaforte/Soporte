import conn from '../db/db.js';

const impresorasController = {
  // Obtener impresoras HP
  getHp: async (req, res) => {
    let connection;
    try {
      connection = await conn.getConnection();
      const [impresoras] = await connection.query(
        'SELECT id, nombre, idToner FROM impresorasHpToner ORDER BY nombre'
      );
      
      res.json({
        success: true,
        data: impresoras
      });
      
    } catch (error) {
      console.error('Error al obtener impresoras HP:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Error al obtener impresoras HP' }
      });
    } finally {
      if (connection) connection.release();
    }
  },

  // Obtener impresoras Epson
  getEpson: async (req, res) => {
    let connection;
    try {
      connection = await conn.getConnection();
      const [impresoras] = await connection.query(
        'SELECT id, nombre, idToner FROM impresorasEpson ORDER BY modelo'
      );
      
      res.json({
        success: true,
        data: impresoras
      });
      
    } catch (error) {
      console.error('Error al obtener impresoras Epson:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Error al obtener impresoras Epson' }
      });
    } finally {
      if (connection) connection.release();
    }
  },

  // Obtener impresoras Canon
  getCanon: async (req, res) => {
    let connection;
    try {
      connection = await conn.getConnection();
      const [impresoras] = await connection.query(
        'SELECT id, nombre, idToner FROM impresorasCanon ORDER BY nombre_modelo'
      );
      
      res.json({
        success: true,
        data: impresoras
      });
      
    } catch (error) {
      console.error('Error al obtener impresoras Canon:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Error al obtener impresoras Canon' }
      });
    } finally {
      if (connection) connection.release();
    }
  }
};

export default impresorasController;