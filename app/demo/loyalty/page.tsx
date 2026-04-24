"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ScratchCard from "@/components/ScratchCard";
import LoyaltyPhoneEmulator, { LoyaltyResult } from "@/components/LoyaltyPhoneEmulator";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLOR = "#BE0303";
const CODE  = "LYL-4821-MNVX";

const tierColors: Record<string, string> = { Bronze: "#545454", Silver: "#545454", Gold: "#BE0303" };

const RETAILERS = [
  { name: "Emeka Okafor",  initials: "EO", location: "Aba, Abia State",   basePoints: 1250, cartons: 8,  tier: "Silver", streak: "4 weeks", toGold: 1500 },
  { name: "Ngozi Adaeze",  initials: "NA", location: "Onitsha, Anambra",  basePoints: 2100, cartons: 14, tier: "Gold",   streak: "8 weeks", toGold: 2500 },
  { name: "Tunde Bakare",  initials: "TB", location: "Lagos Island",       basePoints:  450, cartons: 3,  tier: "Bronze", streak: "2 weeks", toGold: 1500 },
];

/* ─── Loyalty Analytics Dashboard ──────────────────────────────────────── */

const L_GROWTH = [
  { week: "W1", retailers: 4200 },
  { week: "W2", retailers: 4890 },
  { week: "W3", retailers: 5340 },
  { week: "W4", retailers: 5980 },
  { week: "W5", retailers: 6540 },
  { week: "W6", retailers: 7120 },
  { week: "W7", retailers: 7830 },
  { week: "W8", retailers: 8432 },
];
const L_STATES = [
  { state: "Lagos",    retailers: 2340, pointsM: 0.62 },
  { state: "Abuja",   retailers: 1120, pointsM: 0.29 },
  { state: "Kano",    retailers:  980, pointsM: 0.24 },
  { state: "Aba",     retailers:  870, pointsM: 0.21 },
  { state: "Enugu",   retailers:  640, pointsM: 0.16 },
];
const L_TIERS = [
  { tier: "Bronze", count: 4890, color: "#b45309", pct: 58 },
  { tier: "Silver", count: 2614, color: "#6b7280", pct: 31 },
  { tier: "Gold",   count:  928, color: "#BE0303", pct: 11 },
];
const L_REDEMPTIONS = [
  { day: "Mon", airtime: 312, points: 89 },
  { day: "Tue", airtime: 289, points: 102 },
  { day: "Wed", airtime: 421, points: 134 },
  { day: "Thu", airtime: 378, points: 118 },
  { day: "Fri", airtime: 512, points: 167 },
  { day: "Sat", airtime: 445, points: 142 },
  { day: "Sun", airtime: 390, points: 124 },
];

function LTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px" }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "white" }}>{label}: {payload[0].value.toLocaleString()} retailers</p>
    </div>
  );
}
function LRedTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px" }}>
      <p style={{ margin: "0 0 4px", fontSize: 10, color: "#9ca3af", fontWeight: 700 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: "2px 0", fontSize: 11, fontWeight: 700, color: p.color }}>
          {p.name === "airtime" ? "💰 Airtime redeemed" : "⭐ Point redeems"}: {p.value}
        </p>
      ))}
    </div>
  );
}

function LoyaltyAnalyticsDashboard() {
  const COLOR = "#BE0303";
  const kpis = [
    { label: "Active Retailers", value: "8,432",  delta: "+14.8%", icon: "🏪", up: true },
    { label: "Points Issued",    value: "2.1M",   delta: "+22.3%", icon: "⭐", up: true },
    { label: "Rewards Claimed",  value: "1,847",  delta: "+18.9%", icon: "🎁", up: true },
    { label: "States Covered",   value: "28",     delta: "+2",     icon: "🗺", up: true },
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
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "white" }}>Loyalty Analytics</h2>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#4b5563" }}>Sproxil Loyalty™ · All retailers · Last 8 weeks</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["8W","3M","1Y"].map((r, i) => (
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
                <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "2px 7px", borderRadius: 9999 }}>{k.delta}</span>
              </div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: COLOR }}>{k.value}</p>
              <p style={{ margin: "3px 0 0", fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Enrollment growth */}
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Retailer Enrollment Growth</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={L_GROWTH} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={44} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                <Tooltip content={<LTooltip />} />
                <Line type="monotone" dataKey="retailers" stroke={COLOR} strokeWidth={3} dot={{ fill: COLOR, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Daily redemptions */}
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Daily Redemptions This Week</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={L_REDEMPTIONS} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<LRedTooltip />} />
                <Bar dataKey="airtime" fill={COLOR}    stackId="a" radius={[0,0,0,0]} />
                <Bar dataKey="points"  fill="#f59e0b"  stackId="a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier distribution + states */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Tier distribution */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "16px 18px", border: "1px solid #f3f4f6" }}>
            <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Tier Distribution</p>
            {L_TIERS.map(t => (
              <div key={t.tier} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${t.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>{t.tier === "Gold" ? "🥇" : t.tier === "Silver" ? "🥈" : "🥉"}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{t.tier}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: t.color }}>{t.count.toLocaleString()} retailers · {t.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "#e5e7eb", borderRadius: 9999, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${t.pct}%` }} transition={{ duration: 0.9, delay: 0.2 }}
                      style={{ height: "100%", background: t.color, borderRadius: 9999 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* State coverage */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "16px 18px", border: "1px solid #f3f4f6" }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Top States by Coverage</p>
            {L_STATES.map((s, i) => (
              <div key={s.state} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", width: 14 }}>{i + 1}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", flex: 1 }}>{s.state}</span>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: COLOR }}>{s.retailers.toLocaleString()}</p>
                  <p style={{ margin: 0, fontSize: 9, color: "#9ca3af" }}>{s.pointsM}M pts</p>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: "8px 10px", background: "white", borderRadius: 8, border: "1px solid #e5e7eb" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#6b7280" }}>Total states covered: <strong style={{ color: COLOR }}>28 / 36</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoyaltyDemo() {
  const [scratched, setScratched] = useState(false);
  const [result, setResult]       = useState<LoyaltyResult | null>(null);
  const [selected, setSelected]   = useState(0);

  // After points awarded, Emeka's balance updates live in the dashboard
  const emekaPoints = result ? result.balance : RETAILERS[0].basePoints;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-2" style={{ background: COLOR }} />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* ── Live Simulation ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 text-xl mb-1">Live Simulation</h2>
          <p className="text-sm text-gray-500 mb-6">
            Emeka Okafor opens a carton, finds the loyalty coupon, scratches it to reveal his code, then sends it
            to earn instant airtime and accumulate points towards Gold tier.
          </p>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Left panel */}
            <div className="flex-1 space-y-6">

              {/* Step 1 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0" style={{ background: COLOR }}>1</span>
                  <p className="font-semibold text-gray-800 text-sm">Scratch the coupon to reveal the code</p>
                </div>
                <ScratchCard code={CODE} onScratched={() => setScratched(true)} />
              </div>

              {/* Step 2 + 3: appear after scratch */}
              <AnimatePresence>
                {scratched && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                    {/* Instructions */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0" style={{ background: COLOR }}>2</span>
                        <p className="font-semibold text-gray-800 text-sm">Send the code from the phone</p>
                      </div>
                      <div className="rounded-xl p-4 space-y-2 text-sm border"
                        style={{ background: `${COLOR}08`, borderColor: `${COLOR}30`, color: "#4a1d96" }}>
                        <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: COLOR }}>How to play</p>
                        <p>→ Tap the phone screen to wake it</p>
                        <p>→ Tap a notification or <strong>Tap to unlock</strong></p>
                        <p>→ Open <strong>WhatsApp</strong> or <strong>Messages</strong></p>
                        <p>→ The code is pre-filled — tap <strong>Send ✈</strong></p>
                        <p>→ Watch <strong>+150 pts</strong> and <strong>₦150 airtime</strong> arrive instantly!</p>
                      </div>
                    </div>

                    {/* Retailer profile preview */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0" style={{ background: COLOR }}>3</span>
                        <p className="font-semibold text-gray-800 text-sm">Emeka&apos;s loyalty profile</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 p-4 bg-white shadow-sm">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: COLOR }}>EO</div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">Emeka Okafor</p>
                            <p className="text-xs text-gray-500">Aba, Abia State · Silver Tier 🥈</p>
                          </div>
                          {result && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className="text-xs font-black px-2 py-1 rounded-full text-white"
                              style={{ background: COLOR }}>
                              +{result.points} pts!
                            </motion.span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {[
                            ["Total Points", emekaPoints.toLocaleString()],
                            ["Cartons Bought", result ? "9" : "8"],
                            ["Rewards Earned", result ? "₦1,350" : "₦1,200"],
                            ["Active Streak",  "4 weeks"],
                          ].map(([k, v]) => (
                            <div key={k} className="bg-gray-50 rounded-lg px-3 py-2">
                              <p className="text-gray-400 text-[10px] uppercase font-semibold">{k}</p>
                              <motion.p key={v} initial={{ scale: result ? 1.1 : 1 }} animate={{ scale: 1 }}
                                className="font-bold text-gray-800 text-sm mt-0.5">{v}</motion.p>
                            </div>
                          ))}
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-gray-500">Progress to Gold 🏆</span>
                            <span className="font-bold" style={{ color: COLOR }}>{emekaPoints.toLocaleString()} / 1,500</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              animate={{ width: `${Math.min((emekaPoints / 1500) * 100, 100)}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${COLOR}, #BE0303)` }}
                            />
                          </div>
                          {result && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs mt-1.5 font-semibold" style={{ color: COLOR }}>
                              🏆 Just {1500 - emekaPoints} points to Gold tier!
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right panel: Phone */}
            <div className="w-full lg:w-auto flex flex-col items-center gap-4">
              <LoyaltyPhoneEmulator
                code={CODE}
                codeRevealed={scratched}
                onPointsAwarded={data => setResult(data)}
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
                🏆 Loyalty Transaction — Data Captured &amp; Aggregated
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ["Channel",   result.channel === "whatsapp" ? "WhatsApp" : "SMS"],
                  ["Code",      result.code],
                  ["Points",    `+${result.points} pts`],
                  ["Balance",   `${result.balance.toLocaleString()} pts`],
                  ["Airtime",   result.airtime + " credited"],
                  ["Retailer",  "Emeka Okafor"],
                  ["Location",  "Aba, Abia State"],
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

        <LoyaltyAnalyticsDashboard />

        {/* ── Trade Partner Dashboard ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 text-xl mb-1">Trade Partner Dashboard</h2>
          <p className="text-sm text-gray-500 mb-4">Your view from HQ — thousands of retailers profiled automatically</p>

          <div className="space-y-3">
            {RETAILERS.map((r, i) => {
              const pts = i === 0 ? emekaPoints : r.basePoints;
              const pct = Math.min((pts / r.toGold) * 100, 100);
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => setSelected(i)}
                  className="rounded-xl border-2 cursor-pointer transition-all overflow-hidden"
                  style={{ borderColor: selected === i ? COLOR : "#f3f4f6" }}>

                  <div className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: selected === i ? COLOR : "#BE0303" }}>
                      {r.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.location} · {i === 0 && result ? r.cartons + 1 : r.cartons} cartons · {r.streak} streak</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <motion.p key={pts} className="font-black text-sm" style={{ color: COLOR }}>
                        {pts.toLocaleString()} pts
                      </motion.p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${tierColors[r.tier]}22`, color: tierColors[r.tier] }}>
                        {r.tier}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar row */}
                  <div className="px-4 pb-3">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Progress to {r.tier === "Gold" ? "Platinum" : "Gold"}</span>
                      <span className="font-semibold">{pts.toLocaleString()} / {r.toGold.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${COLOR}, #BE0303)` }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
