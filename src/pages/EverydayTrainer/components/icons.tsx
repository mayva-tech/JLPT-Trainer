/* Inline icons — the repo has no icon dependency (same approach as Konbini/Trip). */

const svgProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const IconSpeaker = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M19 5a10 10 0 0 1 0 14" />
  </svg>
);

export const IconCheck = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconStar = ({ size = 16, filled = false }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} {...svgProps} fill={filled ? "currentColor" : "none"}>
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z" />
  </svg>
);

export const IconChevronLeft = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const IconChevronRight = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const IconPlay = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps} fill="currentColor">
    <path d="M7 4v16l13-8L7 4Z" />
  </svg>
);

export const IconStop = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps} fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="1.5" />
  </svg>
);

export const IconSearch = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} {...svgProps}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);
