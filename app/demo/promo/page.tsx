"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import NarratorBox from "@/components/NarratorBox";
import StepFlow from "@/components/StepFlow";
import ObjectionAccordion from "@/components/ObjectionAccordion";
import PhoneSimulator from "@/components/PhoneSimulator";

const COLOR = "#E85D04";

const steps = [
  { label: "Pack Shipped", color: "#0D1B2A" },
  { label: "Consumer Scratches", color: "#E85D04" },
  { label: "Sends Code", color: "#00B69B" },
  { label: "Wins Instantly", color: "#2D9D3A" },
  { label: "Data Captured", color: "#BE0303" },
  { label: "Dashboard Updates", color: "#0D1B2A" },
];

const objections = [
  { q: "We already run a promo — we just don't track it digitally", a: "Then you're flying blind. You know how much you spent; you don't know who responded, from where, or whether they ever bought again. Sproxil gives you every one of those data points." },
  { q: "Can we run multiple prize tiers simultaneously?", a: "Yes — you can configure any number of prize levels simultaneously. Daily winners, weekly draws, a grand final event. All running in parallel off the same code pool." },
  { q: "What if consumers share PINs or cheat?", a: "Every PIN is one-time use and server-validated. Once used, it's locked. Reuse attempts are flagged. The system is built specifically to prevent gaming." },
  { q: "Can we run this for a limited time campaign?", a: "Absolutely. Campaigns can run for a weekend, a quarter, or year-round. You control the start and end dates, prize budgets, and winner selection logic." },
];

const airtimeMessages = [
  { from: "user" as const, text: "SNG-4521-PRMO", delay: 0.5 },
  { from: "system" as const, text: "✅ Genuine — Thank you for buying this product!\n\nSproxil Verify™", delay: 1.8 },
  { from: "system" as const, text: "🎉 Congratulations! You have won ₦500 Airtime in the ABC Promo!\n\nKeep buying to win more fantastic prizes.", delay: 3.2 },
];

const cashMessages = [
  { from: "user" as const, text: "SNG-9873-CASH", delay: 0.5 },
  { from: "system" as const, text: "✅ Genuine — Thank you for buying this product!\n\nSproxil Verify™", delay: 1.8 },
  { from: "system" as const, text: "🏆 GRAND PRIZE WINNER!\n\nYou have won ₦50,000 cash!\n\nYour PAYCODE: PAY-7723-XQRT\n\nDial *737# to redeem to any bank account.", delay: 3.2 },
];

export default function PromoDemo() {
  const [prizeType, setPrizeType] = useState<"airtime" | "cash">("airtime");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-2" style={{ background: COLOR }} />
      <div className="bg-[#0D1B2A] text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: COLOR }}>Product 2 of 5</p>
          <h1 className="text-3xl font-black">Sproxil Promo™</h1>
          <p className="text-gray-400 text-sm mt-1">Mobile-Driven Consumer Loyalty Rewards — Turning Every Purchase Into a Conversation</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <NarratorBox label="Opening Hook" variant="orange">
            "When you run a promotion today — how do you know it's working? Not the sell-in numbers.
            I mean: do you know which specific consumers participated? From which town? On which day of
            the week? Which SKU? And did they come back? Most brands cannot answer those questions.
            Sproxil Promo answers all of them — while the promotion is still running."
          </NarratorBox>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              { label: "$5M+", sub: "Rewards disbursed" },
              { label: "100K+", sub: "Verifications (Mouka Foam)" },
              { label: "18%", sub: "Repeat user rate" },
              { label: "Instant", sub: "No voucher to redeem" },
            ].map((s) => (
              <div key={s.label} className="text-center rounded-xl p-4" style={{ background: `${COLOR}10` }}>
                <p className="font-black text-base" style={{ color: COLOR }}>{s.label}</p>
                <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Prize simulator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 text-xl mb-2">Prize Simulator</h2>
          <p className="text-sm text-gray-500 mb-6">Toggle between prize types and see how each consumer interaction plays out</p>
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setPrizeType("airtime")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${prizeType === "airtime" ? "border-[#E85D04] bg-orange-50 text-[#E85D04]" : "border-gray-200 text-gray-500"}`}
            >
              Airtime Win (₦500)
            </button>
            <button
              onClick={() => setPrizeType("cash")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${prizeType === "cash" ? "border-[#E85D04] bg-orange-50 text-[#E85D04]" : "border-gray-200 text-gray-500"}`}
            >
              Cash Grand Prize (₦50K)
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="wait">
              <motion.div key={prizeType} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <PhoneSimulator messages={prizeType === "airtime" ? airtimeMessages : cashMessages} />
              </motion.div>
            </AnimatePresence>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                <p className="font-bold text-orange-800 mb-3 text-sm">Prize Configuration</p>
                <div className="space-y-2 text-sm text-gray-700">
                  {prizeType === "airtime" ? (
                    <>
                      <p>• Every <strong>10th</strong> genuine verification → ₦100 airtime</p>
                      <p>• Every <strong>100th</strong> → ₦500 airtime</p>
                      <p>• Every <strong>3,000th</strong> → TV or fridge</p>
                    </>
                  ) : (
                    <>
                      <p>• Every <strong>1,000th</strong> verification → ₦10,000 cash</p>
                      <p>• Monthly grand draw → ₦1,000,000</p>
                      <p>• PAYCODE disbursed via *737# to any bank</p>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-[#0D1B2A] rounded-xl p-5 text-white">
                <p className="text-xs text-gray-400 mb-3 font-semibold uppercase">Data Captured Automatically</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[["Phone", "080****4521"], ["Location", "Lagos Island"], ["SKU", "ABC-500ML"], ["Time", "11:14:02"]].map(([k, v]) => (
                    <div key={k} className="bg-white/5 rounded-lg px-3 py-2">
                      <p className="text-gray-400 text-[10px] uppercase">{k}</p>
                      <p className="text-white font-medium mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Case study */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">Real Client Story</p>
          <h3 className="font-black text-gray-900 text-lg mb-3">Mouka Foam — 'Sleep Like a Millionaire'</h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            Mouka Foam ran a Sproxil Promo where every genuine consumer verification automatically enrolled into a raffle.
            Four winners each took home ₦1 million. In the first three months: <strong>over 100,000 verifications</strong> —
            18% were repeat users, proving genuine purchase loyalty. Mouka also collected phone numbers across the country
            and used them to run consumer satisfaction surveys. One promo delivered both marketing activation and market research data.
          </p>
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
            "Your biggest competitors are fighting for the same shelf space, the same consumer. The ones who win are the
            ones who build a relationship beyond the shelf. Sproxil Promo doesn't just drive trial — it builds a database
            of verified buyers you own. Not rented from a media platform. Owned by you. That's a competitive moat that
            compounds over time."
          </p>
        </div>
      </div>
    </div>
  );
}
