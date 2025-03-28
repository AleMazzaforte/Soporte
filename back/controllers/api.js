import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const listarModelos = async () => {
    try {
        const response = await axios.get("https://api.openai.com/v1/models", {
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
        });

        console.log("Modelos disponibles:");
        response.data.data.forEach(modelo => console.log(modelo.id));
    } catch (error) {
        console.error("Error al obtener modelos:", error.response?.data || error.message);
    }
};

listarModelos();
