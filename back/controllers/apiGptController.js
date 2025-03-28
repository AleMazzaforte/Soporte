import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const chatWithAI = async (req, res) => {
    const { message } = req.body;
    console.log( 'message:', message );
    console.log( 'message filtrado:', req.body);
    
    
    if (!message) {
        return res.status(400).json({ error: "El mensaje es obligatorio" });
    }

    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            console.log('la respuesta no existe');
            
        }else {
            console.log('la respuesta existe');
        }   
        console.log( 'response:', response.data.choices[0].message.content );
        console.log( 'response limpio:', response);
        res.json({ reply: response.data.choices[0].message.content });
        
        
    } catch (error) {
        console.error("Error en OpenAI API"/*, error*/);
        console.log(error.response.data);
        const errorResponse = error.response.data;
        if (errorResponse && errorResponse.error) {
            return res.status(400).json({ error: errorResponse.error.message });
        } else {
            return res.status(500).json({ error: "Error en el servidor" });
        }                   
        
    }
};
