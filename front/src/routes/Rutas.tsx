// src/routes/Rutas.tsx
import { Routes, Route } from "react-router-dom";
import Index from "../components/Index";
import CargarEquipo from "../components/CargarEquipo";
import Prompt from "../components/Prompt";
import PrivateRoute from "../utilities/PrivateRoutes";
import Login from "../components/Login";
import { NotFound } from "../components/NotFound";

export const Rutas: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />

      
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<CargarEquipo />} />
        <Route path="/prompt" element={<Prompt />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
