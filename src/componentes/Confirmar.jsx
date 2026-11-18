import Modal from './Modal.jsx';

export default function Confirmar({ titulo, texto, textoBoton = 'Eliminar', ocupado, error, onConfirmar, onCancelar }) {
  return (
    <Modal titulo={titulo} onCerrar={onCancelar}>
      <p>{texto}</p>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="acciones">
        <button type="button" className="btn" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="btn peligro" onClick={onConfirmar} disabled={ocupado}>
          {ocupado ? 'Eliminando…' : textoBoton}
        </button>
      </div>
    </Modal>
  );
}
