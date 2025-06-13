import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Endpoints from '../utilities/Endpoints';

let urlBase = Endpoints.URLPROD;
if (window.location.host === "localhost:5173") {
  urlBase = Endpoints.URLDEV;
}

// Interfaz
interface Prompt {
  id: number;
  prompt: string;
  usarEste: boolean;
}

const PromptManager: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [nuevoPromptTexto, setNuevoPromptTexto] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [promptEdits, setPromptEdits] = useState<Record<number, string>>({});
  const [checkboxEdits, setCheckboxEdits] = useState<Record<number, boolean>>({});

  // Cargar prompts desde la API
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const res = await axios.get(`${urlBase}/getPrompts`);
        const data = res.data.data || [];
        setPrompts(data);

        // Inicializamos el estado de edición con los valores actuales
        const initialEdits = data.reduce((acc: Record<number, string>, prompt: Prompt) => {
          acc[prompt.id] = prompt.prompt;
          return acc;
        }, {});

        // Inicializar edición de checkbox
        const initialCheckboxEdits = data.reduce((acc: Record<number, boolean>, prompt: Prompt) => {
          acc[prompt.id] = prompt.usarEste;
          return acc;
        }, {});

        setPromptEdits(initialEdits);
        setCheckboxEdits(initialCheckboxEdits);

      } catch (err) {
        console.error('Error al cargar prompts:', err);
        setError('No se pudieron cargar los prompts.');
      } finally {
        setCargando(false);
      }
    };

    fetchPrompts();
  }, []);

  // Cambiar el estado de usarEste y actualizar en backend
  const toggleUsarEste = async (id: number) => {
    const prompt = prompts.find((p) => p.id === id);
    if (!prompt) return;

    const nuevoEstado = !prompt.usarEste;

    try {
      await axios.put(`/api/prompts/${id}`, {
        ...prompt,
        usarEste: nuevoEstado,
      });

      setPrompts(
        prompts.map((p) =>
          p.id === id ? { ...p, usarEste: nuevoEstado } : p
        )
      );
    } catch (err) {
      alert('Error al actualizar el estado "usarEste"');
      console.error(err);
    }
  };

  // Actualizar texto del prompt
  // Guardar cambios en un prompt específico
  const guardarPrompt = async (id: number) => {
    const nuevoTexto = promptEdits[id];
    const nuevoEstadoCheck = checkboxEdits[id];

    const promptOriginal = prompts.find((p) => p.id === id);
    if (!promptOriginal) return;

    // Si no hay cambios, no mandamos petición
    if (
      promptOriginal.prompt === nuevoTexto &&
      promptOriginal.usarEste === nuevoEstadoCheck
    ) {
      alert("No hubo cambios.");
      return;
    }

    try {
      await axios.put(`${urlBase}/prompts/${id}`, {
        prompt: nuevoTexto,
        usarEste: nuevoEstadoCheck,
      });

      // Actualizar estado global
      setPrompts(
        prompts.map((p) =>
          p.id === id ? { ...p, prompt: nuevoTexto, usarEste: nuevoEstadoCheck } : p
        )
      );

      // Limpiar campos temporales
      const { [id]: removedText, ...restText } = promptEdits;
      setPromptEdits(restText);

      const { [id]: removedCheck, ...restCheck } = checkboxEdits;
      setCheckboxEdits(restCheck);

      // Alerta de éxito
      alert("Modificación realizada correctamente.");

    } catch (err) {
      alert('Error al actualizar el prompt');
      console.error(err);
    }
  };
  // Eliminar un prompt
  const eliminarPrompt = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este prompt?')) return;

    try {
    
      await axios.delete(`${urlBase}/prompts/${id}`);
      setPrompts(prompts.filter((p) => p.id !== id));
      alert("Prompt eliminado correctamente")
    } catch (err) {
      alert('Error al eliminar el prompt');
      console.error(err);
    }
  };

  // Agregar nuevo prompt
  const agregarPrompt = async () => {
    if (!nuevoPromptTexto.trim()) return;

    try {
      const res = await axios.post(`${urlBase}/postPrompts`, {
        prompt: nuevoPromptTexto,
        usarEste: false,
      });

      const nuevoPrompt = res.data.data || {
        id: Date.now(),
        prompt: nuevoPromptTexto,
        usarEste: false,
      };

      setPrompts([nuevoPrompt, ...prompts]);
      setNuevoPromptTexto('');
    } catch (err) {
      alert('Error al crear el prompt');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', width: '100%' }}>
      <h2>Administrador de Prompts</h2>

      {/* Mensaje de error */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Tabla con display grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '10px',
          border: '1px solid #ccc',
          padding: '10px',
          fontWeight: 'bold',
        }}
      >
        <div>Prompt</div>
        <div>Usar este</div>
        <div>Acciones</div>
      </div>

      <div style={{ marginTop: '10px' }}>
        {cargando && <p>Cargando prompts...</p>}

        {!cargando && prompts.length === 0 && <p>No hay prompts disponibles.</p>}

        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: '10px',
              borderBottom: '1px solid #eee',
              padding: '10px 0',
            }}
          >
            {/* Prompt - Textarea */}
            <div>
              <textarea
                value={promptEdits[prompt.id]}
                onChange={(e) =>
                  setPromptEdits({
                    ...promptEdits,
                    [prompt.id]: e.target.value,
                  })
                }
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '8px',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Usar Este - Checkbox */}
            <div style={{ textAlign: 'center' }}>
              <label>
                <input
                  type="checkbox"
                  checked={checkboxEdits[prompt.id] ?? prompt.usarEste}
                  onChange={(e) =>
                    setCheckboxEdits({
                      ...checkboxEdits,
                      [prompt.id]: e.target.checked,
                    })
                  }
                />
              </label>
            </div>

            {/* Acciones - Botones */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => guardarPrompt(prompt.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Actualizar
              </button>
              <button
                onClick={() => eliminarPrompt(prompt.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario para agregar */}
      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h3>Agregar Nuevo Prompt</h3>
        <textarea
          value={nuevoPromptTexto}
          onChange={(e) => setNuevoPromptTexto(e.target.value)}
          placeholder="Escribe el nuevo prompt..."
          style={{
            width: '100%',
            height: '60px',
            padding: '8px',
            resize: 'vertical',
            marginBottom: '10px',
          }}
        />
        <button
          onClick={agregarPrompt}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Agregar Prompt
        </button>
      </div>
    </div>
  );
};

export default PromptManager;