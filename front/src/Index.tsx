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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            {/* Encabezado */}
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Centro de Soporte Técnico</h1>
            <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
                Ingresa los datos de tu cartucho o toner para recibir asistencia inmediata.
            </p>
    
            {/* Sección de Selección de Productos */}
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Selecciona el producto</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Toner */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Toner</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded"
                            placeholder="Modelo de toner"
                            onChange={() => setShowToner(true)}
                        />
                        {showToner && (
                            <select className="w-full mt-2 p-2 border rounded bg-white">
                                <option value="H05A-H80A">H05A-H80A</option>
                                <option value="H17A">H17A</option>
                                <option value="H26A">H26A</option>
                            </select>
                        )}
                    </div>
    
                    {/* Cartucho */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Cartucho</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded"
                            placeholder="Modelo de cartucho"
                            onChange={() => setShowCartucho(true)}
                        />
                        {showCartucho && (
                            <select className="w-full mt-2 p-2 border rounded bg-white">
                                <option value="EP47-N">EP47 N</option>
                                <option value="EP47-C">EP47 C</option>
                                <option value="EP47-M">EP47 M</option>
                                <option value="EP47-A">EP47 A</option>
                            </select>
                        )}
                    </div>
    
                    {/* Unidad de Imagen */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Unidad de Imagen</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded"
                            placeholder="Modelo de unidad de imagen"
                            onChange={() => setShowUnidadImagen(true)}
                        />
                        {showUnidadImagen && (
                            <select className="w-full mt-2 p-2 border rounded bg-white">
                                <option value="DR14-A">DR14 A</option>
                                <option value="DR19-A">DR19 A</option>
                                <option value="DR32-A">DR32 A</option>
                                <option value="DR1060">DR1060</option>
                            </select>
                        )}
                    </div>
                </div>
            </div>
    
            {/* Chat de Soporte */}
            <div className="mt-8 w-full max-w-3xl bg-white p-6 shadow-md rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-3">Asistente de Soporte</h2>
                <p className="text-gray-600 mb-4">Escribe tu problema y te ayudaremos con la mejor solución.</p>
                <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="Describe tu problema..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                />
                <button 
                    className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    onClick={handleChatSubmit}
                >
                    Enviar
                </button>
                {chatResponse && (
                    <div className="mt-4 p-3 bg-gray-100 rounded">
                        <p className="text-gray-700">{chatResponse}</p>
                    </div>
                )}
            </div>
        </div>
    );
    
};

export default Index;
