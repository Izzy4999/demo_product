"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import NarratorBox from "@/components/NarratorBox";
import ScratchCard from "@/components/ScratchCard";
import StepFlow from "@/components/StepFlow";
import ObjectionAccordion from "@/components/ObjectionAccordion";

const COLOR = "#7B2FBE";

const steps = [
  { label: "Carton Packed", color: "#0D1B2A" },
  { label: "Coupon Included", color: "#7B2FBE" },
  { label: "Retailer Scratches", color: "#00B69B" },
  { label: "Points Earned", color: "#BE0303" },
  { label: "Profile Built", color: "#2D9D3A" },
  { label: "Brand Contacts Directly", color: "#0D1B2A" },
];

const objections = [
  { q: "We have a field sales force that handles this", a: "Your reps can only visit a fraction of your outlets. Sproxil Loyalty is always-on — every carton, every retailer, every day, even where no rep has ever set foot." },
  { q: "Retailers won't bother participating", a: "USSD is free to the retailer — no airtime cost to them. And the reward is instant. We've seen participation rates well above 60% in active markets because the barrier to entry is zero." },
  { q: "How do we prevent a distributor from scratching all coupons themselves?", a: "The scheme is configurable. You can restrict the number of codes redeemable per phone number per period, or require retailer-level registration before codes are valid." },
  { q: "We sell through a few large distributors — is this relevant?", a: "Absolutely — the value is in the retailer and consumer data you gain below your distributors. For the first time, you'll have a direct line of sight and communication to the end of your chain." },
];

const retailers = [
  { name: "Emeka Okafor", location: "Aba", points: 1250, cartons: 8, tier: "Silver", streak: "4 weeks" },
  { name: "Ngozi Adaeze", location: "Onitsha", points: 2100, cartons: 14, tier: "Gold", streak: "8 weeks" },
  { name: "Tunde Bakare", location: "Lagos", points: 450, cartons: 3, tier: "Bronze", streak: "2 weeks" },
];

const tierColors: Record<string, string> = { Bronze: "#cd7f32", Silver: "#aaa", Gold: "#f59e0b" };

export default function LoyaltyDemo() {
  const [scratched, setScratched] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-2" style={{ background: COLOR }} />
      <div className="bg-[#0D1B2A] text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: COLOR }}>Product 3 of 5</p>
          <h1 className="text-3xl font-black">Sproxil Loyalty™</h1>
          <p className="text-gray-400 text-sm mt-1">Trade & Channel Partner Loyalty — Incentivising Every Level of the Supply Chain</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <NarratorBox label="Opening Hook" variant="purple">
            "Your product moves through distributors, wholesalers, and retailers before it ever reaches a consumer.
            Every one of those hands makes a daily decision: push your brand, or push a competitor that's giving them
            better margin, a gift, or a phone call. How do you compete for loyalty at every single level of that chain
            — consistently, measurably, without a massive field sales team on the ground?"
          </NarratorBox>
        </div>

        {/* Scratch demo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 text-xl mb-2">Retailer Experience Simulation</h2>
          <p className="text-sm text-gray-500 mb-6">Emeka receives a carton, finds the loyalty coupon, and scratches it</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ScratchCard code="LYL-4821-MNVX" onScratched={() => setScratched(true)} />
              {scratched && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <p className="font-black text-purple-800 text-xl">+₦150 Airtime</p>
                  <p className="text-purple-600 text-xs mt-1">Credited instantly via USSD · Free to retailer</p>
                </motion.div>
              )}
            </div>
            <div>
              {scratched ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-black text-sm">EO</div>
                      <div>
                        <p className="font-bold text-gray-900">Emeka Okafor</p>
                        <p className="text-xs text-gray-500">Aba, Abia State</p>
                      </div>
                      <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-gray-100" style={{ color: "#aaa" }}>Silver</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      {[["Total Points", "1,250"], ["Cartons Bought", "8"], ["Rewards Earned", "₦1,200"], ["Active Streak", "4 wks"]].map(([k, v]) => (
                        <div key={k} className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-gray-400 text-[10px] uppercase font-semibold">{k}</p>
                          <p className="font-bold text-gray-800 text-sm mt-0.5">{v}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress to Gold</span>
                        <span className="font-bold" style={{ color: COLOR }}>1,250/1,500</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "83%" }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full" style={{ background: COLOR }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl h-52 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Scratch the coupon to see Emeka's profile</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trade partner dashboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 text-xl mb-2">Trade Partner Dashboard</h2>
          <p className="text-sm text-gray-500 mb-4">Your view from HQ — thousands of retailers profiled automatically</p>
          <div className="space-y-3">
            {retailers.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                onClick={() => setSelectedRetailer(i)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedRetailer === i ? "border-purple-400 bg-purple-50" : "border-gray-100 hover:border-gray-200"}`}
              >
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {r.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.location} · {r.cartons} cartons · {r.streak} streak</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm" style={{ color: COLOR }}>{r.points.toLocaleString()} pts</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${tierColors[r.tier]}22`, color: tierColors[r.tier] }}>{r.tier}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Incentive table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Incentive Scheme Architecture</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D1B2A] text-white">
                  <th className="px-4 py-3 text-left rounded-l-lg text-xs font-semibold">Supply Chain Level</th>
                  <th className="px-4 py-3 text-left rounded-r-lg text-xs font-semibold">Example Incentive Structure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Distributor", "Points per full truck shipped. Quarterly cash redemption milestone. Annual trip reward for top distributors."],
                  ["Wholesaler", "Airtime per carton code. Bonus prize at 50-carton milestone. Regional leaderboard."],
                  ["Retailer", "Instant airtime per coupon. Monthly lucky draw for top stockists. Priority product allocation for highest scorers."],
                  ["Consumer (via Verify/Promo)", "Instant airtime, cash prizes, gamification — drives pull-through demand up the chain."],
                ].map(([level, desc], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-xs">{level}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Step Flow</h2>
          <StepFlow steps={steps} activeIndex={5} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Objection Handling</h2>
          <ObjectionAccordion items={objections} />
        </div>

        <div className="bg-[#0D1B2A] rounded-2xl p-6 text-white border-l-4" style={{ borderColor: COLOR }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: COLOR }}>Closing Statement</p>
          <p className="text-gray-300 italic leading-relaxed text-sm">
            "Your trade channel is your distribution network, your brand advocates, and your first line of defence against
            substitution — all in one. Right now, you're asking for their loyalty without giving them a reason to be loyal.
            Sproxil Loyalty changes that equation. That is not trade marketing — that is a trade relationship."
          </p>
        </div>
      </div>
    </div>
  );
}
