import { Router } from "express";
import { chatWithAI } from "../controllers/apiGptController.js";



const router = Router();

// Ruta para manejar las consultas del chat con OpenAI
router.post("/chat", chatWithAI);

export default router;
