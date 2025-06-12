import React, { useState } from "react";
import axios from "axios";
import Select from "react-select";
import Endpoints from "../utilities/Endpoints";

import "../styles.css";

let urlBase = Endpoints.URLPROD;
if (window.location.host === "localhost:5173") {
  urlBase = Endpoints.URLDEV;
}
const chat = Endpoints.CHAT;

interface Impresora {
  id: number;
  nombre: string;
  idToner: string;
}

interface Marca {
  id: number;
  nombre: string;
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  isError?: boolean;
  timestamp?: string;
}

const Index: React.FC = () => {
  const [selections, setSelections] = useState({
    pais: "",
    medioCompra: "",
    impresora: "",
    modelo: "",
    tonerCorrecto: "",
    falla: "",
  });


  const [chatInput, setChatInput] = useState("");
  const [currentStep, setCurrentStep] = useState<
    | "pais"
    | "medioCompra"
    | "impresora"
    | "modelo"
    | "tonerCorrecto"
    | "falla"
    | "chat"
  >("pais");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);

  const [modelos, setModelos] = useState<Impresora[]>([]);
  const [isLoadingModelos, setIsLoadingModelos] = useState(false);

  const [tonerInfo, setTonerInfo] = useState<{ nombre: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [newModelToner, setNewModelToner] = useState("");
  const [isHuman, setIsHuman] = useState(false);
  const [botCheck, setBotCheck] = useState("");

  const handleSubmitModel = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!newModelName.trim() || !newModelToner.trim()) {
      alert("Por favor completa todos los campos.");
      return;
    }

    if (!isHuman) {
      alert("Por favor marca la opción 'Soy un humano'.");
      return;
    }
    if (botCheck !== "") {
      setIsModalOpen(false);

      return;
    }

    // Datos a enviar
    const data = {
      nombre: newModelName,
      idToner: newModelToner,
      idMarca:
        marcas.find((m) => m.nombre === selections.impresora)?.id || null,
    };

    try {
      const response = await axios.post(`${urlBase}/guardarNoMostrada`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        alert("Modelo guardado correctamente.");
        setIsModalOpen(false);
        setNewModelName("");
        setNewModelToner("");
      } else {
        throw new Error(response.data.error?.message || "Error desconocido");
      }
    } catch (error) {
      let errorMessage = "Hubo un error al guardar el modelo.";

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.error?.message ||
          error.message ||
          "Error de conexión";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error(errorMessage);
      alert(errorMessage);
    }
  };

  const handleSelection = async (
    key: keyof typeof selections,
    value: string
  ) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
    const stepHandlers = {
      pais: async () => {
        setCurrentStep("medioCompra");
        try {
          const response = await axios.get(`${urlBase}/listarMarcas`);
          setMarcas(response.data);
          console.log("Marcas", response.data);
        } catch (error) {
          console.error("Error al cargar las marcas", error);
          setMarcas([]);
        }
      },
      medioCompra: () => setCurrentStep("impresora"),
      impresora: async () => {
        setIsLoadingModelos(true);
        try {
          const marcaSeleccionada = marcas.find((m) => m.nombre === value);
          if (marcaSeleccionada) {
            const endpoint = urlBase + "/impresoras/" + marcaSeleccionada.id;
            const response = await axios.get(`${endpoint}`);
            setModelos(response.data.data || []);
          }
        } catch (error) {
          console.error(`Error al cargar modelos ${value}`, error);
          setModelos([]);
        } finally {
          setIsLoadingModelos(false);
        }
        setCurrentStep("modelo");
      },
      modelo: async () => {
        const modeloSeleccionado = modelos.find((m) => m.nombre === value);
        if (modeloSeleccionado) {
          try {
            const response = await axios.get(
              `${urlBase}/sku/${modeloSeleccionado.idToner}`
            );
            setTonerInfo(response.data.data);
          } catch (error) {
            console.error("Error al cargar información del toner", error);
            setTonerInfo(null);
          }
        }
        setCurrentStep("tonerCorrecto");
      },
      tonerCorrecto: () => {
        if (value === "Sí") {
          setCurrentStep("falla");
        } else {
          
          setChatMessages([
            {
              sender: "bot",
              text: "Tu producto no corresponde con tu equipo",
              isError: true,
              timestamp: new Date().toISOString(),
            },
          ]);
          setCurrentStep("chat"); 
        }
      },
      falla: () => setCurrentStep("chat"),
    };

    await stepHandlers[key]?.();
  };

  const goBack = (step: keyof typeof selections) => {
    const newSelections = { ...selections };
    let cleared = false;
    (Object.keys(newSelections) as Array<keyof typeof selections>).forEach(
      (key) => {
        if (key === step || cleared) {
          newSelections[key] = "";
          cleared = true;
        }
      }
    );
    setSelections(newSelections);
    setCurrentStep(step);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      sender: "user",
      text: chatInput,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    try {
      const response = await axios.post(
        urlBase + chat,
        {
          message: chatInput,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.error?.message || "Respuesta no exitosa del servidor"
        );
      }

      const botMessage: ChatMessage = {
        sender: "bot",
        text: response.data.reply,
        isError: false,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      let errorMessage =
        "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.";

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.error?.message ||
          error.message ||
          "Error de conexión con el servidor";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      const errorMessageObj: ChatMessage = {
        sender: "bot",
        text: errorMessage,
        isError: true,
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, errorMessageObj]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleChatSubmit();
    }
  };

  const renderSelectionChip = (
    value: string,
    step: keyof typeof selections
  ) => (
    <div className="selection-chip">
      <span>
         {value}
      </span>
      <button onClick={() => goBack(step)}>✕</button>
    </div>
  );

  return (
    <div className="app-container">
      <h1 className="app-title">Centro de Soporte Técnico</h1>

      <div className="selections-container">
        {selections.pais &&
          renderSelectionChip(selections.pais, "pais")}
        {selections.medioCompra &&
          renderSelectionChip(
  
            selections.medioCompra,
            "medioCompra"
          )}
        {selections.impresora &&
          renderSelectionChip( selections.impresora, "impresora")}
        {selections.modelo &&
          renderSelectionChip( selections.modelo, "modelo")}
        {selections.tonerCorrecto &&
          renderSelectionChip(
            
            selections.tonerCorrecto,
            "tonerCorrecto"
          )}
        {selections.falla &&
          renderSelectionChip( selections.falla, "falla")}
      </div>

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
                <option value="Chile">Chile</option>
              </select>
            </>
          )}

          {currentStep === "medioCompra" && (
            <>
              <h2>¿Por qué medio compraste?</h2>
              <select
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
              <h2>¿Qué marca es tu impresora?</h2>
              <select
                value={selections.impresora}
                onChange={(e) => handleSelection("impresora", e.target.value)}
              >
                <option value="">Seleccione una marca</option>
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.nombre}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </>
          )}

          {currentStep === "modelo" && (
            <>
              <h2>Selecciona tu modelo de impresora {selections.impresora}</h2>
              <Select
                options={modelos.map((impresora) => ({
                  value: impresora.nombre,
                  label: impresora.nombre,
                }))}
                isLoading={isLoadingModelos}
                noOptionsMessage={() => (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="add-model-button"
                  >
                    No encuentro mi modelo, agregar nuevo
                  </button>
                )}
                placeholder="Busca tu modelo..."
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    handleSelection("modelo", selectedOption.value);
                  }
                }}
                className="react-select-container"
                classNamePrefix="react-select"
              />

              {/* Modal */}
              {isModalOpen && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3>Agregar nuevo modelo</h3>
                    <form onSubmit={handleSubmitModel}>
                      <label style={{ paddingLeft: "15px" }}>Impresora </label>
                      <input
                        className="modal-input"
                        type="text"
                        placeholder="Nombre de la impresora"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        required
                      />

                      <br />
                      <br />
                      <label style={{ paddingLeft: "15px" }}>
                        Toner/Cartucho
                      </label>
                      <input
                        className="modal-input"
                        type="text"
                        placeholder="Toner/Cartucho"
                        value={newModelToner}
                        onChange={(e) => setNewModelToner(e.target.value)}
                        required
                      />
                      <br />
                      <br />
                      {/* Checkbox "No soy un robot" */}
                      <label className="human-check-label">
                        <input
                          type="checkbox"
                          checked={isHuman}
                          onChange={(e) => setIsHuman(e.target.checked)}
                        />
                        Soy un humano
                      </label>

                      {/* Campo oculto honeypot (solo bots lo rellenan) */}
                      <input
                        type="text"
                        value={botCheck}
                        onChange={(e) => setBotCheck(e.target.value)}
                        className="honeypot-input" // Clase CSS para ocultarlo
                      />
                      <div className="modal-buttons">
                        <button type="submit">Guardar</button>
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {currentStep === "tonerCorrecto" && tonerInfo && (
            <>
              <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mt-4 text-center">
                <h2>Cartucho compatible</h2>
                <p className="tonerSeleccionado">{tonerInfo.nombre}</p>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  ¿Es el cartucho que compraste?
                </h2>
                <select
                  value={selections.tonerCorrecto}
                  onChange={(e) =>
                    handleSelection("tonerCorrecto", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
            </>
          )}

          {currentStep === "falla" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Selecciona la falla
              </h2>
              <select
                className="w-full p-2 border rounded"
                value={selections.falla}
                onChange={(e) => handleSelection("falla", e.target.value)}
              >
                <option value="">Seleccione una falla</option>
                {[
                  "Roto",
                  "No lo reconoce",
                  "Mancha la hoja",
                  "Pierde tinta",
                  "No imprime",
                  "Otro",
                ].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {currentStep === "chat" && (
        <div className="chat-container">
          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <p className="empty-chat-message">
                Describe tu problema y nuestro equipo te ayudará.
              </p>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={`${msg.timestamp || index}-${msg.sender}`}
                  className={`message ${msg.sender} ${
                    msg.isError ? "error" : ""
                  }`}
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
