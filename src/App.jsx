import { Routes, Route, Navigate } from 'react-router-dom';
import { configurado } from './supabase.js';
import { AuthProvider, useAuth } from './auth.jsx';
import { VehiculosProvider } from './vehiculos.jsx';
import { NAVEGACION } from './navegacion.js';
import Layout from './componentes/Layout.jsx';
import Login from './paginas/Login.jsx';
import Panel from './paginas/Panel.jsx';
import Vehiculos from './paginas/Vehiculos.jsx';
import Mas from './paginas/Mas.jsx';
import Pendiente from './paginas/Pendiente.jsx';

function Rutas() {
  const { sesion, cargando } = useAuth();
  if (cargando) return <div className="pantalla-centro">Cargando…</div>;
  if (!sesion) return <Login />;
  return (
    <VehiculosProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Panel />} />
          <Route path="vehiculos" element={<Vehiculos />} />
          <Route path="mas" element={<Mas />} />
          {NAVEGACION.filter((n) => n.pendiente).map((n) => (
            <Route key={n.ruta} path={n.ruta.slice(1)} element={<Pendiente titulo={n.etiqueta} />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </VehiculosProvider>
  );
}

export default function App() {
  if (!configurado) {
    return (
      <div className="pantalla-centro">
        <div className="tarjeta aviso-config">
          <h1>Falta conectar la base de datos</h1>
          <p>
            La aplicación no encuentra las claves de Supabase. Añade <code>VITE_SUPABASE_URL</code> y{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> (en GitHub: Settings → Secrets and variables → Actions) y vuelve a publicar.
          </p>
        </div>
      </div>
    );
  }
  return (
    <AuthProvider>
      <Rutas />
    </AuthProvider>
  );
}
