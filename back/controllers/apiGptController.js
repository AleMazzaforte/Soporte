import axios from "axios";
import dotenv from "dotenv";
import conn from "../db/db.js";
dotenv.config();

const API = process.env.OPENAI_API_KEY;

export const chatWithAI = async (req, res) => {
  if (!API || API === undefined) {
    console.log( 'apikey',  API);
    
    return}
  const { message, context } = req.body;
  async function obtenerPromptActivo() {
    const connection = await conn.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT prompt FROM prompt WHERE usarEste = true"
      );

      return rows[0]?.prompt;
    } finally {
      connection.release();
    }
  }
  const prompt = await obtenerPromptActivo();
  //console.log(prompt);
  if (!message) {
    return res.status(400).json({
      success: false,
      error: {
        message: "El mensaje es obligatorio",
        code: "MESSAGE_REQUIRED",
      },
    });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `${prompt}`.trim(),
          },
          ...(context || []),
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      return res.status(502).json({
        success: false,
        error: {
          message: "La respuesta de OpenAI no tiene el formato esperado",
          code: "INVALID_RESPONSE_FORMAT",
          details: response.data,
        },
      });
    }

    res.json({
      success: true,
      reply: response.data.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error en OpenAI API:", error);

    // Error de OpenAI
    if (error.response?.data?.error) {
      return res.status(error.response.status || 500).json({
        success: false,
        error: {
          message: error.response.data.error.message,
          code: error.response.data.error.code || "OPENAI_ERROR",
          type: error.response.data.error.type,
          status: error.response.status,
        },
      });
    }

    // Error de conexión/red
    if (error.code) {
      return res.status(500).json({
        success: false,
        error: {
          message: `Error de conexión: ${error.message}`,
          code: error.code,
          details: error.config,
        },
      });
    }

    // Error genérico
    return res.status(500).json({
      success: false,
      error: {
        message: "Error interno del servidor",
        code: "INTERNAL_SERVER_ERROR",
      },
    });
  }
};
