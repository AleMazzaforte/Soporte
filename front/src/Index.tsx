import React, { useState } from "react";
import axios from "axios";

const Index: React.FC = () => {
    const [showToner, setShowToner] = useState(false);
    const [showCartucho, setShowCartucho] = useState(false);
    const [showUnidadImagen, setShowUnidadImagen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatResponse, setChatResponse] = useState("");

    const handleChatSubmit = async () => {
        console.log("Enviando mensaje a OpenAI", chatInput);
   
        try {
            const response = await axios.post("http://localhost:8080/chat", { message: chatInput });
            setChatResponse(response.data.reply);
        } catch (error) {
            console.error("Error obteniendo respuesta de OpenAI", error);
        }
    };
   

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-4xl font-bold text-gray-800">Bienvenido a la Página de Soporte</h1>
            <table>
                <thead>
                    <tr>
                        <td>Toner</td>
                        <td>Cartuchos</td>
                        <td>Unidad de Imagen</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <input 
                                type="text" 
                                placeholder="Ingrese el modelo de toner"
                                onChange={() => setShowToner(true)}
                            />
                        </td>
                        <td>
                            <input 
                                type="text" 
                                placeholder="Ingrese el modelo de cartucho"
                                onChange={() => setShowCartucho(true)}
                            />
                        </td>
                        <td>
                            <input 
                                type="text" 
                                placeholder="Ingrese el modelo de Unidad de imagen"
                                onChange={() => setShowUnidadImagen(true)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {showToner && (
                                <select name="toner" id="selectToner">
                                    <option value="H05A-H80A">H05A-H80A</option>
                                    <option value="H17A">H17A</option>
                                    <option value="H26A">H26A</option>
                                </select>
                            )}
                        </td>
                        <td>
                            {showCartucho && (
                                <select name="cartucho" id="selectCartucho">
                                    <option value="EP47-N">EP47 N</option>
                                    <option value="EP47-C">EP47 C</option>
                                    <option value="EP47-M">EP47 M</option>
                                    <option value="EP47-A">EP47 A</option>
                                </select>
                            )}
                        </td>
                        <td>
                            {showUnidadImagen && (
                                <select name="unidadDeImagen" id="selectUnidadDeImagen">
                                    <option value="DR14-A">DR14 A</option>
                                    <option value="DR19-A">DR19 A</option>
                                    <option value="DR32-A">DR32 A</option>
                                    <option value="DR1060">DR1060</option>
                                </select>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Chat de IA */}
            <div className="mt-6 w-full max-w-md bg-white p-4 shadow-md rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Chat con IA</h2>
                <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="Escribe tu pregunta..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                />
                <button 
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={handleChatSubmit}
                >
                    Enviar
                </button>
                {chatResponse && (
                    <p className="mt-4 p-2 bg-gray-200 rounded">{chatResponse}</p>
                )}
            </div>
        </div>
    );
};

export default Index;
