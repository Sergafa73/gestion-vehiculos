import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NAVEGACION } from '../navegacion.js';
import { useAuth } from '../auth.jsx';

export default function Mas() {
  const { cerrarSesion } = useAuth();
  return (
    <section>
      <h1>Más</h1>
      <div className="lista-enlaces">
        {NAVEGACION.filter((n) => !n.movil).map(({ ruta, etiqueta, icono: Icono }) => (
          <NavLink key={ruta} to={ruta}><Icono size={20} aria-hidden="true" />{etiqueta}</NavLink>
        ))}
      </div>
      <button type="button" className="btn" onClick={cerrarSesion}><LogOut size={16} /> Cerrar sesión</button>
    </section>
  );
}
