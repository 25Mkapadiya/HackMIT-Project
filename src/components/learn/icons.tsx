import type { SVGProps } from "react";

/** Shared stroke-icon style matching the rest of the app's inline SVGs (chevrons, search, reset, etc). */
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const BoltIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
  </Icon>
);

export const DropletIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 2.5s7 7.6 7 12.5a7 7 0 1 1-14 0c0-4.9 7-12.5 7-12.5Z" />
  </Icon>
);

export const MapIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M9 3 3 5.5v15L9 18l6 2.5 6-2.5v-15L15 5.5 9 3Z" />
    <path d="M9 3v15" />
    <path d="M15 5.5v15" />
  </Icon>
);

export const TowerIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 2v20" />
    <path d="M6 22 12 6l6 16" />
    <path d="M8.2 15h7.6" />
    <path d="M9.6 10.5h4.8" />
    <path d="M3 9l3 1.3M21 9l-3 1.3M3 15l3-1M21 15l-3-1" />
  </Icon>
);

export const NetworkIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="5" cy="6" r="2.2" />
    <circle cx="19" cy="6" r="2.2" />
    <circle cx="12" cy="18" r="2.2" />
    <path d="M6.9 7.3 10.5 16M17.1 7.3 13.5 16M7.2 6h9.6" />
  </Icon>
);

export const BatteryIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="2.5" y="7" width="16" height="10" rx="2" />
    <path d="M21 10v4" />
    <path d="M7 9.5 5 12h3l-2 2.5" />
  </Icon>
);

export const UsersIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    <circle cx="17.5" cy="8.5" r="2.6" />
    <path d="M15.5 14.2c2.9.4 5 2.5 5 5.8" />
  </Icon>
);

export const BuildingIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="4" y="3" width="11" height="18" rx="1" />
    <path d="M8 7h3M8 11h3M8 15h3" />
    <path d="M15 21v-7l5 2v5" />
  </Icon>
);

export const BookIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17Z" />
    <path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20" />
  </Icon>
);

export const ServerIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="6" rx="1.3" />
    <rect x="3" y="14" width="18" height="6" rx="1.3" />
    <circle cx="7" cy="7" r="0.6" fill="currentColor" />
    <circle cx="7" cy="17" r="0.6" fill="currentColor" />
  </Icon>
);

export const SparkleIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </Icon>
);

export const CloudIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M7 18h10.5a3.5 3.5 0 0 0 .5-6.96 5.5 5.5 0 0 0-10.6-1.5A4 4 0 0 0 7 18Z" />
  </Icon>
);

export const PlayIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" stroke="none" />
  </Icon>
);

export const GlobeIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
  </Icon>
);

export const LeafIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M20 4C10 4 4 10 4 18v2h2c8 0 14-6 14-14V4Z" />
    <path d="M6 20 18 8" />
  </Icon>
);

export const SpeakerWaveIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 9v6h4l5 4V5L7 9H3Z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 6a9 9 0 0 1 0 12" />
  </Icon>
);

export const TruckIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M2 7h11v10H2z" />
    <path d="M13 10h4l4 3.2V17h-8z" />
    <circle cx="6.5" cy="18.5" r="1.6" />
    <circle cx="16.5" cy="18.5" r="1.6" />
  </Icon>
);

export const CoinIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9.5c0-1 1.2-1.8 3-1.8s3 .8 3 1.8-1.2 1.3-3 1.8-3 .8-3 1.9 1.2 1.8 3 1.8 3-.8 3-1.8" />
  </Icon>
);

export const HardHatIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 16a8 8 0 0 1 16 0Z" />
    <path d="M2 16h20" />
    <path d="M12 6v3" />
  </Icon>
);

export const ArrowDownIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 4v16M6 14l6 6 6-6" />
  </Icon>
);
