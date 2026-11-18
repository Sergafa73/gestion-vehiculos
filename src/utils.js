import { useEffect, useState } from 'react';

export const fmtNum = (n, dec = 0) =>
  n == null || n === '' ? '—' : Number(n).toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const fmtMoneda = (n) =>
  n == null || n === '' ? '—' : Number(n).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

export const fmtFecha = (f) => (f ? new Date(f + 'T00:00:00').toLocaleDateString('es-ES') : '—');

export const COMBUSTIBLES = [
  { valor: 'gasoil', etiqueta: 'Gasoil' },
  { valor: 'gasolina', etiqueta: 'Gasolina' },
  { valor: 'hibrido', etiqueta: 'Híbrido' },
  { valor: 'electrico', etiqueta: 'Eléctrico' },
  { valor: 'glp', etiqueta: 'GLP / gas natural' },
  { valor: 'otro', etiqueta: 'Otro' }
];
export const etiquetaCombustible = (v) => COMBUSTIBLES.find((c) => c.valor === v)?.etiqueta || v || '—';

export function leerLocal(clave) {
  try { return localStorage.getItem(clave) || ''; } catch { return ''; }
}
export function guardarLocal(clave, valor) {
  try { localStorage.setItem(clave, valor); } catch { /* sin almacenamiento local */ }
}

export function useTema() {
  const [tema, setTema] = useState(() => document.documentElement.dataset.tema || 'claro');
  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    guardarLocal('tema', tema);
  }, [tema]);
  return { tema, alternar: () => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro')) };
}

// Reduce la foto antes de subirla (máx. 1200 px, JPEG) para ahorrar espacio y datos móviles.
export async function redimensionarImagen(archivo, max = 1200) {
  const img = await createImageBitmap(archivo);
  const escala = Math.min(1, max / Math.max(img.width, img.height));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(img.width * escala);
  lienzo.height = Math.round(img.height * escala);
  lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height);
  return new Promise((ok, fallo) =>
    lienzo.toBlob((b) => (b ? ok(b) : fallo(new Error('No se pudo procesar la imagen.'))), 'image/jpeg', 0.82)
  );
}
