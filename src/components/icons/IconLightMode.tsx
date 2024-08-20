// Ionicons icon: moon-outline
// Licenced under MIT
// https://github.com/ionic-team/ionicons/blob/main/src/svg/moon-outline.svg

export default function IconLightMode({
  className,
  color = "black",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      baseProfile="full"
      version="1.1"
      style={{
        fill: "none",
      }}
      width="512"
      height="512"
      viewBox="0 0 512 512"
      className={className}
    >
      <line
        x1="256"
        y1="48"
        x2="256"
        y2="96"
        style={{
          fill: "none",
          stroke: color,
          strokeLinecap: "round",
          strokeMiterlimit: 10,
          strokeWidth: 32,
        }}
      />
      <line
        x1="256"
        y1="416"
        x2="256"
        y2="464"
        style={{
          fill: "none",
          stroke: color,
          strokeLinecap: "round",
          strokeMiterlimit: 10,
          strokeWidth: 32,
        }}
      />
      <line
        x1="403.08"
        y1="108.92"
        x2="369.14"
        y2="142.86"
        style={{
          fill: "none",
          stroke: color,
          strokeLinecap: "round",
          strokeMiterlimit: 10,
          strokeWidth: 32,
        }}
      />
      <line
        x1="142.86"
        y1="369.14"
        x2="108.92"
        y2="403.08"
        style={{
          fill: "none",
          stroke: color,
          strokeLinecap: "round",
          strokeMiterlimit: 10,
          strokeWidth: 32,
        }}
      />
      <line
        x1="464"
        y1="256"
        x2="416"
        y2="256"
        style={{
          fill: "none",
          stroke: color,
          strokeLinecap: "round",
          strokeMiterlimit: 10,
          strokeWidth: 32,
        }}
      />
      <line
        x1="96"
        y1="256"
        x2="48"
        y2="256"
        style={{
          fill: "none",
          stroke: color,
          strokeLinecap: "round",
          strokeMiterlimit: 10,
          strokeWidth: 32,
        }}
      />
      <line
        x1="403.08"
        y1="403.08"
        x2="369.14"
        y2="369.14"
        style={{
          fill: "none",
          stroke: color,
          strokeLinecap: "round",
          strokeMiterlimit: 10,
          strokeWidth: 32,
        }}
      />
      <line
        x1="142.86"
        y1="142.86"
        x2="108.92"
        y2="108.92"
        style={{
          fill: "none",
          stroke: color,
          strokeLinecap: "round",
          strokeMiterlimit: 10,
          strokeWidth: 32,
        }}
      />
      <circle
        cx="256"
        cy="256"
        r="80"
        style={{
          fill: "none",
          stroke: color,
          strokeLinecap: "round",
          strokeMiterlimit: 10,
          strokeWidth: 32,
        }}
      />
    </svg>
  );
}
