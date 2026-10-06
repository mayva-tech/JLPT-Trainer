import type { ReactNode } from "react";

/* The full-stage SVG canvas every scene draws on. */

const VIEW = "0 0 1600 900";

export function Art({ children }: { children: ReactNode }) {
  return (
    <svg
      className="amb-art"
      viewBox={VIEW}
      preserveAspectRatio="xMidYMid slice"
    >
      {children}
    </svg>
  );
}
