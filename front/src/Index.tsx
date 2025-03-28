import React, { useState } from "react";
import axios from "axios";
import Endpoints from "./utilities/Endpoints";

let urlBase = Endpoints.URLPROD;
if (window.location.host === "localhost:5173") {
    urlBase = Endpoints.URLDEV;
}

const chat = Endpoints.CHAT;
const Index: React.FC = () => {
    const [chatInput, setChatInput] = useState("");
    const [chatResponse, setChatResponse] = useState("");
    const [producto, setProducto] = useState("");
    const [modelo, setModelo] = useState("");
    const [falla, setFalla] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const handleChatSubmit = async () => {
        try {
            const response = await axios.post(urlBase + chat, { message: chatInput }, {
                headers: { 'Content-Type': 'application/json' }
            });
            setChatResponse(response.data.reply);
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Centro de Soporte Técnico</h1>
            <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
                Ingresa los datos de tu producto para recibir asistencia inmediata.
            </p>
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Selecciona el producto</h2>
                <select className="w-full p-2 border rounded" onChange={(e) => setProducto(e.target.value)}>
                    <option value="">Seleccione un producto</option>
                    <option value="toner">Toner</option>
                    <option value="cartucho">Cartucho</option>
                    <option value="unidadImagen">Unidad de Imagen</option>
                </select>

                {producto && (
                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium mb-1">Modelo</label>
                        <select className="w-full p-2 border rounded" onChange={(e) => setModelo(e.target.value)}>
                            <option value="">Seleccione un modelo</option>
                            {producto === "toner" && ["H05A-H80A", "H17A", "H26A"].map(m => <option key={m} value={m}>{m}</option>)}
                            {producto === "cartucho" && ["EP47-N", "EP47-C", "EP47-M", "EP47-A"].map(m => <option key={m} value={m}>{m}</option>)}
                            {producto === "unidadImagen" && ["DR14-A", "DR19-A", "DR32-A", "DR1060"].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                )}

                {modelo && (
                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium mb-1">Falla</label>
                        <select className="w-full p-2 border rounded" onChange={(e) => setFalla(e.target.value)}>
                            <option value="">Seleccione una falla</option>
                            {["Roto", "No lo reconoce", "Mancha la hoja", "Pierde tinta", "No imprime", "Otro"].map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                )}

                {falla === "Otro" && (
                    <div className="mt-4">
                        <label className="block text-gray-700 font-medium mb-1">Descripción</label>
                        <input type="text" className="w-full p-2 border rounded" placeholder="Describa la falla" onChange={(e) => setDescripcion(e.target.value)} />
                    </div>
                )}
            </div>

            <div className="mt-8 w-full max-w-3xl bg-white p-6 shadow-md rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-3">Asistente de Soporte</h2>
                <p className="text-gray-600 mb-4">Describe tu problema y te ayudaremos con la mejor solución.</p>
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
