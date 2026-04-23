"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ScratchCard from "@/components/ScratchCard";
import LoyaltyPhoneEmulator, { LoyaltyResult } from "@/components/LoyaltyPhoneEmulator";

const COLOR = "#7B2FBE";
const CODE  = "LYL-4821-MNVX";

const tierColors: Record<string, string> = { Bronze: "#cd7f32", Silver: "#9ca3af", Gold: "#f59e0b" };

const RETAILERS = [
  { name: "Emeka Okafor",  initials: "EO", location: "Aba, Abia State",   basePoints: 1250, cartons: 8,  tier: "Silver", streak: "4 weeks", toGold: 1500 },
  { name: "Ngozi Adaeze",  initials: "NA", location: "Onitsha, Anambra",  basePoints: 2100, cartons: 14, tier: "Gold",   streak: "8 weeks", toGold: 2500 },
  { name: "Tunde Bakare",  initials: "TB", location: "Lagos Island",       basePoints:  450, cartons: 3,  tier: "Bronze", streak: "2 weeks", toGold: 1500 },
];

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
                              style={{ background: `linear-gradient(90deg, ${COLOR}, #a855f7)` }}
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
                      style={{ background: selected === i ? COLOR : "#7c3aed" }}>
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
                        className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${COLOR}, #a855f7)` }} />
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
