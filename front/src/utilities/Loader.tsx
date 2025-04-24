// src/components/Loader.tsx
import { ClipLoader } from 'react-spinners';

const Loader = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      <ClipLoader
        color="#2c3e50" // gris oscuro
        loading={true}
        size={45}
        aria-label="Cargando..."
      />
    </div>
  );
};

export default Loader;
