import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_evento, s) => setSesion(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const cerrarSesion = () => supabase.auth.signOut();
  return <Ctx.Provider value={{ sesion, cargando, cerrarSesion }}>{children}</Ctx.Provider>;
}
