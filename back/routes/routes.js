import { Router } from "express";
import { chatWithAI } from "../controllers/apiGptController.js";
import { listarMarcas } from "../controllers/marcasController.js";
import impresorasController from "../controllers/impresorasController.js";
import tonersController from "../controllers/tonersController.js";
import promptsController from "../controllers/promptsController.js";



const router = Router();



// Ruta para manejar las consultas del chat con OpenAI
router.post("/chat", chatWithAI);

// Ruta para Consultas de marcas
router.get("/listarMarcas", listarMarcas)

// Rutas para modelos de impresoras
router.get('/impresoras/:idMarca', impresorasController.getImpresoras);
router.post('/guardarImpresora', impresorasController.postGuardarImpresora);

//Rutas para modelos de toner
router.get("/sku/:idToner", tonersController.getToners)
router.get("/getAllToners", tonersController.getAllToners)

//Ruta para recibir impresora no mostrada
router.post('/guardarNoMostrada', impresorasController.postNoMostrada)

//Ruta para prompt
router.get("/getPrompts", promptsController.getPrompts);
router.post("/postPrompts", promptsController.postCrearPrompt);
router.put("/prompts/:id", promptsController.putActualizarPrompt);
router.delete("/prompts/:id", promptsController.deleteEliminarPrompt);


export default router;
