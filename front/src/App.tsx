

import './App.css'
import { BrowserRouter } from 'react-router-dom';

import { Rutas } from './routes/Rutas';

const App = () => {
  return (
    <BrowserRouter>
      
        <Rutas />
      
    </BrowserRouter>
  );
};

export default App;
