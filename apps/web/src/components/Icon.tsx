import type { SVGProps } from 'react';

const paths = {
  star: <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.2l-5.9 3.4 1.3-6.6L2.5 9.4l6.6-.8z" fill="currentColor" stroke="none" />,
  shield: <><path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  pin: <><path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <path d="M4.5 12.5l5 5L19.5 7" strokeWidth="2.4" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  left: <path d="M15 6l-6 6 6 6" />,
  right: <path d="M9 6l6 6-6 6" />,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="3" /><path d="M8 10.5V8a4 4 0 018 0v2.5" /></>,
  card: <><rect x="3" y="5.5" width="18" height="13" rx="3" /><path d="M3 10h18M7 15h3" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" /></>,
  bell: <><path d="M6 17V11a6 6 0 1112 0v6l1.5 2h-15z" /><path d="M10 21h4" /></>,
  house: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>,
  sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 17v4M17 19h4" /></>,
  wrench: <path d="M14.5 6.5a4 4 0 005 5l-1 .5L8 22l-3-3L15.5 8z" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  brush: <><rect x="3.5" y="3.5" width="14" height="6" rx="2" /><path d="M17.5 6.5H20v5h-9v3" /><rect x="9" y="14.5" width="4" height="6.5" rx="1.5" /></>,
  leaf: <><path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15" /><path d="M5 19c3-4 6-7 10-9" /></>,
  box: <><path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z" /><path d="M3 7.5l9 4.5 9-4.5M12 12v9" /></>,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>,
  tag: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.2" /></>,
  bank: <path d="M3 9l9-5 9 5M5 9v9M10 9v9M14 9v9M19 9v9M3 20h18" />,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.8a3.5 3.5 0 010 6.4M18 14.5c2 .7 3.5 2.4 3.5 5" /></>,
  inbox: <><path d="M3 13l3-8h12l3 8v6a1 1 0 01-1 1H4a1 1 0 01-1-1z" /><path d="M3 13h5l1 2h6l1-2h5" /></>,
  chart: <><path d="M4 20V4M4 20h16" /><path d="M8 15l4-4 3 3 5-6" /></>,
  plus: <path d="M12 5v14M5 12h14" strokeWidth="2.2" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16z" />,
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, className, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...rest}>
      {paths[name]}
    </svg>
  );
}
export const isIcon = (n: string): n is IconName => n in paths;
