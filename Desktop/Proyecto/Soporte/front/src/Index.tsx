import React, { useState } from "react";

const Index: React.FC = () => {
    const [showToner, setShowToner] = useState(false);
    const [showCartucho, setShowCartucho] = useState(false);
    const [showUnidadImagen, setShowUnidadImagen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-4xl font-bold text-gray-800">Bienvenido a la Página de Soporte</h1>
            <table>
                <thead>
                    <tr>
                        <td>Toner</td>
                        <td>Cartuchos</td>
                        <td>Unidad de Imagen</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <input 
                                type="text" 
                                placeholder="Ingrese el modelo de toner"
                                onChange={() => setShowToner(true)}
                            />
                        </td>
                        <td>
                            <input 
                                type="text" 
                                placeholder="Ingrese el modelo de cartucho"
                                onChange={() => setShowCartucho(true)}
                            />
                        </td>
                        <td>
                            <input 
                                type="text" 
                                placeholder="Ingrese el modelo de Unidad de imagen"
                                onChange={() => setShowUnidadImagen(true)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {showToner && (
                                <select name="toner" id="selectToner">
                                    <option value="H05A-H80A">H05A-H80A</option>
                                    <option value="H17A">H17A</option>
                                    <option value="H26A">H26A</option>
                                </select>
                            )}
                        </td>
                        <td>
                            {showCartucho && (
                                <select name="cartucho" id="selectCartucho">
                                    <option value="EP47-N">EP47 N</option>
                                    <option value="EP47-C">EP47 C</option>
                                    <option value="EP47-M">EP47 M</option>
                                    <option value="EP47-A">EP47 A</option>
                                </select>
                            )}
                        </td>
                        <td>
                            {showUnidadImagen && (
                                <select name="unidadDeImagen" id="selectUnidadDeImagen">
                                    <option value="DR14-A">DR14 A</option>
                                    <option value="DR19-A">DR19 A</option>
                                    <option value="DR32-A">DR32 A</option>
                                    <option value="DR1060">DR1060</option>
                                </select>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Index;
