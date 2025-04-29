import React, { useState } from "react";
import axios from "axios";
import Select from "react-select";
import Endpoints from "./utilities/Endpoints";
import "./styles.css";

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
    falla: "",
  });

  const [chatInput, setChatInput] = useState("");
  const [currentStep, setCurrentStep] = useState<
    "pais" | "medioCompra" | "impresora" | "modelo" | "falla" | "chat"
  >("pais");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);

  const [modelos, setModelos] = useState<Impresora[]>([]);
  const [isLoadingModelos, setIsLoadingModelos] = useState(false);

  const [tonerInfo, setTonerInfo] = useState<{ nombre: string } | null>(null);

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
        } catch (error) {
          console.error("Error al cargar las marcas", error);
          setMarcas([]);
        }
      },
      medioCompra: () => setCurrentStep("impresora"),
      impresora: async () => {
        setIsLoadingModelos(true);
        try {
          // Busca el ID de la marca seleccionada
          const marcaSeleccionada = marcas.find((m) => m.nombre === value);
          if (marcaSeleccionada) {
            // Usa el ID de la marca en la URL

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
            // Obtener información del toner
            const response = await axios.get(
              `${urlBase}/sku/${modeloSeleccionado.idToner}`
            );
            setTonerInfo(response.data.data);
          } catch (error) {
            console.error("Error al cargar información del toner", error);
            setTonerInfo(null);
          }
        }
        setCurrentStep("falla");
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
    label: string,
    value: string,
    step: keyof typeof selections
  ) => (
    <div className="selection-chip">
      <span>
        {label}: {value}
      </span>
      <button onClick={() => goBack(step)}>✕</button>
    </div>
  );

  return (
    <div className="app-container">
      <h1 className="app-title">Centro de Soporte Técnico</h1>

      <div className="selections-container">
        {selections.pais &&
          renderSelectionChip("País", selections.pais, "pais")}
        {selections.medioCompra &&
          renderSelectionChip(
            "Medio de compra",
            selections.medioCompra,
            "medioCompra"
          )}
        {selections.impresora &&
          renderSelectionChip("Impresora", selections.impresora, "impresora")}
        {selections.modelo &&
          renderSelectionChip("Modelo", selections.modelo, "modelo")}
        {selections.falla &&
          renderSelectionChip("Falla", selections.falla, "falla")}
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
                <option value="España">España</option>
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
                placeholder="Busca tu modelo..."
                noOptionsMessage={() => "No se encontraron modelos"}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    handleSelection("modelo", selectedOption.value);
                  }
                }}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: "var(--select-bg)",
                    color: "var(--select-color)",
                    borderColor: state.isFocused
                      ? "var(--primary-color)"
                      : "var(--input-border)",
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(100, 108, 255, 0.2)"
                      : "none",
                    "&:hover": {
                      borderColor: "var(--primary-hover)",
                    },
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "var(--select-option-bg)",
                    color: "var(--select-option-color)",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    textAlign: "left",
                    backgroundColor: state.isFocused
                      ? "var(--primary-hover)"
                      : "var(--select-option-bg)",
                    color: "var(--select-option-color)",
                    "&:hover": {
                      backgroundColor: "var(--primary-hover)",
                      color: "white",
                    },
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    textAlign: "left",
                    color: "var(--select-color)",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "var(--select-color)",
                  }),
                }}
              />
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

      {selections.modelo && (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl mt-4 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Cartucho compatible
          </h2>
          {tonerInfo ? (
            <p className="text-gray-600">{tonerInfo.nombre}</p>
          ) : (
            <p className="text-gray-600">
              No se encontró información del cartucho compatible
            </p>
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
