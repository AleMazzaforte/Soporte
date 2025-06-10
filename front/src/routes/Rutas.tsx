
import { Routes, Route } from "react-router-dom"
import Index from "../components/Index"; 
import CargarEquipo from "../components/CargarEquipo";
import PrivateRoute, {  } from "../utilities/PrivateRoutes";
import Login from "../components/Login";
import { NotFound } from "../components/NotFound";

export const Rutas: React.FC = () => { 
    return (
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            <Route path="/admin" element={
                <PrivateRoute>
                   <CargarEquipo /> 
                </PrivateRoute>
                }
             />
             <Route path="*" element={<NotFound />} />
        </Routes> 
    );
};
