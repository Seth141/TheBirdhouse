// Generates the static /public/icons/*.svg asset library from the same
// path data used by the React icon components, so the "sketchbook" stays
// in one place conceptually while satisfying the standalone-asset
// requirement for the icon system.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const INK = "#6B625A";
const wash = {
  sage: "#D6E1D5",
  blush: "#F4E5E7",
  dustyBlue: "#B9CBD8",
  taupe: "#E4DCD2",
  lavender: "#DCD6E8",
  none: null,
};

function svg(name, washTone, glyph) {
  const washEl = wash[washTone]
    ? `<ellipse cx="12" cy="13" rx="10.5" ry="9.5" fill="${wash[washTone]}" opacity="0.55" style="filter:blur(2.5px)"/>`
    : "";
  const content = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none">
  ${washEl}
  <g stroke="${INK}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    ${glyph}
  </g>
</svg>
`;
  writeFileSync(join(outDir, `${name}.svg`), content, "utf8");
}

svg(
  "home",
  "blush",
  `<path d="M4.5 11.5 12 5l7.5 6.5" />
   <path d="M6.5 10v8.2a1 1 0 0 0 1 1H16.5a1 1 0 0 0 1-1V10" />
   <path d="M10 19.2v-4.4c0-.7.6-1.3 1.3-1.3h1.4c.7 0 1.3.6 1.3 1.3v4.4" />`
);

svg(
  "live-camera",
  "dustyBlue",
  `<rect x="3.5" y="8" width="12.5" height="9" rx="2.4" />
   <path d="M16 11.2 20 8.8v6.4l-4-2.4" />
   <circle cx="9.7" cy="12.5" r="2.1" />
   <path d="M7.5 8V6.7c0-.6.5-1.1 1.1-1.1h2.3" />`
);

svg(
  "gallery",
  "lavender",
  `<rect x="3.5" y="4.5" width="17" height="14" rx="2.4" />
   <circle cx="8.3" cy="9.3" r="1.5" />
   <path d="m4.2 16.8 4.7-4.8a1.4 1.4 0 0 1 2 0l2.6 2.6" />
   <path d="m11.5 17-1-1a1.4 1.4 0 0 1 0-2l3.9-3.9a1.4 1.4 0 0 1 2 0l3.4 3.4" />`
);

svg(
  "moments",
  "sage",
  `<path d="M12 4.8c2.4 2 5.6 3.1 7.5 3.1-.2 6.4-3 10.1-7.5 11.4C7.5 18 4.7 14.3 4.5 7.9c1.9 0 5.1-1.1 7.5-3.1Z" />
   <path d="M9.3 12.4 11.4 14.5 15 10" />`
);

svg(
  "notification",
  "blush",
  `<path d="M7 10.2c0-3 2.2-5.3 5-5.3s5 2.3 5 5.3c0 4 1.5 5.2 1.5 5.2H5.5S7 14.2 7 10.2Z" />
   <path d="M10.2 18.2a1.9 1.9 0 0 0 3.6 0" />`
);

svg(
  "settings",
  "taupe",
  `<circle cx="12" cy="12" r="2.7" />
   <path d="M12 4.8v1.9M12 17.3v1.9M19.2 12h-1.9M6.7 12H4.8M17 7l-1.3 1.3M8.3 15.7 7 17M17 17l-1.3-1.3M8.3 8.3 7 7" />`
);

svg(
  "menu",
  "none",
  `<path d="M4.5 7.2h15" /><path d="M4.5 12h15" /><path d="M4.5 16.8h9.5" />`
);

svg(
  "share",
  "none",
  `<circle cx="18" cy="6.2" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="17.8" r="2" />
   <path d="m7.7 11 8.6-4M7.7 13l8.6 4" />`
);

svg(
  "favorite",
  "blush",
  `<path d="M12 19s-6.9-4.1-9-8.3C1.6 7.8 3.4 5 6.4 5c1.8 0 3.1 1 3.6 2.2C10.5 6 11.8 5 13.6 5c3 0 4.8 2.8 3.4 5.7-2.1 4.2-9 8.3-9 8.3Z" />`
);

svg(
  "download",
  "none",
  `<path d="M12 4.5v10.3" /><path d="m8 11.3 4 4 4-4" />
   <path d="M5.5 17v1.6c0 .8.7 1.4 1.5 1.4h10c.8 0 1.5-.6 1.5-1.4V17" />`
);

svg(
  "bird",
  "dustyBlue",
  `<path d="M4 13c1.6-3.4 4.7-5.6 8.2-5.6 3.8 0 6.9 2.2 7.8 5.4-1.6.9-3.3 1.1-4.6.6-.2 2.6-2.1 4.9-5.2 5.6-2.6.6-5-.3-6.3-2.1 1.4.1 2.6-.3 3.3-1.1-1.6 0-2.6-1-3.2-2.8Z" />
   <circle cx="14.5" cy="9.6" r="0.5" fill="${INK}" />`
);

svg(
  "birdhouse",
  "taupe",
  `<path d="M5 11.5 12 6l7 5.5" />
   <path d="M6.8 10.5v7.3c0 .7.5 1.2 1.2 1.2h8c.7 0 1.2-.5 1.2-1.2v-7.3" />
   <circle cx="12" cy="13.6" r="2" />
   <path d="M12 4.3v1.9" />`
);

svg(
  "nest",
  "sage",
  `<path d="M3.5 14.5c1.6-1.4 4.6-2.2 8.5-2.2s6.9.8 8.5 2.2" />
   <path d="M4.7 14.8c.6 2.1 3.6 3.7 7.3 3.7s6.7-1.6 7.3-3.7" />
   <ellipse cx="9.8" cy="11.6" rx="1.5" ry="2" transform="rotate(-18 9.8 11.6)" />
   <ellipse cx="12.6" cy="10.8" rx="1.5" ry="2" transform="rotate(2 12.6 10.8)" />
   <ellipse cx="15.1" cy="11.8" rx="1.5" ry="2" transform="rotate(20 15.1 11.8)" />`
);

svg(
  "flower",
  "blush",
  `<circle cx="12" cy="12" r="1.6" />
   <ellipse cx="12" cy="7.3" rx="1.9" ry="2.6" />
   <ellipse cx="12" cy="16.7" rx="1.9" ry="2.6" />
   <ellipse cx="7.3" cy="12" rx="2.6" ry="1.9" />
   <ellipse cx="16.7" cy="12" rx="2.6" ry="1.9" />
   <path d="M12 19v2.2" />`
);

svg(
  "leaf",
  "sage",
  `<path d="M6 18c-1.6-5.6 1-11 9.5-12.8C17.3 10.6 15.3 17 6 18Z" />
   <path d="M7 17c2-3.4 4.4-6 8-9.4" />`
);

svg(
  "feather",
  "dustyBlue",
  `<path d="M7 19.2 16.8 5.8" />
   <path d="M16.8 5.8c.4 1.6-.1 3.2-1.4 4.8-1.6 2-3.8 3.4-6.2 4.2" />
   <path d="M15.2 7.6 11.4 12" />
   <path d="M13.8 9.6 10 14.2" />
   <path d="M12.2 12 8.6 16.4" />
   <path d="M16.2 6.6c1.1-.2 2 .4 2.2 1.4" />`
);

svg(
  "egg",
  "dustyBlue",
  `<path d="M12 4.5c3 3.6 5 7.3 5 10.1a5 5 0 0 1-10 0c0-2.8 2-6.5 5-10.1Z" />
   <path d="M9.7 14.2c.6.4 1.4.6 2.3.6" />`
);

svg(
  "camera",
  "taupe",
  `<rect x="3.5" y="8" width="17" height="11" rx="2.4" />
   <path d="M8.5 8 9.8 5.6h4.4L15.5 8" />
   <circle cx="12" cy="13.4" r="3" />`
);

console.log("Icon assets written to", outDir);
