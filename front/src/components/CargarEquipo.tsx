import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import Endpoints from "../utilities/Endpoints";
import { useNavigate } from "react-router-dom";

let urlBase = Endpoints.URLPROD;
if (window.location.host === "localhost:5173") {
  urlBase = Endpoints.URLDEV;
}

type OptionType = {
  id: number;
  nombre: string;
  label: string;
  value: number;
};

const token = localStorage.getItem("token");

const CargarEquipo: React.FC = () => {
  const [nombreImpresora, setNombreImpresora] = useState("");
  const [tonerOptions, setTonerOptions] = useState<OptionType[]>([]);
  const [marcaOptions, setMarcaOptions] = useState<OptionType[]>([]);
  const [selectedMarca, setSelectedMarca] = useState<OptionType | null>(null);
  
  // ✅ 4 estados para los toners
  const [selectedToner1, setSelectedToner1] = useState<OptionType | null>(null);
  const [selectedToner2, setSelectedToner2] = useState<OptionType | null>(null);
  const [selectedToner3, setSelectedToner3] = useState<OptionType | null>(null);
  const [selectedToner4, setSelectedToner4] = useState<OptionType | null>(null);
  
  const [mensaje, setMensaje] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);

  useEffect(() => {
    const fetchToners = async () => {
      try {
        const response = await axios.get(`${urlBase}/getAllToners`);
        if (response.data.success) {
          const options = response.data.data.map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            label: item.nombre,
            value: item.id,
          }));
          setTonerOptions(options);
        } else {
          setMensaje("Error al cargar tóners.");
        }
      } catch (error) {
        console.error("Error al cargar tóners:", error);
        setMensaje("Error al cargar tóners del servidor.");
      }
    };

    fetchToners();
  }, []);

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await axios.get(`${urlBase}/listarMarcas`);
        const optionsMarca = response.data.map((item: any) => ({
          id: item.id,
          nombre: item.nombre,
          label: item.nombre,
          value: item.id,
        }));
        setMarcaOptions(optionsMarca);
      } catch (error) {
        console.error("Error al cargar marcas:", error);
        setMensaje("Error al cargar marcas del servidor.");
      }
    };

    fetchMarcas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validación: al menos toner1 es obligatorio
    if (!nombreImpresora || !selectedToner1 || !selectedMarca) {
      setMensaje("Debes completar: nombre, marca y al menos el Toner 1.");
      return;
    }

    try {
      // ✅ Payload con 4 toners
      const payload = {
        nombre: nombreImpresora,
        idToner1: selectedToner1.id,
        idToner2: selectedToner2?.id || null,
        idToner3: selectedToner3?.id || null,
        idToner4: selectedToner4?.id || null,
        idMarca: selectedMarca.id,
      };

      await axios.post(`${urlBase}/guardarImpresora`, payload);

      setMensaje("Impresora guardada correctamente.");
      // ✅ Limpiar todos los campos
      setNombreImpresora("");
      setSelectedMarca(null);
      setSelectedToner1(null);
      setSelectedToner2(null);
      setSelectedToner3(null);
      setSelectedToner4(null);
    } catch (error) {
      console.error("Error al guardar la impresora:", error);
      setMensaje("Hubo un error al guardar la impresora.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Agregar Impresora
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Marca:
          </label>
          <Select
            options={marcaOptions}
            value={selectedMarca}
            onChange={(option) => setSelectedMarca(option)}
            placeholder="Seleccione una marca"
            noOptionsMessage={() => "No hay opciones disponibles"}
            styles={{
              control: (base) => ({
                ...base,
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "5px",
              }),
            }}
          />
        </div>
         <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Nombre de la impresora:
          </label>
          <input
            type="text"
            value={nombreImpresora}
            onChange={(e) => setNombreImpresora(e.target.value)}
            required
            style={{
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            placeholder="Ej: HP LaserJet Pro M404"
          />
        </div>

        {/* ✅ Toner 1 (obligatorio) */}
        <div style={{ display: "flex", flexDirection: "column", width: "60%",  margin: "0 auto" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Toner 1: *
          </label>
          <Select
            options={tonerOptions}
            value={selectedToner1}
            onChange={(option) => setSelectedToner1(option)}
            placeholder="Seleccione el toner 1"
            noOptionsMessage={() => "No hay opciones disponibles"}
            styles={{
              control: (base) => ({
                ...base,
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "5px",
              }),
            }}
          />
        

        {/* ✅ Toner 2 (opcional) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Toner 2:
          </label>
          <Select
            options={tonerOptions}
            value={selectedToner2}
            onChange={(option) => setSelectedToner2(option)}
            placeholder="Seleccione el toner 2 (opcional)"
            isClearable
            noOptionsMessage={() => "No hay opciones disponibles"}
            styles={{
              control: (base) => ({
                ...base,
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "5px",
              }),
            }}
          />
        </div>

        {/* ✅ Toner 3 (opcional) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Toner 3:
          </label>
          <Select
            options={tonerOptions}
            value={selectedToner3}
            onChange={(option) => setSelectedToner3(option)}
            placeholder="Seleccione el toner 3 (opcional)"
            isClearable
            noOptionsMessage={() => "No hay opciones disponibles"}
            styles={{
              control: (base) => ({
                ...base,
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "5px",
              }),
            }}
          />
        </div>

        {/* ✅ Toner 4 (opcional) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
            Toner 4:
          </label>
          <Select
            options={tonerOptions}
            value={selectedToner4}
            onChange={(option) => setSelectedToner4(option)}
            placeholder="Seleccione el toner 4 (opcional)"
            isClearable
            noOptionsMessage={() => "No hay opciones disponibles"}
            styles={{
              control: (base) => ({
                ...base,
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "5px",
              }),
            }}
          />
        </div>

       </div>

        

        <button
          type="submit"
          style={{
            padding: "10px 15px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            marginTop: "10px",
          }}
        >
          Guardar
        </button>
      </form>

      {mensaje && (
        <p
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: mensaje.includes("correctamente")
              ? "#dff0d8"
              : "#f8d7da",
            border: `1px solid ${
              mensaje.includes("correctamente") ? "#d0e9c6" : "#f5c6cb"
            }`,
            borderRadius: "4px",
            color: mensaje.includes("correctamente") ? "#3c763d" : "#721c24",
            textAlign: "center",
          }}
        >
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default CargarEquipo;