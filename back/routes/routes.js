import { Router } from "express";
import { chatWithAI } from "../controllers/apiGptController.js";
import { listarMarcas } from "../controllers/marcasController.js";



const router = Router();

// Ruta para manejar las consultas del chat con OpenAI
router.post("/chat", chatWithAI);

// Ruta para Consultas de marcas
router.get("/listarMarcas", listarMarcas)


export default router;
