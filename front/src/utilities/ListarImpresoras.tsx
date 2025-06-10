import React, { useEffect, useState } from "react";
import axios from "axios";
import Endpoints from "./Endpoints";

interface Impresora {
  id: number;
  nombre: string;
  idToner: string;
}

interface Props {
  marcaId: number | null; // ID de la marca seleccionada
  filtroNombre: string;
}

let urlBase = Endpoints.URLPROD;
if (window.location.host === "localhost:5173") {
  urlBase = Endpoints.URLDEV;
}
const ListarImpresoras: React.FC<Props> = ({ marcaId, filtroNombre }) => {
  const [impresoras, setImpresoras] = useState<Impresora[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  

  useEffect(() => {
    const fetchImpresoras = async () => {
      if (!marcaId) return;

      setIsLoading(true);
      try {
        const response = await axios.get(`${urlBase}/impresoras/${marcaId}`);
        setImpresoras(response.data.data || []);
      } catch (error) {
        console.error("Error al cargar las impresoras:", error);
        setImpresoras([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImpresoras();
  }, [marcaId]);

  const impresorasFiltradas = impresoras
    .filter((imp) =>
      imp.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
    )
    .slice(0, 5);

  if (!marcaId) {
    return <div>Selecciona una marca para ver las impresoras.</div>;
  }

  return (
    <div className="lista-impresoras">
      {isLoading ? (
        <p>Cargando modelos...</p>
      ) : impresoras.length > 0 ? (
        <ul 
            style={{
                listStyle: "none",
                paddingLeft: "0",
                textAlign: "left",
                marginLeft: "0",
          }}
        >
          {impresorasFiltradas.map((impresora, index) => (
            <li 
                key={impresora.id}
                 style={{
                    backgroundColor: index % 2 === 0 ? "#f0f0f0" : "#ffffff",
                    padding: "8px",
                }}
            >{impresora.nombre}</li>
          ))}
        </ul>
      ) : (
        <p>No hay impresoras para esta marca.</p>
      )}
    </div>
  );
};

export default ListarImpresoras;
