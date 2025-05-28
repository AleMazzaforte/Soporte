import conn from "../db/db.js";

export const listarMarcas = async (req, res) => {
    
    try {
        const [marcas] = await conn.query("SELECT id, nombre FROM marcas ORDER BY nombre ASC");
        
        res.json(marcas);
        
    } catch (error) {
        console.error("Error al listar marcas: ", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener la lista de marcas",
            message: error.message
        });
    }
};