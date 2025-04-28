import conn from '../db/db.js';

const impresorasController = {
  
  getImpresoras: async (req, res) => {
    let connection;
    let idMarca = req.params.idMarca;
    let nombreTabla = '';
    switch (idMarca) {
      case 1:
        nombreTabla = 'impresorasHpToner';
        break;
      case 2:
        nombreTabla = 'impresorasEpsonToner';
        break;
      case 3:
        nombreTabla = 'impresorasRicohToner';
        break;
      case 4:
        nombreTabla = 'impresorasXeroxToner';
        break;
      case 5:
      default:
        nombreTabla = 'impresorasSamsungToner';
        break;
    }
    try {
      connection = await conn.getConnection();
      const [impresoras] = await connection.query(
        `SELECT id, nombre, idToner FROM ${nombreTabla} ORDER BY nombre`
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

  
};

export default impresorasController;
