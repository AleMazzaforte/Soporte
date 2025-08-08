import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import Endpoints from "../utilities/Endpoints";
import Urls from "../utilities/Urls";

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

interface ModeloAgrupado {
  nombre: string;
  toners: {
    id: number;
    idToner: string;
  }[];
}
interface TonerInfo {
  nombre: string;
  skus: string[]; // Para almacenar todos los SKUs
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
    medio_compra: "",
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
    | "medio_compra"
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [newModelToner, setNewModelToner] = useState("");
  const [isHuman, setIsHuman] = useState(false);
  const [botCheck, setBotCheck] = useState("");
  const [modelosAgrupados, setModelosAgrupados] = useState<ModeloAgrupado[]>(
    []
  );
  const [tonersDelModelo, setTonersDelModelo] = useState<{ idToner: string }[]>(
    []
  );

  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);


  const messagesEndRef = useRef<HTMLDivElement>(null);

  //Urls
  let guardarConsulta = Urls.consultas.guardar

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // --- NUEVO: Detectar primera respuesta del bot ---
  useEffect(() => {
    const firstBotMessage = chatMessages.find(m => m.sender === "bot" && !m.isError);
    if (firstBotMessage && !showEmailForm && !isSaved) {
      setShowEmailForm(true);
    }
  }, [chatMessages, showEmailForm, isSaved]);
  // -----------------------------------------------

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
      console.log(tonersDelModelo);
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
        setCurrentStep("medio_compra");
        try {
          const response = await axios.get(`${urlBase}/listarMarcas`);
          setMarcas(response.data);
        } catch (error) {
          console.error("Error al cargar las marcas", error);
          setMarcas([]);
        }
      },
      medio_compra: () => setCurrentStep("impresora"),
      impresora: async () => {
        setIsLoadingModelos(true);
        try {
          const marcaSeleccionada = marcas.find((m) => m.nombre === value);
          if (marcaSeleccionada) {
            const endpoint = urlBase + "/impresoras/" + marcaSeleccionada.id;
            const response = await axios.get(`${endpoint}`);
            const modelosData = response.data.data || [];

            // Agrupar modelos por nombre
            const modelosAgrupados = modelosData.reduce(
              (acc: ModeloAgrupado[], curr: Impresora) => {
                const modeloExistente = acc.find((m) => m.nombre === curr.nombre);
                if (modeloExistente) {
                  modeloExistente.toners.push({
                    id: curr.id,
                    idToner: curr.idToner,
                  });
                } else {
                  acc.push({
                    nombre: curr.nombre,
                    toners: [{
                      id: curr.id,
                      idToner: curr.idToner,
                    }],
                  });
                }
                return acc;
              },
              []
            );

            setModelosAgrupados(modelosAgrupados);
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
        const modeloSeleccionado = modelosAgrupados.find(m => m.nombre === value);
        if (modeloSeleccionado) {
          try {
            // Obtener todos los SKUs para este modelo
            const skusPromises = modeloSeleccionado.toners.map(toner =>
              axios.get(`${urlBase}/sku/${toner.idToner}`)
            );

            const responses = await Promise.all(skusPromises);

            // Extraer nombres y eliminar duplicados
            const skus = [
              ...new Set(responses.map(res => res.data.data.nombre))
            ];

            setTonerInfo({
              nombre: modeloSeleccionado.nombre,
              skus: skus
            });

            // Eliminar duplicados por idToner
            const tonersUnicos = Array.from(
              new Map(
                modeloSeleccionado.toners.map(t => [t.idToner, t])
              ).values()
            );

            setTonersDelModelo(tonersUnicos);
            setCurrentStep("tonerCorrecto");
          } catch (error) {
            console.error("Error al cargar información de los toners", error);
            setTonerInfo(null);
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

  // Guardar consulta ---
  const handleSaveConsulta = async () => {
    if (!email.trim()) {
      alert("Por favor ingresa tu email");
      return;
    }

    const data = {
      pais: selections.pais,
      medio_compra: selections.medio_compra,
      marca: selections.impresora,
      modelo: selections.modelo,
      falla: selections.falla,
      email: email.trim(),
      chat: chatMessages,
    };

    try {
      const response = await axios.post(`${guardarConsulta}`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        setIsSaved(true);
        setShowEmailForm(false);
      } else {
        throw new Error(response.data.error?.message || "Error al guardar");
      }
    } catch (error) {
      alert("Error al guardar la conversación. Intenta nuevamente.");
      console.error(error);
    }
  };
  // ---------------------------------------------

  return (
    <div className="app-container">
      <h1 className="app-title">Centro de Soporte Técnico</h1>

      <div className="selections-container">
        {selections.pais && renderSelectionChip(selections.pais, "pais")}
        {selections.medio_compra &&
          renderSelectionChip(selections.medio_compra, "medio_compra")}
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

          {currentStep === "medio_compra" && (
            <>
              <h2 className="app-title">¿Por qué medio compraste?</h2>
              <select
                value={selections.medio_compra}
                onChange={(e) => handleSelection("medio_compra", e.target.value)}
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
                options={[
                  ...modelosAgrupados.map((modelo) => ({
                    value: modelo.nombre,
                    label: modelo.nombre,
                  })),
                  { value: "no-encontrado", label: "No está mi modelo de impresora" },
                ]}
                value={
                  selections.modelo && selections.modelo !== "no-encontrado"
                    ? { value: selections.modelo, label: selections.modelo }
                    : null
                }
                isLoading={isLoadingModelos}
                placeholder="Busca tu modelo..."
                formatOptionLabel={(option) => {
                  if (option.value === "no-encontrado") {
                    return (
                      <span style={{ fontStyle: "italic", color: "var(--primary-color)" }}>
                        {option.label}
                      </span>
                    );
                  }
                  return option.label;
                }}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    if (selectedOption.value === "no-encontrado") {
                      setIsModalOpen(true);
                    } else {
                      const modeloSeleccionado = modelosAgrupados.find(
                        (m) => m.nombre === selectedOption.value
                      );
                      if (modeloSeleccionado) {
                        setTonersDelModelo(modeloSeleccionado.toners);
                        handleSelection("modelo", selectedOption.value);
                      }
                    }
                  }
                }}
                className="react-select-container"
                classNamePrefix="react-select"
              />

              {isModalOpen && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3>Por favor agregar modelo</h3>
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
                      <label className="human-check-label">
                        <input
                          type="checkbox"
                          checked={isHuman}
                          onChange={(e) => setIsHuman(e.target.checked)}
                        />
                        Soy un humano
                      </label>

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
                    {tonerInfo.skus.map((sku) => (
                      <li key={sku}>{sku}</li>
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
                  className={`message ${msg.sender} ${msg.isError ? "error" : ""}`}
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

            
            {isSaved && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                ✅ ¡Gracias! Tu caso fue guardado. Pronto recibirás una respuesta.
              </div>
            )}
            {/* ----------------------------- */}
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
      {/* --- FORMULARIO DE EMAIL --- */}
            {showEmailForm && !isSaved && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: 'var(--chip-bg)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Ingresa tu email para finalizar</h3>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: '10px',
                    width: '80%',
                    maxWidth: '300px',
                    margin: '10px 0',
                    border: '1px solid var(--input-border)',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
                <br />
                <button
                  onClick={handleSaveConsulta}
                  disabled={!email.trim()}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Guardar y finalizar
                </button>
              </div>
            )}

    </div>
  );
};

export default Index;