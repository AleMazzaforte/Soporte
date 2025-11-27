import React, { useState, useEffect, useRef } from "react";
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
  idToner1: string; // Siempre presente
  idToner2: string | null; // Opcional
  idToner3: string | null; // Opcional
  idToner4: string | null; // Opcional
}

interface TonerInfo {
  nombre: string;
  skus: string[]; // Para almacenar todos los SKUs
}
interface Marca {
  id: number;
  nombre: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
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

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "var(--select-bg)",
      borderColor: "var(--input-border)",
      color: "var(--select-color)",
      padding: "10px 15px",
      fontSize: "16px",
      borderRadius: "4px",
      textAlign: "left",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(100, 108, 255, 0.2)" : null,
      "&:hover": {
        borderColor: "var(--primary-color)",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "var(--select-bg)",
      color: "var(--select-color)",
      borderRadius: "4px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "var(--primary-color)"
        : state.isFocused
        ? "var(--chip-bg)"
        : "var(--select-option-bg)",
      color: state.isSelected ? "#fff" : "var(--select-option-color)",
      padding: "8px 12px",
      textAlign: "left",
      "&:active": {
        backgroundColor: "var(--primary-hover)",
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "var(--select-color)",
      textAlign: "left",
    }),
    input: (provided: any) => ({
      ...provided,
      color: "var(--select-color)",
      textAlign: "left",
    }),
  };

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

  const [isLoadingModelos, setIsLoadingModelos] = useState(false);

  const [tonerInfo, setTonerInfo] = useState<TonerInfo | null>(null);
  const [modelosAgrupados, setModelosAgrupados] = useState<Impresora[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [newModelToner, setNewModelToner] = useState("");
  const [isHuman, setIsHuman] = useState(false);
  const [botCheck, setBotCheck] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

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
            const response = await axios.get<ApiResponse<Impresora[]>>(
              endpoint
            );
            const modelosData = response.data.data || [];

            setModelosAgrupados(modelosData);
          }
        } catch (error) {
          console.error(`Error al cargar modelos ${value}`, error);
          setModelosAgrupados([]);
        } finally {
          setIsLoadingModelos(false);
        }
        setCurrentStep("modelo");
      },
      modelo: async () => {
        const modeloSeleccionado = modelosAgrupados.find(
          (m) => m.nombre === value
        );
        if (modeloSeleccionado) {
          // ✅ Extraer toners no nulos
          const toners = [
            modeloSeleccionado.idToner1,
            modeloSeleccionado.idToner2,
            modeloSeleccionado.idToner3,
            modeloSeleccionado.idToner4,
          ].filter((t) => t !== null && t !== undefined) as string[];

          if (toners.length === 0) {
            setTonerInfo({
              nombre: modeloSeleccionado.nombre,
              skus: [],
            });
            setCurrentStep("tonerCorrecto");
          } else {
            try {
              // 🚀 Una sola llamada para todos los toners
              const response = await axios.post(`${urlBase}/sku/bulk`, {
                ids: toners,
              });

              // Crear un mapa para buscar rápido por ID
              const tonerMap = new Map(
                response.data.data.map((item: any) => [item.id, item.nombre])
              );

              // Asegurar el mismo orden que en `toners`
              const skus: string[] = toners.map((id) => {
                const nombre = tonerMap.get(Number(id));
                return typeof nombre === "string"
                  ? nombre
                  : `Toner ${id} no encontrado`;
              });

              setTonerInfo({
                nombre: modeloSeleccionado.nombre,
                skus: skus,
              });
              setCurrentStep("tonerCorrecto");
            } catch (error) {
              console.error("Error al cargar información de los toners", error);
              setTonerInfo({
                nombre: modeloSeleccionado.nombre,
                skus: ["Error al cargar los cartuchos compatibles"],
              });
              setCurrentStep("tonerCorrecto");
            }
          }
        }
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
    setChatMessages([]);
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
      <span>{value}</span>
      <button onClick={() => goBack(step)}>✕</button>
    </div>
  );

  return (
    <div className="app-container">
      <h1 className="app-title">Centro de Soporte Técnico</h1>

      <div className="selections-container">
        {selections.pais && renderSelectionChip(selections.pais, "pais")}
        {selections.medioCompra &&
          renderSelectionChip(selections.medioCompra, "medioCompra")}
        {selections.impresora &&
          renderSelectionChip(selections.impresora, "impresora")}
        {selections.modelo && renderSelectionChip(selections.modelo, "modelo")}
        {selections.tonerCorrecto &&
          renderSelectionChip(selections.tonerCorrecto, "tonerCorrecto")}
        {selections.falla && renderSelectionChip(selections.falla, "falla")}
      </div>

      {currentStep !== "chat" && (
        <div className="form-container">
          {currentStep === "pais" && (
            <>
              <h2 className="app-title">¿De qué país te contactas?</h2>
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
              <h2 className="app-title">¿Por qué medio compraste?</h2>
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
              <h2 className="app-title">¿Qué marca es tu impresora?</h2>
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
              <h2 className="app-title">
                Selecciona tu modelo de impresora {selections.impresora}
              </h2>
              <Select
                styles={customStyles}
                options={modelosAgrupados.map((modelo) => ({
                  value: modelo.nombre,
                  label: modelo.nombre,
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
                    const modeloSeleccionado = modelosAgrupados.find(
                      (m) => m.nombre === selectedOption.value
                    );
                    if (modeloSeleccionado) {
                      handleSelection("modelo", selectedOption.value);
                    }
                  }
                }}
                className="react-select-container"
                classNamePrefix="react-select"
              />

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
                        className="honeypot-input"
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
              <div>
                <h2>Modelo seleccionado: {tonerInfo.nombre}</h2>
                <div className="toners-container">
                  <h3>Cartuchos compatibles:</h3>
                  <ul>
                    {tonerInfo.skus.map((sku, index) => (
                      <li key={index}>{sku}</li>
                    ))}
                  </ul>
                </div>
                <h2>¿El producto que compraste aparece en la lista?</h2>
                <select
                  value={selections.tonerCorrecto}
                  onChange={(e) =>
                    handleSelection("tonerCorrecto", e.target.value)
                  }
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
              <h2>Selecciona la falla</h2>
              <select
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
            <div ref={messagesEndRef} />
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
