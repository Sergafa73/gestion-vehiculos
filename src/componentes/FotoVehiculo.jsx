import { useEffect, useState } from 'react';
import { Car } from 'lucide-react';
import { supabase } from '../supabase.js';

export default function FotoVehiculo({ ruta, className = '' }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    let vivo = true;
    setUrl('');
    if (!ruta) return undefined;
    supabase.storage.from('adjuntos').createSignedUrl(ruta, 3600).then(({ data }) => {
      if (vivo && data) setUrl(data.signedUrl);
    });
    return () => { vivo = false; };
  }, [ruta]);

  return (
    <div className={`foto ${className}`}>
      {url ? <img src={url} alt="" loading="lazy" /> : <Car size={40} aria-hidden="true" />}
    </div>
  );
}
