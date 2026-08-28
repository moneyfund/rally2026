const phrases = [
  "TU HABILIDAD MERECE SER VISTA",
  "CONECTÁ CON OPORTUNIDADES",
  "HECHO EN NICARAGUA",
  "CREÁ · MOSTRÁ · CRECÉ",
  "DEL TALENTO A LA OPORTUNIDAD",
  "DONDE EL TALENTO CRECE",
];

export function MovingTicker() {
  const track = [...phrases, ...phrases];
  return (
    <div className="ticker" aria-label="Mensajes de Germina">
      <div className="ticker-track">
        {track.map((phrase, index) => <span key={`${phrase}-${index}`}><i />{phrase}</span>)}
      </div>
    </div>
  );
}
