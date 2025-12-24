export default function IconGuitar({ className, color = "black" }: { className?: string; color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      baseProfile="full"
      version="1.1"
      style={{
        fill: "none",
      }}
      width="360"
      height="360"
      viewBox="0 0 360 360"
      className={className}
    >
      <path
        style={{
          strokeWidth: "13px",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          stroke: color,
          fill: "none",
        }}
        d="M180,285 A105,105 0 0,0 285,180 A105,105 0 0,0 180,75 A105,105 0 0,0 75,180 A105,105 0 0,0 180,285 "
      />
      <path
        style={{
          strokeWidth: "9px",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          stroke: color,
          fill: "none",
        }}
        d="M30,105 L30,105 L330,105 M30,135 L30,135 L330,135 M30,165 L30,165 L330,165 M30,195 L30,195 L330,195 M30,225 L30,225 L330,225 M30,255 L30,255 L330,255 "
      />
    </svg>
  );
}
