"use client";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatMessage {
  from: "user" | "system";
  text: string;
  delay?: number;
}

interface Props {
  messages: ChatMessage[];
  title?: string;
  subtitle?: string;
}

export default function PhoneSimulator({ messages, title = "38353", subtitle = "Sproxil Verify" }: Props) {
  return (
    <div className="flex justify-center">
      <div className="w-[280px] bg-black phone-frame overflow-hidden">
        {/* Status bar */}
        <div className="bg-[#075E54] px-4 py-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div>
            <p className="text-white text-xs font-semibold">{title}</p>
            <p className="text-green-200 text-[10px]">{subtitle}</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="bg-[#ECE5DD] min-h-[340px] p-3 flex flex-col gap-2 relative">
          {/* WhatsApp bg pattern */}
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="text-[8px] text-gray-600 leading-4">
                ✓✓ SPROXIL VERIFY ✓✓
              </div>
            ))}
          </div>

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: (msg.delay ?? i * 0.8), duration: 0.3 }}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-xs shadow-sm relative ${
                    msg.from === "user"
                      ? "bg-[#DCF8C6] text-gray-800 rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-[9px] text-gray-400 text-right mt-1">
                    {msg.from === "user" ? "14:32 ✓✓" : "14:32"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full px-3 py-1 text-xs text-gray-400">
            Type a message
          </div>
          <div className="w-8 h-8 bg-[#075E54] rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
