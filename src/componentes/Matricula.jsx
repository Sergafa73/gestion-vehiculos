export default function Matricula({ valor }) {
  if (!valor) return null;
  return (
    <span className="matricula" aria-label={`Matrícula ${valor}`}>
      <i aria-hidden="true">E</i>
      <b>{valor}</b>
    </span>
  );
}
