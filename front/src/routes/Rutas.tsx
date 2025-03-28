
import { Routes, Route } from "react-router-dom"
import Index from "../Index"; 

export const Rutas: React.FC = () => { 
    return (
        <Routes>
            <Route path="/" element={<Index />} />
        </Routes> 
    );
};
