// Curvas de nível: o desenho de terreno que dá identidade às telas de entrada.
// Gerado por função determinística, sem imagem externa.

type Hill = { cx: number; cy: number; rings: number; step: number; seed: number };

const HILLS: Hill[] = [
  { cx: 620, cy: 250, rings: 17, step: 34, seed: 1.3 },
  { cx: 130, cy: 720, rings: 10, step: 32, seed: 4.1 },
];

const POINTS = 56;

function fmt(value: number) {
  return value.toFixed(1);
}

function ringPath({ cx, cy, seed }: Hill, ring: number, radius: number) {
  const phase = seed + ring * 0.11;
  const points: [number, number][] = [];

  for (let i = 0; i < POINTS; i++) {
    const angle = (i / POINTS) * Math.PI * 2;
    const wobble =
      0.09 * Math.sin(2 * angle + phase) +
      0.055 * Math.sin(3 * angle + 2 * phase) +
      0.03 * Math.sin(5 * angle + 3 * phase);
    const r = radius * (1 + wobble);
    points.push([cx + r * Math.cos(angle) * 1.15, cy + r * Math.sin(angle) * 0.9]);
  }

  // Catmull-Rom fechada convertida em curvas de Bézier.
  let d = `M${fmt(points[0][0])},${fmt(points[0][1])}`;
  for (let i = 0; i < POINTS; i++) {
    const p0 = points[(i - 1 + POINTS) % POINTS];
    const p1 = points[i];
    const p2 = points[(i + 1) % POINTS];
    const p3 = points[(i + 2) % POINTS];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${fmt(c1x)},${fmt(c1y)} ${fmt(c2x)},${fmt(c2y)} ${fmt(p2[0])},${fmt(p2[1])}`;
  }
  return `${d}Z`;
}

const LINES = HILLS.flatMap((hill, hillIndex) =>
  Array.from({ length: hill.rings }, (_, ring) => ({
    key: `${hillIndex}-${ring}`,
    d: ringPath(hill, ring, (ring + 1) * hill.step),
    delay: ring * 0.09 + hillIndex * 0.4,
  })),
);

export function Contours({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      aria-hidden="true"
      className={className}
    >
      {LINES.map((line) => (
        <path
          key={line.key}
          d={line.d}
          pathLength={1}
          className="contour-line"
          style={{ animationDelay: `${line.delay}s` }}
        />
      ))}
    </svg>
  );
}
