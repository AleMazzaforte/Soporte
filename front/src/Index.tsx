import React, { useState } from "react";
import axios from "axios";
import Endpoints from "./utilities/Endpoints";

let urlBase = Endpoints.URLPROD;
if (window.location.host === "localhost:5173") {
    urlBase = Endpoints.URLDEV;
}

const chat = Endpoints.CHAT;
const Index: React.FC = () => {
    const [pais, setPais] = useState("");
    const [medioCompra, setMedioCompra] = useState("");
    const [impresora, setImpresora] = useState("");
    const [modelo, setModelo] = useState("");
    const [falla, setFalla] = useState("");
    const [chatInput, setChatInput] = useState("");
    const [chatResponse, setChatResponse] = useState("");

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

            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">¿De qué país te contactas?</h2>
                <select className="w-full p-2 border rounded" onChange={(e) => setPais(e.target.value)}>
                    <option value="">Seleccione un país</option>
                    <option value="Argentina">Argentina</option>
                    <option value="México">México</option>
                    <option value="España">España</option>
                </select>
            </div>

            {pais && (
                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mt-4">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">¿Por qué medio compraste?</h2>
                    <select className="w-full p-2 border rounded" onChange={(e) => setMedioCompra(e.target.value)}>
                        <option value="">Seleccione un medio</option>
                        <option value="Mercado Libre">Mercado Libre</option>
                        <option value="Tienda Nube">Tienda Nube</option>
                        <option value="Compra Directa">Compra Directa en Local</option>
                    </select>
                </div>
            )}

            {medioCompra && (
                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mt-4">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">¿Qué marca es tu impresora?</h2>
                    <select className="w-full p-2 border rounded" onChange={(e) => setImpresora(e.target.value)}>
                        <option value="">Seleccione una marca</option>
                        <option value="HP">HP</option>
                        <option value="Canon">Canon</option>
                        <option value="Epson">Epson</option>
                    </select>
                </div>
            )}

            {impresora && (
                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mt-4">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">¿Qué modelo es tu impresora?</h2>
                    <select className="w-full p-2 border rounded" onChange={(e) => setModelo(e.target.value)}>
                        <option value="">Seleccione un modelo</option>
                        <option value="Modelo 1">Modelo 1</option>
                        <option value="Modelo 2">Modelo 2</option>
                        <option value="Modelo 3">Modelo 3</option>
                    </select>
                </div>
            )}

            {modelo && (
                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mt-4 text-center">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Estos son tus cartuchos</h2>
                    <img src="/ruta-a-la-imagen.jpg" alt="Cartuchos compatibles" className="w-64 mx-auto mb-4" />
                    <p className="text-gray-600">Aquí están los cartuchos compatibles con tu impresora.</p>
                </div>
            )}

            {modelo && (
                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mt-4">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Selecciona la falla</h2>
                    <select className="w-full p-2 border rounded" onChange={(e) => setFalla(e.target.value)}>
                        <option value="">Seleccione una falla</option>
                        {[
                            "Roto", "No lo reconoce", "Mancha la hoja",
                            "Pierde tinta", "No imprime", "Otro"
                        ].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
};

export default Index;
