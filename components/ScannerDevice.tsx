"use client";
import { motion, AnimatePresence } from "framer-motion";

interface ScannerDeviceProps {
  scanning: boolean;
  lastScanned?: string;
  onScan: () => void;
}

export default function ScannerDevice({ scanning, lastScanned, onScan }: ScannerDeviceProps) {
  const lcdState = scanning ? "scanning" : lastScanned ? "done" : "idle";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div style={{
        width: 140,
        background: "linear-gradient(160deg, #2a2a2e, #1a1a1d)",
        borderRadius: "18px 18px 8px 8px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        padding: "10px 10px 8px",
      }}>

        {/* Scan window */}
        <div style={{
          height: 14,
          background: "#000",
          border: "1.5px solid #333",
          borderRadius: 3,
          marginBottom: 8,
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Idle — faint red line */}
          {!scanning && (
            <div style={{
              position: "absolute", top: "50%", left: 4, right: 4,
              height: 1, background: "rgba(239,68,68,0.18)",
              transform: "translateY(-50%)",
            }} />
          )}
          {/* Scanning — red laser sweeps x */}
          {scanning && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 0.45, ease: "linear", repeat: Infinity }}
              style={{
                position: "absolute", top: 0, bottom: 0, width: "30%",
                background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.9), transparent)",
                boxShadow: "0 0 8px rgba(239,68,68,0.7)",
              }}
            />
          )}
        </div>

        {/* LCD screen */}
        <div style={{
          background: "#0a1a0a",
          border: "1.5px solid #1a3a1a",
          borderRadius: 6,
          padding: "8px",
          minHeight: 68,
          boxShadow: "inset 0 2px 10px rgba(0,0,0,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 7,
          overflow: "hidden",
        }}>
          <AnimatePresence mode="wait">

            {lcdState === "idle" && (
              <motion.div key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: "center", width: "100%" }}>
                <p style={{ margin: 0, fontSize: 8, fontWeight: 900, letterSpacing: 1.5,
                  color: "#4ade80", opacity: 0.6, fontFamily: "monospace" }}>
                  SPROXIL TRACK™
                </p>
                <p style={{ margin: "5px 0 0", fontSize: 9, color: "#4ade80", fontFamily: "monospace" }}>
                  Ready to scan...
                </p>
                <div style={{ display: "flex", justifyContent: "center", marginTop: 7 }}>
                  <motion.div
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80",
                      boxShadow: "0 0 6px #4ade80" }}
                  />
                </div>
              </motion.div>
            )}

            {lcdState === "scanning" && (
              <motion.div key="scanning"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: "center", width: "100%" }}>
                <p style={{ margin: 0, fontSize: 9, fontWeight: 900, letterSpacing: 2,
                  color: "#fbbf24", fontFamily: "monospace" }}>
                  SCANNING...
                </p>
                <motion.p
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                  style={{ margin: "7px 0 0", fontSize: 15, color: "#fbbf24",
                    fontFamily: "monospace", letterSpacing: 4, lineHeight: 1 }}>
                  |||
                </motion.p>
              </motion.div>
            )}

            {lcdState === "done" && (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{ textAlign: "center", width: "100%", padding: "0 4px" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 900,
                  color: "#4ade80", fontFamily: "monospace" }}>
                  SCAN OK ✓
                </p>
                <p style={{
                  margin: "4px 0 0", fontSize: 7, color: "#4ade80", fontFamily: "monospace",
                  opacity: 0.75, wordBreak: "break-all", lineHeight: 1.4,
                }}>
                  {lastScanned?.slice(0, 20)}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 7, fontWeight: 900,
                  letterSpacing: 1.5, color: "#4ade80", fontFamily: "monospace" }}>
                  LOGGED
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Brand strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
          <span style={{ fontSize: 7, fontFamily: "monospace", color: "rgba(255,255,255,0.25)",
            fontWeight: 900, letterSpacing: 1.5 }}>
            SPROXIL
          </span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#2D9D3A",
              boxShadow: "0 0 4px #2D9D3A" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>
      </div>

      {/* ── Handle ────────────────────────────────────────────────────── */}
      <div style={{
        width: 80,
        background: "linear-gradient(180deg, #1a1a1d, #141416)",
        borderRadius: "0 0 14px 14px",
        padding: "10px 14px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}>

        {/* Trigger button */}
        <motion.button
          onMouseDown={e => e.preventDefault()}
          onClick={onScan}
          disabled={scanning}
          whileTap={scanning ? {} : { scale: 0.92, y: 2 }}
          style={{
            width: 52, height: 22, borderRadius: 6, border: "none",
            background: scanning ? "#374151" : "linear-gradient(180deg, #16a34a, #15803d)",
            boxShadow: scanning ? "none" : "0 3px 0 #166534, 0 4px 8px rgba(0,0,0,0.4)",
            color: "white", fontWeight: 900, fontSize: 9, letterSpacing: 1,
            cursor: scanning ? "not-allowed" : "pointer",
            fontFamily: "monospace", transition: "background 0.15s",
          }}>
          {scanning ? "···" : "SCAN"}
        </motion.button>

        {/* Grip lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 36, height: 1.5,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 1,
            }} />
          ))}
        </div>

      </div>
    </div>
  );
}
