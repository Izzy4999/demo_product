"use client";
import { motion } from "framer-motion";

// ─── Projection ───────────────────────────────────────────────────────────────
// Nigeria: lon 2.69–14.58 °E, lat 4.24–13.87 °N
// SVG viewBox 0 0 500 390
function px(lon: number, lat: number) {
  return {
    x: ((lon - 2.3) / 12.8) * 420 + 40,
    y: ((14.3 - lat) / 10.1) * 350 + 20,
  };
}

// ─── Nigeria Border ───────────────────────────────────────────────────────────
const BORDER_COORDS: [number, number][] = [
  [2.691702, 6.258817], [2.749063, 7.870734], [2.723793, 8.506845],
  [2.912308, 9.137608], [3.220352, 9.444153], [3.705438, 10.063210],
  [3.600070, 10.332186],[3.797112, 10.734746],[3.572216, 11.327939],
  [3.611180, 11.660167],[3.680634, 12.552903],[3.967283, 12.956109],
  [4.107946, 13.531216],[4.368344, 13.747482],[5.443058, 13.865924],
  [6.445426, 13.492768],[6.820442, 13.115091],[7.330747, 13.098038],
  [7.804671, 13.343527],[9.014933, 12.826659],[9.524928, 12.851102],
  [10.114814,13.277252],[10.701032,13.246918],[10.989593,13.387323],
  [11.527803,13.328980],[12.302071,13.037189],[13.083987,13.596147],
  [13.318702,13.556356],[13.995353,12.461565],[14.181336,12.483657],
  [14.577178,12.085361],[14.468192,11.904752],[14.415379,11.572369],
  [13.572950,10.798566],[13.308676,10.160362],[13.167600, 9.640626],
  [12.955468, 9.417772],[12.753672, 8.717763],[12.218872, 8.305824],
  [12.063946, 7.799808],[11.839309, 7.397042],[11.745774, 6.981383],
  [11.058788, 6.644427],[10.497375, 7.055358],[10.118277, 7.038770],
  [ 9.522706, 6.453482],[ 9.233163, 6.444491],[ 8.757533, 5.479666],
  [ 8.500288, 4.771983],[ 7.462108, 4.412108],[ 7.082596, 4.464689],
  [ 6.698072, 4.240594],[ 5.898173, 4.262453],[ 5.362805, 4.887971],
  [ 5.033574, 5.611802],[ 4.325607, 6.270651],[ 3.574180, 6.258300],
];
const BORDER_D = BORDER_COORDS.map(([lon, lat], i) => {
  const { x, y } = px(lon, lat);
  return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ") + " Z";

// ─── Rivers ───────────────────────────────────────────────────────────────────
const NIGER_COORDS: [number, number][] = [
  [3.55,11.70],[4.00,11.20],[4.28,10.88],[4.55,10.25],[4.70,9.58],
  [5.00,8.72],[5.58,7.58],[6.10,7.18],[6.75,7.78],
  [6.52,6.55],[6.22,5.72],[5.88,5.28],[5.52,5.00],
];
const NIGER_D = NIGER_COORDS.map(([lon, lat], i) => {
  const { x, y } = px(lon, lat);
  return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ");

const BENUE_COORDS: [number, number][] = [
  [13.00,7.55],[11.00,7.52],[9.50,7.42],[8.50,7.32],[7.50,7.28],[6.75,7.78],
];
const BENUE_D = BENUE_COORDS.map(([lon, lat], i) => {
  const { x, y } = px(lon, lat);
  return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ");

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapPin {
  id: string;
  /** Display label on the map */
  label: string;
  lon: number;
  lat: number;
  /** Fill color of the dot */
  color: string;
  /** Radius in SVG units (default 7) */
  size?: number;
  /** Whether to show an animated pulse ring */
  pulse?: boolean;
  /** Small text badge below/above the label, e.g. "21 exc." */
  badge?: string;
  /** Optional shape override: "circle" | "diamond" | "triangle" (default "circle") */
  shape?: "circle" | "diamond" | "triangle";
}

export interface MapLegendItem {
  color: string;
  label: string;
  shape?: "circle" | "diamond" | "triangle";
}

interface Props {
  pins: MapPin[];
  legend?: MapLegendItem[];
  /** SVG rendered height (default 340) */
  height?: number;
  /** Optional top-right title shown on the map face */
  mapLabel?: string;
}

// ─── Shape helpers ────────────────────────────────────────────────────────────

function PinShape({ x, y, r, color, shape }: { x: number; y: number; r: number; color: string; shape: string }) {
  const filter = `drop-shadow(0 1px 4px ${color}88)`;
  if (shape === "diamond") {
    const s = r * 1.4;
    const d = `M ${x} ${y - s} L ${x + s} ${y} L ${x} ${y + s} L ${x - s} ${y} Z`;
    return <path d={d} fill={color} stroke="white" strokeWidth="1.8" style={{ filter }} />;
  }
  if (shape === "triangle") {
    const s = r * 1.3;
    const d = `M ${x} ${y - s} L ${x + s} ${y + s * 0.7} L ${x - s} ${y + s * 0.7} Z`;
    return <path d={d} fill={color} stroke="white" strokeWidth="1.8" style={{ filter }} />;
  }
  // default circle
  return <circle cx={x} cy={y} r={r} fill={color} stroke="white" strokeWidth="2" style={{ filter }} />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NigeriaAnalyticsMap({ pins, legend, height = 340, mapLabel }: Props) {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
      {/* SVG map */}
      <div style={{ background: "#c8e0f4", position: "relative" }}>
        <svg viewBox="0 0 500 390" width="100%" height={height} style={{ display: "block" }}>
          <defs>
            <linearGradient id="nam-ocean" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8e0f4" />
              <stop offset="100%" stopColor="#a8d0ee" />
            </linearGradient>
            <pattern id="nam-paper" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="none" />
              <circle cx="2" cy="2" r="0.4" fill="rgba(80,40,0,0.04)" />
            </pattern>
          </defs>

          {/* Ocean */}
          <rect width="500" height="390" fill="url(#nam-ocean)" />

          {/* Subtle grid */}
          {[1,2,3,4].map(i => (
            <line key={`v${i}`} x1={i*100} y1={0} x2={i*100} y2={390}
              stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
          ))}
          {[1,2,3].map(i => (
            <line key={`h${i}`} x1={0} y1={i*97} x2={500} y2={i*97}
              stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />
          ))}

          {/* Nigeria land */}
          <path d={BORDER_D} fill="#f5edd8" stroke="#c8a86a" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={BORDER_D} fill="url(#nam-paper)" />

          {/* Rivers */}
          <path d={NIGER_D} fill="none" stroke="#7ec8e3" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          <path d={BENUE_D} fill="none" stroke="#7ec8e3" strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />

          {/* ── Pins ── */}
          {pins.map(pin => {
            const { x, y } = px(pin.lon, pin.lat);
            const r   = pin.size ?? 7;
            const shp = pin.shape ?? "circle";

            // label above the dot when near the bottom coast (Lagos ~y 289, PH ~y 335, Onitsha ~y 297)
            const nearBottom = y > 265;
            const lblY   = nearBottom ? y - r - 7  : y + r + 14;
            const badgeY = nearBottom ? y - r - 18 : y + r + 24;

            return (
              <g key={pin.id}>
                {/* Halo */}
                <circle cx={x} cy={y} r={r + 7} fill={pin.color} opacity={0.1} />

                {/* Pulse ring */}
                {pin.pulse && (
                  <motion.circle
                    cx={x} cy={y} r={r + 4}
                    fill="none" stroke={pin.color} strokeWidth="1.5"
                    animate={{ r: [r + 4, r + 20], opacity: [0.6, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}

                {/* Shape */}
                <PinShape x={x} y={y} r={r} color={pin.color} shape={shp} />

                {/* City label */}
                <text x={x} y={lblY} fontSize="9" fill="#1f2937"
                  fontFamily="sans-serif" fontWeight="700" textAnchor="middle">
                  {pin.label}
                </text>

                {/* Badge */}
                {pin.badge && (
                  <text x={x} y={badgeY} fontSize="7.5" fill="#6b7280"
                    fontFamily="sans-serif" textAnchor="middle">
                    {pin.badge}
                  </text>
                )}
              </g>
            );
          })}

          {/* Map title badge */}
          <text x="12" y="16" fontSize="9" fill="rgba(0,0,0,0.35)"
            fontFamily="sans-serif" fontWeight="700" letterSpacing="1.5">
            NIGERIA
          </text>

          {/* Optional right-side label */}
          {mapLabel && (
            <text x="490" y="16" fontSize="9" fill="rgba(0,0,0,0.35)"
              fontFamily="sans-serif" fontWeight="600" textAnchor="end">
              {mapLabel}
            </text>
          )}

          {/* Compass */}
          <g transform="translate(468,22)">
            <text y="0" fontSize="7" fill="rgba(0,0,0,0.35)"
              textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">N</text>
            <line x1="0" y1="3" x2="0" y2="9" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          </g>

          {/* Scale bar */}
          <g transform="translate(14,372)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#888" strokeWidth="1.5" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#888" strokeWidth="1.5" />
            <line x1="60" y1="-3" x2="60" y2="3" stroke="#888" strokeWidth="1.5" />
            <text x="30" y="-5" fontSize="7" fill="#888" textAnchor="middle" fontFamily="sans-serif">~400 km</text>
          </g>
        </svg>
      </div>

      {/* Legend strip */}
      {legend && legend.length > 0 && (
        <div style={{ display: "flex", gap: 16, padding: "8px 14px", background: "white", flexWrap: "wrap", borderTop: "1px solid #f3f4f6" }}>
          {legend.map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {item.shape === "triangle" ? (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <polygon points="5,0 10,10 0,10" fill={item.color} />
                </svg>
              ) : item.shape === "diamond" ? (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <polygon points="5,0 10,5 5,10 0,5" fill={item.color} />
                </svg>
              ) : (
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              )}
              <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
