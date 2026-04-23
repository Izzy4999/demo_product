"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Item { q: string; a: string; }

export default function ObjectionAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>"{item.q}"</span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${open === i ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 text-sm text-gray-600 bg-white border-t border-gray-100">
                  {item.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
