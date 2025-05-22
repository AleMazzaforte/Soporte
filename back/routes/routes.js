import { Router } from "express";
import { chatWithAI } from "../controllers/apiGptController.js";
import { listarMarcas } from "../controllers/marcasController.js";
import impresorasController from "../controllers/impresorasController.js";
import tonersController from "../controllers/tonersController.js";



const router = Router();

// Ruta para manejar las consultas del chat con OpenAI
router.post("/chat", chatWithAI);

// Ruta para Consultas de marcas
router.get("/listarMarcas", listarMarcas)

// Rutas para modelos de impresoras
router.get('/impresoras/:idMarca', impresorasController.getImpresoras);

//Rutas para modelos de toner
router.get("/sku/:idToner", tonersController.getToners)
router.get("/getAllToners", tonersController.getAllToners)


export default router;
