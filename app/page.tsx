"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

const stats = [
  { value: "4.5B", label: "PINs Generated" },
  { value: "90M+", label: "Verifications" },
  { value: "35M+", label: "Engagements" },
  { value: "$5M+", label: "Rewards Disbursed" },
  { value: "15+", label: "Years Operating" },
  { value: "20", label: "Countries" },
];

const products = [
  {
    id: "verify",
    name: "Sproxil Verify™",
    tagline: "Brand & Consumer Protection from Counterfeits",
    desc: "Unique scratch-off PINs verified via SMS, USSD, or WhatsApp. Instant counterfeit detection at point of purchase.",
    color: "#00B69B",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: "promo",
    name: "Sproxil Promo™",
    tagline: "Mobile-Driven Consumer Loyalty Rewards",
    desc: "Turn every purchase into instant airtime wins, cash prizes, and CRM data capture. Real-time campaign analytics.",
    color: "#E85D04",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
  {
    id: "loyalty",
    name: "Sproxil Loyalty™",
    tagline: "Trade & Channel Partner Loyalty",
    desc: "Incentivise every distributor, wholesaler, and retailer with instant rewards and profile building at scale.",
    color: "#7B2FBE",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    id: "track",
    name: "Sproxil Track™",
    tagline: "Factory-to-Consumer Supply Chain Visibility",
    desc: "GS1-standard barcodes tracking every unit from factory floor to retail shelf in real time.",
    color: "#2D9D3A",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    id: "survey",
    name: "Sproxil Survey™",
    tagline: "Real-Time End-Consumer Insights",
    desc: "Reach verified buyers at the exact moment of purchase. Zero recall bias. Always-on market research.",
    color: "#C84B31",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0D1B2A] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-red opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-red opacity-10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-block bg-brand-red/20 border border-brand-red/40 rounded-full px-4 py-1 text-sm text-red-300 mb-6 font-medium">
              AI Hackathon — Interactive Sales Demo Tool
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
              The Complete{" "}
              <span className="text-brand-red">Sproxil</span>{" "}
              Story
            </h1>
            <p className="text-xl text-gray-300 mb-3 font-light italic tracking-wide">
              "Making Counterfeiting Unprofitable®"
            </p>
            <p className="text-gray-400 mb-10 max-w-xl leading-relaxed text-base">
              An offline-capable sales simulation tool. Walk prospects through the complete
              Authentication → Engagement → Loyalty → Insights journey in minutes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/story"
                className="bg-brand-red hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start Full Story Demo
              </Link>
              <Link
                href="/products"
                className="border border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                Individual Product Demos
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-gray-100">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
                className="flex flex-col items-center py-5 px-3"
              >
                <span className="text-2xl font-black text-brand-red">{s.value}</span>
                <span className="text-xs text-gray-500 text-center mt-1 leading-tight">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-red uppercase tracking-widest mb-2">One Platform</p>
          <h2 className="text-3xl font-black text-gray-900">Five Powerful Products</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Each product is powerful on its own — but together they form a complete channel intelligence engine.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="group border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
              style={{ borderTopColor: p.color, borderTopWidth: 3 }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 shadow-md"
                style={{ background: p.color }}
              >
                {p.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{p.name}</h3>
              <p className="text-xs font-semibold mb-3" style={{ color: p.color }}>{p.tagline}</p>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">{p.desc}</p>
              <Link
                href={`/demo/${p.id}`}
                className="inline-flex items-center gap-1 text-sm font-bold transition-opacity hover:opacity-70 cursor-pointer"
                style={{ color: p.color }}
              >
                Run Demo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}

          {/* Story card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="border-2 border-dashed border-brand-red/40 rounded-2xl p-6 bg-red-50 flex flex-col justify-between"
          >
            <div>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 shadow-md"
                style={{ background: "linear-gradient(135deg,#6D0000,#BE0303)" }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">The Complete Story</h3>
              <p className="text-xs font-semibold text-brand-red mb-3">
                Authentication → Engagement → Loyalty → Insights
              </p>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                Follow Emeka (retailer) and Chidinma (consumer) through the full end-to-end Sproxil journey.
              </p>
            </div>
            <Link
              href="/story"
              className="bg-brand-red text-white font-bold px-5 py-3 rounded-xl text-sm text-center cursor-pointer hover:bg-red-700 transition-colors block"
            >
              Start Story Mode
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#0D1B2A] py-16 text-center text-white">
        <h2 className="text-2xl font-black mb-3">Ready to run the demo?</h2>
        <p className="text-gray-400 mb-6 text-sm">Works offline. No backend required. Fully interactive.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/story" className="bg-brand-red hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-colors cursor-pointer">
            Story Mode
          </Link>
          <Link href="/dashboard" className="border border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-xl transition-colors cursor-pointer">
            Live Dashboard
          </Link>
        </div>
      </section>

      <footer className="bg-[#0a1520] text-gray-600 py-6 text-center text-xs">
        <span className="bg-brand-red text-white font-black text-xs px-2 py-0.5 rounded tracking-widest mr-2">SPROXIL</span>
        Sales Demo Tool — Hackathon Build · © Sproxil® Confidential & Proprietary
      </footer>
    </div>
  );
}
