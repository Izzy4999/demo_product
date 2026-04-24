"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import ScratchCard from "@/components/ScratchCard";
import PhoneEmulator from "@/components/PhoneEmulator";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import NigeriaAnalyticsMap, { MapPin, MapLegendItem } from "@/components/NigeriaAnalyticsMap";

const COLOR = "#BE0303";
const CODE = "SNG-7829-KXPQ";

/* ─── Verify Dashboard ──────────────────────────────────────────────────── */

const V_DAILY = [
  { day: "Mon", genuine: 5821, fake: 312 },
  { day: "Tue", genuine: 6234, fake: 289 },
  { day: "Wed", genuine: 7102, fake: 398 },
  { day: "Thu", genuine: 6890, fake: 341 },
  { day: "Fri", genuine: 8234, fake: 421 },
  { day: "Sat", genuine: 7123, fake: 287 },
  { day: "Sun", genuine: 6488, fake: 299 },
];
const V_STATES = [
  { state: "Lagos",        verif: 12400, fakeRate: 6.1 },
  { state: "Kano",         verif:  8920, fakeRate: 8.3 },
  { state: "Abuja",        verif:  7210, fakeRate: 4.2 },
  { state: "Aba",          verif:  5890, fakeRate: 7.9 },
  { state: "Port Harcourt",verif:  4320, fakeRate: 5.6 },
];
const V_ALERTS = [
  { id: "TPI-LAG-8821", location: "Lagos Island",   risk: "High",   time: "14:32" },
  { id: "TPI-ABA-9102", location: "Aba Market",     risk: "High",   time: "14:28" },
  { id: "TPI-KAN-7733", location: "Kano Centre",    risk: "Medium", time: "14:19" },
  { id: "TPI-ABJ-5512", location: "Abuja CBD",      risk: "Low",    time: "13:55" },
  { id: "TPI-PHC-3391", location: "Port Harcourt",  risk: "Medium", time: "13:41" },
];

// ─── Verify Map Data ──────────────────────────────────────────────────────────
// Main state-level pins — sized by scan volume, colored by fake rate
const V_MAP_PINS: MapPin[] = [
  // HIGH risk (fake rate > 7%) — red, pulsing
  { id: "kano", label: "Kano",          lon: 8.52, lat: 12.00, color: "#dc2626", size: 11, pulse: true,  badge: "8.3% fake rate" },
  { id: "aba",  label: "Aba",           lon: 7.35, lat:  5.12, color: "#dc2626", size: 10, pulse: true,  badge: "7.9% fake rate" },
  // MEDIUM risk (4–7%) — orange
  { id: "lagos", label: "Lagos",        lon: 3.40, lat:  6.40, color: "#f97316", size: 13, pulse: false, badge: "6.1% fake rate" },
  { id: "ph",    label: "Port Harcourt",lon: 7.00, lat:  4.82, color: "#f97316", size: 8,  pulse: false, badge: "5.6% fake rate" },
  { id: "abuja", label: "Abuja",        lon: 7.50, lat:  9.10, color: "#eab308", size: 9,  pulse: false, badge: "4.2% fake rate" },
  // Reported shop markers (triangle) — from TPI alerts, more granular
  { id: "tpi-lagos",  label: "Lagos Island",   lon: 3.40, lat: 6.58, color: "#dc2626", size: 5, shape: "triangle", badge: "TPI-LAG-8821" },
  { id: "tpi-aba",    label: "Aba Market",     lon: 7.32, lat: 5.00, color: "#dc2626", size: 5, shape: "triangle", badge: "TPI-ABA-9102" },
  { id: "tpi-kano",   label: "Kano Centre",    lon: 8.55, lat: 11.82,color: "#f97316", size: 4, shape: "triangle", badge: "TPI-KAN-7733" },
  { id: "tpi-ph",     label: "Mile 1 Market",  lon: 7.02, lat:  4.94,color: "#f97316", size: 4, shape: "triangle", badge: "TPI-PHC-3391" },
];
const V_MAP_LEGEND: MapLegendItem[] = [
  { color: "#dc2626", label: "High risk — >7% fake rate" },
  { color: "#f97316", label: "Medium risk — 4–7%" },
  { color: "#eab308", label: "Low risk — <4%" },
  { color: "#dc2626", label: "Reported shop (TPI)", shape: "triangle" },
];

function VTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px" }}>
      <p style={{ margin: "0 0 4px", fontSize: 10, color: "#9ca3af", fontWeight: 700 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: "2px 0", fontSize: 12, fontWeight: 700, color: p.color }}>
          {p.name === "genuine" ? "✅ Genuine" : "🚨 Counterfeit"}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function VerifyDashboard() {
  const COLOR = "#BE0303";
  const kpis = [
    { label: "Total Verifications", value: "47,892", delta: "+12.4%", icon: "✅", up: true },
    { label: "Genuine Rate",         value: "94.2%",  delta: "+0.8%",  icon: "🔒", up: true },
    { label: "Counterfeits Flagged", value: "2,847",  delta: "+3.1%",  icon: "🚨", up: false },
    { label: "Avg Response Time",    value: "1.4s",   delta: "−0.2s",  icon: "⚡", up: true },
  ];
  return (
    <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "#0D1B2A", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: 1.5, textTransform: "uppercase" as const }}>Live Dashboard</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "white" }}>Verification Analytics</h2>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#4b5563" }}>Sproxil Verify™ · Last 7 days · All SKUs</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["7D","30D","90D"].map((r, i) => (
            <button key={r} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: i === 0 ? COLOR : "rgba(255,255,255,0.05)", color: i === 0 ? "white" : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{r}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{k.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: k.up ? "#16a34a" : "#dc2626", background: k.up ? "#f0fdf4" : "#fef2f2", padding: "2px 7px", borderRadius: 9999 }}>{k.delta}</span>
              </div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: COLOR }}>{k.value}</p>
              <p style={{ margin: "3px 0 0", fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Area chart */}
        <p style={{ fontSize: 11, fontWeight: 800, color: "#374151", marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Daily Verification Volume — Genuine vs Counterfeit</p>
        <div style={{ marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={V_DAILY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="vGenuine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="vFake" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={44} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
              <Tooltip content={<VTooltip />} />
              <Area type="monotone" dataKey="genuine" stroke={COLOR} strokeWidth={2.5} fill="url(#vGenuine)" />
              <Area type="monotone" dataKey="fake" stroke="#dc2626" strokeWidth={2} fill="url(#vFake)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Counterfeit Intelligence Map */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5, margin: 0 }}>
              Counterfeit Intelligence Map
            </p>
            <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
              5 flagged locations · 2 reported shops
            </span>
          </div>
          <NigeriaAnalyticsMap
            pins={V_MAP_PINS}
            legend={V_MAP_LEGEND}
            height={310}
            mapLabel="Fake Detection Density"
          />
        </div>

        {/* Bottom 3-panel row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

          {/* Channel */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Channel Split</p>
            {[{ name: "WhatsApp", pct: 78, color: "#25D366" }, { name: "SMS", pct: 22, color: COLOR }].map(c => (
              <div key={c.name} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{c.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: c.color }}>{c.pct}%</span>
                </div>
                <div style={{ height: 6, background: "#e5e7eb", borderRadius: 9999, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ height: "100%", background: c.color, borderRadius: 9999 }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: "8px 10px", background: "white", borderRadius: 9, border: "1px solid #e5e7eb" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#6b7280" }}>Total unique consumers: <strong style={{ color: "#111" }}>34,218</strong></p>
            </div>
          </div>

          {/* Top states */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Top States</p>
            {V_STATES.map((s, i) => (
              <div key={s.state} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", width: 14 }}>{i + 1}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", flex: 1 }}>{s.state}</span>
                <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: COLOR }}>{(s.verif / 1000).toFixed(1)}k</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                  color: s.fakeRate > 7 ? "#dc2626" : "#6b7280",
                  background: s.fakeRate > 7 ? "#fef2f2" : "#f3f4f6" }}>
                  {s.fakeRate}% fake
                </span>
              </div>
            ))}
          </div>

          {/* TPI alerts */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>TPI Alerts</p>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "2px 7px", borderRadius: 9999 }}>5 today</span>
            </div>
            {V_ALERTS.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                  background: a.risk === "High" ? "#dc2626" : a.risk === "Medium" ? "#f59e0b" : "#9ca3af" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{a.location}</p>
                  <p style={{ margin: 0, fontSize: 9, color: "#9ca3af" }}>{a.id} · {a.time}</p>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, flexShrink: 0,
                  color: a.risk === "High" ? "#dc2626" : a.risk === "Medium" ? "#d97706" : "#6b7280" }}>{a.risk}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function VerifyDemo() {
  const [scratched, setScratched] = useState(false);
  const [scenario, setScenario] = useState<"genuine" | "fake">("genuine");
  const [tpiData, setTpiData] = useState<{ shop: string; area: string; coords: string } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-2" style={{ background: COLOR }} />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* Live Simulation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 text-xl mb-1">Live Simulation</h2>
          <p className="text-sm text-gray-500 mb-6">
            Scratch the label to reveal the PIN, then open WhatsApp or Messages on the phone and type the code to verify.
          </p>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Left panel ─────────────────────────────────────── */}
            <div className="flex-1 space-y-6">

              {/* Step 1: Scenario */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0" style={{ background: COLOR }}>1</span>
                  <p className="font-semibold text-gray-800 text-sm">Choose a scenario</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setScenario("genuine")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${scenario === "genuine" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-500"}`}
                  >
                    Genuine Product
                  </button>
                  <button
                    onClick={() => setScenario("fake")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${scenario === "fake" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-500"}`}
                  >
                    Counterfeit / Used PIN
                  </button>
                </div>
              </div>

              {/* Step 2: Scratch */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0" style={{ background: COLOR }}>2</span>
                  <p className="font-semibold text-gray-800 text-sm">Scratch the label to reveal the PIN</p>
                </div>
                <ScratchCard code={CODE} onScratched={() => setScratched(true)} />
              </div>

              {/* Step 3: Instructions (after scratch) */}
              <AnimatePresence>
                {scratched && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0" style={{ background: COLOR }}>3</span>
                      <p className="font-semibold text-gray-800 text-sm">Send it on the phone</p>
                    </div>
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-2 text-sm text-teal-800">
                      <p>→ The phone has booted on the right</p>
                      <p>→ Tap the screen to unlock it</p>
                      <p>→ Open <strong>WhatsApp</strong> or <strong>Messages</strong></p>
                      <p>→ Type or paste the code and hit send</p>
                      <p>→ See the response come back live</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Right panel: Phone ─────────────────────────────── */}
            <div className="w-full lg:w-auto flex flex-col items-center gap-4">
              <PhoneEmulator
                scenario={scenario}
                prefillCode={CODE}
                codeRevealed={scratched}
                onReportSubmitted={(data) => setTpiData(data)}
              />
              <p className="text-xs text-gray-400 text-center max-w-xs">
                Tap to unlock → open WhatsApp or Messages → type the code
              </p>
            </div>
          </div>
        </div>

        {/* TPI alert panel — appears after report */}
        <AnimatePresence>
          {tpiData && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0D1B2A] rounded-2xl p-6 text-white"
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-red-400">TPI Alert — Data Captured & Logged</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ["Status", "COUNTERFEIT"],
                  ["Shop", tpiData.shop],
                  ["Area", tpiData.area],
                  ["Coordinates", tpiData.coords],
                  ["PIN Flagged", CODE],
                  ["Channel", "WhatsApp"],
                  ["Alert", "Brand team notified"],
                  ["Ref", `TPI-ABA-${Math.floor(10000 + Math.random() * 90000)}`],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white/5 rounded-xl px-3 py-2">
                    <p className="text-gray-400 text-[10px] uppercase font-semibold">{k}</p>
                    <p className="text-white text-xs font-bold mt-0.5 truncate">{v}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <VerifyDashboard />

      </div>
    </div>
  );
}
