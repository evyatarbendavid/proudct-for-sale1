// דיסק עם 60 סימוני דקות, כמו בזל של שעון. מסתובב לאט מאחורי השעון
export function Bezel({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" aria-hidden className={className}>
      <circle cx="200" cy="200" r="196" fill="var(--paper)" />
      <circle cx="200" cy="200" r="196" fill="none" stroke="var(--line)" strokeWidth="2" />
      <g className="origin-center animate-[spin_90s_linear_infinite]">
        {Array.from({ length: 60 }, (_, i) => {
          const major = i % 5 === 0;
          return (
            <line
              key={i}
              x1="200"
              y1="14"
              x2="200"
              y2={major ? 38 : 26}
              stroke={i === 0 ? "var(--signal)" : "var(--graphite)"}
              strokeOpacity={major ? 0.7 : 0.3}
              strokeWidth={major ? 4 : 2}
              strokeLinecap="round"
              transform={`rotate(${i * 6} 200 200)`}
            />
          );
        })}
      </g>
    </svg>
  );
}
