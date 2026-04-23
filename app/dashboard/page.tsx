"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import Navbar from "@/components/Navbar";

const regionData = [
  { region: "Lagos", verifications: 412 },
  { region: "Aba", verifications: 287 },
  { region: "Kano", verifications: 194 },
  { region: "Ibadan", verifications: 176 },
  { region: "PHC", verifications: 178 },
];

const trendData = [
  { day: "Mon", count: 834 },
  { day: "Tue", count: 910 },
  { day: "Wed", count: 1102 },
  { day: "Thu", count: 987 },
  { day: "Fri", count: 1201 },
  { day: "Sat", count: 1378 },
  { day: "Sun", count: 1247 },
];

const productBreakdown = [
  { name: "Verify", value: 54, color: "#00B69B" },
  { name: "Promo", value: 22, color: "#E85D04" },
  { name: "Loyalty", value: 12, color: "#7B2FBE" },
  { name: "Track", value: 8, color: "#2D9D3A" },
  { name: "Survey", value: 4, color: "#C84B31" },
];

const nigeriaNodes = [
  { city: "Lagos", x: 95, y: 310, count: 412, color: "#00B69B" },
  { city: "Ibadan", x: 120, y: 275, count: 176, color: "#E85D04" },
  { city: "Kano", x: 215, y: 130, count: 194, color: "#7B2FBE" },
  { city: "Abuja", x: 210, y: 220, count: 98, color: "#2D9D3A" },
  { city: "PHC", x: 195, y: 320, count: 178, color: "#C84B31" },
  { city: "Aba", x: 185, y: 305, count: 287, color: "#BE0303" },
  { city: "Enugu", x: 195, y: 270, count: 89, color: "#00B69B" },
  { city: "Kaduna", x: 200, y: 175, count: 67, color: "#7B2FBE" },
];

const feedItems = [
  { phone: "080****4521", sku: "ABC-500ML", location: "Lagos Island", status: "Genuine", time: "14:32", product: "Verify" },
  { phone: "070****8832", sku: "XYZ-250G", location: "Onitsha Main", status: "Genuine", time: "14:31", product: "Promo" },
  { phone: "081****2201", sku: "BRD-1L", location: "Kano Central", status: "Flagged", time: "14:30", product: "Verify" },
  { phone: "090****5543", sku: "ABC-500ML", location: "Aba Market", status: "Genuine", time: "14:29", product: "Survey" },
  { phone: "080****9912", sku: "LYL-CART", location: "Ibadan North", status: "Genuine", time: "14:28", product: "Loyalty" },
  { phone: "070****3341", sku: "XYZ-250G", location: "PHC Old GRA", status: "Genuine", time: "14:27", product: "Promo" },
  { phone: "081****6678", sku: "TRK-BATCH", location: "Lagos Apapa", status: "Genuine", time: "14:26", product: "Track" },
  { phone: "080****1123", sku: "ABC-500ML", location: "Enugu Trans", status: "Flagged", time: "14:25", product: "Verify" },
];

const productColors: Record<string, string> = {
  Verify: "#00B69B", Promo: "#E85D04", Loyalty: "#7B2FBE", Track: "#2D9D3A", Survey: "#C84B31",
};

function LiveFeed() {
  const [items, setItems] = useState(feedItems);
  const [count, setCount] = useState(1247);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newItem = {
        phone: `0${Math.floor(Math.random() * 3) === 0 ? "70" : Math.floor(Math.random() * 3) === 1 ? "80" : "81"}****${Math.floor(1000 + Math.random() * 9000)}`,
        sku: ["ABC-500ML", "XYZ-250G", "BRD-1L"][Math.floor(Math.random() * 3)],
        location: ["Lagos Island", "Aba Market", "Kano Central", "Ibadan", "PHC", "Enugu"][Math.floor(Math.random() * 6)],
        status: Math.random() > 0.08 ? "Genuine" : "Flagged",
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        product: ["Verify", "Promo", "Loyalty", "Track", "Survey"][Math.floor(Math.random() * 5)],
      };
      setItems((prev) => [newItem, ...prev.slice(0, 11)]);
      setCount((c) => c + 1);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return { items, count };
}

export default function DashboardPage() {
  const { items, count } = LiveFeed();
  const genuine = Math.round(count * 0.961);
  const flagged = count - genuine;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-[#0D1B2A] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Admin Command Centre</p>
            <h1 className="text-2xl font-black">Sproxil Live Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-semibold">Live · updating every 2s</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Verifications Today", value: count.toLocaleString(), color: "#0D1B2A", sub: "↑ 12% vs yesterday" },
            { label: "Genuine", value: genuine.toLocaleString(), color: "#2D9D3A", sub: `${((genuine / count) * 100).toFixed(1)}% of total` },
            { label: "Flagged / Suspicious", value: flagged.toLocaleString(), color: "#BE0303", sub: `${((flagged / count) * 100).toFixed(1)}% TPI rate` },
          ].map((s) => (
            <motion.div
              key={s.label}
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">{s.label}</p>
              <p className="font-black text-3xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4 text-sm">Verifications by Region</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={regionData} barSize={32}>
                <XAxis dataKey="region" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#F3F4F6" }} contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Bar dataKey="verifications" fill="#00B69B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4 text-sm">Daily Verification Trend — Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#BE0303" strokeWidth={2.5} dot={{ fill: "#BE0303", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Map + donut row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nigeria map */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-1 text-sm">Geographic Coverage</h2>
            <p className="text-xs text-gray-400 mb-4">Verification hotspots across Nigeria</p>
            <div className="relative" style={{ height: 340 }}>
              <svg viewBox="0 0 320 380" className="w-full h-full">
                {/* Simplified Nigeria outline */}
                <path
                  d="M60,80 L90,50 L140,40 L190,45 L240,60 L275,100 L290,150 L285,200 L270,245 L260,285 L230,320 L200,345 L170,360 L140,355 L110,340 L80,310 L55,275 L40,235 L38,195 L45,155 L55,115 Z"
                  fill="#F0FDF4"
                  stroke="#D1FAE5"
                  strokeWidth="2"
                />
                {nigeriaNodes.map((n) => (
                  <g key={n.city}>
                    <motion.circle
                      cx={n.x}
                      cy={n.y}
                      r={Math.max(8, Math.min(20, n.count / 20))}
                      fill={n.color}
                      opacity={0.85}
                      animate={{ r: [Math.max(8, Math.min(20, n.count / 20)), Math.max(8, Math.min(20, n.count / 20)) + 3, Math.max(8, Math.min(20, n.count / 20))] }}
                      transition={{ repeat: Infinity, duration: 2 + Math.random() }}
                    />
                    <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">{n.count}</text>
                    <text x={n.x} y={n.y + 16} textAnchor="middle" fontSize="7" fill="#374151">{n.city}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Donut */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-1 text-sm">Product Breakdown</h2>
            <p className="text-xs text-gray-400 mb-4">Engagement share by product type</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={productBreakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                  {productBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Live Verification Feed</h2>
              <p className="text-xs text-gray-400">Auto-updating in real time</p>
            </div>
            <span className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="overflow-hidden" style={{ maxHeight: 360 }}>
            <AnimatePresence initial={false}>
              {items.map((item, i) => (
                <motion.div
                  key={`${item.phone}-${item.time}-${i}`}
                  initial={{ opacity: 0, y: -24, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: productColors[item.product] || "#888" }}>
                    {item.product.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-xs">{item.phone} · {item.sku}</p>
                    <p className="text-[10px] text-gray-400">{item.location}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${item.status === "Genuine" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{item.time}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
