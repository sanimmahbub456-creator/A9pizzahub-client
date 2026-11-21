/** Original hand-built SVG pizza used in the hero (no stock image needed) */
export function PizzaIllustration({ className }: { className?: string }) {
  const pepperoni = [
    [140, 120], [210, 95], [270, 150], [120, 200], [200, 180], [285, 230], [160, 270], [235, 280], [95, 140], [300, 175],
  ];
  const basil = [[175, 145, 20], [250, 205, -30], [130, 240, 60], [220, 245, 10], [260, 120, 80]];
  const olives = [[185, 225], [240, 165], [150, 175], [275, 270], [110, 175]];
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      <defs>
        <radialGradient id="cheese" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="70%" stopColor="#f7c552" />
          <stop offset="100%" stopColor="#eaa63c" />
        </radialGradient>
        <radialGradient id="crust" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#e9a24b" />
          <stop offset="100%" stopColor="#b8702a" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#crust)" />
      <circle cx="200" cy="200" r="168" fill="#c8261d" opacity="0.85" />
      <circle cx="200" cy="200" r="160" fill="url(#cheese)" />
      {[0, 45, 90, 135].map((d) => (
        <line key={d} x1="200" y1="12" x2="200" y2="388" stroke="#b8702a" strokeWidth="2.5" opacity="0.45" transform={`rotate(${d} 200 200)`} />
      ))}
      {pepperoni.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="19" fill="#b3261e" />
          <circle cx={x - 5} cy={y - 4} r="3" fill="#8f1c16" />
          <circle cx={x + 6} cy={y + 5} r="2.5" fill="#8f1c16" />
        </g>
      ))}
      {olives.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" fill="none" stroke="#2b1810" strokeWidth="4" />
      ))}
      {basil.map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="13" ry="7" fill="#3f7d3a" transform={`rotate(${r} ${x} ${y})`} />
      ))}
    </svg>
  );
}
