// בורר צבע בצורת רצועה קטנה עם חורים, במקום עיגול צבע
export function StrapSwatch({ hex, selected }: { hex: string; selected: boolean }) {
  return (
    <svg
      viewBox="0 0 24 64"
      aria-hidden
      className={`h-14 w-auto drop-shadow-sm transition-transform duration-200 ${
        selected ? "-translate-y-1.5" : "group-hover:-translate-y-0.5"
      }`}
    >
      <rect x="2" y="1" width="20" height="62" rx="10" fill={hex} stroke="rgb(0 0 0 / 0.12)" />
      {[30, 39, 48].map((y) => (
        <circle key={y} cx="12" cy={y} r="2.2" fill="rgb(0 0 0 / 0.28)" />
      ))}
    </svg>
  );
}
