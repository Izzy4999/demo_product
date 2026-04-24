"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import ScratchCard from "@/components/ScratchCard";
import PromoPhoneEmulator, { PrizeType, PromoResult } from "@/components/PromoPhoneEmulator";
import { motion, AnimatePresence } from "framer-motion";

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

      </div>
    </div>
  );
}
