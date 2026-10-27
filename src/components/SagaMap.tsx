import type { Palette, SagaStage } from "../types/api";

interface SagaMapProps {
  width: number; // tamaño del mapa que manda la API (map.width × map.height)
  height: number;
  stages: SagaStage[];
  activeIndex: number;
  palette: Palette; // colores de la etapa activa
}

// Mapa del Grand Line dibujado en SVG con las coordenadas (x, y) de cada isla
function SagaMap({ width, height, stages, activeIndex, palette }: SagaMapProps) {
  const islands = stages.map((stage) => stage.island);
  const ship = islands[activeIndex] ?? islands[0];

  // Ruta: una línea que une las islas en orden ("M x y L x y L x y...")
  const route = islands
    .map((island, i) => `${i === 0 ? "M" : "L"}${island.x} ${island.y}`)
    .join(" ");

  // Distancia acumulada hasta cada isla, para saber qué parte de la ruta ya
  // se recorrió (de 0 = nada a 1 = toda)
  const distances = [0];
  for (let i = 1; i < islands.length; i++) {
    const dx = islands[i].x - islands[i - 1].x;
    const dy = islands[i].y - islands[i - 1].y;
    distances.push(distances[i - 1] + Math.hypot(dx, dy));
  }
  const total = distances[distances.length - 1] || 1;
  const traveled = (distances[activeIndex] ?? 0) / total;

  const fontSize = width / 40;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Mapa del Grand Line: el barco está en ${ship?.name ?? ""}, etapa ${activeIndex + 1} de ${stages.length}.`}
      className="w-full rounded-xl"
      style={{ backgroundColor: palette.surface }}
    >
      {/* Ruta completa, punteada y tenue */}
      <path
        d={route}
        fill="none"
        stroke={palette.text}
        strokeOpacity={0.3}
        strokeWidth={3}
        strokeDasharray="10 10"
      />
      {/* Ruta recorrida: la misma línea, pero solo se ve hasta la isla activa.
          pathLength=1 hace que el largo total valga 1, y dashoffset esconde el resto */}
      <path
        className="saga-route"
        d={route}
        fill="none"
        stroke={palette.primary}
        strokeWidth={6}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - traveled}
      />

      {islands.map((island, i) => (
        <g key={island.id}>
          <circle
            cx={island.x}
            cy={island.y}
            r={i === activeIndex ? 14 : 9}
            fill={i <= activeIndex ? palette.primary : palette.background}
            stroke={palette.text}
            strokeWidth={2}
          />
          <text
            x={island.x}
            y={island.y + fontSize * 1.7}
            // Cerca de los bordes, el nombre se alinea hacia adentro para no cortarse
            textAnchor={
              island.x < width * 0.15
                ? "start"
                : island.x > width * 0.85
                  ? "end"
                  : "middle"
            }
            fontSize={fontSize}
            fill={palette.text}
            fontWeight={i === activeIndex ? 700 : 400}
          >
            {island.name}
          </text>
        </g>
      ))}

      {/* Barco: se mueve a la isla de la etapa activa */}
      {ship && (
        <g
          className="saga-ship"
          style={{ transform: `translate(${ship.x}px, ${ship.y - 30}px)` }}
        >
          <path d="M-20 0 L20 0 L13 12 L-13 12 Z" fill={palette.accent} />
          <line x1={0} y1={0} x2={0} y2={-28} stroke={palette.text} strokeWidth={3} />
          <path d="M2 -26 L18 -4 L2 -4 Z" fill={palette.text} />
        </g>
      )}
    </svg>
  );
}

export default SagaMap;
