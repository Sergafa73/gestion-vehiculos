import { useState } from 'react';
import { Car } from 'lucide-react';
import { supabase } from '../supabase.js';

const traducir = (msg = '') => {
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('already registered')) return 'Ya existe una cuenta con ese correo. Prueba a iniciar sesión.';
  if (msg.includes('Email not confirmed')) return 'Confirma tu correo desde el mensaje que te hemos enviado.';
  if (msg.includes('at least')) return 'La contraseña debe tener al menos 8 caracteres.';
  return 'No se ha podido completar la operación. Inténtalo de nuevo.';
};

export default function Login() {
  const [modo, setModo] = useState('entrar');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError(''); setInfo(''); setOcupado(true);
    if (modo === 'entrar') {
      const { error: err } = await supabase.auth.signInWithPassword({ email: correo.trim(), password: clave });
      if (err) setError(traducir(err.message));
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email: correo.trim(),
        password: clave,
        options: { emailRedirectTo: window.location.origin + window.location.pathname }
      });
      if (err) setError(traducir(err.message));
      else if (!data.session) setInfo('Cuenta creada. Te hemos enviado un correo: confírmalo y después inicia sesión.');
    }
    setOcupado(false);
  }

  return (
    <div className="pantalla-centro">
      <form className="tarjeta login" onSubmit={enviar}>
        <div className="marca"><Car size={28} aria-hidden="true" /><span>Mis vehículos</span></div>
        <h1>{modo === 'entrar' ? 'Inicia sesión' : 'Crea tu cuenta'}</h1>
        <label className="campo">Correo electrónico
          <input type="email" required autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
        </label>
        <label className="campo">Contraseña
          <input type="password" required minLength={8} autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            value={clave} onChange={(e) => setClave(e.target.value)} />
          {modo === 'registro' && <small>Mínimo 8 caracteres.</small>}
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        {info && <p className="info" role="status">{info}</p>}
        <button type="submit" className="btn primario grande" disabled={ocupado}>
          {ocupado ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}
        </button>
        <button type="button" className="enlace" onClick={() => { setModo(modo === 'entrar' ? 'registro' : 'entrar'); setError(''); setInfo(''); }}>
          {modo === 'entrar' ? 'No tengo cuenta: crear una' : 'Ya tengo cuenta: iniciar sesión'}
        </button>
      </form>
    </div>
  );
}
