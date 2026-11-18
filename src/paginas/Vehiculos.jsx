import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../supabase.js';
import { useAuth } from '../auth.jsx';
import { useVehiculos } from '../vehiculos.jsx';
import Modal from '../componentes/Modal.jsx';
import Confirmar from '../componentes/Confirmar.jsx';
import FotoVehiculo from '../componentes/FotoVehiculo.jsx';
import Matricula from '../componentes/Matricula.jsx';
import { COMBUSTIBLES, fmtNum, redimensionarImagen } from '../utils.js';

const VACIO = {
  nombre: '', marca: '', modelo: '', version: '', matricula: '', anio: '', fecha_compra: '',
  km: '', combustible: 'gasoil', deposito: '', potencia: '', observaciones: ''
};

const aFormulario = (v) => ({
  nombre: v.nombre || '', marca: v.marca || '', modelo: v.modelo || '', version: v.version || '',
  matricula: v.matricula || '', anio: v.anio_matriculacion ?? '', fecha_compra: v.fecha_compra || '',
  km: v.km_actuales ?? '', combustible: v.combustible || 'gasoil', deposito: v.capacidad_deposito ?? '',
  potencia: v.potencia || '', observaciones: v.observaciones || ''
});

function FormVehiculo({ vehiculo, onCerrar }) {
  const { sesion } = useAuth();
  const { guardar } = useVehiculos();
  const [f, setF] = useState(vehiculo ? aFormulario(vehiculo) : VACIO);
  const [foto, setFoto] = useState(null);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const cambia = (campo) => (e) => setF({ ...f, [campo]: e.target.value });
  const num = (v) => (v === '' ? null : Number(v));

  async function enviar(e) {
    e.preventDefault();
    const nombre = f.nombre.trim();
    if (!nombre) return setError('Escribe un nombre para identificar el vehículo.');
    const km = f.km === '' ? 0 : Number(f.km);
    if (!Number.isInteger(km) || km < 0) return setError('Los kilómetros deben ser un número entero igual o mayor que 0.');
    const anio = num(f.anio);
    if (anio !== null && (!Number.isInteger(anio) || anio < 1900 || anio > new Date().getFullYear() + 1)) {
      return setError('Revisa el año de matriculación.');
    }
    const deposito = num(f.deposito);
    if (deposito !== null && deposito <= 0) return setError('La capacidad del depósito debe ser mayor que 0.');

    setOcupado(true); setError('');
    try {
      const datos = {
        nombre, marca: f.marca.trim() || null, modelo: f.modelo.trim() || null, version: f.version.trim() || null,
        matricula: f.matricula.trim().toUpperCase() || null, anio_matriculacion: anio,
        fecha_compra: f.fecha_compra || null, km_actuales: km, combustible: f.combustible,
        capacidad_deposito: deposito, potencia: f.potencia.trim() || null, observaciones: f.observaciones.trim() || null
      };
      let rutaAnterior = null;
      if (foto) {
        const blob = await redimensionarImagen(foto);
        const ruta = `${sesion.user.id}/vehiculos/${crypto.randomUUID()}.jpg`;
        const { error: errSubida } = await supabase.storage.from('adjuntos').upload(ruta, blob, { contentType: 'image/jpeg' });
        if (errSubida) throw errSubida;
        rutaAnterior = vehiculo?.foto_ruta || null;
        datos.foto_ruta = ruta;
      }
      await guardar(datos, vehiculo?.id);
      if (rutaAnterior) await supabase.storage.from('adjuntos').remove([rutaAnterior]);
      onCerrar();
    } catch {
      setError('No se ha podido guardar el vehículo. Comprueba tu conexión e inténtalo de nuevo.');
      setOcupado(false);
    }
  }

  return (
    <Modal titulo={vehiculo ? 'Editar vehículo' : 'Añadir vehículo'} onCerrar={onCerrar}>
      <form onSubmit={enviar} noValidate>
        <div className="rejilla">
          <label className="campo ancho">Nombre identificativo *
            <input value={f.nombre} onChange={cambia('nombre')} placeholder="Ej.: Furgoneta" autoFocus />
          </label>
          <label className="campo">Marca<input value={f.marca} onChange={cambia('marca')} /></label>
          <label className="campo">Modelo<input value={f.modelo} onChange={cambia('modelo')} /></label>
          <label className="campo">Versión<input value={f.version} onChange={cambia('version')} /></label>
          <label className="campo">Matrícula<input value={f.matricula} onChange={cambia('matricula')} autoCapitalize="characters" /></label>
          <label className="campo">Año de matriculación<input type="number" inputMode="numeric" value={f.anio} onChange={cambia('anio')} /></label>
          <label className="campo">Fecha de compra<input type="date" value={f.fecha_compra} onChange={cambia('fecha_compra')} /></label>
          <label className="campo">Kilómetros actuales<input type="number" inputMode="numeric" min="0" value={f.km} onChange={cambia('km')} /></label>
          <label className="campo">Combustible
            <select value={f.combustible} onChange={cambia('combustible')}>
              {COMBUSTIBLES.map((c) => <option key={c.valor} value={c.valor}>{c.etiqueta}</option>)}
            </select>
          </label>
          <label className="campo">Capacidad del depósito (L)<input type="number" inputMode="decimal" step="0.1" value={f.deposito} onChange={cambia('deposito')} /></label>
          <label className="campo">Potencia<input value={f.potencia} onChange={cambia('potencia')} placeholder="Ej.: 110 CV" /></label>
          <label className="campo ancho">Observaciones<textarea rows="3" value={f.observaciones} onChange={cambia('observaciones')} /></label>
          <label className="campo ancho">Fotografía
            <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0] || null)} />
            {vehiculo?.foto_ruta && !foto && <small>Ya tiene foto. Elige otra solo si quieres cambiarla.</small>}
          </label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="acciones">
          <button type="button" className="btn" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn primario" disabled={ocupado}>{ocupado ? 'Guardando…' : 'Guardar vehículo'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Vehiculos() {
  const { lista, cargando, error, eliminar } = useVehiculos();
  const [editando, setEditando] = useState(null); // null = cerrado, {} = nuevo, vehículo = edición
  const [borrando, setBorrando] = useState(null);
  const [errBorrado, setErrBorrado] = useState('');
  const [ocupado, setOcupado] = useState(false);

  async function confirmarBorrado() {
    setOcupado(true); setErrBorrado('');
    try {
      await eliminar(borrando.id);
      if (borrando.foto_ruta) await supabase.storage.from('adjuntos').remove([borrando.foto_ruta]);
      setBorrando(null);
    } catch {
      setErrBorrado('No se ha podido eliminar el vehículo. Inténtalo de nuevo.');
    }
    setOcupado(false);
  }

  return (
    <section>
      <div className="cabecera">
        <h1>Vehículos</h1>
        <button type="button" className="btn primario" onClick={() => setEditando({})}><Plus size={18} /> Añadir vehículo</button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {!cargando && !error && lista.length === 0 && (
        <div className="tarjeta vacio-estado"><p>Todavía no has añadido ningún vehículo.</p></div>
      )}

      <div className="cuadricula">
        {lista.map((v) => (
          <article key={v.id} className="tarjeta vehiculo">
            <FotoVehiculo ruta={v.foto_ruta} />
            <div className="cuerpo">
              <h3>{v.nombre}</h3>
              <Matricula valor={v.matricula} />
              <p className="sec">{[v.marca, v.modelo, v.version].filter(Boolean).join(' ') || 'Sin datos de modelo'}</p>
              <p className="km"><strong>{fmtNum(v.km_actuales)}</strong> km</p>
              <div className="acciones izq">
                <button type="button" className="btn" onClick={() => setEditando(v)}><Pencil size={16} /> Editar</button>
                <button type="button" className="btn peligro-suave" onClick={() => { setErrBorrado(''); setBorrando(v); }}><Trash2 size={16} /> Eliminar</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editando && <FormVehiculo vehiculo={editando.id ? editando : null} onCerrar={() => setEditando(null)} />}
      {borrando && (
        <Confirmar
          titulo="¿Eliminar este vehículo?"
          texto={`Se borrará «${borrando.nombre}» junto con todos sus repostajes, gastos, reparaciones, mantenimientos y documentos. Esta acción no se puede deshacer.`}
          ocupado={ocupado} error={errBorrado}
          onConfirmar={confirmarBorrado} onCancelar={() => setBorrando(null)}
        />
      )}
    </section>
  );
}
