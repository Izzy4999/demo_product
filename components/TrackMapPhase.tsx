"use client";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLOR = "#BE0303";

interface Props {
  completedSteps: Set<string>;
  sscc?: string;
  productName?: string;
  batchLot?: string;
  shipDestination?: string;
}

// ─── Geographic projection ────────────────────────────────────────────────────
// Nigeria: lon 2.69–14.58 °E, lat 4.24–13.87 °N  (Natural Earth ne_110m)
// SVG viewBox 0 0 500 390
// x = (lon - 2.3) / 12.8 * 420 + 40
// y = (14.3 - lat) / 10.1 * 350 + 20

function px(lon: number, lat: number) {
  return {
    x: ((lon - 2.3) / 12.8) * 420 + 40,
    y: ((14.3 - lat) / 10.1) * 350 + 20,
  };
}

interface Node { id: string; label: string; sub: string; x: number; y: number }

// Geographically accurate positions
const NODES: Node[] = [
  { id: "lagos",   label: "Lagos",         sub: "Apapa Warehouse",          ...px(3.4,  6.4)  },
  { id: "ibadan",  label: "Ibadan",        sub: "SW Regional Hub",          ...px(3.9,  7.4)  },
  { id: "abuja",   label: "Abuja",         sub: "FCT Depot",                ...px(7.5,  9.1)  },
  { id: "onitsha", label: "Onitsha",       sub: "Main Market Depot",        ...px(6.8,  6.15) },
  { id: "kano",    label: "Kano",          sub: "Central Distribution Hub", ...px(8.52, 12.0)  },
  { id: "ph",      label: "Port Harcourt", sub: "Rivers State Depot",       ...px(7.0,  4.82) },
];

const NODE_MAP = Object.fromEntries(NODES.map(n => [n.id, n]));

// ─── Nigeria outline (geographic polygon) ─────────────────────────────────────
// Source: Natural Earth ne_110m_admin_0_countries.geojson — Nigeria feature.
// Coordinates: [lon°E, lat°N], 58 points, counter-clockwise ring (closed).
const BORDER_COORDS: [number, number][] = [
  [2.691702, 6.258817],
  [2.749063, 7.870734],
  [2.723793, 8.506845],
  [2.912308, 9.137608],
  [3.220352, 9.444153],
  [3.705438, 10.063210],
  [3.600070, 10.332186],
  [3.797112, 10.734746],
  [3.572216, 11.327939],
  [3.611180, 11.660167],
  [3.680634, 12.552903],
  [3.967283, 12.956109],
  [4.107946, 13.531216],
  [4.368344, 13.747482],
  [5.443058, 13.865924],
  [6.445426, 13.492768],
  [6.820442, 13.115091],
  [7.330747, 13.098038],
  [7.804671, 13.343527],
  [9.014933, 12.826659],
  [9.524928, 12.851102],
  [10.114814, 13.277252],
  [10.701032, 13.246918],
  [10.989593, 13.387323],
  [11.527803, 13.328980],
  [12.302071, 13.037189],
  [13.083987, 13.596147],
  [13.318702, 13.556356],
  [13.995353, 12.461565],
  [14.181336, 12.483657],
  [14.577178, 12.085361],
  [14.468192, 11.904752],
  [14.415379, 11.572369],
  [13.572950, 10.798566],
  [13.308676, 10.160362],
  [13.167600,  9.640626],
  [12.955468,  9.417772],
  [12.753672,  8.717763],
  [12.218872,  8.305824],
  [12.063946,  7.799808],
  [11.839309,  7.397042],
  [11.745774,  6.981383],
  [11.058788,  6.644427],
  [10.497375,  7.055358],
  [10.118277,  7.038770],
  [9.522706,  6.453482],
  [9.233163,  6.444491],
  [8.757533,  5.479666],
  [8.500288,  4.771983],
  [7.462108,  4.412108],
  [7.082596,  4.464689],
  [6.698072,  4.240594],
  [5.898173,  4.262453],
  [5.362805,  4.887971],
  [5.033574,  5.611802],
  [4.325607,  6.270651],
  [3.574180,  6.258300],
];

const BORDER_D = BORDER_COORDS.map(([lon, lat], i) => {
  const { x, y } = px(lon, lat);
  return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ") + " Z";

// Niger River — enters Nigeria from Niger Republic ~(3.55 °E, 11.70 °N),
// flows SE through Kainji → Baro → Lokoja confluence → Niger Delta
const NIGER_COORDS: [number, number][] = [
  [3.55, 11.70], [4.00, 11.20], [4.28, 10.88],
  [4.55, 10.25], [4.70,  9.58], [5.00,  8.72],
  [5.58,  7.58], [6.10,  7.18],
  [6.75,  7.78],                                  // Lokoja — confluence with Benue
  [6.52,  6.55], [6.22,  5.72], [5.88,  5.28], [5.52,  5.00],
];
const NIGER_D = NIGER_COORDS.map(([lon, lat], i) => {
  const { x, y } = px(lon, lat);
  return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ");

// Benue River — enters from Cameroon ~(13.0 °E, 7.55 °N), flows W to Lokoja
const BENUE_COORDS: [number, number][] = [
  [13.00, 7.55], [11.00, 7.52], [9.50, 7.42],
  [ 8.50, 7.32], [ 7.50, 7.28], [6.75, 7.78],
];
const BENUE_D = BENUE_COORDS.map(([lon, lat], i) => {
  const { x, y } = px(lon, lat);
  return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ");

// ─── Route helpers ─────────────────────────────────────────────────────────────

function destToNodeId(destination: string): string {
  if (!destination) return "";
  const d = destination.toLowerCase();
  if (d.includes("kano"))                                              return "kano";
  if (d.includes("abuja"))                                             return "abuja";
  if (d.includes("onitsha"))                                           return "onitsha";
  if (d.includes("port") || d.includes("harcourt") || d.includes("rivers")) return "ph";
  if (d.includes("ibadan"))                                            return "ibadan";
  return "abuja";
}

function getRouteNodes(destNodeId: string): string[] {
  switch (destNodeId) {
    case "abuja":   return ["lagos", "abuja"];
    case "kano":    return ["lagos", "abuja", "kano"];
    case "onitsha": return ["lagos", "onitsha"];
    case "ph":      return ["lagos", "onitsha", "ph"];
    case "ibadan":  return ["lagos", "ibadan"];
    default:        return ["lagos"];
  }
}

function buildPath(nodeIds: string[]): string {
  return nodeIds.map((id, i) => {
    const n = NODE_MAP[id];
    return `${i === 0 ? "M" : "L"} ${n.x.toFixed(1)} ${n.y.toFixed(1)}`;
  }).join(" ");
}

function getRouteProgress(completedSteps: Set<string>): number {
  if (completedSteps.has("verify") || completedSteps.has("dispense")) return 1.0;
  if (completedSteps.has("unpack"))  return 0.55;
  if (completedSteps.has("receive")) return 0.50;
  if (completedSteps.has("ship"))    return 0.25;
  return 0;
}

function getProductPosition(progress: number, routeNodes: string[]): { x: number; y: number } {
  const first = NODE_MAP[routeNodes[0] ?? "lagos"];
  if (routeNodes.length <= 1) return { x: first.x, y: first.y };
  if (progress <= 0) return { x: first.x, y: first.y };
  const last = NODE_MAP[routeNodes[routeNodes.length - 1]];
  if (progress >= 1) return { x: last.x, y: last.y };
  const segments = routeNodes.length - 1;
  const scaled = progress * segments;
  const segIdx = Math.min(Math.floor(scaled), segments - 1);
  const segFrac = scaled - segIdx;
  const from = NODE_MAP[routeNodes[segIdx]];
  const to   = NODE_MAP[routeNodes[segIdx + 1]];
  return { x: from.x + (to.x - from.x) * segFrac, y: from.y + (to.y - from.y) * segFrac };
}

function getActiveNodeId(completedSteps: Set<string>, routeNodes: string[]): string {
  const origin = routeNodes[0] ?? "lagos";
  const dest   = routeNodes[routeNodes.length - 1];
  const mid    = routeNodes.length > 2 ? routeNodes[1] : null;
  if (completedSteps.has("verify") || completedSteps.has("dispense")) return dest;
  if (completedSteps.has("receive") || completedSteps.has("unpack"))  return mid || dest;
  return origin;
}

// ─── Step events ───────────────────────────────────────────────────────────────

function buildStepEvents(destNodeId: string, routeNodes: string[]) {
  const ORIGIN   = "Lagos — Apapa Warehouse";
  const destNode = NODE_MAP[destNodeId];
  const destLbl  = destNode ? `${destNode.label} — ${destNode.sub}` : "Destination";
  const midId    = routeNodes.length > 2 ? routeNodes[1] : null;
  const midNode  = midId ? NODE_MAP[midId] : null;
  const midLbl   = midNode ? `${midNode.label} — ${midNode.sub}` : destLbl;
  const transit  = destNode ? `Lagos → ${destNode.label} (in transit)` : "In transit";

  return [
    { step: "commission",   label: "Labels Commissioned",  icon: "⚡", location: ORIGIN,   time: "just now"   },
    { step: "pack",         label: "Products Packed",      icon: "📦", location: ORIGIN,   time: "1 min ago"  },
    { step: "ship",         label: "Package Shipped",      icon: "🚚", location: transit,  time: "3 min ago"  },
    { step: "receive",      label: "Package Received",     icon: "📬", location: midLbl,   time: "8 min ago"  },
    { step: "unpack",       label: "Package Unpacked",     icon: "📤", location: midLbl,   time: "9 min ago"  },
    { step: "dispense",     label: "Items Dispensed",      icon: "💊", location: destLbl,  time: "12 min ago" },
    { step: "decommission", label: "Label Decommissioned", icon: "❌", location: destLbl,  time: "14 min ago" },
    { step: "verify",       label: "Package Verified",     icon: "✅", location: destLbl,  time: "15 min ago" },
  ];
}

// ─── SVG Map ───────────────────────────────────────────────────────────────────

function TrackMap({ completedSteps, routeNodes }: { completedSteps: Set<string>; routeNodes: string[] }) {
  const pathRef   = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);

  const hasRoute      = routeNodes.length >= 2;
  const routePathD    = hasRoute ? buildPath(routeNodes) : "";
  const routeProgress = getRouteProgress(completedSteps);
  const activeNodeId  = getActiveNodeId(completedSteps, routeNodes);
  const productPos    = getProductPosition(routeProgress, routeNodes);

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, [routePathD]);

  const dashOffset = pathLen > 0 ? pathLen * (1 - Math.min(routeProgress, 1)) : pathLen;

  // Helper: label placement — push above when near the southern coast, below otherwise.
  // Lagos (~y 294) and Onitsha (~y 303) both sit close to the coast, so threshold = 280.
  function labelY(n: Node, isActive: boolean) {
    if (n.y > 280) return n.y - (isActive ? 16 : 13);  // near coast → label above
    if (n.y < 120) return n.y + (isActive ? 22 : 19);  // near top   → label below
    return n.y + (isActive ? 22 : 19);
  }
  function subY(n: Node, isActive: boolean) {
    if (n.y > 280) return n.y - (isActive ? 5 : 3);
    if (n.y < 120) return n.y + (isActive ? 33 : 29);
    return n.y + (isActive ? 33 : 29);
  }

  return (
    <svg viewBox="0 0 500 390" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <filter id="routeGlow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="nodeGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Subtle paper texture */}
        <pattern id="paper" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="none"/>
          <circle cx="2" cy="2" r="0.4" fill="rgba(80,40,0,0.04)" />
        </pattern>
        <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8e0f4" />
          <stop offset="100%" stopColor="#a8d0ee" />
        </linearGradient>
      </defs>

      {/* Ocean / Gulf of Guinea background */}
      <rect width="500" height="390" fill="url(#oceanGrad)" />

      {/* Subtle grid */}
      {[1,2,3,4].map(i => (
        <line key={`v${i}`} x1={i*100} y1={0} x2={i*100} y2={390}
          stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      ))}
      {[1,2,3].map(i => (
        <line key={`h${i}`} x1={0} y1={i*97} x2={500} y2={i*97}
          stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      ))}

      {/* Nigeria land fill — warm cream/parchment, classic atlas style */}
      <path d={BORDER_D} fill="#f5edd8" stroke="#c8a86a" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Paper texture overlay on land */}
      <path d={BORDER_D} fill="url(#paper)" />

      {/* Niger River */}
      <path d={NIGER_D} fill="none" stroke="#7ec8e3" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      {/* Benue River */}
      <path d={BENUE_D} fill="none" stroke="#7ec8e3" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />

      {/* Route path — dashed underlay */}
      {hasRoute && (
        <path
          ref={pathRef}
          d={routePathD}
          fill="none"
          stroke="#f2b8b8"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
      )}

      {/* Route path — animated fill */}
      {hasRoute && pathLen > 0 && (
        <motion.path
          d={routePathD}
          fill="none"
          stroke={COLOR}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={pathLen}
          animate={{ strokeDashoffset: dashOffset }}
          initial={{ strokeDashoffset: pathLen }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          filter="url(#routeGlow)"
        />
      )}

      {/* ── Nodes ──────────────────────────────────────────────────────────── */}
      {NODES.map(n => {
        const isOnRoute = routeNodes.includes(n.id);
        const isActive  = n.id === activeNodeId;
        const activeIdx = routeNodes.indexOf(activeNodeId);
        const nodeIdx   = routeNodes.indexOf(n.id);
        const isDone    = isOnRoute && nodeIdx >= 0 && nodeIdx < activeIdx;

        if (!isOnRoute) {
          // Dim secondary node
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={4} fill="white" stroke="#bbb" strokeWidth="1.2" opacity="0.7" />
              <text x={n.x + 7} y={n.y + 3} fontSize="8" fill="#888" fontFamily="sans-serif" opacity="0.9">
                {n.label}
              </text>
            </g>
          );
        }

        const r      = isActive ? 9 : 6;
        const fill   = isActive ? COLOR : isDone ? "#f5c5c5" : "white";
        const stroke = isActive ? "#7a0000" : isDone ? COLOR : "#999";
        const sw     = isActive ? 2.5 : 1.8;

        return (
          <g key={n.id}>
            {/* Pulse ring on active node */}
            {isActive && (
              <motion.circle
                cx={n.x} cy={n.y} r={11}
                fill="none" stroke={COLOR} strokeWidth="1.5"
                animate={{ r: [11, 22], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            )}

            {/* Halo for done nodes */}
            {isDone && <circle cx={n.x} cy={n.y} r={9} fill={`${COLOR}20`} />}

            {/* Node dot */}
            <motion.circle
              cx={n.x} cy={n.y}
              animate={{ r }}
              transition={{ duration: 0.3 }}
              fill={fill} stroke={stroke} strokeWidth={sw}
              style={isActive ? { filter: `drop-shadow(0 0 5px ${COLOR}88)` } : undefined}
            />

            {/* Check mark for done nodes */}
            {isDone && (
              <text x={n.x} y={n.y + 3.5} fontSize="7" fill={COLOR}
                fontWeight="bold" textAnchor="middle" fontFamily="sans-serif" opacity="0.9">
                ✓
              </text>
            )}

            {/* Corner brackets on active node */}
            {isActive && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx, sy], i) => (
                  <path key={i}
                    d={`M ${n.x + sx*14} ${n.y + sy*8} L ${n.x + sx*14} ${n.y + sy*14} L ${n.x + sx*8} ${n.y + sy*14}`}
                    fill="none" stroke={COLOR} strokeWidth="1.8" strokeLinecap="round" />
                ))}
              </motion.g>
            )}

            {/* City label */}
            <text x={n.x} y={labelY(n, isActive)}
              fontSize={isActive ? 10 : 9}
              fill={isActive ? "#3a0000" : isDone ? "#7a1a1a" : "#444"}
              fontFamily="sans-serif" fontWeight={isActive ? "700" : "600"}
              textAnchor="middle">
              {n.label}
            </text>
            <text x={n.x} y={subY(n, isActive)}
              fontSize="7" fill="#888" fontFamily="sans-serif" textAnchor="middle">
              {n.sub}
            </text>
          </g>
        );
      })}

      {/* Product dot */}
      {hasRoute && (
        <motion.circle
          key={routeNodes.join("-")}
          animate={{ cx: productPos.x, cy: productPos.y }}
          initial={{ cx: productPos.x, cy: productPos.y }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          r={7} fill={COLOR} stroke="white" strokeWidth={2.5}
          style={{ filter: `drop-shadow(0 2px 4px rgba(190,3,3,0.55))` }}
        />
      )}

      {/* No-route hint */}
      {!hasRoute && (
        <text x="250" y="380" fontSize="10" fill="rgba(80,40,40,0.5)"
          fontFamily="sans-serif" textAnchor="middle">
          Complete the Ship step to see the route
        </text>
      )}

      {/* Map title */}
      <text x="12" y="16" fontSize="9" fill="rgba(0,0,0,0.38)"
        fontFamily="sans-serif" fontWeight="700" letterSpacing="1.5">
        NIGERIA
      </text>

      {/* Compass rose (simple) */}
      <g transform="translate(468, 22)">
        <text y="0"  fontSize="7" fill="rgba(0,0,0,0.38)" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">N</text>
        <line x1="0" y1="3" x2="0" y2="9" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
      </g>

      {/* Scale bar */}
      <g transform="translate(14, 372)">
        <line x1="0" y1="0" x2="60" y2="0" stroke="#888" strokeWidth="1.5" />
        <line x1="0" y1="-3" x2="0" y2="3" stroke="#888" strokeWidth="1.5" />
        <line x1="60" y1="-3" x2="60" y2="3" stroke="#888" strokeWidth="1.5" />
        <text x="30" y="-5" fontSize="7" fill="#888" textAnchor="middle" fontFamily="sans-serif">~400 km</text>
      </g>
    </svg>
  );
}

// ─── Event Timeline ────────────────────────────────────────────────────────────

function EventTimeline({ completedSteps, stepEvents }: {
  completedSteps: Set<string>;
  stepEvents: ReturnType<typeof buildStepEvents>;
}) {
  const visibleEvents = stepEvents.filter(e => completedSteps.has(e.step));
  const reversed = [...visibleEvents].reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#111" }}>Supply Chain Events</p>
        <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>
          {visibleEvents.length} event{visibleEvents.length !== 1 ? "s" : ""} recorded
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
        {reversed.length === 0 ? (
          <div style={{ padding: "24px 8px", textAlign: "center" }}>
            <p style={{ fontSize: 24, margin: "0 0 8px" }}>📡</p>
            <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
              No events yet. Start scanning on the mobile app.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {reversed.map((ev, i) => (
              <motion.div key={ev.step}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                style={{
                  display: "flex", gap: 10, padding: "10px",
                  marginBottom: 6, borderRadius: 10,
                  background: i === 0 ? `${COLOR}0d` : "#fafafa",
                  border: `1px solid ${i === 0 ? `${COLOR}30` : "#f3f4f6"}`,
                  alignItems: "flex-start",
                }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: i === 0 ? COLOR : "#f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}>
                  {ev.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#111" }}>{ev.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ev.location}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: "#9ca3af" }}>{ev.time}</p>
                </div>
                <span style={{ fontSize: 14, color: "#16a34a", flexShrink: 0 }}>✓</span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─── Route badge ───────────────────────────────────────────────────────────────

function RouteBadge({ routeNodes, shipDestination }: { routeNodes: string[]; shipDestination?: string }) {
  if (!shipDestination || routeNodes.length < 2) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>🗺</span>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>Route will appear after you pick a shipping destination in the mobile app</span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: `${COLOR}08`, borderBottom: `1px solid ${COLOR}20` }}>
      <span style={{ fontSize: 10 }}>🚚</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: COLOR }}>
        Route: {routeNodes.map(id => NODE_MAP[id]?.label).join(" → ")}
      </span>
      <span style={{ fontSize: 10, color: "#6b7280", marginLeft: 4 }}>
        · {shipDestination.split("—")[0].trim()}
      </span>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function TrackMapPhase({ completedSteps, sscc, productName, batchLot, shipDestination }: Props) {
  const destNodeId = destToNodeId(shipDestination ?? "");
  const routeNodes = getRouteNodes(destNodeId);
  const stepEvents = buildStepEvents(destNodeId, routeNodes);

  return (
    <div>
      <RouteBadge routeNodes={routeNodes} shipDestination={shipDestination} />

      <div style={{ display: "flex", minHeight: 390 }}>
        {/* Map — now light atlas style */}
        <div style={{ flex: "0 0 66%", background: "#c8e0f4", position: "relative", overflow: "hidden" }}>
          <TrackMap completedSteps={completedSteps} routeNodes={routeNodes} />
        </div>

        {/* Event timeline */}
        <div style={{ flex: "0 0 34%", background: "white", borderLeft: "1px solid #f3f4f6", overflow: "hidden" }}>
          <EventTimeline completedSteps={completedSteps} stepEvents={stepEvents} />
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 0, borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
        {[
          { label: "SSCC",        value: sscc || "—" },
          { label: "Product",     value: productName || "—" },
          { label: "Batch / Lot", value: batchLot || "—" },
          { label: "Destination", value: shipDestination ? shipDestination.split("—")[0].trim() : "Not shipped yet" },
          { label: "Steps Done",  value: `${completedSteps.size} / 8` },
        ].map((stat, i, arr) => (
          <div key={stat.label} style={{
            flex: "1 1 130px", padding: "10px 18px",
            borderRight: i < arr.length - 1 ? "1px solid #f3f4f6" : "none",
          }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8 }}>{stat.label}</p>
            <p style={{ margin: "3px 0 0", fontSize: 12, fontWeight: 700, color: "#111", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
