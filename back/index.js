import express from "express";
import cors from "cors";
import router from "./routes/routes.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();


const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//login
app.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  const usuarioCorrecto = process.env.USUARIO;
  const passwordCorrecto = process.env.CONTRASENIA;
  const SECRET_KEY = process.env.SECRET_KEY;
  
  
  console.log((usuario === usuarioCorrecto && password === passwordCorrecto));
  
  if (usuario === usuarioCorrecto && password === passwordCorrecto) {
    // Crear token
    const token = jwt.sign({ usuario }, SECRET_KEY, { expiresIn: '1h' });
    console.log(token);
    
    return res.json({ token });
  } else {
    return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
  }
});




// Ruta para manejar las consultas del chat con OpenAI
app.use("/", router);
app.get("/", (req, res) => {
    res.send("Servidor corriendo en el puerto: " + PORT);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});