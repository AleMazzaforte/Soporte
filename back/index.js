import express from "express";
import cors from "cors";
import router from "./routes/routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ruta para manejar las consultas del chat con OpenAI
app.use("/", router);
app.get("/", (req, res) => {
    res.send("Servidor corriendo en el puerto: " + PORT);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});