import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Endpoints from "../src/utilities/Endpoints";

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

const CargarEquipo: React.FC = () => {
  const [nombreImpresora, setNombreImpresora] = useState('');
  const [tonerOptions, setTonerOptions] = useState<OptionType[]>([]);
  const [marcaOptions, setMarcaOptions] = useState<OptionType[]>([]);
  const [selectedToner, setSelectedToner] = useState<OptionType | null>(null);
  const [selectedMarca, setSelectedMarca] = useState<OptionType | null>(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchToners = async () => {
      try {
        const response = await axios.get(`${urlBase}/getAllToners`);
        // Asumiendo que este endpoint SÍ tiene estructura {success, data}
        if (response.data.success) {
          const options = response.data.data.map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            label: item.nombre,
            value: item.id
          }));
          setTonerOptions(options);
        } else {
          setMensaje('Error al cargar tóners.');
        }
      } catch (error) {
        console.error('Error al cargar tóners:', error);
        setMensaje('Error al cargar tóners del servidor.');
      }
    };

    fetchToners();
  }, []);

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await axios.get(`${urlBase}/listarMarcas`);
        // Adaptado para el endpoint que devuelve array directo
        const optionsMarca = response.data.map((item: any) => ({
          id: item.id,
          nombre: item.nombre,
          label: item.nombre,
          value: item.id
        }));
        setMarcaOptions(optionsMarca);
      } catch (error) {
        console.error('Error al cargar marcas:', error);
        setMensaje('Error al cargar marcas del servidor.');
      }
    };

    fetchMarcas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreImpresora || !selectedToner || !selectedMarca) {
      setMensaje('Debes completar todos los campos.');
      return;
    }

    try {
      const payload = {
        nombre: nombreImpresora,
        idToner: selectedToner.id,
        idMarca: selectedMarca.id
      };

      await axios.post(`${urlBase}/guardarImpresora`, payload);

      setMensaje('Impresora guardada correctamente.');
      setNombreImpresora('');
      setSelectedToner(null);
      setSelectedMarca(null);
    } catch (error) {
      console.error('Error al guardar la impresora:', error);
      setMensaje('Hubo un error al guardar la impresora.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Agregar Impresora</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>Marca:</label>
          <Select
            options={marcaOptions}
            value={selectedMarca}
            onChange={(option) => setSelectedMarca(option)}
            placeholder="Seleccione una marca"
            noOptionsMessage={() => "No hay opciones disponibles"}
            styles={{
              control: (base) => ({
                ...base,
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '5px'
              })
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>Toner/Cartucho:</label>
          <Select
            options={tonerOptions}
            value={selectedToner}
            onChange={(option) => setSelectedToner(option)}
            placeholder="Seleccione un toner o cartucho"
            noOptionsMessage={() => "No hay opciones disponibles"}
            styles={{
              control: (base) => ({
                ...base,
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '5px'
              })
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>Nombre de la impresora:</label>
          <input
            type="text"
            value={nombreImpresora}
            onChange={(e) => setNombreImpresora(e.target.value)}
            required
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            placeholder="Ej: HP LaserJet Pro M404"
          />
        </div>

        <button 
          type="submit" 
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px',
            
          }}
        >
          Guardar
        </button>
      </form>

      {mensaje && <p style={{ 
        marginTop: '15px', 
        padding: '10px', 
        backgroundColor: mensaje.includes('correctamente') ? '#dff0d8' : '#f8d7da',
        border: `1px solid ${mensaje.includes('correctamente') ? '#d0e9c6' : '#f5c6cb'}`,
        borderRadius: '4px',
        color: mensaje.includes('correctamente') ? '#3c763d' : '#721c24',
        textAlign: 'center'
      }}>{mensaje}</p>}
    </div>
  );
};

export default CargarEquipo;