"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import ScratchCard from "@/components/ScratchCard";
import PromoPhoneEmulator, { PrizeType, PromoResult } from "@/components/PromoPhoneEmulator";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLOR = "#BE0303";
const CODE  = "SNG-7829-PRMO";

// ─── Prize scenario definitions ───────────────────────────────────────────────

const PRIZES: { id: PrizeType; label: string; icon: string; sub: string; badge: string }[] = [
  {
    id:    "airtime",
    label: "Instant Airtime Win",
    icon:  "🎉",
    sub:   "Every genuine scan enters a prize tier — win ₦500 airtime instantly",
    badge: "₦500 Airtime",
  },
  {
    id:    "cash",
    label: "Cash Grand Prize",
    icon:  "🏆",
    sub:   "Grand prize winners receive a PAYCODE — redeemable at any bank via *737#",
    badge: "₦50,000 Cash",
  },
  {
    id:    "draw",
    label: "Monthly Grand Draw",
    icon:  "🎟",
    sub:   "Every genuine scan enters the monthly draw — prize pool of ₦1,000,000",
    badge: "₦1M Draw",
  },
];

/* ─── Promo Dashboard ───────────────────────────────────────────────────── */

const P_DAILY = [
  { day: "Mon", airtime: 1823, cash: 234, draw: 892 },
  { day: "Tue", airtime: 2102, cash: 187, draw: 1023 },
  { day: "Wed", airtime: 2540, cash: 301, draw: 1189 },
  { day: "Thu", airtime: 2287, cash: 265, draw: 1087 },
  { day: "Fri", airtime: 3012, cash: 412, draw: 1534 },
  { day: "Sat", airtime: 2789, cash: 378, draw: 1298 },
  { day: "Sun", airtime: 2345, cash: 287, draw: 1123 },
];
const P_CITIES = [
  { city: "Lagos",          entries: 8820, winners: 882 },
  { city: "Abuja",          entries: 5430, winners: 543 },
  { city: "Kano",           entries: 4210, winners: 421 },
  { city: "Port Harcourt",  entries: 3180, winners: 318 },
  { city: "Aba",            entries: 1500, winners: 150 },
];
const P_RECENT = [
  { name: "Chidinma A.",  prize: "₦500 Airtime",  time: "14:32", city: "Aba"           },
  { name: "Fatima B.",    prize: "₦100 Airtime",  time: "14:29", city: "Kano"          },
  { name: "Emeka O.",     prize: "₦50,000 Cash",  time: "14:25", city: "Lagos"         },
  { name: "Ngozi C.",     prize: "Draw Entry",    time: "14:21", city: "Port Harcourt" },
  { name: "Tunde L.",     prize: "₦500 Airtime",  time: "14:18", city: "Ibadan"        },
];

function PTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px" }}>
      <p style={{ margin: "0 0 4px", fontSize: 10, color: "#9ca3af", fontWeight: 700 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: "2px 0", fontSize: 11, fontWeight: 700, color: p.color }}>
          {p.name === "airtime" ? "🎉 Airtime" : p.name === "cash" ? "🏆 Cash" : "🎟 Draw"}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function PromoDashboard() {
  const COLOR = "#BE0303";
  const kpis = [
    { label: "Campaign Entries",   value: "23,140", delta: "+18.2%", icon: "🎯", up: true  },
    { label: "Winners Today",      value: "2,314",  delta: "+22.1%", icon: "🏆", up: true  },
    { label: "Airtime Disbursed",  value: "₦4.6M",  delta: "+19.4%", icon: "💰", up: true  },
    { label: "Active States",      value: "24",     delta: "+4",     icon: "🗺", up: true  },
  ];
  const prizeMix = [
    { label: "Airtime Wins", pct: 68, color: COLOR     },
    { label: "Cash Prizes",  pct: 21, color: "#f59e0b" },
    { label: "Draw Entries", pct: 11, color: "#6b7280"  },
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
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "white" }}>Campaign Performance</h2>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#4b5563" }}>Sproxil Promo™ · XYZ Brand Campaign · All channels</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["7D","30D","All"].map((r, i) => (
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

        {/* Bar chart */}
        <p style={{ fontSize: 11, fontWeight: 800, color: "#374151", marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Daily Campaign Entries by Prize Type</p>
        <div style={{ marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={P_DAILY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={44} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
              <Tooltip content={<PTooltip />} />
              <Bar dataKey="airtime" fill={COLOR}    stackId="a" radius={[0,0,0,0]} />
              <Bar dataKey="cash"    fill="#f59e0b"  stackId="a" radius={[0,0,0,0]} />
              <Bar dataKey="draw"    fill="#9ca3af"  stackId="a" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
            {[["🎉 Airtime", COLOR], ["🏆 Cash", "#f59e0b"], ["🎟 Draw", "#9ca3af"]].map(([l, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                <span style={{ fontSize: 10, color: "#6b7280" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

          {/* Prize mix */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Prize Mix</p>
            {prizeMix.map(p => (
              <div key={p.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{p.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: p.color }}>{p.pct}%</span>
                </div>
                <div style={{ height: 6, background: "#e5e7eb", borderRadius: 9999, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ height: "100%", background: p.color, borderRadius: 9999 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Top cities */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Top Cities</p>
            {P_CITIES.map((c, i) => (
              <div key={c.city} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", width: 14 }}>{i + 1}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", flex: 1 }}>{c.city}</span>
                <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: COLOR }}>{(c.entries/1000).toFixed(1)}k</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "1px 5px", borderRadius: 4 }}>
                  {c.winners} won
                </span>
              </div>
            ))}
          </div>

          {/* Recent winners */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Recent Wins</p>
              <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            </div>
            {P_RECENT.map((w, i) => (
              <motion.div key={w.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: COLOR, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 900, flexShrink: 0 }}>
                  {w.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#374151" }}>{w.prize}</p>
                  <p style={{ margin: 0, fontSize: 9, color: "#9ca3af" }}>{w.city} · {w.time}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PromoDemo() {
  const [prizeType, setPrizeType] = useState<PrizeType>("airtime");
  const [scratched, setScratched] = useState(false);
  const [result, setResult]       = useState<PromoResult | null>(null);

  const switchPrize = (p: PrizeType) => {
    setPrizeType(p);
    setScratched(false);
    setResult(null);
  };

  const activePrize = PRIZES.find(p => p.id === prizeType)!;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-2" style={{ background: COLOR }} />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* Live Simulation card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 text-xl mb-1">Live Simulation</h2>
          <p className="text-sm text-gray-500 mb-6">
            Choose a prize scenario, scratch the label to reveal the PIN, then verify on the phone to see how the consumer experience works end to end.
          </p>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Left panel ──────────────────────────────────────── */}
            <div className="flex-1 space-y-6">

              {/* Step 1: Prize scenario */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0" style={{ background: COLOR }}>1</span>
                  <p className="font-semibold text-gray-800 text-sm">Choose a prize scenario</p>
                </div>
                <div className="flex flex-col gap-2">
                  {PRIZES.map(p => (
                    <button key={p.id} onMouseDown={e => e.preventDefault()} onClick={() => switchPrize(p.id)}
                      className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3"
                      style={{
                        borderColor: prizeType === p.id ? COLOR : "#e5e7eb",
                        background:  prizeType === p.id ? "#fff7f0" : "white",
                      }}>
                      <span className="text-xl flex-shrink-0">{p.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{ color: prizeType === p.id ? COLOR : "#545454" }}>{p.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.sub}</p>
                      </div>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: prizeType === p.id ? `${COLOR}20` : "#f3f4f6", color: prizeType === p.id ? COLOR : "#545454" }}>
                        {p.badge}
                      </span>
                      {prizeType === p.id && (
                        <svg width={16} height={16} viewBox="0 0 24 24" fill={COLOR} className="flex-shrink-0">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Scratch */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0" style={{ background: COLOR }}>2</span>
                  <p className="font-semibold text-gray-800 text-sm">Scratch the label to reveal the PIN</p>
                </div>
                <ScratchCard key={prizeType} code={CODE} onScratched={() => setScratched(true)} />
              </div>

              {/* Step 3: Instructions (after scratch) */}
              <AnimatePresence>
                {scratched && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0" style={{ background: COLOR }}>3</span>
                      <p className="font-semibold text-gray-800 text-sm">Verify on the phone</p>
                    </div>
                    <div className="rounded-xl p-4 space-y-2 text-sm border"
                      style={{ background: `${COLOR}08`, borderColor: `${COLOR}30`, color: "#7a3a10" }}>
                      <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: COLOR }}>How to play</p>
                      <p>→ Tap the phone screen to wake it</p>
                      <p>→ Tap <strong>Tap to unlock</strong></p>
                      <p>→ Open <strong>WhatsApp</strong> or <strong>Messages</strong></p>
                      <p>→ The code is pre-filled — tap <strong>Send ✈</strong></p>
                      <p>→ Watch the <strong>{activePrize.icon} {activePrize.label}</strong> response arrive!</p>
                    </div>

                    {/* Prize config card */}
                    <div className="mt-4 rounded-xl p-4 border border-gray-100 bg-gray-50 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Prize configuration</p>
                      {prizeType === "airtime" && (
                        <>
                          <p className="text-xs text-gray-600">• Every <strong>10th</strong> scan → ₦100 airtime instantly</p>
                          <p className="text-xs text-gray-600">• Every <strong>100th</strong> scan → ₦500 airtime instantly</p>
                          <p className="text-xs text-gray-600">• Every <strong>3,000th</strong> scan → Physical prize (TV / fridge)</p>
                        </>
                      )}
                      {prizeType === "cash" && (
                        <>
                          <p className="text-xs text-gray-600">• Every <strong>1,000th</strong> scan → ₦10,000 cash via PAYCODE</p>
                          <p className="text-xs text-gray-600">• Monthly grand draw → ₦1,000,000 cash</p>
                          <p className="text-xs text-gray-600">• PAYCODE redeemable via <strong>*737#</strong> to any bank</p>
                        </>
                      )}
                      {prizeType === "draw" && (
                        <>
                          <p className="text-xs text-gray-600">• Every genuine scan = 1 draw entry</p>
                          <p className="text-xs text-gray-600">• Monthly draw from all participants</p>
                          <p className="text-xs text-gray-600">• Prize pool: <strong>₦1,000,000</strong> per month</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Right panel: Phone ──────────────────────────────── */}
            <div className="w-full lg:w-auto flex flex-col items-center gap-4">
              <PromoPhoneEmulator
                key={prizeType}
                prizeType={prizeType}
                prefillCode={CODE}
                codeRevealed={scratched}
                onPrizeAwarded={data => setResult(data)}
              />
              <p className="text-xs text-gray-400 text-center max-w-xs">
                Tap to wake → unlock → open WhatsApp or Messages → send the code
              </p>
            </div>
          </div>
        </div>

        {/* Results panel */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#0D1B2A] rounded-2xl p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: COLOR }}>
                {result.prizeType === "airtime" ? "🎉 Airtime Prize" : result.prizeType === "cash" ? "🏆 Cash Prize" : "🎟 Draw Entry"} — Data Captured &amp; Aggregated
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ["Channel",   result.channel === "whatsapp" ? "WhatsApp" : "SMS"],
                  ["PIN",       result.code],
                  ["Prize",     result.prizeType === "airtime" ? "₦500 Airtime" : result.prizeType === "cash" ? "₦50,000 PAYCODE" : "Draw Entry #DRW-7829-KQ"],
                  ["Status",    result.prizeType === "draw" ? "Draw entered" : "Disbursed"],
                  ["Phone",     "0803****4521"],
                  ["Location",  "Lagos Island"],
                  ["SKU",       "SNG-PRMO-500ML"],
                  ["Timestamp", new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })],
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

        <PromoDashboard />

      </div>
    </div>
  );
}
