"use client";
import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLOR    = "#BE0303";   // Loyalty purple
const WA_DARK  = "#075E54";
const WA_MED   = "#128C7E";
const WA_GREEN = "#25D366";
const WA_BG    = "#E5DDD5";

type AppType = "whatsapp" | "sms";
type Phase   = "off" | "boot" | "lock" | "home" | "chat";

export interface LoyaltyResult {
  code:     string;
  channel:  AppType;
  points:   number;
  balance:  number;
  airtime:  string;
}

interface Props {
  code:             string;
  codeRevealed:     boolean;
  onPointsAwarded?: (result: LoyaltyResult) => void;
}

// ─── Retailer constants ───────────────────────────────────────────────────────

const R = {
  name:       "Emeka Okafor",
  first:      "Emeka",
  phone:      "0803****4521",
  tier:       "Silver",
  prevBal:    1250,
  newBal:     1400,
  pts:        150,
  airtime:    "₦150",
  toGold:     1500,
};

// ─── Messages ─────────────────────────────────────────────────────────────────

const WA_1 =
  `✅ *Code Accepted!*\n\n*+${R.pts} points* added to your account, ${R.first}! 🎉\n\nNew Balance: *${R.newBal.toLocaleString()} pts*\nTier: *${R.tier}* 🥈\nProgress to Gold: *${R.newBal} / ${R.toGold} pts*\n\n_Just ${R.toGold - R.newBal} points away from Gold tier!_ 🏆`;

const WA_2 =
  `🎉 *${R.airtime} Airtime Credited!*\n\nInstantly added to *${R.phone}*.\n\n_Thank you for stocking Sanofi products! Keep buying to earn more rewards._ 💜`;

const SMS_1 =
  `CODE ACCEPTED. +${R.pts}pts. New balance: ${R.newBal}pts. Tier: ${R.tier}. ${R.toGold - R.newBal}pts to Gold! -Sproxil Loyalty`;

const SMS_2 =
  `${R.airtime} airtime credited to ${R.phone}. Thanks for stocking Sanofi products! Keep buying to earn more. -Sproxil Loyalty`;

const NOTIF_TEXT = `+${R.pts} pts · Balance ${R.newBal.toLocaleString()} — Sproxil Loyalty`;

function nowStr() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function topBarColor(phase: Phase, app: AppType | null): string {
  if (phase === "off" || phase === "boot") return "#000";
  if (phase === "lock" || phase === "home") return "rgba(10,20,48,0.95)";
  if (phase === "chat") return app === "whatsapp" ? WA_DARK : "#0D1B2A";
  return "#000";
}

// ─── Icons — exact copies from PhoneEmulator ──────────────────────────────────

const WaIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="white">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
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

// ─── Off screen ───────────────────────────────────────────────────────────────

function OffScreen() {
  return <div style={{ width: "100%", height: "100%", background: "#000" }} />;
}

// ─── Boot screen ──────────────────────────────────────────────────────────────

function BootScreen() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
      <motion.div initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "#BE0303", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(190,3,3,0.4)" }}>
          <span style={{ color: "white", fontWeight: 900, fontSize: 28, letterSpacing: -1 }}>S</span>
        </div>
        <span style={{ color: "white", fontWeight: 800, fontSize: 16, letterSpacing: 4 }}>SPROXIL</span>
      </motion.div>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} style={{ width: 7, height: 7, borderRadius: 9999, background: "white" }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Infinity, delay: i * 0.22, duration: 0.7 }} />
        ))}
      </div>
    </div>
  );
}

// ─── Lock screen ──────────────────────────────────────────────────────────────

function LockScreen({ time, onUnlock, onOpenApp }: {
  time: string; onUnlock: () => void; onOpenApp: (a: AppType) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -30 }}
      style={{ width: "100%", height: "100%", background: "#0D1B2A", display: "flex", flexDirection: "column", userSelect: "none" }}
    >
      {/* Notification cards */}
      <div style={{ padding: "12px 14px 0", display: "flex", flexDirection: "column", gap: 6 }}>
        <motion.button onMouseDown={e => e.preventDefault()} onClick={() => onOpenApp("whatsapp")} whileTap={{ scale: 0.97 }}
          style={{ width: "100%", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", borderRadius: 16, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, border: "none", cursor: "pointer", textAlign: "left" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: WA_GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <WaIcon size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "white", fontSize: 11, fontWeight: 700, margin: 0 }}>WhatsApp</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>38353: Send your carton code to earn points…</p>
          </div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, flexShrink: 0 }}>now</span>
        </motion.button>

        <motion.button onMouseDown={e => e.preventDefault()} onClick={() => onOpenApp("sms")} whileTap={{ scale: 0.97 }}
          style={{ width: "100%", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", borderRadius: 16, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, border: "none", cursor: "pointer", textAlign: "left" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0D1B2A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MsgIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "white", fontSize: 11, fontWeight: 700, margin: 0 }}>Messages</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>38353: Send your carton code to earn points…</p>
          </div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, flexShrink: 0 }}>now</span>
        </motion.button>
      </div>

      {/* Clock */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <p style={{ color: "white", fontSize: 58, fontWeight: 200, letterSpacing: -2, lineHeight: 1, margin: 0 }}>{time}</p>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: 0 }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Unlock hint */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingBottom: 24, color: "rgba(255,255,255,0.45)", cursor: "pointer" }} onClick={onUnlock}>
        <motion.div animate={{ y: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 1.4 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
        </motion.div>
        <p style={{ fontSize: 11, margin: 0 }}>Tap to unlock</p>
      </div>
    </motion.div>
  );
}

// ─── App icon ─────────────────────────────────────────────────────────────────

function AppIcon({ bg, label, icon, onClick }: { bg: string; label: string; icon: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} onMouseDown={e => e.preventDefault()}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: onClick ? "pointer" : "default", border: "none", background: "none", padding: 0 }}>
      <motion.div whileTap={{ scale: 0.88 }}
        style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
        {icon}
      </motion.div>
      {label && <span style={{ color: "white", fontSize: 9, fontWeight: 500, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{label}</span>}
    </button>
  );
}

// ─── Home screen ──────────────────────────────────────────────────────────────

function HomeScreen({ onOpenApp }: { onOpenApp: (a: AppType) => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      style={{ width: "100%", height: "100%", background: "#0D1B2A", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "16px 16px 0", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px 8px", alignContent: "start" }}>
        <AppIcon bg="#BE0303" label="Phone" icon={<PhoneIcon />} />
        <AppIcon bg="#0D1B2A" label="Messages" icon={<MsgIcon />} onClick={() => onOpenApp("sms")} />
        <AppIcon bg="#545454" label="Camera" icon={<CamIcon />} />
        <AppIcon bg="#0D1B2A" label="Settings" icon={
          <svg width={22} height={22} viewBox="0 0 24 24" fill="white">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        } />
        <AppIcon bg={WA_GREEN} label="WhatsApp" icon={<WaIcon />} onClick={() => onOpenApp("whatsapp")} />
        <AppIcon bg="#BE0303" label="Maps" icon={
          <svg width={22} height={22} viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        } />
        <AppIcon bg="#BE0303" label="YouTube" icon={
          <svg width={22} height={22} viewBox="0 0 24 24" fill="white">
            <path d="M21.582 6.186a2.506 2.506 0 00-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418A2.506 2.506 0 002.418 6.186C2 7.746 2 12 2 12s0 4.254.418 5.814a2.506 2.506 0 001.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418a2.506 2.506 0 001.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814zM10 15V9l5.196 3L10 15z" />
          </svg>
        } />
        <AppIcon bg="#BE0303" label="Gallery" icon={
          <svg width={22} height={22} viewBox="0 0 24 24" fill="white">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        } />
      </div>
      <div style={{ padding: "10px 16px 12px" }}>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "8px 14px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, margin: 0 }}>
            Open <strong style={{ color: "white" }}>WhatsApp</strong> or <strong style={{ color: "white" }}>Messages</strong> to send your loyalty code
          </p>
        </div>
      </div>
      <div style={{ margin: "0 12px 12px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", borderRadius: 24, padding: "10px 8px", display: "flex", justifyContent: "space-around" }}>
        <AppIcon bg="#BE0303" label="" icon={<PhoneIcon />} />
        <AppIcon bg="#0D1B2A" label="" icon={<MsgIcon />} onClick={() => onOpenApp("sms")} />
        <AppIcon bg={WA_GREEN} label="" icon={<WaIcon />} onClick={() => onOpenApp("whatsapp")} />
        <AppIcon bg="#545454" label="" icon={<CamIcon />} />
      </div>
    </motion.div>
  );
}

// ─── Chat screen ──────────────────────────────────────────────────────────────

interface ChatMsg { id: string; from: "user" | "system"; text: string; time: string; }

function ChatScreen({ app, code, codeRevealed, onBack, onPointsAwarded }: {
  app: AppType; code: string; codeRevealed: boolean;
  onBack: () => void; onPointsAwarded: () => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState("");
  const [waiting, setWaiting]     = useState(false);
  const [done, setDone]           = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const isWa     = app === "whatsapp";
  const headBg   = isWa ? WA_DARK : "#0D1B2A";
  const chatBg   = isWa ? WA_BG : "#f1f5f9";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, waiting]);

  const push = useCallback((from: "user" | "system", text: string) => {
    setMessages(p => [...p, { id: `${from}-${Date.now()}-${Math.random()}`, from, text, time: nowStr() }]);
  }, []);

  const send = useCallback(() => {
    const text = inputText.trim();
    if (!text || waiting || done) return;
    push("user", text);
    setInputText("");
    setWaiting(true);

    // Reply 1: points confirmation
    setTimeout(() => {
      push("system", isWa ? WA_1 : SMS_1);
      setWaiting(false);

      // Reply 2: airtime credited
      setTimeout(() => {
        setWaiting(true);
        setTimeout(() => {
          push("system", isWa ? WA_2 : SMS_2);
          setWaiting(false);
          setDone(true);
          onPointsAwarded();
        }, 1800);
      }, 1200);
    }, 1800);
  }, [inputText, waiting, done, isWa, push, onPointsAwarded]);

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") send(); };
  const pasteCode = () => { setInputText(code); inputRef.current?.focus(); };

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: headBg, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button onClick={onBack} style={{ cursor: "pointer", background: "none", border: "none", padding: 4, display: "flex" }}>
          <BackIcon />
        </button>
        <div style={{ width: 38, height: 38, borderRadius: 9999, background: isWa ? WA_MED : "#0D1B2A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.15)" }}>
          {isWa ? <WaIcon size={20} /> : <span style={{ color: "white", fontSize: 12, fontWeight: 800 }}>38</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "white", fontWeight: 700, fontSize: 13, margin: 0 }}>
            {isWa ? "Sproxil Loyalty™" : "38353"}
          </p>
          <p style={{ color: "#a7f3d0", fontSize: 10, margin: 0, marginTop: 1 }}>
            {isWa ? "online · Loyalty Programme" : "Sproxil Loyalty Service"}
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
            <div style={{ background: "#f5f0ff", border: "1px solid #ddd6fe", borderRadius: 12, padding: "10px 14px", fontSize: 11, color: "#5b21b6", textAlign: "center", maxWidth: "85%" }}>
              <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Sproxil Loyalty™</p>
              <p style={{ margin: 0 }}>Send the code from your carton coupon to earn points and instant airtime rewards.</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "82%", borderRadius: 14,
                borderTopRightRadius: msg.from === "user" ? 4 : 14,
                borderTopLeftRadius: msg.from === "system" ? 4 : 14,
                padding: "8px 10px", fontSize: 12, lineHeight: 1.55,
                background: msg.from === "user" ? "#DCF8C6" : "white",
                color: "#111", boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}>
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {msg.text.replace(/\*([^*]+)\*/g, "$1")}
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, marginTop: 3 }}>
                  <span style={{ fontSize: 9, color: "#545454" }}>{msg.time}</span>
                  {msg.from === "user" && (
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="#4CAF50">
                      <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                    </svg>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {waiting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "white", borderRadius: 14, borderTopLeftRadius: 4, padding: "10px 14px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} style={{ width: 6, height: 6, borderRadius: 9999, background: "#545454" }}
                  animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Paste chip */}
      <AnimatePresence>
        {codeRevealed && inputText === "" && messages.filter(m => m.from === "user").length === 0 && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: chatBg, padding: "4px 10px", flexShrink: 0 }}>
            <button onClick={pasteCode}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "1px solid #e5e7eb", borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: "#545454", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill={COLOR}>
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              </svg>
              Paste code: <span style={{ color: COLOR, fontFamily: "monospace", fontWeight: 700 }}>{code}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div style={{ background: "#f0f0f0", borderTop: "1px solid #e5e7eb", padding: "8px 10px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ flex: 1, background: "white", borderRadius: 22, border: "1px solid #e5e7eb", display: "flex", alignItems: "center", padding: "0 14px" }}>
          <input ref={inputRef} value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={handleKey}
            placeholder="Type a message…"
            style={{ flex: 1, padding: "10px 0", fontSize: 12, color: "#1f2937", outline: "none", border: "none", background: "transparent" }} />
        </div>
        <button onClick={send} onMouseDown={e => e.preventDefault()} disabled={!inputText.trim() || waiting || done}
          style={{ width: 40, height: 40, borderRadius: 9999, border: "none", background: isWa ? WA_GREEN : "#0D1B2A", display: "flex", alignItems: "center", justifyContent: "center", cursor: inputText.trim() && !waiting && !done ? "pointer" : "not-allowed", opacity: inputText.trim() && !waiting && !done ? 1 : 0.45, flexShrink: 0, transition: "opacity 0.2s" }}>
          <SendIcon />
        </button>
      </div>

      {/* Home bar */}
      <div style={{ background: "white", padding: "6px 0 8px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 80, height: 4, background: "#d1d5db", borderRadius: 2 }} />
      </div>
    </motion.div>
  );
}

// ─── Main emulator ────────────────────────────────────────────────────────────

export default function LoyaltyPhoneEmulator({ code, codeRevealed, onPointsAwarded }: Props) {
  const [phase, setPhase]       = useState<Phase>("off");
  const [app, setApp]           = useState<AppType | null>(null);
  const [time, setTime]         = useState("9:41");
  const [done, setDone]         = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const bootTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPhase("off"); setApp(null); setDone(false); setShowNotif(false);
    if (bootTimer.current) clearTimeout(bootTimer.current);
  }, [code]);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => { if (bootTimer.current) clearTimeout(bootTimer.current); }, []);

  const handleTap = () => {
    if (phase !== "off") return;
    setPhase("boot");
    bootTimer.current = setTimeout(() => setPhase("lock"), 2200);
  };

  const openApp = (a: AppType) => { setApp(a); setPhase("chat"); };
  const goHome  = () => { setPhase("home"); setApp(null); };

  const handlePointsAwarded = useCallback(() => {
    if (done) return;
    setDone(true);
    onPointsAwarded?.({ code, channel: app ?? "whatsapp", points: R.pts, balance: R.newBal, airtime: R.airtime });
    // Notification always as SMS
    setTimeout(() => {
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 5000);
    }, 1400);
  }, [done, code, app, onPointsAwarded]);

  const handleNotifClick = () => {
    setShowNotif(false);
    openApp("sms");
  };

  const statusBg = topBarColor(phase, app);

  return (
    <div style={{
      position: "relative", width: 300, height: 634, borderRadius: 46,
      background: phase === "off" || phase === "boot" ? "#000" : "#0D1B2A",
      boxShadow: "0 0 0 2px #3a3a3a, 0 0 0 6px #1a1a1a, 0 32px 80px rgba(0,0,0,0.55)",
      display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0,
    }}>

      {/* SMS notification banner — always SMS, always clickable */}
      <AnimatePresence>
        {showNotif && (
          <motion.button key="notif"
            initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onMouseDown={e => e.preventDefault()} onClick={handleNotifClick}
            style={{
              position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
              background: "rgba(14,14,14,0.93)", backdropFilter: "blur(14px)",
              padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
              borderBottom: `2px solid ${COLOR}`,
              border: "none", cursor: "pointer", textAlign: "left", width: "100%",
            }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0D1B2A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MsgIcon />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Messages · now</p>
              <p style={{ color: "white", fontSize: 12, fontWeight: 700, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                🏆 {NOTIF_TEXT}
              </p>
            </div>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, flexShrink: 0 }}>tap</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Status bar */}
      <PhoneStatusBar time={time} bg={statusBg} />

      {/* Notch */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 108, height: 30, background: "#000", borderBottomLeftRadius: 18, borderBottomRightRadius: 18, zIndex: 50 }} />

      {/* Screen */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", cursor: phase === "off" ? "pointer" : "default" }}
        onClick={phase === "off" ? handleTap : undefined}>
        <AnimatePresence mode="wait">
          {phase === "off" && (
            <motion.div key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: "100%", height: "100%" }}>
              <OffScreen />
            </motion.div>
          )}
          {phase === "boot" && (
            <motion.div key="boot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: "100%", height: "100%" }}>
              <BootScreen />
            </motion.div>
          )}
          {phase === "lock" && (
            <motion.div key="lock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: "100%", height: "100%" }}>
              <LockScreen time={time} onUnlock={() => setPhase("home")} onOpenApp={openApp} />
            </motion.div>
          )}
          {phase === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: "100%", height: "100%" }}>
              <HomeScreen onOpenApp={openApp} />
            </motion.div>
          )}
          {phase === "chat" && app && (
            <motion.div key={`chat-${app}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: "100%", height: "100%" }}>
              <ChatScreen app={app} code={codeRevealed ? code : ""} codeRevealed={codeRevealed} onBack={goHome} onPointsAwarded={handlePointsAwarded} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side buttons */}
      <div style={{ position: "absolute", left: -3, top: 100, width: 3, height: 30, background: "#2a2a2a", borderRadius: "3px 0 0 3px" }} />
      <div style={{ position: "absolute", left: -3, top: 140, width: 3, height: 30, background: "#2a2a2a", borderRadius: "3px 0 0 3px" }} />
      <div style={{ position: "absolute", right: -3, top: 120, width: 3, height: 48, background: "#2a2a2a", borderRadius: "0 3px 3px 0" }} />
    </div>
  );
}
