"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import ScratchCard from "@/components/ScratchCard";
import PhoneEmulator from "@/components/PhoneEmulator";
import { motion, AnimatePresence } from "framer-motion";

const COLOR = "#BE0303";
const CODE = "SNG-7829-KXPQ";

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

      </div>
    </div>
  );
}
