import type { ReactNode, SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number;
}

/** 统一的图标外壳：线性、currentColor、24 视窗。 */
function makeIcon(path: ReactNode, viewBox = '0 0 24 24') {
  return function Icon({ size = 16, className, ...rest }: IconProps) {
    return (
      <svg
        viewBox={viewBox}
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className}
        {...rest}
      >
        {path}
      </svg>
    );
  };
}

export const IconSearch = makeIcon(
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </>,
);

export const IconMenu = makeIcon(
  <>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </>,
);

export const IconSettings = makeIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
  </>,
);

export const IconUser = makeIcon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </>,
);

export const IconClose = makeIcon(<path d="M6 6l12 12M18 6 6 18" />);

export const IconChevronDown = makeIcon(<path d="M5 8l7 7 7-7" />);

export const IconChevronRight = makeIcon(<path d="M9 5l7 7-7 7" />);

export const IconPlus = makeIcon(<path d="M12 5v14M5 12h14" />);

export const IconMinus = makeIcon(<path d="M5 12h14" />);

export const IconCheck = makeIcon(<path d="M4 12.5 9.5 18 20 6.5" />);

export const IconInfo = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7.5v.5" />
  </>,
);

export const IconWarn = makeIcon(
  <>
    <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
    <path d="M12 10v4M12 17v.5" />
  </>,
);

export const IconDanger = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" />
  </>,
);

export const IconSuccess = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.8 2.8L16 9.5" />
  </>,
);

export const IconGrid = makeIcon(
  <>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </>,
);

export const IconList = makeIcon(
  <>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </>,
);

export const IconClock = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.5l3.5 2" />
  </>,
);

export const IconDownload = makeIcon(
  <>
    <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5" />
    <path d="M4 19h16" />
  </>,
);

export const IconRotate = makeIcon(
  <>
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 4v5h-5" />
  </>,
);

export const IconExpand = makeIcon(
  <>
    <path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" />
  </>,
);

export const IconSun = makeIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </>,
);

export const IconMoon = makeIcon(<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />);

export const IconMonitor = makeIcon(
  <>
    <rect x="3" y="4" width="18" height="12" />
    <path d="M8 20h8M12 16v4" />
  </>,
);

export const IconLock = makeIcon(
  <>
    <rect x="4" y="10" width="16" height="11" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </>,
);

export const IconBell = makeIcon(
  <>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </>,
);

export const IconTrend = makeIcon(<path d="M3 17l6-6 4 4 8-8M15 7h6v6" />);

export const IconActivity = makeIcon(<path d="M3 12h4l3-7 4 14 3-7h4" />);

export const IconFile = makeIcon(
  <>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4" />
  </>,
);
