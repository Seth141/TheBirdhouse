import { IconBase, pastel, type IconProps, type PastelTone } from "./IconBase";

export type { IconProps };

/**
 * Purpose-built chalk icons — each shape matches what it represents,
 * filled in tones darker than the sage garden background.
 */

/** Home — a quiet house with a soft door */
export function HomeIcon(props: IconProps) {
  return (
    <IconBase wash="sage" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <path d="M3.8 11.4 12 4.2l8.2 7.2" fill={soft} />
          <path d="M5.6 10.6v8.6c0 .8.6 1.4 1.4 1.4h10c.8 0 1.4-.6 1.4-1.4v-8.6" fill={mid} />
          <rect x="10" y="13.2" width="4" height="7.4" rx="1" fill={deep} />
          <rect x="7.2" y="12.4" width="2.4" height="2.4" rx="0.5" fill={soft} opacity="0.85" />
          <rect x="14.4" y="12.4" width="2.4" height="2.4" rx="0.5" fill={soft} opacity="0.85" />
        </>
      )}
    </IconBase>
  );
}

/** Live Cam — birdhouse with a glowing entry (watching the nest) */
export function LiveCameraIcon(props: IconProps) {
  return (
    <IconBase wash="dustyBlue" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          {/* Roof */}
          <path d="M3.6 10.8 12 3.6l8.4 7.2" fill={soft} />
          {/* House body */}
          <path
            d="M5.4 10v8.6c0 .8.6 1.4 1.4 1.4h10.4c.8 0 1.4-.6 1.4-1.4V10"
            fill={mid}
          />
          {/* Entry hole as the “lens” */}
          <circle cx="12" cy="13.6" r="3.1" fill={deep} />
          <circle cx="12" cy="13.6" r="1.7" fill={pastel.cream.soft} opacity="0.9" />
          <circle cx="12" cy="13.6" r="0.75" fill={deep} opacity="0.55" />
          {/* Soft live glint */}
          <circle cx="11.1" cy="12.7" r="0.55" fill={pastel.cream.soft} />
          {/* Perch */}
          <rect x="9.6" y="17.2" width="4.8" height="1.2" rx="0.6" fill={deep} opacity="0.45" />
          {/* Chimney / antenna hint */}
          <rect x="11.3" y="2.8" width="1.4" height="2.2" rx="0.7" fill={deep} opacity="0.55" />
        </>
      )}
    </IconBase>
  );
}

/** Gallery — stacked picture frames */
export function GalleryIcon(props: IconProps) {
  return (
    <IconBase wash="lavender" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <rect x="5.2" y="3.6" width="13.2" height="10.4" rx="2" fill={soft} transform="rotate(-8 11.8 8.8)" />
          <rect x="4" y="7.2" width="14.4" height="11.6" rx="2.2" fill={mid} />
          <circle cx="8.4" cy="11.4" r="1.5" fill={soft} />
          <path d="M4.6 17.2 8.8 13.2l2.6 2.4 2.8-3.4 4.2 5" fill={soft} />
          <rect x="15.6" y="9.2" width="1.6" height="1.6" rx="0.4" fill={deep} opacity="0.5" />
        </>
      )}
    </IconBase>
  );
}

/** Moments — soft heart */
export function MomentsIcon(props: IconProps) {
  return (
    <IconBase wash="blush" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <path
            d="M12 20.4c-.4 0-1-.3-2.2-1.2C6.4 16.6 3.2 13.4 3.2 9.8 3.2 7.1 5.2 5 7.8 5c1.5 0 2.8.7 3.6 1.8C12.2 5.7 13.5 5 15 5c2.6 0 4.6 2.1 4.6 4.8 0 3.6-3.2 6.8-6.6 9.4-1.2.9-1.8 1.2-2.2 1.2Z"
            fill={mid}
          />
          <path
            d="M8.2 8.4c.9-1 2.2-1.2 3-.4"
            stroke={soft}
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="9.2" cy="9.6" rx="1.1" ry="1.4" fill={deep} opacity="0.18" />
        </>
      )}
    </IconBase>
  );
}

/** Notifications — bell */
export function NotificationIcon(props: IconProps) {
  return (
    <IconBase wash="blush" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <path
            d="M6.4 10.2c0-3.3 2.5-5.8 5.6-5.8s5.6 2.5 5.6 5.8c0 4.4 1.7 5.8 1.7 5.8H4.7S6.4 14.6 6.4 10.2Z"
            fill={mid}
          />
          <rect x="5.2" y="15.8" width="13.6" height="1.8" rx="0.9" fill={soft} />
          <path d="M10.2 18.6a1.9 1.9 0 0 0 3.6 0" fill={deep} />
          <circle cx="12" cy="4.2" r="1.1" fill={deep} opacity="0.7" />
        </>
      )}
    </IconBase>
  );
}

/** Settings — gear */
export function SettingsIcon(props: IconProps) {
  return (
    <IconBase wash="taupe" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <circle cx="12" cy="12" r="4.2" fill={soft} />
          <circle cx="12" cy="12" r="2.2" fill={deep} />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            const x = 12 + Math.cos(rad) * 7.4;
            const y = 12 + Math.sin(rad) * 7.4;
            return (
              <rect
                key={deg}
                x={x - 1.35}
                y={y - 2.1}
                width="2.7"
                height="4.2"
                rx="1"
                fill={mid}
                transform={`rotate(${deg} ${x} ${y})`}
              />
            );
          })}
        </>
      )}
    </IconBase>
  );
}

/** Menu — three soft bars */
export function MenuIcon(props: IconProps) {
  return (
    <IconBase wash="taupe" {...props}>
      {({ mid, deep }: PastelTone) => (
        <>
          <rect x="4" y="6" width="16" height="2.6" rx="1.3" fill={mid} />
          <rect x="4" y="10.7" width="16" height="2.6" rx="1.3" fill={deep} />
          <rect x="4" y="15.4" width="11.2" height="2.6" rx="1.3" fill={mid} />
        </>
      )}
    </IconBase>
  );
}

/** Share — connected nodes */
export function ShareIcon(props: IconProps) {
  return (
    <IconBase wash="dustyBlue" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <path d="M8.4 11.2 15.2 7.6M8.4 12.8 15.2 16.4" stroke={soft} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="17.4" cy="6.4" r="2.5" fill={mid} />
          <circle cx="6.2" cy="12" r="2.5" fill={deep} />
          <circle cx="17.4" cy="17.6" r="2.5" fill={mid} />
        </>
      )}
    </IconBase>
  );
}

/** Favorite — heart */
export function FavoriteIcon(props: IconProps) {
  return (
    <IconBase wash="blush" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <path
            d="M12 20.4c-.4 0-1-.3-2.2-1.2C6.4 16.6 3.2 13.4 3.2 9.8 3.2 7.1 5.2 5 7.8 5c1.5 0 2.8.7 3.6 1.8C12.2 5.7 13.5 5 15 5c2.6 0 4.6 2.1 4.6 4.8 0 3.6-3.2 6.8-6.6 9.4-1.2.9-1.8 1.2-2.2 1.2Z"
            fill={mid}
          />
          <path
            d="M8.2 8.4c.9-1 2.2-1.2 3-.4"
            stroke={soft}
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="9.2" cy="9.6" rx="1.1" ry="1.4" fill={deep} opacity="0.18" />
        </>
      )}
    </IconBase>
  );
}

/** Download — arrow into tray */
export function DownloadIcon(props: IconProps) {
  return (
    <IconBase wash="sage" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <path d="M12 3.8v10" stroke={mid} strokeWidth="2.6" strokeLinecap="round" />
          <path
            d="m7.6 10.2 4.4 4.4 4.4-4.4"
            stroke={deep}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M5 16.4h14v1.8c0 1-.8 1.8-1.8 1.8H6.8c-1 0-1.8-.8-1.8-1.8Z" fill={soft} />
        </>
      )}
    </IconBase>
  );
}

/** Bird — perched songbird silhouette */
export function BirdIcon(props: IconProps) {
  return (
    <IconBase wash="dustyBlue" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <ellipse cx="11" cy="13.4" rx="6.6" ry="4.6" fill={mid} />
          <ellipse cx="15.6" cy="9.4" rx="3.4" ry="2.9" fill={soft} />
          <path d="M17.8 8.8 21 7.6 18.4 10.4Z" fill={deep} />
          <circle cx="16.6" cy="8.6" r="0.55" fill={deep} />
          <path d="M4.4 14.2c-1.8.4-2.8 1.8-2.2 3 1.6.1 3.2-.6 4-1.8Z" fill={deep} opacity="0.65" />
          <path d="M8.2 11.4c1.8-2.2 4-3.2 6.4-2.8" stroke={soft} strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
          <path d="M9.2 17.6c1.2 1.4 2.8 2 4.4 1.6" stroke={deep} strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
        </>
      )}
    </IconBase>
  );
}

/** Birdhouse — peaked house with round entry */
export function BirdhouseIcon(props: IconProps) {
  return (
    <IconBase wash="taupe" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <path d="M4 11.4 12 4.4l8 7" fill={soft} />
          <path d="M6 10.6v8.4c0 .8.6 1.4 1.4 1.4h9.2c.8 0 1.4-.6 1.4-1.4v-8.4" fill={mid} />
          <circle cx="12" cy="13.8" r="2.6" fill={soft} />
          <circle cx="12" cy="13.8" r="1.35" fill={deep} />
          <rect x="11.25" y="3.4" width="1.5" height="2.4" rx="0.75" fill={deep} />
          <rect x="10.4" y="17.6" width="3.2" height="1.2" rx="0.5" fill={deep} opacity="0.45" />
        </>
      )}
    </IconBase>
  );
}

/** Nest — woven bowl with three eggs */
export function NestIcon(props: IconProps) {
  return (
    <IconBase wash="sage" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <ellipse cx="12" cy="15.6" rx="8.4" ry="3.8" fill={mid} />
          <ellipse cx="12" cy="14.4" rx="7.2" ry="2.6" fill={soft} />
          <ellipse cx="9.2" cy="11.6" rx="1.85" ry="2.4" fill={pastel.dustyBlue.soft} transform="rotate(-18 9.2 11.6)" />
          <ellipse cx="12.2" cy="10.8" rx="1.85" ry="2.4" fill={pastel.blush.soft} />
          <ellipse cx="15.2" cy="11.8" rx="1.85" ry="2.4" fill={pastel.lavender.soft} transform="rotate(18 15.2 11.8)" />
          <path d="M5.2 15.2c1.6 1.8 4.2 2.8 6.8 2.8s5.2-1 6.8-2.8" stroke={deep} strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />
        </>
      )}
    </IconBase>
  );
}

/** Flower — five soft petals */
export function FlowerIcon(props: IconProps) {
  return (
    <IconBase wash="blush" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <ellipse cx="12" cy="6.4" rx="2.4" ry="3.2" fill={mid} />
          <ellipse cx="12" cy="17.6" rx="2.4" ry="3.2" fill={mid} />
          <ellipse cx="6.4" cy="12" rx="3.2" ry="2.4" fill={soft} />
          <ellipse cx="17.6" cy="12" rx="3.2" ry="2.4" fill={soft} />
          <circle cx="12" cy="12" r="2.5" fill={deep} />
          <circle cx="12" cy="12" r="1.15" fill={pastel.cream.soft} />
          <path d="M12 19.4v2.4" stroke={pastel.sage.mid} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </IconBase>
  );
}

/** Leaf — single botanical leaf */
export function LeafIcon(props: IconProps) {
  return (
    <IconBase wash="sage" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <path
            d="M5.2 18.4C3.6 12.4 6.4 6.4 16.2 4.6c1.6 5.8-.8 13-11 13.8Z"
            fill={mid}
          />
          <path
            d="M6.8 17.2c2.4-3.8 5.2-6.8 9.2-10.4"
            stroke={soft}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M9.2 14.4c1.4-1.6 2.8-2.8 4.6-4.2M11.2 16c1.2-1.2 2.4-2.2 3.8-3.2"
            stroke={deep}
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.45"
          />
        </>
      )}
    </IconBase>
  );
}

/** Feather — soft quill */
export function FeatherIcon(props: IconProps) {
  return (
    <IconBase wash="dustyBlue" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <path
            d="M6.8 19.6c3-5 6.8-9.2 11.2-12.8 1.1 2.6.1 5.4-2 7.8-2.6 3-5.8 4.6-9.2 5Z"
            fill={mid}
          />
          <path d="M8 18.8 17.2 6.2" stroke={soft} strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M15.2 8.2 11.4 12.6M13.6 10.4 9.8 14.8M11.8 13 8.2 17"
            stroke={deep}
            strokeWidth="1.25"
            strokeLinecap="round"
            opacity="0.55"
          />
        </>
      )}
    </IconBase>
  );
}

/** Egg — classic nest egg in soft pastel green */
export function EggIcon(props: IconProps) {
  return (
    <IconBase wash="sage" {...props}>
      {() => {
        // Lighter than the default sage family so the egg feels chalky, not heavy
        const softGreen = "#C5D4C4";
        const midGreen = "#A8BCA8";
        const deepGreen = "#7E9180";
        return (
          <>
            <path
              d="M12 3.4
                 C14.6 3.4 16.6 6.8 17.2 10.6
                 C17.8 14.2 16.2 20.6 12 20.6
                 C7.8 20.6 6.2 14.2 6.8 10.6
                 C7.4 6.8 9.4 3.4 12 3.4Z"
              fill={midGreen}
            />
            <ellipse
              cx="10.4"
              cy="9.8"
              rx="1.5"
              ry="2.8"
              fill={pastel.cream.soft}
              opacity="0.55"
            />
            <ellipse cx="13.5" cy="14.4" rx="0.6" ry="0.8" fill={deepGreen} opacity="0.18" />
            <ellipse cx="11" cy="16.2" rx="0.45" ry="0.6" fill={deepGreen} opacity="0.14" />
            <ellipse cx="12" cy="12" rx="4.2" ry="5.6" fill={softGreen} opacity="0.35" />
          </>
        );
      }}
    </IconBase>
  );
}

/** Camera — still camera */
export function CameraIcon(props: IconProps) {
  return (
    <IconBase wash="taupe" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <rect x="2.8" y="7.6" width="18.4" height="11.6" rx="3" fill={mid} />
          <path d="M7.8 7.6 9.4 5h5.2L16.2 7.6Z" fill={soft} />
          <circle cx="12" cy="13.4" r="3.6" fill={soft} />
          <circle cx="12" cy="13.4" r="2" fill={deep} />
          <circle cx="12" cy="13.4" r="0.8" fill={pastel.cream.soft} />
          <circle cx="18.2" cy="10" r="0.9" fill={soft} />
        </>
      )}
    </IconBase>
  );
}

/** Chevron — forward caret */
export function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase wash="taupe" {...props}>
      {({ mid }: PastelTone) => (
        <path
          d="m9 5.8 6.2 6.2L9 18.2"
          stroke={mid}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </IconBase>
  );
}

/** Offline cloud */
export function CloudOfflineIcon(props: IconProps) {
  return (
    <IconBase wash="dustyBlue" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <path
            d="M6.8 16.8a4 4 0 0 1-.4-7.8 5 5 0 0 1 9.6-1.6 4.2 4.2 0 0 1-.4 9.4Z"
            fill={mid}
          />
          <path d="M9 12.8h6" stroke={soft} strokeWidth="2" strokeLinecap="round" />
          <circle cx="10.2" cy="12.8" r="0.9" fill={deep} opacity="0.4" />
          <circle cx="13.8" cy="12.8" r="0.9" fill={deep} opacity="0.4" />
        </>
      )}
    </IconBase>
  );
}

/** Music — soft note for the relax playlist */
export function MusicIcon(props: IconProps) {
  return (
    <IconBase wash="lavender" {...props}>
      {({ soft, mid, deep }: PastelTone) => (
        <>
          <ellipse cx="8.2" cy="17.2" rx="3.2" ry="2.4" fill={mid} />
          <ellipse cx="16.4" cy="15.4" rx="3.2" ry="2.4" fill={mid} />
          <path d="M11.4 17.2V5.6c0-.6.4-1 1-1.1l5.2-.8c.7-.1 1.2.4 1.2 1.1v10.6" stroke={deep} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M11.4 8.2 18.8 7" stroke={soft} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </IconBase>
  );
}

export const Icons = {
  home: HomeIcon,
  liveCamera: LiveCameraIcon,
  gallery: GalleryIcon,
  moments: MomentsIcon,
  notification: NotificationIcon,
  settings: SettingsIcon,
  menu: MenuIcon,
  share: ShareIcon,
  favorite: FavoriteIcon,
  download: DownloadIcon,
  bird: BirdIcon,
  birdhouse: BirdhouseIcon,
  nest: NestIcon,
  egg: EggIcon,
  flower: FlowerIcon,
  leaf: LeafIcon,
  feather: FeatherIcon,
  camera: CameraIcon,
  music: MusicIcon,
  chevronRight: ChevronRightIcon,
  cloudOffline: CloudOfflineIcon,
} as const;
