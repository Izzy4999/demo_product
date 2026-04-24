"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import PhoneSimulator from "@/components/PhoneSimulator";
import ScratchCard from "@/components/ScratchCard";
import StepFlow from "@/components/StepFlow";
import NarratorBox from "@/components/NarratorBox";

/* ─── Phase data ──────────────────────────────────────────────── */
const phases = [
  { id: 1, label: "Authentication", tag: "Track + Verify", color: "#BE0303" },
  { id: 2, label: "Engagement", tag: "Promo", color: "#BE0303" },
  { id: 3, label: "Loyalty", tag: "Loyalty", color: "#BE0303" },
  { id: 4, label: "Insights", tag: "Survey", color: "#BE0303" },
];

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

const supplySteps = [
  { label: "Factory (Lagos)", color: "#0D1B2A" },
  { label: "Distributor", color: "#BE0303" },
  { label: "Retail Scan", color: "#BE0303" },
  { label: "Consumer Verifies", color: "#BE0303" },
  { label: "Genuine ✓", color: "#BE0303" },
];

const loyaltySteps = [
  { label: "Carton Packed", color: "#0D1B2A" },
  { label: "Coupon Included", color: "#BE0303" },
  { label: "Retailer Scratches", color: "#BE0303" },
  { label: "Points Earned", color: "#BE0303" },
  { label: "Profile Built", color: "#BE0303" },
];

/* ─── Survey component ────────────────────────────────────────── */
const surveyQuestions = [
  {
    q: "What motivated your purchase?",
    options: ["Price", "Quality", "Advertisement", "Recommendation"],
  },
  { q: "Are you satisfied with the price paid?", options: ["Yes", "No", "Maybe"] },
  { q: "How likely are you to recommend this product?", options: ["Extremely", "Likely", "Not at all"] },
];

function SurveyFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const pick = (opt: string) => {
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center"
      >
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
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ background: i <= step ? "#BE0303" : "#e5e7eb" }}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">Question {step + 1} of {surveyQuestions.length}</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <p className="font-semibold text-gray-800 mb-4 text-base">{q.q}</p>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => pick(opt)}
                className="border-2 border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:border-[#BE0303] hover:bg-[#BE0303]/5 hover:text-[#BE0303] transition-all cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Supply Chain Map ────────────────────────────────────────── */
function SupplyChainMap() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (active < 2) {
      const t = setTimeout(() => setActive((a) => a + 1), 1200);
      return () => clearTimeout(t);
    }
  }, [active]);

  const nodes = [
    { label: "Factory", sub: "Lagos", icon: "🏭" },
    { label: "Distributor", sub: "Onitsha", icon: "🚚" },
    { label: "Emeka's Shop", sub: "Aba", icon: "🏪" },
  ];

  return (
    <div className="bg-[#0D1B2A] rounded-2xl p-6 text-white">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-semibold">Sproxil Track™ — Live Supply Chain</p>
      <div className="flex items-center justify-between gap-2">
        {nodes.map((n, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center flex-1">
              <motion.div
                animate={i <= active ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.5, delay: i * 1.2 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                  i <= active ? "bg-green-500 shadow-lg shadow-green-500/30" : "bg-gray-700"
                }`}
              >
                {n.icon}
              </motion.div>
              <p className="text-xs font-semibold mt-2 text-center">{n.label}</p>
              <p className="text-[10px] text-gray-400 text-center">{n.sub}</p>
              {i <= active && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-1 bg-green-500/20 text-green-400 text-[9px] px-2 py-0.5 rounded-full font-bold"
                >
                  SCANNED ✓
                </motion.div>
              )}
            </div>
            {i < nodes.length - 1 && (
              <div className="flex-shrink-0 flex items-center">
                <div className={`h-0.5 w-8 transition-colors duration-700 ${i < active ? "bg-green-500" : "bg-gray-600"}`} />
                <motion.div
                  animate={i < active ? { x: [0, 4, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className={`text-sm ${i < active ? "text-green-500" : "text-gray-600"}`}
                >
                  ›
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </div>
      {active >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center"
        >
          <p className="text-green-400 text-sm font-bold">Carton arrived at Emeka's Shop ✓</p>
          <p className="text-gray-400 text-xs">Batch L213050 · Verified from authorised supply chain</p>
        </motion.div>
      )}
    </div>
  );
}

/* ─── CRM Capture Panel ───────────────────────────────────────── */
function CRMCapture() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3 }}
      className="bg-[#0D1B2A] rounded-2xl p-5 text-white mt-4"
    >
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">CRM Data Auto-Captured</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          ["Phone", "080****4521"],
          ["Location", "Aba, Abia State"],
          ["SKU", "XYZ-500ML"],
          ["Time", "14:32:07"],
          ["Channel", "WhatsApp"],
          ["Result", "Genuine ✓"],
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

/* ─── Retailer Loyalty Panel ──────────────────────────────────── */
function RetailerProfile({ scratched }: { scratched: boolean }) {
  const points = 1250;
  const max = 1500;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: scratched ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 mt-4"
    >
      {scratched && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-50 border border-purple-200 rounded-xl p-4"
          >
            <p className="text-xs text-purple-500 font-bold uppercase mb-2">Reward Received</p>
            <p className="font-black text-purple-800 text-xl">+₦150 Airtime</p>
            <p className="text-xs text-purple-600 mt-1">Credited instantly · No rep visit required</p>
          </motion.div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-black text-sm">
                EO
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Emeka Okafor</p>
                <p className="text-xs text-gray-500">Aba, Abia State</p>
              </div>
              <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                Silver
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              {[
                ["Total Points", "1,250"],
                ["Cartons Purchased", "8"],
                ["Rewards Earned", "₦1,200"],
                ["Engagement Streak", "4 weeks"],
              ].map(([k, v]) => (
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
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(points / max) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-purple-600 rounded-full"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{max - points} points to Gold tier + ₦2,000 cash prize</p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

/* ─── Dashboard Mini ──────────────────────────────────────────── */
function MiniDashboard({ show }: { show: boolean }) {
  const [count, setCount] = useState(1247);
  useEffect(() => {
    if (!show) return;
    const i = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 3) + 1), 2000);
    return () => clearInterval(i);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0D1B2A] rounded-2xl p-5 mt-4"
        >
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">Live Campaign Dashboard</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Total Today", value: count.toLocaleString(), color: "#BE0303" },
              { label: "Winners Sent", value: "312", color: "#BE0303" },
              { label: "Flagged", value: "49", color: "#BE0303" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-gray-400 text-[10px] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {["Lagos · XYZ-500ML · Genuine · 14:32", "Kano · XYZ-250ML · Genuine · 14:31", "Aba · XYZ-500ML · Genuine · 14:32"].map(
              (entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 rounded-lg px-3 py-2"
                >
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  {entry}
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function StoryPage() {
  const [phase, setPhase] = useState(1);
  const [scratched, setScratched] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);

  const goNext = () => setPhase((p) => Math.min(p + 1, 4));
  const goPrev = () => setPhase((p) => Math.max(p - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-[#0D1B2A] text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-semibold">Cross-Product Demo</p>
          <h1 className="text-2xl font-black">The Complete Sproxil Story</h1>
          <p className="text-gray-400 text-sm mt-1">Authentication → Engagement → Loyalty → Insights</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-20">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Demo Phases</p>
            <div className="space-y-2">
              {phases.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPhase(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    phase === p.id
                      ? "text-white font-bold shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                  style={phase === p.id ? { background: p.color } : {}}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        phase === p.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {p.id}
                    </span>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{p.label}</p>
                      <p className={`text-[10px] ${phase === p.id ? "text-white/70" : "text-gray-400"}`}>{p.tag}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <p className="text-xs text-gray-400 mb-2 font-semibold">Characters</p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#BE0303] rounded-full flex items-center justify-center text-white font-bold text-[10px]">EO</div>
                  <div><p className="font-semibold">Emeka Okafor</p><p className="text-gray-400">Retailer · Aba</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#BE0303] rounded-full flex items-center justify-center text-white font-bold text-[10px]">CD</div>
                  <div><p className="font-semibold">Chidinma</p><p className="text-gray-400">Consumer · Aba</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* ── PHASE 1 ────────────────────────────────────────── */}
            {phase === 1 && (
              <motion.div
                key="phase1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#BE0303] flex items-center justify-center text-white font-black">1</div>
                    <div>
                      <h2 className="font-black text-gray-900 text-xl">Authentication</h2>
                      <p className="text-xs text-[#BE0303] font-semibold">Sproxil Track™ + Sproxil Verify™</p>
                    </div>
                  </div>

                  <NarratorBox>
                    "Before Emeka's carton even reaches Aba, Sproxil Track has been tracking it from your
                    factory in Lagos. When it arrives at Emeka's shop, he scans it — confirmed as genuine
                    stock from your authorised supply chain. Now Chidinma walks in, cautious about fakes.
                    She scratches the label and texts the code. In seconds — Genuine."
                  </NarratorBox>

                  <SupplyChainMap />

                  <div className="mt-6">
                    <StepFlow steps={supplySteps} activeIndex={4} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-1">Chidinma Verifies the Product</h3>
                  <p className="text-sm text-gray-500 mb-5">She scratches the label and sends the code via WhatsApp</p>
                  <PhoneSimulator messages={verifyMessages} />
                </div>
              </motion.div>
            )}

            {/* ── PHASE 2 ────────────────────────────────────────── */}
            {phase === 2 && (
              <motion.div
                key="phase2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#BE0303] flex items-center justify-center text-white font-black">2</div>
                    <div>
                      <h2 className="font-black text-gray-900 text-xl">Engagement</h2>
                      <p className="text-xs text-[#BE0303] font-semibold">Sproxil Promo™</p>
                    </div>
                  </div>

                  <NarratorBox variant="orange">
                    "Chidinma just verified as genuine — but instead of that being the end, it's the beginning.
                    Because your product is running a Sproxil Promo. Instantly she gets a second message:
                    she's won ₦200 airtime. She didn't have to enter anything else. Back at HQ, you just
                    captured her phone number, location, the exact SKU, and the time — automatically."
                  </NarratorBox>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <PhoneSimulator messages={promoMessages} />
                    <div>
                      <CRMCapture />
                    </div>
                  </div>

                  <div className="mt-6">
                    <MiniDashboard show={true} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PHASE 3 ────────────────────────────────────────── */}
            {phase === 3 && (
              <motion.div
                key="phase3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#BE0303] flex items-center justify-center text-white font-black">3</div>
                    <div>
                      <h2 className="font-black text-gray-900 text-xl">Loyalty</h2>
                      <p className="text-xs text-[#BE0303] font-semibold">Sproxil Loyalty™ — Emeka's View</p>
                    </div>
                  </div>

                  <NarratorBox variant="purple">
                    "Now let's go back to Emeka — the retailer. When that carton arrived, it had a loyalty coupon
                    inside. Emeka scratches it, texts the code free via USSD. He gets ₦150 airtime instantly.
                    Your brand protection team just built a profile on Emeka — name, phone, location, purchase
                    frequency — without a single rep visit."
                  </NarratorBox>

                  <div className="mt-6">
                    <StepFlow steps={loyaltySteps} activeIndex={4} />
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 text-sm">Emeka scratches the loyalty coupon</h3>
                      <ScratchCard code="LYL-4821-MNVX" onScratched={() => setScratched(true)} />
                    </div>
                    <RetailerProfile scratched={scratched} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PHASE 4 ────────────────────────────────────────── */}
            {phase === 4 && (
              <motion.div
                key="phase4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#BE0303] flex items-center justify-center text-white font-black">4</div>
                    <div>
                      <h2 className="font-black text-gray-900 text-xl">Insights</h2>
                      <p className="text-xs text-[#BE0303] font-semibold">Sproxil Survey™</p>
                    </div>
                  </div>

                  <NarratorBox variant="orange">
                    "Sproxil Survey is now working in the background. Chidinma gets a short survey — while
                    she's still at the point of purchase, product in hand. She answers in 90 seconds and gets
                    ₦300 airtime. Simultaneously, a thousand other Chidinmas across 20 states are doing the
                    same thing. By tomorrow, you have statistically significant purchase data — no fieldwork, no
                    three-month wait."
                  </NarratorBox>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 text-sm">Answer Chidinma's survey</h3>
                      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-[#BE0303] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">XYZ Brand Survey</p>
                            <p className="text-xs text-gray-400">Earn ₦300 airtime on completion</p>
                          </div>
                        </div>
                        <SurveyFlow onComplete={() => setSurveyDone(true)} />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 text-sm">Live insights dashboard</h3>
                      <div className="bg-[#0D1B2A] rounded-2xl p-5 text-white space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { l: "Responses Today", v: surveyDone ? "1,248" : "1,247", c: "#BE0303" },
                            { l: "Avg Completion", v: "88 sec", c: "#BE0303" },
                            { l: "NPS Score", v: "72", c: "#BE0303" },
                            { l: "Satisfied", v: "91%", c: "#BE0303" },
                          ].map((s) => (
                            <div key={s.l} className="bg-white/5 rounded-xl p-3">
                              <p className="font-black text-xl" style={{ color: s.c }}>{s.v}</p>
                              <p className="text-gray-400 text-[10px] mt-0.5">{s.l}</p>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">Purchase Motivation</p>
                          {[
                            { l: "Quality", pct: 42 },
                            { l: "Price", pct: 28 },
                            { l: "Recommendation", pct: 20 },
                            { l: "Advertisement", pct: 10 },
                          ].map((b) => (
                            <div key={b.l} className="flex items-center gap-2 mb-2">
                              <p className="text-xs text-gray-400 w-28">{b.l}</p>
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${b.pct}%` }}
                                  transition={{ duration: 1, delay: 0.2 }}
                                  className="h-full rounded-full"
                                  style={{ background: "#BE0303" }}
                                />
                              </div>
                              <p className="text-xs font-bold text-white w-8">{b.pct}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-[#0D1B2A] rounded-2xl p-6 text-white"
                >
                  <h3 className="font-black text-xl mb-4">The Complete Picture</h3>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed italic">
                    "That's not five products. That's one platform. And every touchpoint works with the others
                    — or independently, depending on where you want to start."
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: "Track", sub: "Supply Chain Visibility", color: "#BE0303" },
                      { label: "Verify", sub: "Consumer Trust", color: "#BE0303" },
                      { label: "Promo", sub: "Engagement & CRM", color: "#BE0303" },
                      { label: "Loyalty", sub: "Trade Partner Loyalty", color: "#BE0303" },
                      { label: "Survey", sub: "Real-Time Insights", color: "#BE0303" },
                    ].map((p) => (
                      <div key={p.label} className="text-center">
                        <div
                          className="rounded-xl py-2 px-2 mb-2 text-white font-black text-sm"
                          style={{ background: p.color }}
                        >
                          {p.label}
                        </div>
                        <p className="text-[10px] text-gray-400 leading-tight">{p.sub}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={goPrev}
              disabled={phase === 1}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous Phase
            </button>
            <div className="flex gap-2">
              {phases.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPhase(p.id)}
                  className="w-2.5 h-2.5 rounded-full transition-all cursor-pointer"
                  style={{ background: phase === p.id ? p.color : "#e5e7eb" }}
                />
              ))}
            </div>
            {phase < 4 ? (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all cursor-pointer"
                style={{ background: phases[phase - 1].color }}
              >
                Next Phase
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setPhase(1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-brand-red transition-all cursor-pointer hover:bg-red-700"
              >
                Restart Demo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
