type BandType = "silicone" | "magnetic";

// הדמיה גרפית בלבד, עד שיהיו תמונות אמיתיות מהדגימות
export function BandPreview({
  hex,
  type,
  className = "",
}: {
  hex: string;
  type: BandType;
  className?: string;
}) {
  const isMagnetic = type === "magnetic";

  return (
    <svg
      viewBox="0 0 200 320"
      className={className}
      role="img"
      aria-label="הדמיה של רצועה בצבע שנבחר"
    >
      {/* רצועה עליונה */}
      <rect x="64" y="4" width="72" height="104" rx="18" fill={hex} />
      {/* רצועה תחתונה */}
      <rect x="64" y="212" width="72" height="104" rx="18" fill={hex} />
      {isMagnetic ? (
        <rect x="64" y="272" width="72" height="30" rx="10" fill="#000" opacity="0.18" />
      ) : (
        [236, 252, 268, 284].map((y) => (
          <circle key={y} cx="100" cy={y} r="3.5" fill="#000" opacity="0.22" />
        ))
      )}
      {/* גוף השעון, גנרי */}
      <rect x="44" y="92" width="112" height="136" rx="30" fill="#2a2a2a" />
      <rect x="54" y="102" width="92" height="116" rx="22" fill="#111" />
      <rect x="156" y="132" width="8" height="26" rx="4" fill="#3a3a3a" />
      <text
        x="100"
        y="166"
        textAnchor="middle"
        fill="#fff"
        fontSize="26"
        fontFamily="system-ui, sans-serif"
        fontWeight="600"
      >
        10:09
      </text>
    </svg>
  );
}
