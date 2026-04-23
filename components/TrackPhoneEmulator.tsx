"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Sproxil brand red — matches the real Track mobile app UI
const APP_RED = "#BE0303";
const APP_DARK = "#0D1B2A";

export interface TrackProduct {
  name: string; batch: string; serial: string;
  barcode: string; gtin: string; client: string; expiry: string;
}

export type WorkflowStep =
  | "commission" | "pack" | "ship" | "receive"
  | "unpack" | "dispense" | "decommission" | "view" | "verify";

type AppScreen = "home" | WorkflowStep;
type PackStep = "set-qty" | "scan-parent" | "scan-children" | "done";
type SimpleStep = "scan" | "confirm" | "done";

const MOCK_SSCC = "00359002329230001";
const LOCATIONS = [
  "Hub Dispatch — Ilupeju, Lagos",
  "Distributor — Onitsha, Anambra",
  "Retailer — Ariaria, Aba",
];
const DECOMMISSION_REASONS = ["Damaged / Tampered", "Expired Product", "Wrong Shipment", "Manufacturing Defect"];

const MENU: { id: WorkflowStep; label: string; icon: string }[] = [
  { id: "commission",   label: "Commission Labels", icon: "⚡" },
  { id: "pack",         label: "Pack Products",     icon: "📦" },
  { id: "ship",         label: "Ship Package",      icon: "🚚" },
  { id: "receive",      label: "Receive Package",   icon: "📬" },
  { id: "unpack",       label: "Unpack Package",    icon: "📤" },
  { id: "dispense",     label: "Dispense",          icon: "💊" },
  { id: "decommission", label: "Decommission Label",icon: "❌" },
  { id: "view",         label: "View Package",      icon: "👁" },
  { id: "verify",       label: "Verify Package",    icon: "✅" },
];

interface Props {
  product: TrackProduct;
  onStepComplete?: (step: WorkflowStep) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ScanField({ value, placeholder }: { value: string; placeholder?: string }) {
  return (
    <div style={{ border: "1.5px solid #d1d5db", borderRadius: 8, padding: "10px 12px", background: "white", marginTop: 4 }}>
      <p style={{ margin: 0, fontSize: 13, color: value ? "#111" : "#9ca3af", fontFamily: "monospace" }}>
        {value || (placeholder ?? "Scan barcode..................")}
      </p>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, color: "#9ca3af", margin: "12px 0 0", fontWeight: 500 }}>{children}</p>;
}

function ScanBtn({ onScan, label = "Scan", disabled }: { onScan: () => void; label?: string; disabled?: boolean }) {
  return (
    <motion.button
      onMouseDown={e => e.preventDefault()}
      onClick={onScan}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.96 }}
      style={{
        width: "100%", padding: "11px 0", borderRadius: 8, marginTop: 12,
        background: disabled ? "#d1d5db" : APP_RED,
        color: "white", fontWeight: 700, fontSize: 13, border: "none",
        cursor: disabled ? "not-allowed" : "pointer", letterSpacing: 0.3,
      }}>
      {disabled ? "—" : `▶ ${label}`}
    </motion.button>
  );
}

function AppHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px 12px", background: "white",
      borderBottom: "1px solid #f3f4f6",
    }}>
      <button onMouseDown={e => e.preventDefault()} onClick={onBack}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth={2.5} strokeLinecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, letterSpacing: 1, color: "#111" }}>{title}</p>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

function DoneCard({ title, children, onDone }: { title: string; children: React.ReactNode; onDone: () => void }) {
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ marginTop: 16, background: "#f0fdf4", borderRadius: 12, padding: "14px 16px", border: "1.5px solid #bbf7d0" }}>
        <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 14, color: "#15803d" }}>✅ {title}</p>
        {children}
      </div>
      <motion.button onMouseDown={e => e.preventDefault()} onClick={onDone} whileTap={{ scale: 0.97 }}
        style={{
          width: "100%", padding: "11px 0", borderRadius: 8, marginTop: 12,
          background: APP_RED, color: "white", fontWeight: 700, fontSize: 13,
          border: "none", cursor: "pointer",
        }}>
        ← Back to Home
      </motion.button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: "#6b7280" }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#111", fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TrackPhoneEmulator({ product, onStepComplete }: Props) {
  const [screen, setScreen] = useState<AppScreen>("home");

  // Commission state
  const [commMode, setCommMode]     = useState<"automatic" | "batch">("automatic");
  const [commItems, setCommItems]   = useState<string[]>([]);
  const [commDone, setCommDone]     = useState(false);

  // Pack state
  const [packStep, setPackStep]     = useState<PackStep>("set-qty");
  const [packQty, setPackQty]       = useState(0);
  const [packQtyStr, setPackQtyStr] = useState("");
  const [packParent, setPackParent] = useState("");
  const [packChildren, setPackChildren] = useState<string[]>([]);
  const [packResult, setPackResult] = useState<{ parent: string; children: string[] } | null>(null);

  // Ship state
  const [shipStep, setShipStep]     = useState<"scan" | "select" | "done">("scan");
  const [shipPackage, setShipPackage] = useState("");
  const [shipDest, setShipDest]     = useState("");

  // Receive state
  const [rcvStep, setRcvStep]       = useState<SimpleStep>("scan");
  const [rcvPackage, setRcvPackage] = useState("");

  // Unpack state
  const [upkStep, setUpkStep]       = useState<SimpleStep>("scan");
  const [upkPackage, setUpkPackage] = useState("");

  // Dispense state
  const [dspItems, setDspItems]     = useState<string[]>([]);
  const [dspDone, setDspDone]       = useState(false);

  // Decommission state
  const [dcmStep, setDcmStep]       = useState<"scan" | "reason" | "done">("scan");
  const [dcmItem, setDcmItem]       = useState("");
  const [dcmReason, setDcmReason]   = useState("");

  // View state
  const [viewParent, setViewParent] = useState<string | null>(null);

  // Verify state
  const [vrfStep, setVrfStep]       = useState<"scan-parent" | "scan-children" | "done">("scan-parent");
  const [vrfParent, setVrfParent]   = useState("");
  const [vrfExpected, setVrfExpected] = useState<string[]>([]);
  const [vrfDone, setVrfDone]       = useState<string[]>([]);

  const scanBuffer  = useRef("");
  const lastKeyTime = useRef(0);
  const contentRef  = useRef<HTMLDivElement>(null);

  // Children list — from pack result or mock
  const childrenPool = packResult?.children.length
    ? packResult.children
    : [product.serial, `SN-0000090-BC`, `SN-0000091-CD`, `SN-0000092-DE`, `SN-0000093-EF`];

  // ── Handle incoming scan ───────────────────────────────────────────────────
  const handleScan = useCallback((raw: string) => {
    const v = raw.trim();
    if (!v) return;

    switch (screen) {
      case "commission": {
        if (commDone) return;
        const n = commItems.length + 1;
        const serial = `SN-${String(n + 88).padStart(7, "0")}-${String.fromCharCode(65 + (n % 26))}${String.fromCharCode(65 + ((n + 2) % 26))}`;
        setCommItems(prev => [...prev, serial]);
        break;
      }
      case "pack": {
        if (packStep === "scan-parent") {
          setPackParent(MOCK_SSCC);
          setPackStep("scan-children");
        } else if (packStep === "scan-children") {
          const next = childrenPool[packChildren.length] ?? `SN-${Date.now()}`;
          setPackChildren(prev => {
            const upd = [...prev, next];
            if (upd.length >= packQty) {
              const result = { parent: MOCK_SSCC, children: upd };
              setPackResult(result);
              setPackStep("done");
              onStepComplete?.("pack");
            }
            return upd;
          });
        }
        break;
      }
      case "ship": {
        if (shipStep === "scan") {
          setShipPackage(MOCK_SSCC);
          setShipStep("select");
        }
        break;
      }
      case "receive": {
        if (rcvStep === "scan") {
          setRcvPackage(MOCK_SSCC);
          setRcvStep("confirm");
        }
        break;
      }
      case "unpack": {
        if (upkStep === "scan") {
          setUpkPackage(MOCK_SSCC);
          setUpkStep("confirm");
        }
        break;
      }
      case "dispense": {
        if (dspDone) return;
        const next = childrenPool[dspItems.length] ?? `SN-${Date.now()}`;
        setDspItems(prev => {
          const upd = [...prev, next];
          if (upd.length >= childrenPool.length) {
            setDspDone(true);
            onStepComplete?.("dispense");
          }
          return upd;
        });
        break;
      }
      case "decommission": {
        if (dcmStep === "scan") {
          setDcmItem(product.serial);
          setDcmStep("reason");
        }
        break;
      }
      case "view": {
        setViewParent(MOCK_SSCC);
        break;
      }
      case "verify": {
        if (vrfStep === "scan-parent") {
          setVrfParent(MOCK_SSCC);
          setVrfExpected(childrenPool);
          setVrfStep("scan-children");
        } else if (vrfStep === "scan-children") {
          const next = vrfExpected[vrfDone.length];
          if (!next) return;
          setVrfDone(prev => {
            const upd = [...prev, next];
            if (upd.length >= vrfExpected.length) {
              setVrfStep("done");
              onStepComplete?.("verify");
            }
            return upd;
          });
        }
        break;
      }
    }

    // Scroll to bottom of app content
    setTimeout(() => {
      if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }, 50);
  }, [screen, commItems, commDone, packStep, packChildren, packQty, childrenPool, shipStep, rcvStep, upkStep, dspItems, dspDone, dcmStep, vrfStep, vrfExpected, vrfDone, product, onStepComplete]);

  // Physical scanner listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastKeyTime.current > 500) scanBuffer.current = "";
      lastKeyTime.current = now;
      if (e.key === "Enter" || e.key === "Tab") {
        const s = scanBuffer.current.trim();
        scanBuffer.current = "";
        if (s) handleScan(s);
      } else if (e.key.length === 1) {
        scanBuffer.current += e.key;
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [handleScan]);

  // Navigate to screen (reset state)
  const go = (s: AppScreen) => {
    if (s === "commission") { setCommItems([]); setCommDone(false); setCommMode("automatic"); }
    if (s === "pack")       { setPackStep("set-qty"); setPackQty(0); setPackQtyStr(""); setPackParent(""); setPackChildren([]); }
    if (s === "ship")       { setShipStep("scan"); setShipPackage(""); setShipDest(""); }
    if (s === "receive")    { setRcvStep("scan"); setRcvPackage(""); }
    if (s === "unpack")     { setUpkStep("scan"); setUpkPackage(""); }
    if (s === "dispense")   { setDspItems([]); setDspDone(false); }
    if (s === "decommission"){ setDcmStep("scan"); setDcmItem(""); setDcmReason(""); }
    if (s === "view")       { setViewParent(null); }
    if (s === "verify")     { setVrfStep("scan-parent"); setVrfParent(""); setVrfExpected([]); setVrfDone([]); }
    setScreen(s);
  };

  const goHome = () => setScreen("home");

  // ── Screen renderers ───────────────────────────────────────────────────────

  const renderHome = () => (
    <div style={{ padding: "0 0 12px" }}>
      {/* User row */}
      <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: 8 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="#9ca3af">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        <p style={{ margin: 0, fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>demo.track@sproxil.com</p>
      </div>

      {/* App Guide */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 16px 10px" }}>
        <div style={{ width: 22, height: 22, borderRadius: 9999, border: `2px solid ${APP_RED}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, color: APP_RED, fontWeight: 900 }}>?</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: APP_RED }}>App Guide</p>
      </div>

      {/* Client selector */}
      <div style={{ margin: "0 16px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", background: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontSize: 12, color: "#374151", fontWeight: 600 }}>{product.client.toUpperCase()}</p>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>✕</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>⌄</span>
        </div>
      </div>

      {/* Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 16px" }}>
        {MENU.map(m => (
          <motion.button
            key={m.id}
            onMouseDown={e => e.preventDefault()}
            onClick={() => go(m.id)}
            whileTap={{ scale: 0.98, x: 2 }}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "white", border: "1.5px solid #e5e7eb",
              borderRadius: 12, padding: "13px 16px", cursor: "pointer",
              textAlign: "left", width: "100%",
            }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111" }}>{m.label}</p>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={2} style={{ marginLeft: "auto", flexShrink: 0 }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderCommission = () => (
    <div>
      <AppHeader title="Commission Package" onBack={goHome} />
      <div style={{ padding: "0 16px 16px" }}>
        {/* Mode tabs */}
        <div style={{ display: "flex", border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginTop: 14 }}>
          {(["automatic", "batch"] as const).map(m => (
            <button key={m} onMouseDown={e => e.preventDefault()} onClick={() => setCommMode(m)}
              style={{
                flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
                background: commMode === m ? APP_RED : "white",
                color: commMode === m ? "white" : "#6b7280",
                fontWeight: 700, fontSize: 13,
              }}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Scan illustration */}
        <div style={{ margin: "14px 0", background: "#f9fafb", borderRadius: 10, padding: "14px", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 28 }}>📷</p>
          <p style={{ margin: "6px 0 0", fontSize: 10, color: "#9ca3af" }}>
            {commMode === "automatic"
              ? `Please click on the "scan barcode" field first, then start scanning labels to be commissioned.`
              : `Please click on the "scan barcode" field first, then start scanning labels. Click Submit when done.`}
          </p>
        </div>

        <p style={{ margin: "0 0 6px", fontWeight: 800, fontSize: 14, color: "#111" }}>Scanning Details</p>

        <FieldLabel>Quantity</FieldLabel>
        <ScanField value={commItems.length > 0 ? String(commItems.length) : "0"} placeholder="0" />

        <FieldLabel>Last Barcode</FieldLabel>
        <ScanField value={commItems[commItems.length - 1] ?? ""} />

        {commItems.length > 0 && (
          <div style={{ marginTop: 10, maxHeight: 100, overflowY: "auto" }}>
            {[...commItems].reverse().map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                <span style={{ color: "#16a34a", fontSize: 11 }}>✓</span>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#374151" }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {!commDone && (
          <ScanBtn onScan={() => handleScan("SCAN")} label="Scan Label" />
        )}

        {commItems.length > 0 && !commDone && (
          <motion.button onMouseDown={e => e.preventDefault()}
            onClick={() => { setCommDone(true); onStepComplete?.("commission"); }} whileTap={{ scale: 0.97 }}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 8, marginTop: 8,
              background: "#16a34a", color: "white", fontWeight: 700, fontSize: 13,
              border: "none", cursor: "pointer",
            }}>
            Submit ({commItems.length} label{commItems.length !== 1 ? "s" : ""})
          </motion.button>
        )}

        {commDone && (
          <DoneCard title={`${commItems.length} label${commItems.length !== 1 ? "s" : ""} commissioned`} onDone={goHome}>
            <InfoRow label="Client" value={product.client} />
            <InfoRow label="Product" value={product.name.slice(0, 22)} />
            <InfoRow label="Batch" value={product.batch} />
          </DoneCard>
        )}
      </div>
    </div>
  );

  const renderPack = () => (
    <div>
      <AppHeader title="Pack Package" onBack={goHome} />
      <div style={{ padding: "0 16px 16px" }}>
        {/* Illustration */}
        <div style={{ margin: "14px 0", background: "#f9fafb", borderRadius: 10, padding: "10px", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <span style={{ fontSize: 28 }}>📦</span>
          <p style={{ margin: "6px 0 0", fontSize: 10, color: "#9ca3af" }}>
            Please set the total number of items (children) to be packed first, then scan the parent package, before scanning the children packages.
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1: Set quantity */}
          {packStep === "set-qty" && (
            <motion.div key="qty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldLabel>Set Children Quantity</FieldLabel>
              <ScanField value={packQtyStr || "0"} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 12 }}>
                {["1","2","3","4","5","6","7","8","9",".","0","⌫"].map(k => (
                  <motion.button key={k} onMouseDown={e => e.preventDefault()} whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      if (k === "⌫") setPackQtyStr(p => p.slice(0, -1));
                      else if (k === ".") return;
                      else setPackQtyStr(p => (p + k).slice(0, 2));
                    }}
                    style={{
                      padding: "13px 0", border: `1.5px solid ${APP_RED}`, borderRadius: 10,
                      background: "white", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#111",
                    }}>{k}</motion.button>
                ))}
              </div>
              <motion.button onMouseDown={e => e.preventDefault()} whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const q = parseInt(packQtyStr);
                  if (q > 0) { setPackQty(q); setPackStep("scan-parent"); }
                }}
                disabled={!packQtyStr || parseInt(packQtyStr) < 1}
                style={{
                  width: "100%", padding: "11px 0", borderRadius: 8, marginTop: 10,
                  background: (!packQtyStr || parseInt(packQtyStr) < 1) ? "#d1d5db" : APP_RED,
                  color: "white", fontWeight: 700, fontSize: 13, border: "none",
                  cursor: (!packQtyStr || parseInt(packQtyStr) < 1) ? "not-allowed" : "pointer",
                }}>
                Confirm Quantity ({packQtyStr || 0})
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Scan parent */}
          {packStep === "scan-parent" && (
            <motion.div key="parent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldLabel>Scan Parent (Case SSCC)</FieldLabel>
              <ScanField value={packParent} />
              <FieldLabel>Parent Count</FieldLabel>
              <ScanField value="0" placeholder="0" />
              <ScanBtn onScan={() => handleScan("SSCC")} label="Scan Parent Case" />
            </motion.div>
          )}

          {/* Step 3: Scan children */}
          {packStep === "scan-children" && (
            <motion.div key="children" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ background: `${APP_RED}10`, borderRadius: 8, padding: "8px 12px", marginTop: 12, border: `1px solid ${APP_RED}30` }}>
                <p style={{ margin: 0, fontSize: 11, color: APP_RED, fontWeight: 700 }}>
                  Scan {packQty - packChildren.length} more item{packQty - packChildren.length !== 1 ? "s" : ""}
                </p>
              </div>
              <FieldLabel>Parent</FieldLabel>
              <ScanField value={packParent} />
              <FieldLabel>Scan Child ({packChildren.length}/{packQty})</FieldLabel>
              <ScanField value={packChildren[packChildren.length - 1] ?? ""} />
              {packChildren.length > 0 && (
                <div style={{ marginTop: 8, maxHeight: 90, overflowY: "auto" }}>
                  {[...packChildren].reverse().map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, padding: "2px 0" }}>
                      <span style={{ color: "#16a34a", fontSize: 11 }}>✓</span>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "#374151" }}>{c}</span>
                    </div>
                  ))}
                </div>
              )}
              <ScanBtn onScan={() => handleScan("CHILD")} label="Scan Child Item" />
            </motion.div>
          )}

          {/* Done */}
          {packStep === "done" && packResult && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DoneCard title={`${packResult.children.length} items packed`} onDone={goHome}>
                <InfoRow label="Parent (SSCC)" value={packResult.parent.slice(0, 16)} />
                <InfoRow label="Items packed" value={String(packResult.children.length)} />
                {packResult.children.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, margin: "2px 0" }}>
                    <span style={{ color: "#16a34a", fontSize: 10 }}>✓</span>
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: "#374151" }}>{c}</span>
                  </div>
                ))}
              </DoneCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderShip = () => (
    <div>
      <AppHeader title="Ship Package" onBack={goHome} />
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ margin: "14px 0", background: "#f9fafb", borderRadius: 10, padding: "10px", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <span style={{ fontSize: 28 }}>🚚</span>
          <p style={{ margin: "6px 0 0", fontSize: 10, color: "#9ca3af" }}>Scan the parent package, then select the destination location.</p>
        </div>

        <AnimatePresence mode="wait">
          {shipStep === "scan" && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldLabel>Scan Package (SSCC)</FieldLabel>
              <ScanField value={shipPackage} />
              <ScanBtn onScan={() => handleScan("SSCC")} label="Scan Package" />
            </motion.div>
          )}

          {shipStep === "select" && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldLabel>Package</FieldLabel>
              <ScanField value={shipPackage} />
              <FieldLabel>Select Destination</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                {LOCATIONS.map(loc => (
                  <motion.button key={loc} onMouseDown={e => e.preventDefault()} whileTap={{ scale: 0.98 }}
                    onClick={() => { setShipDest(loc); setShipStep("done"); onStepComplete?.("ship"); }}
                    style={{
                      padding: "11px 14px", border: `1.5px solid ${shipDest === loc ? APP_RED : "#e5e7eb"}`,
                      borderRadius: 10, cursor: "pointer", textAlign: "left", background: "white",
                      fontSize: 12, fontWeight: 600, color: "#111",
                    }}>
                    {loc}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {shipStep === "done" && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DoneCard title="Package dispatched" onDone={goHome}>
                <InfoRow label="Package" value={shipPackage.slice(0, 16)} />
                <InfoRow label="Destination" value={shipDest.split("—")[0].trim()} />
              </DoneCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderReceive = () => (
    <div>
      <AppHeader title="Receive Package" onBack={goHome} />
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ margin: "14px 0", background: "#f9fafb", borderRadius: 10, padding: "10px", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <span style={{ fontSize: 28 }}>📬</span>
          <p style={{ margin: "6px 0 0", fontSize: 10, color: "#9ca3af" }}>Scan the incoming package to confirm receipt.</p>
        </div>
        <AnimatePresence mode="wait">
          {rcvStep === "scan" && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldLabel>Scan Package (SSCC)</FieldLabel>
              <ScanField value={rcvPackage} />
              <ScanBtn onScan={() => handleScan("SSCC")} label="Scan Package" />
            </motion.div>
          )}
          {rcvStep === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldLabel>Package</FieldLabel>
              <ScanField value={rcvPackage} />
              <div style={{ marginTop: 12, background: "#f0f9ff", borderRadius: 10, padding: "12px 14px", border: "1px solid #bae6fd" }}>
                <InfoRow label="Contents" value={`${packResult?.children.length ?? 5} items`} />
                <InfoRow label="From" value={shipDest || "Factory — Apapa, Lagos"} />
                <InfoRow label="Product" value={product.name.slice(0, 22)} />
              </div>
              <motion.button onMouseDown={e => e.preventDefault()} onClick={() => { setRcvStep("done"); onStepComplete?.("receive"); }} whileTap={{ scale: 0.97 }}
                style={{ width: "100%", padding: "11px 0", borderRadius: 8, marginTop: 10, background: "#16a34a", color: "white", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
                ✓ Confirm Receipt
              </motion.button>
            </motion.div>
          )}
          {rcvStep === "done" && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DoneCard title="Package received" onDone={goHome}>
                <InfoRow label="Package" value={rcvPackage.slice(0, 16)} />
                <InfoRow label="Items" value={String(packResult?.children.length ?? 5)} />
              </DoneCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderUnpack = () => (
    <div>
      <AppHeader title="Unpack Package" onBack={goHome} />
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ margin: "14px 0", background: "#f9fafb", borderRadius: 10, padding: "10px", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <span style={{ fontSize: 28 }}>📤</span>
          <p style={{ margin: "6px 0 0", fontSize: 10, color: "#9ca3af" }}>Scan the case to open it and register the children at this location.</p>
        </div>
        <AnimatePresence mode="wait">
          {upkStep === "scan" && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldLabel>Scan Package (SSCC)</FieldLabel>
              <ScanField value={upkPackage} />
              <ScanBtn onScan={() => handleScan("SSCC")} label="Scan Package" />
            </motion.div>
          )}
          {upkStep === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldLabel>Package</FieldLabel>
              <ScanField value={upkPackage} />
              <div style={{ marginTop: 10 }}>
                {childrenPool.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: 11 }}>📦</span>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "#374151", flex: 1 }}>{c}</span>
                    <span style={{ fontSize: 9, color: "#16a34a", fontWeight: 700 }}>READY</span>
                  </div>
                ))}
              </div>
              <motion.button onMouseDown={e => e.preventDefault()} onClick={() => { setUpkStep("done"); onStepComplete?.("unpack"); }} whileTap={{ scale: 0.97 }}
                style={{ width: "100%", padding: "11px 0", borderRadius: 8, marginTop: 10, background: APP_RED, color: "white", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
                Confirm Unpack
              </motion.button>
            </motion.div>
          )}
          {upkStep === "done" && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DoneCard title={`${childrenPool.length} items unpacked`} onDone={goHome}>
                <InfoRow label="Package" value={upkPackage.slice(0, 16)} />
                <InfoRow label="Items released" value={String(childrenPool.length)} />
              </DoneCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderDispense = () => (
    <div>
      <AppHeader title="Dispense" onBack={goHome} />
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ margin: "14px 0", background: "#f9fafb", borderRadius: 10, padding: "10px", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <span style={{ fontSize: 28 }}>💊</span>
          <p style={{ margin: "6px 0 0", fontSize: 10, color: "#9ca3af" }}>Scan individual items to dispense them to the end point.</p>
        </div>
        <FieldLabel>Dispensed ({dspItems.length}/{childrenPool.length})</FieldLabel>
        <div style={{ background: "#f3f4f6", borderRadius: 8, height: 6, marginTop: 8, overflow: "hidden" }}>
          <motion.div animate={{ width: `${(dspItems.length / childrenPool.length) * 100}%` }}
            style={{ height: "100%", background: "#16a34a", borderRadius: 8, transition: "width 0.3s" }} />
        </div>
        {dspItems.length > 0 && (
          <div style={{ marginTop: 10, maxHeight: 100, overflowY: "auto" }}>
            {[...dspItems].reverse().map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 6, padding: "3px 0" }}>
                <span style={{ color: "#16a34a", fontSize: 11 }}>✓</span>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#374151" }}>{c}</span>
              </div>
            ))}
          </div>
        )}
        {!dspDone && <ScanBtn onScan={() => handleScan("ITEM")} label="Scan Item to Dispense" />}
        {dspDone && (
          <DoneCard title="All items dispensed" onDone={goHome}>
            <InfoRow label="Items" value={String(dspItems.length)} />
            <InfoRow label="Product" value={product.name.slice(0, 22)} />
          </DoneCard>
        )}
      </div>
    </div>
  );

  const renderDecommission = () => (
    <div>
      <AppHeader title="Decommission Label" onBack={goHome} />
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ margin: "14px 0", background: "#fef2f2", borderRadius: 10, padding: "10px", border: "1px solid #fecaca", textAlign: "center" }}>
          <span style={{ fontSize: 28 }}>⚠️</span>
          <p style={{ margin: "6px 0 0", fontSize: 10, color: "#dc2626" }}>Use this for damaged, tampered, or recalled products only.</p>
        </div>
        <AnimatePresence mode="wait">
          {dcmStep === "scan" && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldLabel>Scan Label to Decommission</FieldLabel>
              <ScanField value={dcmItem} />
              <ScanBtn onScan={() => handleScan("ITEM")} label="Scan Label" />
            </motion.div>
          )}
          {dcmStep === "reason" && (
            <motion.div key="reason" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldLabel>Label Scanned</FieldLabel>
              <ScanField value={dcmItem} />
              <FieldLabel>Select Reason</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                {DECOMMISSION_REASONS.map(r => (
                  <motion.button key={r} onMouseDown={e => e.preventDefault()} whileTap={{ scale: 0.98 }}
                    onClick={() => { setDcmReason(r); setDcmStep("done"); onStepComplete?.("decommission"); }}
                    style={{ padding: "10px 14px", border: `1.5px solid ${dcmReason === r ? "#dc2626" : "#e5e7eb"}`, borderRadius: 10, cursor: "pointer", textAlign: "left", background: "white", fontSize: 12, fontWeight: 600, color: "#111" }}>
                    {r}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          {dcmStep === "done" && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ marginTop: 16, background: "#fef2f2", borderRadius: 12, padding: "14px 16px", border: "1.5px solid #fecaca" }}>
                <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 14, color: "#dc2626" }}>✕ Label Decommissioned</p>
                <InfoRow label="Label" value={dcmItem} />
                <InfoRow label="Reason" value={dcmReason} />
              </div>
              <motion.button onMouseDown={e => e.preventDefault()} onClick={goHome} whileTap={{ scale: 0.97 }}
                style={{ width: "100%", padding: "11px 0", borderRadius: 8, marginTop: 12, background: APP_RED, color: "white", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
                ← Back to Home
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderView = () => (
    <div>
      <AppHeader title="View Package" onBack={goHome} />
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ margin: "14px 0", background: "#f9fafb", borderRadius: 10, padding: "10px", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <span style={{ fontSize: 28 }}>👁</span>
          <p style={{ margin: "6px 0 0", fontSize: 10, color: "#9ca3af" }}>Scan a parent package to view its contents and traceability chain.</p>
        </div>
        {!viewParent && (
          <>
            <FieldLabel>Scan Parent Package (SSCC)</FieldLabel>
            <ScanField value="" />
            <ScanBtn onScan={() => handleScan("SSCC")} label="Scan Parent Package" />
          </>
        )}
        <AnimatePresence>
          {viewParent && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <FieldLabel>Parent Package</FieldLabel>
              <ScanField value={viewParent} />
              <div style={{ marginTop: 12 }}>
                <div style={{ background: APP_DARK, borderRadius: 10, padding: "12px 14px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Package Details</p>
                  <InfoRow label="SSCC" value={viewParent.slice(0, 16)} />
                  <InfoRow label="Product" value={product.name.slice(0, 16)} />
                  <InfoRow label="Batch" value={product.batch} />
                  <InfoRow label="Items" value={String(childrenPool.length)} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#374151" }}>
                    Children ({childrenPool.length})
                  </p>
                  {childrenPool.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f9fafb", borderRadius: 8, marginBottom: 4, border: "1px solid #f3f4f6" }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af" }}>#{i + 1}</span>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "#111", flex: 1 }}>{c}</span>
                      <span style={{ fontSize: 9, color: "#16a34a", fontWeight: 700 }}>✓</span>
                    </div>
                  ))}
                </div>
              </div>
              <motion.button onMouseDown={e => e.preventDefault()} onClick={() => { setViewParent(null); onStepComplete?.("view"); }} whileTap={{ scale: 0.97 }}
                style={{ width: "100%", padding: "11px 0", borderRadius: 8, marginTop: 10, background: APP_RED, color: "white", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
                ← Back to Home
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderVerify = () => (
    <div>
      <AppHeader title="Verify Package" onBack={goHome} />
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ margin: "14px 0", background: "#f9fafb", borderRadius: 10, padding: "10px", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <span style={{ fontSize: 28 }}>✅</span>
          <p style={{ margin: "6px 0 0", fontSize: 10, color: "#9ca3af" }}>Scan the parent, then scan each child to verify they belong to this package.</p>
        </div>

        <AnimatePresence mode="wait">
          {vrfStep === "scan-parent" && (
            <motion.div key="parent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldLabel>Step 1 — Scan Parent (SSCC)</FieldLabel>
              <ScanField value={vrfParent} />
              <ScanBtn onScan={() => handleScan("SSCC")} label="Scan Parent Package" />
            </motion.div>
          )}

          {vrfStep === "scan-children" && (
            <motion.div key="children" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldLabel>Parent</FieldLabel>
              <ScanField value={vrfParent} />
              <div style={{ background: `${APP_RED}10`, borderRadius: 8, padding: "8px 12px", marginTop: 10, border: `1px solid ${APP_RED}30` }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: APP_RED }}>
                  Step 2 — Verify children: {vrfDone.length}/{vrfExpected.length}
                </p>
              </div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                {vrfExpected.map((c, i) => {
                  const done = vrfDone.includes(c);
                  const isNext = !done && vrfDone.length === i;
                  return (
                    <motion.div key={i} animate={{ backgroundColor: done ? "#f0fdf4" : isNext ? `${APP_RED}08` : "white" }}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, border: `1px solid ${done ? "#bbf7d0" : isNext ? `${APP_RED}40` : "#f3f4f6"}` }}>
                      <span style={{ fontSize: 10, fontFamily: "monospace", flex: 1, color: "#374151" }}>{c}</span>
                      {done && <span style={{ color: "#16a34a", fontWeight: 800, fontSize: 12 }}>✓</span>}
                      {isNext && <span style={{ color: APP_RED, fontWeight: 700, fontSize: 9 }}>SCAN</span>}
                      {!done && !isNext && <span style={{ color: "#d1d5db", fontSize: 12 }}>○</span>}
                    </motion.div>
                  );
                })}
              </div>
              <ScanBtn onScan={() => handleScan("CHILD")} label="Scan Child to Verify" disabled={vrfDone.length >= vrfExpected.length} />
            </motion.div>
          )}

          {vrfStep === "done" && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DoneCard title={`All ${vrfDone.length} items verified`} onDone={goHome}>
                <InfoRow label="Parent" value={vrfParent.slice(0, 16)} />
                <InfoRow label="Verified" value={`${vrfDone.length}/${vrfExpected.length}`} />
                <InfoRow label="Result" value="✓ Authentic" />
              </DoneCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderScreen = () => {
    switch (screen) {
      case "home":          return renderHome();
      case "commission":    return renderCommission();
      case "pack":          return renderPack();
      case "ship":          return renderShip();
      case "receive":       return renderReceive();
      case "unpack":        return renderUnpack();
      case "dispense":      return renderDispense();
      case "decommission":  return renderDecommission();
      case "view":          return renderView();
      case "verify":        return renderVerify();
    }
  };

  // ── Phone frame ────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "relative", width: 295 }}>
      {/* Side buttons */}
      {[{ top: 80, h: 32 }, { top: 124, h: 56 }, { top: 188, h: 56 }].map((b, i) => (
        <div key={i} style={{
          position: "absolute", left: -6, top: b.top, width: 4, height: b.h,
          background: "#2a2a2a", borderRadius: "3px 0 0 3px",
        }} />
      ))}
      <div style={{
        position: "absolute", right: -6, top: 110, width: 4, height: 70,
        background: "#2a2a2a", borderRadius: "0 3px 3px 0",
      }} />

      {/* Phone body */}
      <div style={{
        background: "#1a1a1d", borderRadius: 44, padding: "14px 8px",
        boxShadow: "0 0 0 3px #1a1a1a, 0 0 0 8px #2d2d2d, 0 30px 80px rgba(0,0,0,0.45)",
      }}>
        {/* Notch */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <div style={{ width: 80, height: 22, background: "#0a0a0a", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: 9999, background: "#2a2a2a" }} />
            <div style={{ width: 10, height: 10, borderRadius: 9999, background: "#1a1a1a", border: "1px solid #2a2a2a" }} />
          </div>
        </div>

        {/* Screen */}
        <div style={{ background: "#f5f5f5", borderRadius: 28, overflow: "hidden", height: 560, display: "flex", flexDirection: "column" }}>
          {/* Status bar */}
          <div style={{ background: "white", padding: "6px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#111" }}>9:41</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <svg width={12} height={10} viewBox="0 0 24 24" fill="#111"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="#111" strokeWidth={1.5} strokeLinecap="round" fill="none" /></svg>
              <svg width={14} height={10} viewBox="0 0 24 16" fill="#111"><rect x="1" y="1" width="18" height="14" rx="3" stroke="#111" strokeWidth={1.5} fill="none" /><rect x="3" y="3" width="12" height="10" rx={1.5} fill="#111" /><path d="M20 6v4a2 2 0 0 0 0-4z" fill="#111" /></svg>
            </div>
          </div>

          {/* App content */}
          <div ref={contentRef} style={{ flex: 1, overflowY: "auto", background: "#f5f5f5" }}>
            <AnimatePresence mode="wait">
              <motion.div key={screen} initial={{ opacity: 0, x: screen === "home" ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Home bar */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <div style={{ width: 90, height: 4, background: "rgba(255,255,255,0.25)", borderRadius: 9999 }} />
        </div>
      </div>
    </div>
  );
}
