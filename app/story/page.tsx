"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import PhoneSimulator from "@/components/PhoneSimulator";
import ScratchCard from "@/components/ScratchCard";
import TrackMapPhase from "@/components/TrackMapPhase";

const APP_RED  = "#BE0303";
const APP_DARK = "#0D1B2A";

/* ─── Message data ────────────────────────────────────────────────────────── */

const verifyMessages = [
  { from: "user" as const, text: "SNG-7829-KXPQ", delay: 0.5 },
  {
    from: "system" as const,
    text: "✅ GENUINE — Thank you for buying this product!\n\nThis product was manufactured by XYZ Brand and is authentic.\n\nSproxil Verify™",
    delay: 1.8,
  },
];

const promoMessages = [
  { from: "user" as const, text: "SNG-7829-KXPQ", delay: 0 },
  {
    from: "system" as const,
    text: "✅ GENUINE — Thank you for buying this product!\n\nSproxil Verify™",
    delay: 1.2,
  },
  {
    from: "system" as const,
    text: "🎉 Congratulations! You've won ₦200 Airtime in the XYZ Brand Promo!\n\nKeep buying to win more fantastic prizes.",
    delay: 2.8,
  },
];

/* ─── Survey ──────────────────────────────────────────────────────────────── */

const surveyQuestions = [
  { q: "What motivated your purchase?", options: ["Price", "Quality", "Advertisement", "Recommendation"] },
  { q: "Are you satisfied with the price paid?", options: ["Yes", "No", "Maybe"] },
  { q: "How likely are you to recommend this product?", options: ["Extremely", "Likely", "Not at all"] },
];

function SurveyFlow({ onComplete, onAnswer }: { onComplete: () => void; onAnswer?: (q: string, a: string) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const pick = (opt: string) => {
    onAnswer?.(surveyQuestions[step].q, opt);
    const next = [...answers, opt];
    setAnswers(next);
    if (step < surveyQuestions.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
      onComplete();
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-bold text-green-800 text-lg mb-1">Survey Complete!</h3>
        <p className="text-green-700 text-sm mb-2">Chidinma answered in under 90 seconds</p>
        <div className="bg-green-100 rounded-xl px-4 py-2 inline-block">
          <p className="text-green-800 font-bold text-sm">✅ ₦300 airtime sent to 080****4521</p>
        </div>
      </motion.div>
    );
  }

  const q = surveyQuestions[step];
  return (
    <div className="space-y-4">
      <div className="flex gap-1 mb-4">
        {surveyQuestions.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ background: i <= step ? APP_RED : "#e5e7eb" }} />
        ))}
      </div>
      <p className="text-xs text-gray-500">Question {step + 1} of {surveyQuestions.length}</p>
      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          <p className="font-semibold text-gray-800 mb-4 text-base">{q.q}</p>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt) => (
              <button key={opt} onClick={() => pick(opt)}
                className="border-2 border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:border-[#BE0303] hover:bg-[#BE0303]/5 hover:text-[#BE0303] transition-all cursor-pointer">
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Track simulation phone + map ───────────────────────────────────────── */

const STORY_STEPS = [
  { id: "commission", label: "Commission Labels", icon: "⚡", desc: "Warehouse staff scan unit labels to activate them",     scans: 3, duration: 3000, dest: "" },
  { id: "pack",       label: "Pack Products",     icon: "📦", desc: "Commissioned labels packed into carton, SSCC applied", scans: 2, duration: 2500, dest: "" },
  { id: "ship",       label: "Ship Package",      icon: "🚚", desc: "Carton scanned out of Lagos — route to Onitsha",       scans: 1, duration: 2200, dest: "Onitsha — Main Market Depot" },
  { id: "receive",    label: "Receive Package",   icon: "📬", desc: "Onitsha distributor scans incoming carton",            scans: 1, duration: 2000, dest: "" },
  { id: "unpack",     label: "Unpack Package",    icon: "📤", desc: "Case opened, unit items scanned out",                 scans: 2, duration: 2500, dest: "" },
  { id: "dispense",   label: "Dispense",          icon: "💊", desc: "Individual items dispensed to Emeka's pharmacy",      scans: 2, duration: 2500, dest: "" },
  { id: "verify",     label: "Verify Package",    icon: "✅", desc: "Full chain-of-custody verified — authentic",          scans: 2, duration: 2800, dest: "" },
];

function StoryTrackPhone({ stepIdx, scanCount, completedSteps }: {
  stepIdx: number; scanCount: number; completedSteps: Set<string>;
}) {
  const cur        = stepIdx >= 0 && stepIdx < STORY_STEPS.length ? STORY_STEPS[stepIdx] : null;
  const isScanning = cur !== null && scanCount < cur.scans;
  const isDone     = cur !== null && scanCount >= cur.scans;

  return (
    <div style={{
      width: 248, background: APP_DARK, borderRadius: 36, overflow: "hidden",
      boxShadow: "0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
      border: "6px solid #1a2535", flexShrink: 0,
    }}>
      {/* App header */}
      <div style={{ background: APP_RED, padding: "12px 14px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: 0, fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.75)", letterSpacing: 1.8, textTransform: "uppercase" }}>Sproxil Track™</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 700, color: "white" }}>Panadol Extra 500mg</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 9, fontWeight: 800, color: "white" }}>{completedSteps.size}<span style={{ opacity: 0.6 }}>/7</span></p>
          <p style={{ margin: 0, fontSize: 8, color: "rgba(255,255,255,0.6)" }}>steps done</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: "#f3f4f6", minHeight: 360 }}>
        {/* Home — workflow menu */}
        {!cur && (
          <div style={{ padding: "10px 8px" }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px 4px" }}>Workflow</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {STORY_STEPS.map(s => {
                const done = completedSteps.has(s.id);
                return (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                    borderRadius: 9, background: done ? `${APP_RED}12` : "white",
                    border: `1px solid ${done ? `${APP_RED}25` : "#ebebeb"}`,
                  }}>
                    <span style={{ fontSize: 14 }}>{s.icon}</span>
                    <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: done ? APP_RED : "#374151" }}>{s.label}</span>
                    {done && <span style={{ fontSize: 10, fontWeight: 900, color: APP_RED }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active step */}
        {cur && (
          <AnimatePresence mode="wait">
            <motion.div key={cur.id}
              initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.25 }}
              style={{ padding: 12 }}>
              {/* Step header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: APP_RED, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                  {cur.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#111" }}>{cur.label}</p>
                  <p style={{ margin: 0, fontSize: 9, color: "#9ca3af", lineHeight: 1.3 }}>{cur.desc}</p>
                </div>
              </div>

              {/* Barcode / scan area */}
              <div style={{
                background: "white", borderRadius: 10, padding: "14px 10px 10px",
                border: `1.5px solid ${isScanning ? "rgba(239,68,68,0.3)" : "#f3f4f6"}`,
                position: "relative", overflow: "hidden", marginBottom: 10, transition: "border-color 0.2s",
              }}>
                <div style={{ display: "flex", gap: 2, justifyContent: "center", marginBottom: 6 }}>
                  {[3,1,2,1,4,1,2,1,3,1,2,1,4,1,2].map((w, i) => (
                    <div key={i} style={{ width: w * 2.2, height: 38, background: "#1a1a1a", borderRadius: 1 }} />
                  ))}
                </div>
                <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af", textAlign: "center", margin: 0 }}>(00) 39000232900000001</p>
                {isScanning && (
                  <motion.div initial={{ top: 4 }} animate={{ top: "calc(100% - 4px)" }}
                    transition={{ duration: 0.55, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                    style={{ position: "absolute", left: 8, right: 8, height: 2, background: "rgba(239,68,68,0.85)", boxShadow: "0 0 8px rgba(239,68,68,0.6)" }} />
                )}
                {isDone && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ position: "absolute", inset: 0, background: `${APP_RED}0e`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 32 }}>✅</span>
                  </motion.div>
                )}
              </div>

              {/* Progress dots */}
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 8 }}>
                {Array.from({ length: cur.scans }).map((_, i) => (
                  <motion.div key={i} animate={{ scale: i === scanCount - 1 ? [1, 1.5, 1] : 1 }} transition={{ duration: 0.25 }}
                    style={{ width: 8, height: 8, borderRadius: "50%", background: i < scanCount ? APP_RED : "#e5e7eb" }} />
                ))}
              </div>

              {/* Status chip */}
              <div style={{
                textAlign: "center", padding: "7px 10px", borderRadius: 8,
                background: isDone ? `${APP_RED}10` : "#f9fafb",
                border: `1px solid ${isDone ? `${APP_RED}25` : "#ebebeb"}`,
              }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: isDone ? APP_RED : "#6b7280" }}>
                  {isDone ? `✓ ${cur.label} Complete` : isScanning ? `Scanning… ${scanCount}/${cur.scans}` : "Ready to scan"}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ background: APP_DARK, padding: "8px 16px 14px", display: "flex", justifyContent: "space-around" }}>
        {(["🏠","📊","👤"] as const).map((icon, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 15 }}>{icon}</span>
            <div style={{ width: i === 0 ? 16 : 4, height: 2, borderRadius: 1, background: i === 0 ? APP_RED : "rgba(255,255,255,0.2)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AutoTrackSimulation({ running, onEvent }: {
  running: boolean;
  onEvent?: (icon: string, text: string, sub: string) => void;
}) {
  const [stepIdx, setStepIdx]                 = useState(-1);
  const [scanCount, setScanCount]             = useState(0);
  const [completedSteps, setCompletedSteps]   = useState<Set<string>>(new Set());
  const [shipDestination, setShipDestination] = useState("");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setStepIdx(-1); setScanCount(0);
    setCompletedSteps(new Set()); setShipDestination("");
    if (!running) return;

    let elapsed = 1200;
    STORY_STEPS.forEach((step, idx) => {
      timersRef.current.push(setTimeout(() => { setStepIdx(idx); setScanCount(0); }, elapsed));
      for (let i = 1; i <= step.scans; i++) {
        timersRef.current.push(setTimeout(() => setScanCount(i), elapsed + i * 700));
      }
      const completeAt = elapsed + step.duration;
      timersRef.current.push(setTimeout(() => {
        if (step.dest) setShipDestination(step.dest);
        setCompletedSteps(prev => new Set([...prev, step.id]));
        onEvent?.(step.icon, step.label + " — Complete", `Step ${idx + 1}/7 · Lagos → Onitsha`);
      }, completeAt));
      elapsed = completeAt + 350;
    });
    timersRef.current.push(setTimeout(() => setStepIdx(-1), elapsed + 400));
    return () => timersRef.current.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      <StoryTrackPhone stepIdx={stepIdx} scanCount={scanCount} completedSteps={completedSteps} />
      <div style={{ flex: 1, minWidth: 280, borderRadius: 16, overflow: "hidden", border: "1px solid #f3f4f6", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <TrackMapPhase
          completedSteps={completedSteps}
          shipDestination={shipDestination}
          sscc="39000232900000001"
          productName="Panadol Extra 500mg × 12"
          batchLot="L213050-A"
        />
      </div>
    </div>
  );
}

/* ─── CRM capture ─────────────────────────────────────────────────────────── */

function CRMCapture() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3 }}
      className="bg-[#0D1B2A] rounded-2xl p-5 text-white">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">CRM Data Auto-Captured</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          ["Phone", "080****4521"], ["Location", "Aba, Abia State"],
          ["SKU", "XYZ-500ML"],    ["Time", "14:32:07"],
          ["Channel", "WhatsApp"], ["Result", "Genuine ✓"],
        ].map(([k, v]) => (
          <div key={k} className="bg-white/5 rounded-lg px-3 py-2">
            <p className="text-gray-400 text-[10px] uppercase font-semibold">{k}</p>
            <p className="text-white font-medium text-xs mt-0.5">{v}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Retailer Profile ────────────────────────────────────────────────────── */

function RetailerProfile({ scratched }: { scratched: boolean }) {
  const points = 1250;
  const max    = 1500;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: scratched ? 1 : 0 }} transition={{ duration: 0.5 }}
      className="space-y-4 mt-4">
      {scratched && (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-xs text-purple-500 font-bold uppercase mb-2">Reward Received</p>
            <p className="font-black text-purple-800 text-xl">+₦150 Airtime</p>
            <p className="text-xs text-purple-600 mt-1">Credited instantly · No rep visit required</p>
          </motion.div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-black text-sm">EO</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Emeka Okafor</p>
                <p className="text-xs text-gray-500">Aba, Abia State</p>
              </div>
              <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">Silver</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              {[["Total Points","1,250"],["Cartons Purchased","8"],["Rewards Earned","₦1,200"],["Engagement Streak","4 weeks"]].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-gray-400 text-[10px] font-semibold uppercase">{k}</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Points to next reward</span>
                <span className="font-bold text-purple-700">{points}/{max}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(points / max) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-purple-600 rounded-full" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{max - points} points to Gold tier + ₦2,000 cash prize</p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

/* ─── Mini Dashboard ──────────────────────────────────────────────────────── */

function MiniDashboard({ show }: { show: boolean }) {
  const [count, setCount] = useState(1247);
  useEffect(() => {
    if (!show) return;
    const i = setInterval(() => setCount(c => c + Math.floor(Math.random() * 3) + 1), 2000);
    return () => clearInterval(i);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#0D1B2A] rounded-2xl p-5 mt-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">Live Campaign Dashboard</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Total Today", value: count.toLocaleString() },
              { label: "Winners Sent", value: "312" },
              { label: "Flagged", value: "49" },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="font-black text-xl" style={{ color: APP_RED }}>{s.value}</p>
                <p className="text-gray-400 text-[10px] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {["Lagos · XYZ-500ML · Genuine · 14:32", "Kano · XYZ-250ML · Genuine · 14:31", "Aba · XYZ-500ML · Genuine · 14:32"].map((entry, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.3 }}
                className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 rounded-lg px-3 py-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                {entry}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Verify result panel ─────────────────────────────────────────────────── */

function VerifyResultPanel() {
  const [phase, setPhase] = useState<"loading" | "done">("loading");
  useEffect(() => {
    const t = setTimeout(() => setPhase("done"), 2200);
    return () => clearTimeout(t);
  }, []);

  if (phase === "loading") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", color: "#9ca3af" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ width: 32, height: 32, border: `3px solid #f3f4f6`, borderTopColor: APP_RED, borderRadius: "50%", marginBottom: 12 }} />
        <p style={{ fontSize: 12, margin: 0 }}>Checking authenticity…</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}
          style={{ width: 44, height: 44, background: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "white", fontSize: 20, fontWeight: 900 }}>✓</span>
        </motion.div>
        <div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#15803d" }}>GENUINE</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#16a34a", fontWeight: 600 }}>Sproxil Verify™ confirmed</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[["Product","Panadol Extra 500mg"],["Manufacturer","XYZ Brand"],["Code","SNG-7829-KXPQ"],["Verified at","14:32:07"]].map(([k, v]) => (
          <div key={k} style={{ background: "white", borderRadius: 8, padding: "8px 12px" }}>
            <p style={{ margin: 0, fontSize: 9, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 700, color: "#111" }}>{v}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(22,163,74,0.08)", borderRadius: 9, border: "1px solid rgba(22,163,74,0.2)" }}>
        <p style={{ margin: 0, fontSize: 10, color: "#15803d", fontWeight: 700 }}>
          📱 Reply sent to 080****4521 · response time: 1.4 s
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Live event feed ─────────────────────────────────────────────────────── */

interface LiveEvent {
  id: number;
  icon: string;
  text: string;
  sub: string;
  ts: string;
}

function LiveFeed({ events }: { events: LiveEvent[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}
          style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#111", textTransform: "uppercase", letterSpacing: 1 }}>Live Events</p>
        {events.length > 0 && (
          <span style={{ marginLeft: "auto", fontSize: 10, background: `${APP_RED}12`, color: APP_RED, fontWeight: 700, padding: "2px 7px", borderRadius: 9999 }}>
            {events.length}
          </span>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {events.length === 0 ? (
          <div style={{ padding: "28px 8px", textAlign: "center" }}>
            <p style={{ fontSize: 22, margin: "0 0 8px" }}>📡</p>
            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>
              Events will stream here<br />as the demo runs
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map(ev => (
              <motion.div key={ev.id}
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22 }}
                style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 8px", marginBottom: 5, borderRadius: 8, background: "#fafafa", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1.4 }}>{ev.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#111", lineHeight: 1.3 }}>{ev.text}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ev.sub} · {ev.ts}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/* ─── Scenario card wrapper ───────────────────────────────────────────────── */

function ScenarioCard({ label, title, sub, extra, children }: {
  label: string; title: string; sub: string;
  extra?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: APP_RED, textTransform: "uppercase", letterSpacing: 1 }}>{label}</p>
          <p style={{ margin: "3px 0 0", fontSize: 17, fontWeight: 900, color: "#111" }}>{title}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>{sub}</p>
        </div>
        {extra}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

/* ─── Scenarios config ────────────────────────────────────────────────────── */

const SCENARIOS = [
  { id: 1, label: "Track™",   icon: "🚚", sub: "Supply Chain"    },
  { id: 2, label: "Verify™",  icon: "✅", sub: "Authentication"  },
  { id: 3, label: "Promo™",   icon: "🎉", sub: "Engagement"      },
  { id: 4, label: "Loyalty™", icon: "⭐", sub: "Retailer Loyalty" },
  { id: 5, label: "Survey™",  icon: "📊", sub: "Consumer Insights"},
];

/* ─── Main Page ───────────────────────────────────────────────────────────── */

export default function StoryPage() {
  const [scenario, setScenario]   = useState(1);
  const [trackKey, setTrackKey]   = useState(0);
  const [trackRunning, setTrackRunning] = useState(true);
  const [scratched, setScratched] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);
  const [events, setEvents]       = useState<LiveEvent[]>([]);
  const evIdRef = useRef(0);

  const addEvent = (icon: string, text: string, sub = "") => {
    const ts = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    evIdRef.current++;
    setEvents(prev => [{ id: evIdRef.current, icon, text, sub, ts }, ...prev].slice(0, 30));
  };

  const replayTrack = () => {
    setTrackRunning(false);
    setTimeout(() => { setTrackKey(k => k + 1); setTrackRunning(true); }, 80);
  };

  const goTo = (s: number) => {
    setScenario(s);
    if (s === 1) replayTrack();
    const sc = SCENARIOS[s - 1];
    addEvent(sc.icon, `${sc.label} scenario — started`, sc.sub);
  };

  // Fire events when Verify / Promo scenarios mount
  useEffect(() => {
    if (scenario === 2) {
      const t1 = setTimeout(() => addEvent("📱", "Code received: SNG-7829-KXPQ", "WhatsApp · Chidinma"), 700);
      const t2 = setTimeout(() => addEvent("✅", "GENUINE — XYZ Brand confirmed", "Sproxil Verify™ · 1.4 s response"), 2400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (scenario === 3) {
      const t1 = setTimeout(() => addEvent("📱", "Code received: SNG-7829-KXPQ", "WhatsApp · Chidinma"), 200);
      const t2 = setTimeout(() => addEvent("✅", "GENUINE confirmed", "Sproxil Verify™"), 1500);
      const t3 = setTimeout(() => addEvent("🎉", "Promo win: ₦200 airtime", "Chidinma · 080****4521"), 3200);
      const t4 = setTimeout(() => addEvent("📊", "CRM profile captured", "Aba, Abia State · 14:32:07"), 3900);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Dark header + horizontal stepper ─────────────────────────────── */}
      <div style={{ background: APP_DARK }}>
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", letterSpacing: 1.5, textTransform: "uppercase" }}>Live Demo</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "white", margin: 0 }}>The Complete Sproxil Story</h1>
            <p style={{ fontSize: 12, color: "#4b5563", margin: "3px 0 0" }}>
              Track™ · Verify™ · Promo™ · Loyalty™ · Survey™ — one platform, one story
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {/* Characters */}
            <div style={{ display: "flex", gap: 8 }}>
              {[["EO", "Emeka", "Retailer · Aba"], ["CD", "Chidinma", "Consumer · Aba"]].map(([init, name, role]) => (
                <div key={init} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "rgba(255,255,255,0.07)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: APP_RED, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 900, flexShrink: 0 }}>{init}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{name}</p>
                    <p style={{ margin: 0, fontSize: 9, color: "#6b7280" }}>{role}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => goTo(1)}
              style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              ↺ Restart
            </button>
          </div>
        </div>

        {/* Product stepper */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-7xl mx-auto px-4">
            <div style={{ display: "flex" }}>
              {SCENARIOS.map((sc, i) => {
                const active = scenario === sc.id;
                const done   = scenario > sc.id;
                return (
                  <button key={sc.id} onClick={() => goTo(sc.id)}
                    style={{
                      flex: 1, padding: "11px 4px 9px",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      background: active ? "rgba(190,3,3,0.14)" : "transparent",
                      border: "none", cursor: "pointer",
                      borderBottom: `3px solid ${active ? APP_RED : "transparent"}`,
                      borderRight: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      transition: "background 0.2s",
                    }}>
                    <span style={{ fontSize: 16 }}>{sc.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: active ? 800 : 600, color: active ? "white" : done ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.28)" }}>
                      {sc.label}
                    </span>
                    {done
                      ? <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 800 }}>✓ done</span>
                      : <span style={{ fontSize: 9, color: active ? "#9ca3af" : "rgba(255,255,255,0.2)" }}>{sc.sub}</span>
                    }
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

          {/* Scenario content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <AnimatePresence mode="wait">

              {/* ── SCENARIO 1: TRACK ──────────────────────────────────── */}
              {scenario === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
                  className="space-y-5">
                  <ScenarioCard
                    label="Sproxil Track™"
                    title="Live Supply Chain Simulation"
                    sub="Emeka's carton travels Lagos → Onitsha — watch every scan in real time"
                    extra={
                      <button onClick={replayTrack}
                        style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${APP_RED}30`, color: APP_RED, background: `${APP_RED}08`, fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                        ↺ Replay
                      </button>
                    }
                  >
                    <AutoTrackSimulation key={trackKey} running={trackRunning} onEvent={addEvent} />
                  </ScenarioCard>
                </motion.div>
              )}

              {/* ── SCENARIO 2: VERIFY ─────────────────────────────────── */}
              {scenario === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                  <ScenarioCard
                    label="Sproxil Verify™"
                    title="Consumer Authentication — Live"
                    sub="Chidinma scratches the label and texts the code via WhatsApp — genuine in seconds">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <PhoneSimulator messages={verifyMessages} />
                      <VerifyResultPanel />
                    </div>
                  </ScenarioCard>
                </motion.div>
              )}

              {/* ── SCENARIO 3: PROMO ──────────────────────────────────── */}
              {scenario === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                  <ScenarioCard
                    label="Sproxil Promo™"
                    title="Consumer Engagement — Live"
                    sub="Chidinma wins ₦200 airtime — CRM data captured automatically at the point of verification">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <PhoneSimulator messages={promoMessages} />
                      <div>
                        <CRMCapture />
                        <MiniDashboard show={true} />
                      </div>
                    </div>
                  </ScenarioCard>
                </motion.div>
              )}

              {/* ── SCENARIO 4: LOYALTY ────────────────────────────────── */}
              {scenario === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                  <ScenarioCard
                    label="Sproxil Loyalty™"
                    title="Retailer Loyalty Program — Live"
                    sub="Emeka scratches the loyalty coupon inside his carton — ₦150 airtime, no rep visit needed">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: APP_RED }}>
                          Step 1 — Scratch the coupon
                        </p>
                        <ScratchCard
                          code="LYL-4821-MNVX"
                          onScratched={() => {
                            setScratched(true);
                            addEvent("⭐", "Loyalty coupon redeemed — LYL-4821-MNVX", "Emeka Okafor · Aba, Abia State");
                            addEvent("💰", "₦150 airtime sent instantly", "to 080****7732 · no rep required");
                          }}
                        />
                      </div>
                      <RetailerProfile scratched={scratched} />
                    </div>
                  </ScenarioCard>
                </motion.div>
              )}

              {/* ── SCENARIO 5: SURVEY ─────────────────────────────────── */}
              {scenario === 5 && (
                <motion.div key="s5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
                  className="space-y-5">
                  <ScenarioCard
                    label="Sproxil Survey™"
                    title="Real-Time Market Insights — Live"
                    sub="Chidinma answers 3 questions in 90 seconds — ₦300 airtime, statistically significant data">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: APP_RED }}>
                          Step 1 — Answer the survey
                        </p>
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: APP_RED }}>
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">XYZ Brand Survey</p>
                              <p className="text-xs text-gray-400">Earn ₦300 airtime on completion</p>
                            </div>
                          </div>
                          <SurveyFlow
                            onComplete={() => {
                              setSurveyDone(true);
                              addEvent("📊", "Survey completed — 3/3 questions answered", "Chidinma · Aba, Abia State");
                              addEvent("💰", "₦300 airtime sent to 080****4521", "Survey reward · instant disbursement");
                            }}
                            onAnswer={(q, a) => addEvent("📝", `"${a}" — ${q.substring(0, 32)}…`, "Survey response")}
                          />
                        </div>
                      </div>

                      {/* Live insights */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: APP_RED }}>
                          Step 2 — Live insights dashboard
                        </p>
                        <div className="bg-[#0D1B2A] rounded-2xl p-5 text-white space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { l: "Responses Today", v: surveyDone ? "1,248" : "1,247" },
                              { l: "Avg Completion",  v: "88 sec"  },
                              { l: "NPS Score",       v: "72"      },
                              { l: "Satisfied",       v: "91%"     },
                            ].map(s => (
                              <div key={s.l} className="bg-white/5 rounded-xl p-3">
                                <p className="font-black text-xl" style={{ color: APP_RED }}>{s.v}</p>
                                <p className="text-gray-400 text-[10px] mt-0.5">{s.l}</p>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Purchase Motivation</p>
                            {[
                              { l: "Quality", pct: 42 }, { l: "Price", pct: 28 },
                              { l: "Recommendation", pct: 20 }, { l: "Advertisement", pct: 10 },
                            ].map(b => (
                              <div key={b.l} className="flex items-center gap-2 mb-2">
                                <p className="text-xs text-gray-400 w-28">{b.l}</p>
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${b.pct}%` }}
                                    transition={{ duration: 1, delay: 0.2 }} className="h-full rounded-full"
                                    style={{ background: APP_RED }} />
                                </div>
                                <p className="text-xs font-bold text-white w-8">{b.pct}%</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScenarioCard>

                  {/* Final summary — shown when survey is done */}
                  {surveyDone && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="bg-[#0D1B2A] rounded-2xl p-6 text-white">
                      <h3 className="font-black text-xl mb-2">The Complete Picture</h3>
                      <p className="text-gray-400 text-sm mb-5 italic">
                        "That's not five products. That's one platform — and every touchpoint works with the others, or independently."
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                          { label: "Track",   sub: "Supply Chain Visibility"  },
                          { label: "Verify",  sub: "Consumer Trust"           },
                          { label: "Promo",   sub: "Engagement & CRM"         },
                          { label: "Loyalty", sub: "Trade Partner Loyalty"    },
                          { label: "Survey",  sub: "Real-Time Insights"       },
                        ].map(p => (
                          <div key={p.label} className="text-center">
                            <div className="rounded-xl py-2 px-2 mb-2 text-white font-black text-sm" style={{ background: APP_RED }}>
                              {p.label}
                            </div>
                            <p className="text-[10px] text-gray-400 leading-tight">{p.sub}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            {/* ── Scenario navigation ──────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              {scenario > 1 ? (
                <button onClick={() => goTo(scenario - 1)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 cursor-pointer transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {SCENARIOS[scenario - 2].label}
                </button>
              ) : <div />}

              {scenario < 5 && (
                <button onClick={() => goTo(scenario + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all"
                  style={{ background: APP_RED }}>
                  Continue: {SCENARIOS[scenario].label}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* ── Live event feed (sticky right panel) ────────────────── */}
          <div style={{
            width: 240, flexShrink: 0,
            background: "white", borderRadius: 16,
            border: "1px solid #f3f4f6",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            position: "sticky", top: 80,
            maxHeight: "calc(100vh - 100px)",
            overflow: "hidden", display: "flex", flexDirection: "column",
          }}>
            <LiveFeed events={events} />
          </div>

        </div>
      </div>
    </div>
  );
}
