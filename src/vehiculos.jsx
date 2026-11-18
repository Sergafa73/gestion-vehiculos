import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase.js';
import { guardarLocal, leerLocal } from './utils.js';

const Ctx = createContext(null);
export const useVehiculos = () => useContext(Ctx);

export function VehiculosProvider({ children }) {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [activoId, setActivoId] = useState(() => leerLocal('vehiculo_activo'));

  const cargar = useCallback(async () => {
    setCargando(true);
    const { data, error: err } = await supabase.from('vehiculos').select('*').order('creado_en');
    if (err) setError('No se han podido cargar los vehículos. Comprueba tu conexión e inténtalo de nuevo.');
    else { setError(''); setLista(data); }
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const activo = lista.find((v) => v.id === activoId) || lista[0] || null;
  const elegir = (id) => { setActivoId(id); guardarLocal('vehiculo_activo', id); };

  const guardar = async (datos, id) => {
    const consulta = id
      ? supabase.from('vehiculos').update(datos).eq('id', id).select().single()
      : supabase.from('vehiculos').insert(datos).select().single();
    const { data, error: err } = await consulta;
    if (err) throw err;
    await cargar();
    if (!id) elegir(data.id);
    return data;
  };

  const eliminar = async (id) => {
    const { error: err } = await supabase.from('vehiculos').delete().eq('id', id);
    if (err) throw err;
    await cargar();
  };

  return (
    <Ctx.Provider value={{ lista, activo, cargando, error, elegir, guardar, eliminar, recargar: cargar }}>
      {children}
    </Ctx.Provider>
  );
}
