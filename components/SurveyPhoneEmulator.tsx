"use client";
import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type SurveyMode = "whatsapp" | "website";
export interface SurveyResult {
  satisfaction: string;
  purchase: string;
  recommend: string;
  mode: SurveyMode;
}

interface Props {
  mode: SurveyMode;
  prefillCode: string;
  codeRevealed: boolean;
  onSurveyComplete?: (data: SurveyResult) => void;
}

interface ChatMsg {
  id: string;
  from: "user" | "system";
  text: string;
  time: string;
  action?: "open-wa-survey" | "open-browser";
}

type Phase = "off" | "boot" | "lock" | "home" | "chat" | "browser";
type ChatApp = "whatsapp" | "sms";
type SurveyStep = "idle" | "invite" | "q1" | "q2" | "q3" | "done";

const WA_DARK  = "#075E54";
const WA_MED   = "#128C7E";
const WA_GREEN = "#25D366";
const WA_BG    = "#E5DDD5";
const SURVEY_COLOR = "#C84B31";

function nowStr() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const WaIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
const MsgIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="white">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);
const CamIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="white">
    <path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z" />
    <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
  </svg>
);
const BackIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="white">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);
const SendIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);
const GlobeIcon = ({ size = 22, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

// ─── Status bar ───────────────────────────────────────────────────────────────
function PhoneStatusBar({ time, bg }: { time: string; bg: string }) {
  return (
    <div style={{ height: 44, background: bg, display: "flex", alignItems: "center", paddingLeft: 18, paddingRight: 18, flexShrink: 0, transition: "background 0.3s ease" }}>
      <span style={{ color: "white", fontSize: 12, fontWeight: 700, letterSpacing: 0.3, minWidth: 36 }}>{time}</span>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
          {[5, 8, 11, 14].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: "white", borderRadius: 1, opacity: i < 3 ? 1 : 0.4 }} />
          ))}
        </div>
        <svg width={15} height={15} viewBox="0 0 24 24" fill="white" style={{ opacity: 0.9 }}>
          <path d="M1.5 8.5C5.083 4.917 9.542 3 12 3s6.917 1.917 10.5 5.5L21 11c-3.083-3.583-6.125-5.375-9-5.375S6.083 7.417 3 11L1.5 8.5zM7 14.5c1.38-1.38 3.08-2.08 5-2.08s3.62.7 5 2.08L15.5 16c-1-.9-2.2-1.375-3.5-1.375S8.5 15.1 7.5 16L7 14.5zM12 18a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <div style={{ width: 22, height: 11, border: "1.5px solid rgba(255,255,255,0.7)", borderRadius: 3, display: "flex", alignItems: "center", padding: "1.5px" }}>
            <div style={{ width: "72%", height: "100%", background: "#4ade80", borderRadius: 1.5 }} />
          </div>
          <div style={{ width: 2, height: 5, background: "rgba(255,255,255,0.5)", borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
function BootScreen() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
      <motion.div initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: SURVEY_COLOR, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 32px ${SURVEY_COLOR}60` }}>
          <span style={{ color: "white", fontWeight: 900, fontSize: 28, letterSpacing: -1 }}>S</span>
        </div>
        <span style={{ color: "white", fontWeight: 800, fontSize: 16, letterSpacing: 4 }}>SPROXIL</span>
      </motion.div>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <motion.div key={i} style={{ width: 7, height: 7, borderRadius: 9999, background: "white" }}
            animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, delay: i * 0.22, duration: 0.7 }} />
        ))}
      </div>
    </div>
  );
}

// ─── Lock ─────────────────────────────────────────────────────────────────────
function LockScreen({ time, onUnlock }: { time: string; onUnlock: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -30 }}
      onClick={onUnlock}
      style={{ width: "100%", height: "100%", cursor: "pointer", background: "linear-gradient(170deg,#0f172a 0%,#1e3a8a 55%,#0f172a 100%)", display: "flex", flexDirection: "column", userSelect: "none" }}>
      <div style={{ padding: "12px 14px 0" }}>
        <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", borderRadius: 16, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: WA_GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <WaIcon size={18} />
          </div>
          <div>
            <p style={{ color: "white", fontSize: 11, fontWeight: 700 }}>WhatsApp</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>Sproxil: Send your code to verify...</p>
          </div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, marginLeft: "auto" }}>now</span>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <p style={{ color: "white", fontSize: 58, fontWeight: 200, letterSpacing: -2, lineHeight: 1 }}>{time}</p>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>Wednesday, April 23</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingBottom: 24, color: "rgba(255,255,255,0.45)" }}>
        <motion.div animate={{ y: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 1.4 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
        </motion.div>
        <p style={{ fontSize: 11 }}>Tap to unlock</p>
      </div>
    </motion.div>
  );
}

// ─── App icon ─────────────────────────────────────────────────────────────────
function AppIcon({ bg, label, icon, onClick, pulse }: { bg: string; label: string; icon: React.ReactNode; onClick?: () => void; pulse?: boolean }) {
  return (
    <button onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: onClick ? "pointer" : "default", border: "none", background: "none", padding: 0 }}>
      <motion.div whileTap={{ scale: 0.88 }}
        style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: pulse ? `0 0 0 3px ${bg}55, 0 2px 10px rgba(0,0,0,0.3)` : "0 2px 10px rgba(0,0,0,0.3)" }}>
        {icon}
      </motion.div>
      {label && <span style={{ color: "white", fontSize: 9, fontWeight: 500, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{label}</span>}
    </button>
  );
}

// ─── Home screen ──────────────────────────────────────────────────────────────
function HomeScreen({ onOpenApp }: { onOpenApp: (app: ChatApp) => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      style={{ width: "100%", height: "100%", background: "linear-gradient(170deg,#0f172a 0%,#1e3a8a 55%,#0f172a 100%)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "16px 16px 0", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px 8px", alignContent: "start" }}>
        <AppIcon bg="#1d4ed8" label="Phone" icon={<svg width={24} height={24} viewBox="0 0 24 24" fill="white"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>} />
        <AppIcon bg="#2563eb" label="Messages" icon={<MsgIcon />} onClick={() => onOpenApp("sms")} pulse />
        <AppIcon bg="#374151" label="Camera" icon={<CamIcon />} />
        <AppIcon bg="#4b5563" label="Settings" icon={<svg width={22} height={22} viewBox="0 0 24 24" fill="white"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>} />
        <AppIcon bg={WA_GREEN} label="WhatsApp" icon={<WaIcon />} onClick={() => onOpenApp("whatsapp")} pulse />
        <AppIcon bg="#10b981" label="Maps" icon={<svg width={22} height={22} viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>} />
        <AppIcon bg="#dc2626" label="YouTube" icon={<svg width={22} height={22} viewBox="0 0 24 24" fill="white"><path d="M21.582 6.186a2.506 2.506 0 00-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418A2.506 2.506 0 002.418 6.186C2 7.746 2 12 2 12s0 4.254.418 5.814a2.506 2.506 0 001.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418a2.506 2.506 0 001.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814zM10 15V9l5.196 3L10 15z" /></svg>} />
        <AppIcon bg="#3b82f6" label="Browser" icon={<GlobeIcon />} />
      </div>
      <div style={{ padding: "10px 16px 12px" }}>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "8px 14px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>
            Open <strong style={{ color: "white" }}>WhatsApp</strong> or <strong style={{ color: "white" }}>Messages</strong> to verify your product
          </p>
        </div>
      </div>
      <div style={{ margin: "0 12px 12px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", borderRadius: 24, padding: "10px 8px", display: "flex", justifyContent: "space-around" }}>
        <AppIcon bg="#1d4ed8" label="" icon={<svg width={24} height={24} viewBox="0 0 24 24" fill="white"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>} />
        <AppIcon bg="#2563eb" label="" icon={<MsgIcon />} onClick={() => onOpenApp("sms")} />
        <AppIcon bg={WA_GREEN} label="" icon={<WaIcon />} onClick={() => onOpenApp("whatsapp")} />
        <AppIcon bg="#374151" label="" icon={<CamIcon />} />
      </div>
    </motion.div>
  );
}

// ─── Survey Chat Screen ───────────────────────────────────────────────────────
function SurveyChatScreen({
  app, surveyMode, onBack, prefillCode, codeRevealed,
  onSurveyComplete, onSwitchToWA, onOpenBrowser, autoSurvey, onRewardSent,
}: {
  app: ChatApp;
  surveyMode: SurveyMode;
  onBack: () => void;
  prefillCode: string;
  codeRevealed: boolean;
  onSurveyComplete?: (data: SurveyResult) => void;
  onSwitchToWA?: () => void;
  onOpenBrowser?: () => void;
  autoSurvey?: boolean;
  onRewardSent?: () => void;
}) {
  const isWa = app === "whatsapp";
  const headerBg = isWa ? WA_DARK : "#1e293b";
  const chatBg   = isWa ? WA_BG  : "#f1f5f9";

  const initMsgs = (): ChatMsg[] => {
    if (!autoSurvey) return [];
    return [{
      id: `s${Date.now()}`,
      from: "system",
      text: `🎁 *Sproxil Survey™*\n\nYou've been selected for a quick 3-question survey!\n\nComplete it and stand a chance to win *₦500 airtime*.\n\nReply *START* to begin.`,
      time: nowStr(),
    }];
  };

  const [messages, setMessages] = useState<ChatMsg[]>(initMsgs);
  const [inputText, setInputText] = useState("");
  const [waiting, setWaiting]     = useState(false);
  const [step, setStep]           = useState<SurveyStep>(autoSurvey ? "invite" : "idle");
  const [sat, setSat]   = useState("");
  const [pur, setPur]   = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, waiting]);

  const push = (from: "user" | "system", text: string, extra?: Partial<ChatMsg>) =>
    setMessages((p) => [...p, { id: `${from}${Date.now()}${Math.random()}`, from, text, time: nowStr(), ...extra }]);

  // ── Response strings ──────────────────────────────────────────────────────
  const VERIFY_OK_WA  = `✅ *GENUINE*\n\nThank you for buying this product!\n\nThis product is *authentic* and verified by Sproxil Verify™.\n_Location logged · ${nowStr()}_`;
  const VERIFY_OK_SMS = `GENUINE: Your product is authentic. Verified by Sproxil. Ref: VRF-${Math.floor(10000 + Math.random() * 90000)} -Sproxil`;

  // After genuine: WA verify + WA survey → inline bot invite
  const WA_SURVEY_INVITE = `🎁 *Sproxil Survey™*\n\nYou've been selected for a quick 3-question survey!\n\nComplete it and stand a chance to win *₦500 airtime*.\n\nReply *START* to begin.`;

  // After genuine: any verify + Website survey → "Open Survey" button
  const WEB_SURVEY_TEXT_WA  = `🎁 *Sproxil Survey™*\n\nComplete our quick survey and win *₦500 airtime*.\n\nTap the button below to open the survey:`;
  const WEB_SURVEY_TEXT_SMS = `SPROXIL SURVEY: Earn ₦200 airtime! Complete our survey: survey.sproxil.com/s/r7q2k`;

  // After genuine: SMS verify + WA survey → link to switch to WhatsApp
  const SMS_TO_WA_TEXT = `GENUINE: Your product is authentic. Ref: VRF-${Math.floor(10000 + Math.random() * 90000)} -Sproxil\n\nComplete our survey on WhatsApp and win ₦200 airtime:`;

  const WA_Q = [
    `*Question 1 of 3* 📊\n\nHow satisfied are you with this product?\n\n1️⃣  Very satisfied\n2️⃣  Satisfied\n3️⃣  Neutral\n4️⃣  Dissatisfied\n\nReply with a number (1–4)`,
    `*Question 2 of 3* 🛒\n\nWhere did you purchase this product?\n\n1️⃣  Local market or pharmacy\n2️⃣  Supermarket or mall\n3️⃣  Online store\n\nReply with a number (1–3)`,
    `*Question 3 of 3* 🤝\n\nWould you recommend this brand to a friend?\n\n1️⃣  Yes, definitely\n2️⃣  Maybe\n3️⃣  No\n\nReply with a number (1–3)`,
  ];
  const SAT = { "1": "Very satisfied", "2": "Satisfied",             "3": "Neutral",        "4": "Dissatisfied" };
  const PUR = { "1": "Local market / pharmacy", "2": "Supermarket / mall", "3": "Online store" };
  const REC = { "1": "Yes, definitely", "2": "Maybe", "3": "No" };
  const THANKS = `✅ *Thank you for your feedback!*\n\nYour responses have been recorded.\n\n🎁 You've been entered into our prize draw — results announced Friday.\n\n_Powered by Sproxil Survey™_`;

  // ── Send handler ──────────────────────────────────────────────────────────
  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || waiting) return;
    push("user", text);
    setInputText("");
    setWaiting(true);

    setTimeout(() => {
      setWaiting(false);
      const isCode = /[A-Z0-9]{2,}-\d{3,}-[A-Z0-9]{3,}/i.test(text);
      const low = text.toLowerCase();

      // ── Verify step ──
      if (isCode && step === "idle") {
        if (isWa) {
          push("system", VERIFY_OK_WA);
        }
        setTimeout(() => {
          if (surveyMode === "whatsapp" && isWa) {
            // stay in WA chat → bot survey
            push("system", WA_SURVEY_INVITE);
            setStep("invite");
          } else if (surveyMode === "whatsapp" && !isWa) {
            // SMS verify → link to open WA survey
            push("system", SMS_TO_WA_TEXT, { action: "open-wa-survey" });
            setStep("invite");
          } else if (surveyMode === "website" && isWa) {
            // WA verify → link to open browser
            push("system", WEB_SURVEY_TEXT_WA, { action: "open-browser" });
            setStep("invite");
          } else {
            // SMS verify + website → link to open browser
            push("system", VERIFY_OK_SMS);
            setTimeout(() => {
              push("system", WEB_SURVEY_TEXT_SMS, { action: "open-browser" });
              setStep("invite");
            }, 800);
          }
        }, isWa ? 1500 : 0);

        return;
      }

      // ── Survey: START ──
      if (step === "invite" && (low === "start") && surveyMode === "whatsapp") {
        push("system", WA_Q[0]);
        setStep("q1");
        return;
      }

      // ── Q1 ──
      if (step === "q1" && ["1","2","3","4"].includes(text)) {
        setSat(SAT[text as keyof typeof SAT] || text);
        push("system", WA_Q[1]);
        setStep("q2");
        return;
      }

      // ── Q2 ──
      if (step === "q2" && ["1","2","3"].includes(text)) {
        setPur(PUR[text as keyof typeof PUR] || text);
        push("system", WA_Q[2]);
        setStep("q3");
        return;
      }

      // ── Q3 ──
      if (step === "q3" && ["1","2","3"].includes(text)) {
        const rec = REC[text as keyof typeof REC] || text;
        push("system", THANKS);
        setTimeout(() => {
          push("system", isWa
            ? `🎁 *₦500 Airtime Reward*\n\nYour airtime has been queued and will be sent to your number within 5 minutes.\n\nThank you for helping us improve! 🙏`
            : `SPROXIL: ₦500 airtime reward queued. You will receive it within 5 minutes. Thank you! -Sproxil`
          );
          onRewardSent?.();
        }, 1200);
        setStep("done");
        onSurveyComplete?.({ satisfaction: sat, purchase: pur, recommend: rec, mode: surveyMode });
        return;
      }

      push("system", "Please reply with a valid number from the options above.");
    }, 1800);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") sendMessage(); };
  const pasteCode = () => { setInputText(prefillCode); inputRef.current?.focus(); };

  const inputPlaceholder =
    step === "idle"   ? "Type your verification code…"
    : step === "invite" && surveyMode === "whatsapp" ? 'Reply "START"…'
    : step === "q1" || step === "q2" || step === "q3" ? "Reply with a number…"
    : "…";

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>

      {/* Header */}
      <div style={{ background: headerBg, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button onMouseDown={(e) => e.preventDefault()} onClick={onBack}
          style={{ cursor: "pointer", background: "none", border: "none", padding: 4, borderRadius: 9999, display: "flex" }}>
          <BackIcon />
        </button>
        <div style={{ width: 38, height: 38, borderRadius: 9999, background: isWa ? WA_MED : "#334155", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.15)" }}>
          {isWa ? <WaIcon size={20} /> : <span style={{ color: "white", fontSize: 12, fontWeight: 800 }}>38</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "white", fontWeight: 700, fontSize: 13, margin: 0, lineHeight: 1.2 }}>
            {isWa ? "Sproxil Verify™" : "38353"}
          </p>
          <p style={{ color: "#a7f3d0", fontSize: 10, margin: 0, marginTop: 1 }}>
            {isWa ? "online · Sproxil Verification" : "Sproxil Service"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px 6px", display: "flex", flexDirection: "column", gap: 6, background: chatBg }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
          <span style={{ background: "rgba(0,0,0,0.18)", color: "white", fontSize: 10, padding: "2px 10px", borderRadius: 9999, fontWeight: 500 }}>Today</span>
        </div>

        {messages.length === 0 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <div style={{ background: "#fff8dc", border: "1px solid #e6d88a", borderRadius: 12, padding: "10px 14px", fontSize: 11, color: "#7a5c00", textAlign: "center", maxWidth: "85%" }}>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>Sproxil Verify™ + Survey™</p>
              <p style={{ margin: 0 }}>Send your product code to verify and unlock the survey.</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "82%", borderRadius: 14,
                borderTopRightRadius: msg.from === "user" ? 4 : 14,
                borderTopLeftRadius:  msg.from === "system" ? 4 : 14,
                padding: "8px 10px", fontSize: 12, lineHeight: 1.5,
                background: msg.from === "user" ? "#DCF8C6" : "white",
                color: "#111", boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}>
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>

                {msg.action === "open-wa-survey" && (
                  <span onMouseDown={(e) => e.preventDefault()} onClick={onSwitchToWA}
                    style={{ display: "inline-block", marginTop: 4, color: "#1d4ed8", fontSize: 12, textDecoration: "underline", cursor: "pointer", wordBreak: "break-all" }}>
                    wa.me/2348035380001?text=START+SURVEY
                  </span>
                )}

                {msg.action === "open-browser" && (
                  <button onMouseDown={(e) => e.preventDefault()} onClick={onOpenBrowser}
                    style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "none", background: SURVEY_COLOR, color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer", width: "100%" }}>
                    <GlobeIcon size={14} />
                    Open Survey →
                  </button>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, marginTop: 3 }}>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>{msg.time}</span>
                  {msg.from === "user" && (
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="#4CAF50"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" /></svg>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {waiting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex" }}>
            <div style={{ background: "white", borderRadius: 14, borderTopLeftRadius: 4, padding: "10px 14px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <motion.div key={i} style={{ width: 6, height: 6, borderRadius: 9999, background: "#9ca3af" }}
                  animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }} />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Paste chip */}
      <AnimatePresence>
        {codeRevealed && inputText === "" && messages.filter((m) => m.from === "user").length === 0 && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: chatBg, padding: "4px 10px", flexShrink: 0 }}>
            <button onMouseDown={(e) => e.preventDefault()} onClick={pasteCode}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "1px solid #e5e7eb", borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#374151", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="#16a34a"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>
              Paste code: <span style={{ color: "#16a34a", fontFamily: "monospace", fontWeight: 700 }}>{prefillCode}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      {!(step === "invite" && surveyMode !== "whatsapp") && !(step === "invite" && !isWa) && (
        <div style={{ background: "#f0f0f0", borderTop: "1px solid #e5e7eb", padding: "8px 10px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ flex: 1, background: "white", borderRadius: 22, border: "1px solid #e5e7eb", display: "flex", alignItems: "center", padding: "0 14px" }}>
            <input ref={inputRef} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKey}
              placeholder={inputPlaceholder}
              style={{ flex: 1, padding: "10px 0", fontSize: 12, color: "#1f2937", outline: "none", border: "none", background: "transparent" }} />
          </div>
          <button onMouseDown={(e) => e.preventDefault()} onClick={sendMessage} disabled={!inputText.trim() || waiting}
            style={{ width: 40, height: 40, borderRadius: 9999, border: "none", background: WA_GREEN, display: "flex", alignItems: "center", justifyContent: "center", cursor: inputText.trim() && !waiting ? "pointer" : "not-allowed", opacity: inputText.trim() && !waiting ? 1 : 0.45, flexShrink: 0, transition: "opacity 0.2s" }}>
            <SendIcon />
          </button>
        </div>
      )}

      <div style={{ background: "white", padding: "6px 0 8px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 80, height: 4, background: "#d1d5db", borderRadius: 2 }} />
      </div>
    </motion.div>
  );
}

// ─── Browser Screen ───────────────────────────────────────────────────────────
function BrowserScreen({ onBack, prefillCode, onSurveyComplete, surveyMode, onRewardSent }: {
  onBack: () => void; prefillCode: string;
  onSurveyComplete?: (data: SurveyResult) => void; surveyMode: SurveyMode;
  onRewardSent?: () => void;
}) {
  const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const questions = [
    { key: "q1", label: "How satisfied are you with this product?", options: ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied"] },
    { key: "q2", label: "Where did you purchase this product?", options: ["Local market / pharmacy", "Supermarket / mall", "Online store"] },
    { key: "q3", label: "Would you recommend this brand to a friend?", options: ["Yes, definitely", "Maybe", "No"] },
  ];

  const submit = () => {
    if (!answers.q1 || !answers.q2 || !answers.q3) { setError(true); return; }
    setError(false);
    setSubmitted(true);
    onSurveyComplete?.({ satisfaction: answers.q1, purchase: answers.q2, recommend: answers.q3, mode: surveyMode });
    setTimeout(() => onRewardSent?.(), 1000);
  };

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "white" }}>

      {/* Browser chrome */}
      <div style={{ background: "#f1f3f4", borderBottom: "1px solid #e0e0e0", padding: "7px 10px", display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
        <button onMouseDown={(e) => e.preventDefault()} onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "3px", borderRadius: "50%", display: "flex" }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="#5f6368"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
        </button>
        <div style={{ flex: 1, background: "white", borderRadius: 20, padding: "5px 10px", fontSize: 10, color: "#5f6368", border: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: 5 }}>
          <svg width={11} height={11} viewBox="0 0 24 24" fill="#34a853"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
          survey.sproxil.com/s/r7q2k
        </div>
        <svg width={17} height={17} viewBox="0 0 24 24" fill="#5f6368"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: "#f9fafb" }}>
        <div style={{ background: SURVEY_COLOR, padding: "14px 16px", textAlign: "center" }}>
          <p style={{ color: "white", fontWeight: 800, fontSize: 14, margin: 0 }}>Sproxil Survey™</p>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, marginTop: 2 }}>Product Feedback · 3 Questions</p>
        </div>

        {!submitted ? (
          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15 }}>✅</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#166534", margin: 0 }}>Product Verified Genuine</p>
                <p style={{ fontSize: 10, color: "#15803d", margin: 0 }}>PIN: {prefillCode}</p>
              </div>
            </div>

            {questions.map((q, idx) => (
              <div key={q.key} style={{ background: "white", borderRadius: 12, padding: "12px", border: "1px solid #e5e7eb" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>{idx + 1}. {q.label}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {q.options.map((opt) => {
                    const sel = answers[q.key as keyof typeof answers] === opt;
                    return (
                      <label key={opt} onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setAnswers((p) => ({ ...p, [q.key]: opt }))}
                        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${sel ? SURVEY_COLOR : "#e5e7eb"}`, background: sel ? `${SURVEY_COLOR}10` : "white", transition: "all 0.15s" }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${sel ? SURVEY_COLOR : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {sel && <div style={{ width: 7, height: 7, borderRadius: "50%", background: SURVEY_COLOR }} />}
                        </div>
                        <span style={{ fontSize: 12, color: sel ? SURVEY_COLOR : "#374151", fontWeight: sel ? 600 : 400 }}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {error && <p style={{ color: "#dc2626", fontSize: 11, textAlign: "center", margin: 0 }}>Please answer all questions before submitting.</p>}

            <button onMouseDown={(e) => e.preventDefault()} onClick={submit}
              style={{ background: SURVEY_COLOR, color: "white", border: "none", borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Submit Feedback
            </button>
            <p style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", margin: 0 }}>🎁 ₦500 airtime draw on completion · Powered by Sproxil Survey™</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ padding: "28px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
              style={{ width: 64, height: 64, borderRadius: 9999, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
              🎉
            </motion.div>
            <div>
              <p style={{ fontWeight: 800, color: "#111", fontSize: 16, margin: 0 }}>Thank you!</p>
              <p style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>Your feedback has been recorded</p>
            </div>
            <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 20px", width: "100%" }}>
              <p style={{ fontWeight: 800, color: "#92400e", fontSize: 15, margin: "0 0 2px" }}>🎁 ₦500 Airtime</p>
              <p style={{ fontSize: 11, color: "#78350f", margin: 0 }}>You&apos;ve been entered into the draw</p>
            </div>
            <p style={{ fontSize: 10, color: "#9ca3af" }}>Results announced Friday · Powered by Sproxil Survey™</p>
          </motion.div>
        )}
      </div>

      <div style={{ background: "white", padding: "6px 0 8px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 80, height: 4, background: "#d1d5db", borderRadius: 2 }} />
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SurveyPhoneEmulator({ mode, prefillCode, codeRevealed, onSurveyComplete }: Props) {
  const [phase, setPhase]           = useState<Phase>("off");
  const [chatApp, setChatApp]       = useState<ChatApp>("whatsapp");
  const [autoSurvey, setAutoSurvey] = useState(false);
  const [time, setTime]             = useState("");
  const [showNotif, setShowNotif]   = useState(false);

  const triggerRewardNotif = () => {
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 4000);
  };

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("boot"), 400);
    const t2 = setTimeout(() => setPhase("lock"), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const openApp = (app: ChatApp) => { setChatApp(app); setAutoSurvey(false); setPhase("chat"); };
  const goHome  = () => { setPhase("home"); setAutoSurvey(false); };

  // SMS → WhatsApp survey: switch to WA chat with survey already started
  const switchToWASurvey = () => { setChatApp("whatsapp"); setAutoSurvey(true); setPhase("chat"); };

  const statusBg = (() => {
    if (phase === "off" || phase === "boot") return "#000";
    if (phase === "lock" || phase === "home") return "rgba(10,20,48,0.95)";
    if (phase === "chat") return chatApp === "sms" ? "#1e293b" : WA_DARK;
    if (phase === "browser") return "#f1f3f4";
    return "#000";
  })();

  return (
    <div style={{
      position: "relative", width: 300, height: 634, borderRadius: 46,
      background: phase === "off" || phase === "boot" ? "#000" : "#1e293b",
      boxShadow: "0 0 0 2px #3a3a3a, 0 0 0 6px #1a1a1a, 0 32px 80px rgba(0,0,0,0.55)",
      display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0,
    }}>
      <PhoneStatusBar time={time} bg={statusBg} />

      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 108, height: 30, background: "#000", borderBottomLeftRadius: 18, borderBottomRightRadius: 18, zIndex: 50 }} />

      {/* SMS reward notification banner */}
      <AnimatePresence>
        {showNotif && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 50, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            style={{ position: "absolute", top: 0, left: 12, right: 12, zIndex: 100,
              background: "rgba(30,30,30,0.92)", backdropFilter: "blur(12px)",
              borderRadius: 16, padding: "10px 12px",
              display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>
              💰
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "white", fontSize: 11, fontWeight: 700, margin: 0 }}>Sproxil Rewards</p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, margin: 0, marginTop: 1 }}>₦500 airtime has been sent to your number</p>
            </div>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, flexShrink: 0 }}>now</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait">
          {phase === "off"     && <motion.div key="off"  style={{ width: "100%", height: "100%", background: "#000" }} />}
          {phase === "boot"    && <BootScreen key="boot" />}
          {phase === "lock"    && <LockScreen key="lock" time={time} onUnlock={() => setPhase("home")} />}
          {phase === "home"    && <HomeScreen key="home" onOpenApp={openApp} />}
          {phase === "chat"    && (
            <SurveyChatScreen
              key={`chat-${chatApp}-${autoSurvey}`}
              app={chatApp}
              surveyMode={mode}
              onBack={goHome}
              prefillCode={prefillCode}
              codeRevealed={codeRevealed}
              onSurveyComplete={onSurveyComplete}
              onSwitchToWA={switchToWASurvey}
              onOpenBrowser={() => setPhase("browser")}
              autoSurvey={autoSurvey}
              onRewardSent={triggerRewardNotif}
            />
          )}
          {phase === "browser" && (
            <BrowserScreen
              key="browser"
              onBack={() => setPhase("chat")}
              prefillCode={prefillCode}
              onSurveyComplete={onSurveyComplete}
              surveyMode={mode}
              onRewardSent={triggerRewardNotif}
            />
          )}
        </AnimatePresence>
      </div>

      <div style={{ position: "absolute", left: -3, top: 100, width: 3, height: 30, background: "#2a2a2a", borderRadius: "3px 0 0 3px" }} />
      <div style={{ position: "absolute", left: -3, top: 140, width: 3, height: 30, background: "#2a2a2a", borderRadius: "3px 0 0 3px" }} />
      <div style={{ position: "absolute", right: -3, top: 120, width: 3, height: 48, background: "#2a2a2a", borderRadius: "0 3px 3px 0" }} />
    </div>
  );
}
