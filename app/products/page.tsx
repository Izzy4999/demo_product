"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

const products = [
  {
    id: "verify",
    name: "Sproxil Verify™",
    tagline: "Brand & Consumer Protection from Counterfeits",
    hook: "Have you ever had a customer return a product claiming it was fake — and you weren't sure if they were right?",
    color: "#BE0303",
    stats: ["4.5B PINs generated", "90M+ verifications", "Works on ANY phone"],
  },
  {
    id: "promo",
    name: "Sproxil Promo™",
    tagline: "Mobile-Driven Consumer Loyalty Rewards",
    hook: "When you run a promotion today — how do you know which specific consumers participated? From which town? On which day?",
    color: "#BE0303",
    stats: ["$5M+ rewards disbursed", "100K+ verifications (Mouka)", "18% repeat users"],
  },
  {
    id: "loyalty",
    name: "Sproxil Loyalty™",
    tagline: "Trade & Channel Partner Loyalty",
    hook: "Every hand in your supply chain makes a daily decision: push your brand, or push a competitor. How do you compete?",
    color: "#BE0303",
    stats: ["60%+ participation rates", "Instant USSD rewards", "Direct comms to retailers"],
  },
  {
    id: "track",
    name: "Sproxil Track™",
    tagline: "Factory-to-Consumer Supply Chain Visibility",
    hook: "If a product recall happened tonight — how long would it take you to know which distributor has that batch?",
    color: "#BE0303",
    stats: ["GS1-standard barcodes", "Real-time batch tracking", "NAFDAC compliant"],
  },
  {
    id: "survey",
    name: "Sproxil Survey™",
    tagline: "Real-Time End-Consumer Insights",
    hook: "When was the last time you spoke directly to someone who just bought your product — right at the moment of purchase?",
    color: "#BE0303",
    stats: ["Zero recall bias", "₦200–500 completion reward", "Always-on research"],
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-[#0D1B2A] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold">Product Suite</p>
          <h1 className="text-3xl font-black">Individual Product Demos</h1>
          <p className="text-gray-400 mt-2 text-sm">Select any product to run a focused, interactive demo</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group"
          >
            <div className="h-2" style={{ background: p.color }} />
            <div className="p-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg mb-4 shadow"
                style={{ background: p.color }}
              >
                {i + 1}
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-1">{p.name}</h3>
              <p className="text-xs font-semibold mb-3" style={{ color: p.color }}>{p.tagline}</p>
              <p className="text-sm text-gray-500 italic mb-4 leading-relaxed">"{p.hook}"</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {p.stats.map((s) => (
                  <span key={s} className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: `${p.color}15`, color: p.color }}>
                    {s}
                  </span>
                ))}
              </div>
              <Link
                href={`/demo/${p.id}`}
                className="block w-full text-center text-white font-bold py-3 rounded-xl transition-opacity hover:opacity-90 cursor-pointer"
                style={{ background: p.color }}
              >
                Run Demo
              </Link>
            </div>
          </motion.div>
        ))}

        {/* Full story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0D1B2A] rounded-2xl shadow-sm overflow-hidden md:col-span-2 lg:col-span-1"
        >
          <div className="h-2 bg-brand-gradient" />
          <div className="p-6 h-full flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-black text-lg mb-4 shadow">
              ★
            </div>
            <h3 className="font-black text-white text-lg mb-1">The Complete Story</h3>
            <p className="text-xs font-semibold text-red-400 mb-3">All 5 Products · End-to-End</p>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed flex-1">
              Run the full cross-product journey: Emeka receives stock, Chidinma buys and verifies, wins a prize,
              Emeka earns loyalty points, and Chidinma completes a survey. One story, five products.
            </p>
            <Link
              href="/story"
              className="block w-full text-center text-white font-bold py-3 rounded-xl bg-brand-red hover:bg-red-700 transition-colors cursor-pointer"
            >
              Start Story Mode
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
