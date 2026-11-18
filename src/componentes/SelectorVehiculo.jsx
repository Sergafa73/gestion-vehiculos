import { Link } from 'react-router-dom';
import { useVehiculos } from '../vehiculos.jsx';

export default function SelectorVehiculo() {
  const { lista, activo, elegir, cargando } = useVehiculos();
  if (cargando && lista.length === 0) return <div className="selector vacio">Cargando…</div>;
  if (lista.length === 0) return <Link className="selector vacio" to="/vehiculos">Añade tu primer vehículo</Link>;
  return (
    <select className="selector" aria-label="Vehículo activo" value={activo?.id || ''} onChange={(e) => elegir(e.target.value)}>
      {lista.map((v) => (
        <option key={v.id} value={v.id}>{v.nombre}{v.matricula ? ` · ${v.matricula}` : ''}</option>
      ))}
    </select>
  );
}
