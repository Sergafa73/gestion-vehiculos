import { Link } from 'react-router-dom';
import { useVehiculos } from '../vehiculos.jsx';
import FotoVehiculo from '../componentes/FotoVehiculo.jsx';
import Matricula from '../componentes/Matricula.jsx';
import { etiquetaCombustible, fmtFecha, fmtNum } from '../utils.js';

export default function Panel() {
  const { activo, cargando, error } = useVehiculos();

  if (error) return <p className="error" role="alert">{error}</p>;
  if (cargando && !activo) return <p>Cargando…</p>;
  if (!activo) {
    return (
      <section>
        <h1>Panel</h1>
        <div className="tarjeta vacio-estado">
          <p>Aún no tienes ningún vehículo. Añade el primero para empezar a registrar repostajes y gastos.</p>
          <Link to="/vehiculos" className="btn primario">Añadir vehículo</Link>
        </div>
      </section>
    );
  }

  const datos = [
    ['Marca', activo.marca], ['Modelo', activo.modelo], ['Versión', activo.version],
    ['Año de matriculación', activo.anio_matriculacion], ['Fecha de compra', activo.fecha_compra ? fmtFecha(activo.fecha_compra) : null],
    ['Combustible', etiquetaCombustible(activo.combustible)],
    ['Depósito', activo.capacidad_deposito ? `${fmtNum(activo.capacidad_deposito, 1)} L` : null],
    ['Potencia', activo.potencia]
  ].filter(([, v]) => v);

  return (
    <section>
      <h1>{activo.nombre}</h1>
      <div className="ficha">
        <FotoVehiculo ruta={activo.foto_ruta} className="grande" />
        <div className="ficha-datos">
          <Matricula valor={activo.matricula} />
          <p className="km-grande"><strong>{fmtNum(activo.km_actuales)}</strong> km</p>
          <dl>
            {datos.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
          </dl>
          {activo.observaciones && <p className="notas">{activo.observaciones}</p>}
        </div>
      </div>
    </section>
  );
}
