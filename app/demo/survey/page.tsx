"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import ScratchCard from "@/components/ScratchCard";
import SurveyPhoneEmulator, { SurveyMode, SurveyResult } from "@/components/SurveyPhoneEmulator";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/* ─── Survey Dashboard ──────────────────────────────────────────────────── */

const SV_DAILY = [
  { day: "Mon", responses: 1234, completed: 1089 },
  { day: "Tue", responses: 1567, completed: 1401 },
  { day: "Wed", responses: 1892, completed: 1703 },
  { day: "Thu", responses: 1723, completed: 1551 },
  { day: "Fri", responses: 2103, completed: 1893 },
  { day: "Sat", responses: 1834, completed: 1651 },
  { day: "Sun", responses: 1494, completed: 1345 },
];
const SV_Q1 = [
  { answer: "Quality",        count: 5398 },
  { answer: "Price",          count: 3602 },
  { answer: "Recommendation", count: 2574 },
  { answer: "Advertisement",  count: 1273 },
];
const SV_Q2 = [
  { answer: "Yes",   count: 9821 },
  { answer: "Maybe", count: 2103 },
  { answer: "No",    count:  923 },
];
const SV_Q3 = [
  { answer: "Extremely", count: 7234 },
  { answer: "Likely",    count: 4118 },
  { answer: "Not at all",count: 1495 },
];
const SV_STATES = [
  { state: "Lagos",         responses: 3820 },
  { state: "Abuja",         responses: 2310 },
  { state: "Kano",          responses: 1890 },
  { state: "Aba",           responses: 1540 },
  { state: "Port Harcourt", responses: 1287 },
];

function SVTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px" }}>
      <p style={{ margin: "0 0 4px", fontSize: 10, color: "#9ca3af", fontWeight: 700 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: "2px 0", fontSize: 11, fontWeight: 700, color: p.color }}>
          {p.name === "responses" ? "📊 Sent" : "✅ Completed"}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}
function SVBarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0D1B2A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px" }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "white" }}>{label}: {payload[0].value.toLocaleString()}</p>
    </div>
  );
}

function SurveyDashboard() {
  const COLOR = "#BE0303";
  const kpis = [
    { label: "Total Responses",  value: "12,847", delta: "+21.3%", icon: "📊", up: true  },
    { label: "NPS Score",        value: "72",      delta: "+4 pts", icon: "⭐", up: true  },
    { label: "Avg Completion",   value: "88 sec",  delta: "−6s",   icon: "⏱", up: true  },
    { label: "Reward Disbursed", value: "₦3.85M",  delta: "+21%",  icon: "💰", up: true  },
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
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "white" }}>Survey Intelligence</h2>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#4b5563" }}>Sproxil Survey™ · XYZ Brand · Last 7 days</p>
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
                <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "2px 7px", borderRadius: 9999 }}>{k.delta}</span>
              </div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: COLOR }}>{k.value}</p>
              <p style={{ margin: "3px 0 0", fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* NPS gauge + area chart side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, marginBottom: 24 }}>
          {/* NPS gauge */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "16px", border: "1px solid #f3f4f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5, textAlign: "center" }}>NPS Score</p>
            <div style={{ position: "relative", width: 110, height: 110 }}>
              <svg viewBox="0 0 110 110" width="110" height="110">
                <circle cx="55" cy="55" r="44" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <motion.circle cx="55" cy="55" r="44" fill="none" stroke={COLOR} strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 44}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - 0.72) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ transformOrigin: "55px 55px", transform: "rotate(-90deg)" }} />
                <text x="55" y="50" textAnchor="middle" fontSize="22" fontWeight="900" fill={COLOR}>72</text>
                <text x="55" y="65" textAnchor="middle" fontSize="9" fill="#9ca3af">out of 100</text>
              </svg>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {[["Promoters","62%","#16a34a"],["Passives","19%","#f59e0b"],["Detractors","19%","#dc2626"]].map(([l,v,c]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: c }}>{v}</p>
                  <p style={{ margin: 0, fontSize: 8, color: "#9ca3af" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Area chart */}
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Daily Response Volume</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={SV_DAILY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="svSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e5e7eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#e5e7eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="svComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={44} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
                <Tooltip content={<SVTooltip />} />
                <Area type="monotone" dataKey="responses" stroke="#d1d5db" strokeWidth={2} fill="url(#svSent)" />
                <Area type="monotone" dataKey="completed" stroke={COLOR} strokeWidth={2.5} fill="url(#svComp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Question breakdowns + states */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 180px", gap: 14 }}>
          {/* Q1 */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Purchase Motivation</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={SV_Q1} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="answer" type="category" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} width={88} />
                <Tooltip content={<SVBarTooltip />} />
                <Bar dataKey="count" fill={COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Q2 */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Price Satisfaction</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={SV_Q2} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="answer" type="category" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<SVBarTooltip />} />
                <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Q3 */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Recommendation Likelihood</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={SV_Q3} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="answer" type="category" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} width={66} />
                <Tooltip content={<SVBarTooltip />} />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* States */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, color: "#374151", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Top States</p>
            {SV_STATES.map((s, i) => (
              <div key={s.state} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#9ca3af", width: 12 }}>{i+1}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#374151", flex: 1 }}>{s.state}</span>
                <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: COLOR }}>{(s.responses/1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const COLOR = "#BE0303";
const CODE  = "SNG-7829-KXPQ";

const MODES: { id: SurveyMode; label: string; sub: string; icon: string }[] = [
  { id: "whatsapp", label: "WhatsApp Survey",  sub: "Verify via WhatsApp or SMS → survey continues as a WhatsApp bot", icon: "💬" },
  { id: "website",  label: "Website Survey",   sub: "Verify via WhatsApp or SMS → survey link opens in the phone browser", icon: "🌐" },
];

export default function SurveyDemo() {
  const [mode, setMode]           = useState<SurveyMode>("whatsapp");
  const [scratched, setScratched] = useState(false);
  const [result, setResult]       = useState<SurveyResult | null>(null);

  const switchMode = (m: SurveyMode) => { setMode(m); setScratched(false); setResult(null); };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-2" style={{ background: COLOR }} />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 text-xl mb-1">Live Simulation</h2>
          <p className="text-sm text-gray-500 mb-6">
            Scratch the label, verify via WhatsApp or SMS, then complete the survey through your chosen channel.
          </p>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Left panel ─────────────────────────────────────── */}
            <div className="flex-1 space-y-6">

              {/* Step 1: Survey channel */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0" style={{ background: COLOR }}>1</span>
                  <p className="font-semibold text-gray-800 text-sm">Choose how the survey is delivered</p>
                </div>
                <div className="flex flex-col gap-2">
                  {MODES.map((m) => (
                    <button key={m.id} onClick={() => switchMode(m.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${mode === m.id ? "border-[#BE0303] bg-orange-50" : "border-gray-200"}`}>
                      <span className="text-xl">{m.icon}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${mode === m.id ? "text-[#BE0303]" : "text-gray-600"}`}>{m.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
                      </div>
                      {mode === m.id && (
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="#BE0303" className="flex-shrink-0">
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
                <ScratchCard key={mode} code={CODE} onScratched={() => setScratched(true)} />
              </div>

              {/* Step 3: Instructions */}
              <AnimatePresence>
                {scratched && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0" style={{ background: COLOR }}>3</span>
                      <p className="font-semibold text-gray-800 text-sm">Complete the flow on the phone</p>
                    </div>
                    <div className="rounded-xl p-4 space-y-2 text-sm border" style={{ background: `${COLOR}08`, borderColor: `${COLOR}30`, color: "#7a3a20" }}>
                      <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: COLOR }}>Verify first</p>
                      <p>→ Unlock the phone and open <strong>WhatsApp</strong> or <strong>Messages</strong></p>
                      <p>→ Paste or type the code and send</p>
                      <p>→ You'll get a genuine ✅ response</p>
                      <div className="border-t my-2" style={{ borderColor: `${COLOR}30` }} />
                      <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: COLOR }}>Then the survey</p>
                      {mode === "whatsapp" && <>
                        <p>→ A survey invite appears — reply <strong>START</strong></p>
                        <p>→ If verifying via SMS, tap <strong>Open in WhatsApp →</strong></p>
                        <p>→ Answer the 3 questions in the chat</p>
                      </>}
                      {mode === "website" && <>
                        <p>→ A survey link appears in the response</p>
                        <p>→ Tap <strong>Open Survey →</strong> to open the browser</p>
                        <p>→ Fill the form and submit</p>
                      </>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Right panel: Phone ─────────────────────────────── */}
            <div className="w-full lg:w-auto flex flex-col items-center gap-4">
              <SurveyPhoneEmulator
                key={mode}
                mode={mode}
                prefillCode={CODE}
                codeRevealed={scratched}
                onSurveyComplete={(data) => setResult(data)}
              />
              <p className="text-xs text-gray-400 text-center max-w-xs">
                Unlock → open WhatsApp or Messages → verify → follow the survey link
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
                Survey Response — Recorded &amp; Aggregated
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ["Survey Channel", result.mode === "whatsapp" ? "WhatsApp Bot" : "Website Form"],
                  ["Satisfaction", result.satisfaction],
                  ["Purchase Point", result.purchase],
                  ["Recommend", result.recommend],
                  ["PIN", CODE],
                  ["Reward", "₦500 airtime draw entered"],
                  ["Timestamp", new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })],
                  ["Status", "Aggregated to dashboard"],
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

        <SurveyDashboard />

      </div>
    </div>
  );
}
