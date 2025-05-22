
import { Routes, Route } from "react-router-dom"
import Index from "../Index"; 
import CargarEquipo from "../CargarEquipo";

export const Rutas: React.FC = () => { 
    return (
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<CargarEquipo />} />
        </Routes> 
    );
};
