import React, { useState } from "react";
import axios from "axios";
import Endpoints from "./utilities/Endpoints";
import './styles.css';

let urlBase = Endpoints.URLPROD;
if (window.location.host === "localhost:5173") {
    urlBase = Endpoints.URLDEV;
}


const chat = Endpoints.CHAT;
console.log('url prod', Endpoints.URLPROD+chat);
interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
    isError?: boolean;
    timestamp?: string;
}

const Index: React.FC = () => {
    // Estados (se mantienen igual para que el frontend funcione igual)
    const [selections, setSelections] = useState({
        pais: "",
        medioCompra: "",
        impresora: "",
        modelo: "",
        falla: ""
    });
    const [chatInput, setChatInput] = useState("");
    const [currentStep, setCurrentStep] = useState<"pais" | "medioCompra" | "impresora" | "modelo" | "falla" | "chat">("pais");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    // Funciones de los selects (se mantienen igual)
    const handleSelection = (key: keyof typeof selections, value: string) => {
        setSelections(prev => ({...prev, [key]: value}));
        if (key === "pais") setCurrentStep("medioCompra");
        else if (key === "medioCompra") setCurrentStep("impresora");
        else if (key === "impresora") setCurrentStep("modelo");
        else if (key === "modelo") setCurrentStep("falla");
        else if (key === "falla") setCurrentStep("chat");
    };

    const goBack = (step: keyof typeof selections) => {
        const newSelections = {...selections};
        let cleared = false;
        (Object.keys(newSelections) as Array<keyof typeof selections>).forEach(key => {
            if (key === step || cleared) {
                newSelections[key] = "";
                cleared = true;
            }
        });
        setSelections(newSelections);
        setCurrentStep(step);
    };

    // Función modificada para enviar SOLO el mensaje
    const handleChatSubmit = async () => {
        if (!chatInput.trim()) return;
        
        // Agregar mensaje del usuario
        const userMessage: ChatMessage = { 
            sender: "user", 
            text: chatInput,
            timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput("");
        
        try {
            // 👇 Solo enviamos el mensaje, sin los datos adicionales
            const response = await axios.post(urlBase + chat, { 
                message: chatInput // Único campo enviado
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
    
            if (!response.data.success) {
                throw new Error(response.data.error?.message || "Respuesta no exitosa del servidor");
            }
            
            // Respuesta del bot
            const botMessage: ChatMessage = { 
                sender: "bot", 
                text: response.data.reply,
                isError: false,
                timestamp: new Date().toISOString()
            };
            setChatMessages(prev => [...prev, botMessage]);
            
        } catch (error) {
            console.error("Error en la solicitud:", error);
            
            let errorMessage = "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.";
            
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.error?.message || 
                             error.message || 
                             "Error de conexión con el servidor";
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            const errorMessageObj: ChatMessage = { 
                sender: "bot", 
                text: errorMessage,
                isError: true,
                timestamp: new Date().toISOString()
            };
            
            setChatMessages(prev => [...prev, errorMessageObj]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleChatSubmit();
        }
    };

    // Renderizado (se mantiene igual)
    const renderSelectionChip = (label: string, value: string, step: keyof typeof selections) => (
        <div className="selection-chip">
            <span>{label}: {value}</span>
            <button onClick={() => goBack(step)}>✕</button>
        </div>
    );

    return (
        <div className="app-container">
            <h1 className="app-title">Centro de Soporte Técnico</h1>

            {/* Mostrar selecciones anteriores */}
            <div className="selections-container">
                {selections.pais && renderSelectionChip("País", selections.pais, "pais")}
                {selections.medioCompra && renderSelectionChip("Medio de compra", selections.medioCompra, "medioCompra")}
                {selections.impresora && renderSelectionChip("Impresora", selections.impresora, "impresora")}
                {selections.modelo && renderSelectionChip("Modelo", selections.modelo, "modelo")}
                {selections.falla && renderSelectionChip("Falla", selections.falla, "falla")}
            </div>

            {/* Formulario paso a paso */}
            {currentStep !== "chat" && (
                <div className="form-container">
                    {currentStep === "pais" && (
                        <>
                            <h2>¿De qué país te contactas?</h2>
                            <select 
                                value={selections.pais}
                                onChange={(e) => handleSelection("pais", e.target.value)}
                            >
                                <option value="">Seleccione un país</option>
                                <option value="Argentina">Argentina</option>
                                <option value="México">México</option>
                                <option value="España">España</option>
                            </select>
                        </>
                    )}

                    {currentStep === "medioCompra" && (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">¿Por qué medio compraste?</h2>
                            <select 
                                className="w-full p-2 border rounded" 
                                value={selections.medioCompra}
                                onChange={(e) => handleSelection("medioCompra", e.target.value)}
                            >
                                <option value="">Seleccione un medio</option>
                                <option value="Mercado Libre">Mercado Libre</option>
                                <option value="Tienda Nube">Tienda Nube</option>
                                <option value="Compra Directa">Compra Directa en Local</option>
                            </select>
                        </>
                    )}

                    {currentStep === "impresora" && (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">¿Qué marca es tu impresora?</h2>
                            <select 
                                className="w-full p-2 border rounded" 
                                value={selections.impresora}
                                onChange={(e) => handleSelection("impresora", e.target.value)}
                            >
                                <option value="">Seleccione una marca</option>
                                <option value="HP">HP</option>
                                <option value="Canon">Canon</option>
                                <option value="Epson">Epson</option>
                            </select>
                        </>
                    )}

                    {currentStep === "modelo" && (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">¿Qué modelo es tu impresora?</h2>
                            <select 
                                className="w-full p-2 border rounded" 
                                value={selections.modelo}
                                onChange={(e) => handleSelection("modelo", e.target.value)}
                            >
                                <option value="">Seleccione un modelo</option>
                                <option value="Modelo 1">Modelo 1</option>
                                <option value="Modelo 2">Modelo 2</option>
                                <option value="Modelo 3">Modelo 3</option>
                            </select>
                        </>
                    )}

                    {currentStep === "falla" && (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Selecciona la falla</h2>
                            <select 
                                className="w-full p-2 border rounded" 
                                value={selections.falla}
                                onChange={(e) => handleSelection("falla", e.target.value)}
                            >
                                <option value="">Seleccione una falla</option>
                                {[
                                    "Roto", "No lo reconoce", "Mancha la hoja",
                                    "Pierde tinta", "No imprime", "Otro"
                                ].map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </>
                    )}
                </div>
            )}

            {/* Mostrar información de cartuchos si hay modelo seleccionado */}
            {selections.modelo && (
                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mt-4 text-center">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Estos son tus cartuchos</h2>
                    <img src="/ruta-a-la-imagen.jpg" alt="Cartuchos compatibles" className="w-64 mx-auto mb-4" />
                    <p className="text-gray-600">Aquí están los cartuchos compatibles con tu impresora.</p>
                    <div><br /></div>
                </div>
            )}

            {/* Chat de soporte */}
            {currentStep === "chat" && (
                <div className="chat-container">
                    <div className="chat-messages">
                        {chatMessages.length === 0 ? (
                            <p className="empty-chat-message">Describe tu problema y nuestro equipo te ayudará.</p>
                        ) : (
                            chatMessages.map((msg, index) => (
                                <div 
                                    key={`${msg.timestamp || index}-${msg.sender}`}
                                    className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}
                                >
                                    {msg.text}
                                    {msg.isError && (
                                        <div className="error-hint">
                                            Intenta nuevamente o contacta a soporte
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Input y botón de enviar */}
                    <div className="chat-input-area">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe tu mensaje..."
                            className="chat-input"
                        />
                        <button 
                            onClick={handleChatSubmit}
                            className="send-button"
                            disabled={!chatInput.trim()}
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Index;