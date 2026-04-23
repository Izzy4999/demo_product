"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import ScratchCard from "@/components/ScratchCard";
import SurveyPhoneEmulator, { SurveyMode, SurveyResult } from "@/components/SurveyPhoneEmulator";
import { motion, AnimatePresence } from "framer-motion";

const COLOR = "#C84B31";
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
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${mode === m.id ? "border-[#C84B31] bg-orange-50" : "border-gray-200"}`}>
                      <span className="text-xl">{m.icon}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${mode === m.id ? "text-[#C84B31]" : "text-gray-600"}`}>{m.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
                      </div>
                      {mode === m.id && (
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="#C84B31" className="flex-shrink-0">
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

      </div>
    </div>
  );
}
