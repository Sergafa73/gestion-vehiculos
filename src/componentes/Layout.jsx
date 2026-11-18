import { NavLink, Outlet } from 'react-router-dom';
import { Car, Moon, Sun, LogOut, MoreHorizontal } from 'lucide-react';
import { NAVEGACION } from '../navegacion.js';
import { useTema } from '../utils.js';
import { useAuth } from '../auth.jsx';
import SelectorVehiculo from './SelectorVehiculo.jsx';

const clase = ({ isActive }) => (isActive ? 'activo' : '');

export default function Layout() {
  const { tema, alternar } = useTema();
  const { cerrarSesion } = useAuth();
  const botonTema = (
    <button type="button" className="icono" onClick={alternar} aria-label={tema === 'oscuro' ? 'Usar modo claro' : 'Usar modo oscuro'}>
      {tema === 'oscuro' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );

  return (
    <div className="app">
      <aside className="lateral">
        <div className="marca"><Car size={24} aria-hidden="true" /><span>Mis vehículos</span></div>
        <SelectorVehiculo />
        <nav aria-label="Principal">
          {NAVEGACION.map(({ ruta, etiqueta, icono: Icono }) => (
            <NavLink key={ruta} to={ruta} end={ruta === '/'} className={clase}>
              <Icono size={20} aria-hidden="true" />{etiqueta}
            </NavLink>
          ))}
        </nav>
        <div className="lateral-pie">
          {botonTema}
          <button type="button" className="btn" onClick={cerrarSesion}><LogOut size={16} /> Cerrar sesión</button>
        </div>
      </aside>

      <header className="barra">
        <SelectorVehiculo />
        {botonTema}
      </header>

      <main className="contenido"><Outlet /></main>

      <nav className="inferior" aria-label="Principal">
        {NAVEGACION.filter((n) => n.movil).map(({ ruta, etiqueta, icono: Icono }) => (
          <NavLink key={ruta} to={ruta} end={ruta === '/'} className={clase}>
            <Icono size={22} aria-hidden="true" />{etiqueta}
          </NavLink>
        ))}
        <NavLink to="/mas" className={clase}><MoreHorizontal size={22} aria-hidden="true" />Más</NavLink>
      </nav>
    </div>
  );
}
