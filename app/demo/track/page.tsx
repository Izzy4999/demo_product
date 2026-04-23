"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import Navbar from "@/components/Navbar";
import TrackPhoneEmulator, { WorkflowStep } from "@/components/TrackPhoneEmulator";
import ScannerDevice from "@/components/ScannerDevice";

const COLOR = "#2D9D3A";

// ─── Static data ──────────────────────────────────────────────────────────────

const CLIENTS = ["Sanofi Nigeria", "GlaxoSmithKline NG", "Roche Nigeria", "Auscel Laboratories Limited"];

const LOCATIONS = [
  "Lagos — Apapa Warehouse",
  "Kano — Central Distribution Hub",
  "Abuja — FCT Depot",
  "Port Harcourt — Rivers State Depot",
  "Onitsha — Main Market Depot",
  "Ibadan — SW Regional Hub",
];

const GTIN_OPTIONS = [
  { gtin: "05900232923", name: "Panadol Extra 500mg × 12",  sku: "PAN-EX-12-NG",  barcode: "5900232923" },
  { gtin: "05900232924", name: "Panadol Extra 500mg × 24",  sku: "PAN-EX-24-NG",  barcode: "5900232924" },
  { gtin: "05900232925", name: "Panadol Extra Caplet × 16", sku: "PAN-CP-16-NG",  barcode: "5900232925" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductData {
  name: string; batch: string; sku: string; expiry: string;
  barcode: string; gtin: string; client: string; mfg: string;
  serial: string; volume: number;
}


// Bulk serial records
interface SGTINRow   { index: number; ai: string; gtin14: string; serial: string; batch: string; expiry: string; }
interface SGTINBatch { id: string; productName: string; clientName: string; dateGenerated: string; generatedBy: string; batchLot: string; expiryDate: string; mfgDate: string; volume: number; rows: SGTINRow[]; }
interface SSCCRow    { index: number; ai: string; sscc18: string; client: string; location: string; tag: string; }
interface SSCCBatch  { id: string; clientName: string; productName: string; volume: number; tag: string; dateGenerated: string; rows: SSCCRow[]; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

function toYYMMDD(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}${mm}${dd}`;
  } catch { return iso; }
}

function yymmddToExpiry(s: string) {
  if (s.length !== 6) return s;
  return `${s.slice(2, 4)}/20${s.slice(0, 2)}`;
}

function expiryShort(iso: string) {
  try { const d = new Date(iso); return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`; }
  catch { return "08/2026"; }
}

function genSerial(seqType: string, numType: string, n: number) {
  const pad = String(n).padStart(7, "0");
  if (seqType === "sequential") {
    if (numType === "alphanumeric") {
      const a = String.fromCharCode(65 + (n % 26));
      const b = String.fromCharCode(65 + ((n + 3) % 26));
      return `SN-${pad}-${a}${b}`;
    }
    return `SN-${pad}`;
  } else {
    if (numType === "alphanumeric") {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    }
    return String(Math.floor(10000000 + Math.random() * 89999999));
  }
}

/** Pad GTIN to 14 digits */
function toGtin14(gtin: string) { return gtin.replace(/\D/g, "").padStart(14, "0"); }

/** Build a realistic-looking 18-digit SSCC from company prefix + sequence */
function buildSSCC(gtin: string, seq: number) {
  const prefix = gtin.replace(/\D/g, "").slice(0, 9); // 9-digit company prefix
  const ext = "3"; // extension digit
  const seqPad = String(seq).padStart(8, "0");
  const body = `${ext}${prefix}${seqPad}`; // 18 chars
  return body.slice(0, 17) + calcCheckDigit(body.slice(0, 17));
}

function calcCheckDigit(s: string): string {
  const digits = s.split("").map(Number);
  let sum = 0;
  digits.forEach((d, i) => { sum += d * ((i % 2 === 0) ? 3 : 1); });
  return String((10 - (sum % 10)) % 10);
}

/** Generate a full batch of SGTINs */
function generateSGTINs(gtin: string, batch: string, expiry: string, volume: number, seqType: string, numType: string): SGTINRow[] {
  const gtin14 = toGtin14(gtin);
  const rows: SGTINRow[] = [];
  for (let i = 1; i <= volume; i++) {
    const serial = genSerial(seqType, numType, i);
    rows.push({ index: i, ai: `(01)${gtin14}(21)${serial}`, gtin14, serial, batch, expiry });
  }
  return rows;
}

/** Generate a batch of SSCCs */
function generateSSCCs(gtin: string, client: string, location: string, tag: string, count: number): SSCCRow[] {
  const rows: SSCCRow[] = [];
  for (let i = 1; i <= count; i++) {
    const sscc18 = buildSSCC(gtin, i);
    rows.push({ index: i, ai: `(00)${sscc18}`, sscc18, client, location, tag });
  }
  return rows;
}


// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_SGTIN = "sp_track_sgtin_batches";
const LS_SSCC  = "sp_track_sscc_batches";
const LS_COMM  = "sp_track_commissioned";

function lsLoad<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSave(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PRODUCT: ProductData = {
  name: "Panadol Extra 500mg × 12", batch: "L213050-A", sku: "PAN-EX-12-NG",
  expiry: "08/2026", barcode: "5900232923", gtin: "05900232923",
  client: "Sanofi Nigeria", mfg: "15 Jan 2024", serial: "SN-0000089-AB", volume: 100,
};

// ─── ProductLabel (used in Phase 1 preview) ───────────────────────────────────

function ProductLabel({ product, qrValue, scanning, compact = false }: { product: ProductData; qrValue: string; scanning: boolean; compact?: boolean }) {
  const qrSize  = compact ? 52 : 76;
  const nameSz  = compact ? 11 : 13;
  const metaSz  = compact ? 7  : 8;
  const valueSz = compact ? 8  : 9;
  const pad     = compact ? "10px 12px" : "14px 16px";

  return (
    <div style={{
      background: "white", borderRadius: 12, padding: pad,
      border: "1.5px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      position: "relative", overflow: "hidden", width: "100%",
    }}>
      <AnimatePresence>
        {scanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.06)", zIndex: 1 }}>
            <motion.div initial={{ top: 0 }} animate={{ top: "100%" }} transition={{ duration: 0.45, ease: "linear" }}
              style={{ position: "absolute", left: 0, right: 0, height: 3, background: "rgba(239,68,68,0.7)", boxShadow: "0 0 12px rgba(239,68,68,0.8)" }} />
          </motion.div>
        )}
      </AnimatePresence>

      {[["top-2 left-2","border-t-2 border-l-2"],["top-2 right-2","border-t-2 border-r-2"],["bottom-2 left-2","border-b-2 border-l-2"],["bottom-2 right-2","border-b-2 border-r-2"]].map(([pos, border], i) => (
        <div key={i} className={`absolute ${pos} ${border} w-3 h-3`} style={{ borderColor: scanning ? "#ef4444" : "#d1d5db", transition: "border-color 0.2s" }} />
      ))}

      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: COLOR, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "white", fontSize: 8, fontWeight: 900 }}>S</span>
              </div>
              <span style={{ fontSize: 7, fontWeight: 700, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase" }}>Sproxil Track™</span>
            </div>
            <p style={{ fontSize: nameSz, fontWeight: 800, color: "#111", margin: 0, lineHeight: 1.2 }}>{product.name}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 8px", marginTop: 6 }}>
              {[["Batch", product.batch], ["Serial", product.serial], ["GTIN", product.gtin], ["Expiry", product.expiry]].map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontSize: metaSz, color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</p>
                  <p style={{ fontSize: valueSz, fontWeight: 700, color: "#374151", margin: 0, fontFamily: "monospace" }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
            <div style={{ padding: 3, background: "white", border: "1px solid #e5e7eb", borderRadius: 5 }}>
              <QRCodeSVG value={qrValue} size={qrSize} level="M" />
            </div>
            <p style={{ fontSize: 6, color: "#9ca3af", margin: 0, textAlign: "center" }}>Scan to verify</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Label Generation Phase ───────────────────────────────────────────────────

function LabelGenerationPhase({ onGenerate, onProceed, commissionedSerials }: {
  onGenerate: (product: ProductData) => void;
  onProceed: (sscc18: string, serials: string[]) => void;
  commissionedSerials: string[];
}) {
  const [tab, setTab] = useState<"sgtin" | "sscc">("sscc");

  // SGTIN state — init from localStorage
  const [sgtinForm, setSgtinForm] = useState({
    client: "", location: "", gtin: "", batch: "",
    volume: "", tag: "", seqType: "", numType: "",
    mfgDate: "", expiryDate: "",
  });
  const [sgtinBatches, setSgtinBatches] = useState<SGTINBatch[]>(() => lsLoad<SGTINBatch[]>(LS_SGTIN, []));
  const [sgtinGenerating, setSgtinGenerating] = useState(false);
  const [sgtinCount, setSgtinCount] = useState(0);
  const [selectedSgtinId, setSelectedSgtinId] = useState<string | null>(() => {
    const saved = lsLoad<SGTINBatch[]>(LS_SGTIN, []);
    return saved[0]?.id ?? null;
  });

  // SSCC state — init from localStorage
  const [ssccForm, setSsccForm] = useState({
    client: CLIENTS[0], location: "", gtin: GTIN_OPTIONS[0].gtin, volume: "50", tag: "",
  });
  const [ssccBatches, setSsccBatches] = useState<SSCCBatch[]>(() => lsLoad<SSCCBatch[]>(LS_SSCC, []));
  const [ssccGenerating, setSsccGenerating] = useState(false);
  const [ssccCount, setSsccCount] = useState(0);
  const [selectedSsccId, setSelectedSsccId] = useState<string | null>(() => {
    const saved = lsLoad<SSCCBatch[]>(LS_SSCC, []);
    return saved[0]?.id ?? null;
  });

  const setS = (k: string, v: string) => setSgtinForm(f => ({ ...f, [k]: v }));
  const setC = (k: string, v: string) => setSsccForm(f => ({ ...f, [k]: v }));

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb",
    fontSize: 13, color: "#111", background: "white", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280",
    textTransform: "uppercase" as const, letterSpacing: 0.6, marginBottom: 5,
  };

  // ── Generate SGTINs ──────────────────────────────────────────────────────────
  const handleGenerateSGTINs = () => {
    const gtinVal   = sgtinForm.gtin || GTIN_OPTIONS[0].gtin;
    const seqType   = sgtinForm.seqType || "sequential";
    const numType   = sgtinForm.numType || "alphanumeric";
    const vol       = Math.min(Math.max(parseInt(sgtinForm.volume) || 100, 1), 5000);
    const batchVal  = sgtinForm.batch || "L000001-A";
    const mfgVal    = sgtinForm.mfgDate || "2024-01-15";
    const expiryVal = sgtinForm.expiryDate || "2026-08-01";

    setSgtinGenerating(true);
    setSgtinCount(0);
    const expShort = expiryShort(expiryVal);

    let done = 0;
    const chunk = 100;
    const all: SGTINRow[] = [];

    const tick = () => {
      const end = Math.min(done + chunk, vol);
      const partial = generateSGTINs(gtinVal, batchVal, expShort, end - done, seqType, numType);
      partial.forEach((r, i) => { r.index = done + i + 1; });
      all.push(...partial);
      done = end;
      setSgtinCount(done);
      if (done < vol) {
        setTimeout(tick, 16);
      } else {
        setSgtinGenerating(false);
        const gtinOpt   = GTIN_OPTIONS.find(g => g.gtin === gtinVal) || GTIN_OPTIONS[0];
        const clientVal = sgtinForm.client || CLIENTS[0];
        const now       = new Date();
        const dateGenerated = now.toISOString().slice(0, 10) + " " + now.toTimeString().slice(0, 8);

        const sgtinBatch: SGTINBatch = {
          id: `sgtin-${Date.now()}`,
          productName:   gtinOpt.name,
          clientName:    clientVal,
          dateGenerated,
          generatedBy:   "demo.user@sproxil.com",
          batchLot:      batchVal,
          expiryDate:    toYYMMDD(expiryVal),
          mfgDate:       toYYMMDD(mfgVal),
          volume:        vol,
          rows:          all,
        };
        setSgtinBatches(prev => {
          const updated = [sgtinBatch, ...prev];
          lsSave(LS_SGTIN, updated);
          return updated;
        });
        setSelectedSgtinId(sgtinBatch.id);

        const product: ProductData = {
          name: gtinOpt.name, batch: batchVal, sku: gtinOpt.sku,
          expiry: expShort, barcode: gtinOpt.barcode, gtin: gtinOpt.gtin,
          client: clientVal, mfg: fmtDate(mfgVal),
          serial: all[0].serial, volume: vol,
        };
        onGenerate(product);
      }
    };
    setTimeout(tick, 50);
  };

  // ── Generate SSCCs ───────────────────────────────────────────────────────────
  const handleGenerateSSCCs = () => {
    const count = Math.min(Math.max(parseInt(ssccForm.volume) || 50, 1), 1000);
    setSsccGenerating(true);
    setSsccCount(0);

    let done = 0;
    const chunk = 50;
    const all: SSCCRow[] = [];

    const tick = () => {
      const end = Math.min(done + chunk, count);
      const partial = generateSSCCs(ssccForm.gtin, ssccForm.client, ssccForm.location, ssccForm.tag, end - done);
      partial.forEach((r, i) => { r.index = done + i + 1; });
      all.push(...partial);
      done = end;
      setSsccCount(done);
      if (done < count) {
        setTimeout(tick, 16);
      } else {
        const gtinOpt = GTIN_OPTIONS.find(g => g.gtin === ssccForm.gtin) || GTIN_OPTIONS[0];
        const now = new Date();
        const dateGenerated = now.toISOString().slice(0, 10) + " " +
          now.toTimeString().slice(0, 8);
        const batch: SSCCBatch = {
          id: `sscc-${Date.now()}`,
          clientName: ssccForm.client,
          productName: gtinOpt.name,
          volume: count,
          tag: ssccForm.tag,
          dateGenerated,
          rows: all,
        };
        setSsccBatches(prev => {
          const updated = [batch, ...prev];
          lsSave(LS_SSCC, updated);
          return updated;
        });
        setSelectedSsccId(batch.id);
        setSsccGenerating(false);
      }
    };
    setTimeout(tick, 50);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-xl leading-none mb-0.5">Serialization</h2>
          <p className="text-xs text-gray-400">
            <strong>SGTINs</strong> (Serialized Global Trade Item Number) are applied to each <strong>unit product</strong> — the child.&nbsp;
            <strong>SSCCs</strong> (Serial Shipping Container Code) are applied to each <strong>pack / case</strong> — the parent.
            Generate each independently in bulk.
          </p>
        </div>

        {/* Tabs — SSCC first, then GTIN */}
        <div className="flex border-b border-gray-100 px-6">
          {(["sscc", "sgtin"] as const).map(t => (
            <button key={t} onMouseDown={e => e.preventDefault()} onClick={() => setTab(t)}
              className="px-5 py-3 text-sm font-bold cursor-pointer border-0 bg-transparent border-b-2 transition-colors flex items-center gap-2"
              style={{ borderBottomColor: tab === t ? COLOR : "transparent", color: tab === t ? COLOR : "#6b7280", marginBottom: -1 }}>
              {t === "sscc" ? "SSCCs" : "GTINs"}
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: tab === t ? `${COLOR}15` : "#f3f4f6", color: tab === t ? COLOR : "#9ca3af" }}>
                {t === "sscc" ? "Pack / Parent" : "Unit / Child"}
              </span>
            </button>
          ))}
        </div>

        {/* ── SGTIN TAB ──────────────────────────────────────────────────────── */}
        {tab === "sgtin" && (
          <div>
            {/* Form */}
            <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 space-y-4">
              <p className="text-[11px] text-gray-500">Enter the required GTIN details here. Click submit when you&apos;re done.</p>

              {/* Locations */}
              <div>
                <label style={labelStyle}>Locations</label>
                <select value={sgtinForm.location} onChange={e => setS("location", e.target.value)} style={inputStyle}>
                  <option value="">Select your location</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* GTINs */}
              <div>
                <label style={labelStyle}>GTINs</label>
                <select value={sgtinForm.gtin} onChange={e => setS("gtin", e.target.value)} style={inputStyle}>
                  <option value="">Select GTIN</option>
                  {GTIN_OPTIONS.map(g => <option key={g.gtin} value={g.gtin}>{g.name}</option>)}
                </select>
              </div>

              {/* LOT/BATCH NO. + Volume + Tag */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label style={labelStyle}>Lot/Batch No.</label>
                  <input value={sgtinForm.batch} onChange={e => setS("batch", e.target.value)} style={inputStyle} placeholder="lot/batch number" />
                </div>
                <div>
                  <label style={labelStyle}>Volume</label>
                  <input value={sgtinForm.volume} onChange={e => setS("volume", e.target.value)} style={inputStyle} placeholder="set volume" />
                </div>
                <div>
                  <label style={labelStyle}>Tag</label>
                  <input value={sgtinForm.tag} onChange={e => setS("tag", e.target.value)} style={inputStyle} placeholder="Set Tag" />
                </div>
              </div>

              {/* Serial Number radios */}
              <div className="grid grid-cols-2 gap-4">
                <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "14px 16px" }}>
                  <p style={{ ...labelStyle, marginBottom: 10 }}>Serial Number Sequence Type</p>
                  {[["sequential", "Sequential Serial Number"], ["random", "Random Serial Number"]].map(([v, lbl]) => (
                    <label key={v} className="flex items-center gap-2.5 text-sm cursor-pointer mb-2" style={{ color: sgtinForm.seqType === v ? "#111" : "#6b7280" }}>
                      <input type="radio" name="sgtinSeq" value={v} checked={sgtinForm.seqType === v} onChange={() => setS("seqType", v)}
                        style={{ accentColor: "#8B1A1A", width: 16, height: 16 }} />
                      {lbl}
                    </label>
                  ))}
                </div>
                <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "14px 16px" }}>
                  <p style={{ ...labelStyle, marginBottom: 10 }}>Serial Number Type</p>
                  {[["alphanumeric", "Alpha-numeric"], ["numeric", "Numeric"]].map(([v, lbl]) => (
                    <label key={v} className="flex items-center gap-2.5 text-sm cursor-pointer mb-2" style={{ color: sgtinForm.numType === v ? "#111" : "#6b7280" }}>
                      <input type="radio" name="sgtinNum" value={v} checked={sgtinForm.numType === v} onChange={() => setS("numType", v)}
                        style={{ accentColor: "#8B1A1A", width: 16, height: 16 }} />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>

              {/* MFG + Expiry + Submit */}
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label style={labelStyle}>MFG Date</label>
                  <input type="date" value={sgtinForm.mfgDate} onChange={e => setS("mfgDate", e.target.value)} style={inputStyle} />
                </div>
                <div className="flex-1">
                  <label style={labelStyle}>Expiry Date</label>
                  <input type="date" value={sgtinForm.expiryDate} onChange={e => setS("expiryDate", e.target.value)} style={inputStyle} />
                </div>
                <button onMouseDown={e => e.preventDefault()} onClick={handleGenerateSGTINs} disabled={sgtinGenerating}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold cursor-pointer border-0 disabled:opacity-60 flex-shrink-0"
                  style={{ background: "#8B1A1A" }}>
                  {sgtinGenerating ? `Generating… ${sgtinCount.toLocaleString()}` : "Submit"}
                </button>
              </div>
            </div>

            {/* GTIN batch history */}
            {sgtinBatches.length > 0 && !sgtinGenerating && (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                      {["", "Product Name", "Client Name", "BATCH/LOT", "Expiry", "Volume", "Status", ""].map((h, i) => (
                        <th key={i} style={{ padding: "12px 16px", fontSize: 12, fontWeight: 500, color: "#6b7280", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sgtinBatches.map((batch) => {
                      const selected = batch.id === selectedSgtinId;
                      const sampleSerials = batch.rows.slice(0, 3).map(r => r.serial);
                      const commCount = sampleSerials.filter(s => commissionedSerials.includes(s)).length;
                      const allComm = commCount === sampleSerials.length;
                      return (
                        <tr key={batch.id} style={{ borderBottom: "1px solid #f9fafb", background: selected ? `${COLOR}06` : "white", transition: "background 0.2s" }}>
                          <td style={{ padding: "12px 16px", width: 28 }}>
                            <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${selected ? COLOR : "#d1d5db"}`, background: selected ? COLOR : "white", flexShrink: 0 }} />
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151", fontWeight: selected ? 700 : 400 }}>{batch.productName}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{batch.clientName}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "monospace", color: "#374151" }}>{batch.batchLot}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "monospace", color: "#6b7280" }}>{batch.expiryDate}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{batch.volume.toLocaleString()}</td>
                          <td style={{ padding: "12px 16px" }}>
                            {allComm
                              ? <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "2px 8px", borderRadius: 9999, border: "1px solid #bbf7d0" }}>✓ All Commissioned</span>
                              : commCount > 0
                                ? <span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", background: "#fff7ed", padding: "2px 8px", borderRadius: 9999, border: "1px solid #fed7aa" }}>{commCount}/3 Commissioned</span>
                                : <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", background: "#f9fafb", padding: "2px 8px", borderRadius: 9999, border: "1px solid #e5e7eb" }}>Not commissioned</span>
                            }
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => setSelectedSgtinId(batch.id)}
                              style={{ padding: "5px 14px", borderRadius: 8, border: `1.5px solid ${selected ? COLOR : "#e5e7eb"}`, background: selected ? COLOR : "white", color: selected ? "white" : "#374151", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                              {selected ? "✓ Selected" : "Use"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {sgtinBatches.length === 0 && !sgtinGenerating && (
              <div className="py-16 text-center text-gray-400 text-sm">
                No GTINs generated yet. Fill in the form above and click <strong>Submit</strong>.
              </div>
            )}

            {sgtinGenerating && (
              <div className="py-16 flex flex-col items-center gap-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  style={{ width: 32, height: 32, border: `3px solid ${COLOR}30`, borderTopColor: COLOR, borderRadius: 9999 }} />
                <div className="text-center">
                  <p className="font-black text-2xl" style={{ color: COLOR }}>{sgtinCount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">GTINs generated…</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SSCC TAB ───────────────────────────────────────────────────────── */}
        {tab === "sscc" && (
          <div>
            {/* Form */}
            <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: COLOR }}>
                Generate SSCC Batch — Pack / Case-Level Serial Numbers
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label style={labelStyle}>Locations</label>
                  <select value={ssccForm.location} onChange={e => setC("location", e.target.value)} style={inputStyle}>
                    <option value="">Select your location</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label style={labelStyle}>GTINs</label>
                  <select value={ssccForm.gtin} onChange={e => setC("gtin", e.target.value)} style={inputStyle}>
                    {GTIN_OPTIONS.map(g => <option key={g.gtin} value={g.gtin}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Volume</label>
                  <input value={ssccForm.volume} onChange={e => setC("volume", e.target.value)} style={inputStyle} placeholder="set volume" />
                </div>
                <div>
                  <label style={labelStyle}>Tag</label>
                  <input value={ssccForm.tag} onChange={e => setC("tag", e.target.value)} style={inputStyle} placeholder="Set Tag" />
                </div>
              </div>
              <div className="mt-5">
                <button onMouseDown={e => e.preventDefault()} onClick={handleGenerateSSCCs} disabled={ssccGenerating}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold cursor-pointer border-0 disabled:opacity-60"
                  style={{ background: "#8B1A1A" }}>
                  {ssccGenerating ? `Generating… ${ssccCount.toLocaleString()}` : "Submit"}
                </button>
              </div>
            </div>

            {/* SSCC batch history */}
            {ssccBatches.length > 0 && !ssccGenerating && (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                      {["", "Product Name", "Volume", "SSCC", "Tag", "Date Generated", ""].map((h, i) => (
                        <th key={i} style={{ padding: "12px 16px", fontSize: 12, fontWeight: 500, color: "#6b7280", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ssccBatches.map((batch) => {
                      const selected = batch.id === selectedSsccId;
                      const sscc18 = batch.rows[0]?.sscc18 ?? "—";
                      return (
                        <tr key={batch.id} style={{ borderBottom: "1px solid #f9fafb", background: selected ? `${COLOR}06` : "white", transition: "background 0.2s" }}>
                          <td style={{ padding: "12px 16px", width: 28 }}>
                            <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${selected ? COLOR : "#d1d5db"}`, background: selected ? COLOR : "white" }} />
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151", fontWeight: selected ? 700 : 400 }}>{batch.productName}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{batch.volume.toLocaleString()}</td>
                          <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: "monospace", color: "#6b7280" }}>{sscc18}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280" }}>{batch.tag || "—"}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#6b7280", fontVariantNumeric: "tabular-nums" }}>{batch.dateGenerated}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <button onMouseDown={e => e.preventDefault()} onClick={() => setSelectedSsccId(batch.id)}
                              style={{ padding: "5px 14px", borderRadius: 8, border: `1.5px solid ${selected ? COLOR : "#e5e7eb"}`, background: selected ? COLOR : "white", color: selected ? "white" : "#374151", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                              {selected ? "✓ Selected" : "Use"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {ssccBatches.length === 0 && !ssccGenerating && (
              <div className="py-16 text-center text-gray-400 text-sm">
                No SSCCs generated yet. Fill in the form above and click <strong>Submit</strong>.
              </div>
            )}

            {ssccGenerating && (
              <div className="py-16 flex flex-col items-center gap-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  style={{ width: 32, height: 32, border: `3px solid ${COLOR}30`, borderTopColor: COLOR, borderRadius: 9999 }} />
                <div className="text-center">
                  <p className="font-black text-2xl" style={{ color: COLOR }}>{ssccCount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">SSCCs generated…</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Proceed to mobile — uses selected batches (or first if nothing selected) */}
      {ssccBatches.length > 0 && sgtinBatches.length > 0 && (() => {
        const selSscc     = ssccBatches.find(b => b.id === selectedSsccId) ?? ssccBatches[0];
        const selSgtin    = sgtinBatches.find(b => b.id === selectedSgtinId) ?? sgtinBatches[0];
        const sscc18      = selSscc.rows[0]?.sscc18 ?? "";
        const sgtinBatch  = selSgtin;
        const sampleRows  = sgtinBatch.rows.slice(0, 3);   // preview only
        const serials     = sgtinBatch.rows.slice(0, 20).map(r => r.serial);
        const gtin14      = sampleRows[0]?.gtin14 ?? "";
        const gtinOption  = GTIN_OPTIONS.find(g => toGtin14(g.gtin) === gtin14);
        const gtinDisplay = gtinOption?.gtin ?? gtin14.replace(/^0+/, "");
        const expDisplay  = yymmddToExpiry(sgtinBatch.expiryDate);

        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: COLOR }}>Ready to Proceed</p>
                <p className="text-sm text-gray-500">Labels generated — these codes will be used in the mobile app simulation</p>
              </div>
              <button onMouseDown={e => e.preventDefault()}
                onClick={() => onProceed(sscc18, serials)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold cursor-pointer border-0"
                style={{ background: "#8B1A1A" }}>
                Open Mobile App →
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              {/* SSCC barcode */}
              <div className="px-6 py-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">SSCC-18 — Pack / Case Barcode</p>
                <div className="rounded-xl border border-gray-100 overflow-hidden" style={{ background: `${COLOR}04` }}>
                  <div className="flex items-center gap-2 px-4 pt-4 pb-1">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0" style={{ background: COLOR }}>00</div>
                    <span className="font-mono font-bold text-gray-900 text-sm">{sscc18}</span>
                  </div>
                  <div className="flex justify-center px-4 pb-3 pt-1">
                    <Barcode
                      value={`(00)${sscc18}`}
                      format="CODE128" width={1.4} height={52}
                      displayValue={false} background="transparent" lineColor="#1a1a1a" margin={0}
                    />
                  </div>
                  <p className="text-[9px] font-mono text-gray-400 text-center pb-3">(00){sscc18}</p>
                </div>
              </div>

              {/* SGTIN label cards */}
              <div className="px-6 py-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Unit SGTIN Labels — Scan Each</p>
                <div className="space-y-3">
                  {sampleRows.map((row, i) => {
                    const product: ProductData = {
                      name: sgtinBatch.productName,
                      batch: sgtinBatch.batchLot,
                      sku: gtinOption?.sku ?? "",
                      expiry: expDisplay,
                      barcode: gtinDisplay,
                      gtin: gtinDisplay,
                      client: sgtinBatch.clientName,
                      mfg: sgtinBatch.mfgDate,
                      serial: row.serial,
                      volume: sgtinBatch.volume,
                    };
                    return (
                      <div key={row.serial}>
                        <p className="text-[10px] font-bold text-gray-400 mb-1.5 ml-0.5">Label {i + 1}</p>
                        <ProductLabel
                          product={product}
                          qrValue={`(01)${gtin14}(21)${row.serial}`}
                          scanning={false}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}

// ─── Workflow steps metadata ───────────────────────────────────────────────────

const WORKFLOW_STEPS: { id: WorkflowStep; label: string; icon: string; tip: string }[] = [
  { id: "commission",   label: "Commission Labels",  icon: "⚡", tip: "Scan each product label to activate and register it on the system" },
  { id: "pack",         label: "Pack Products",      icon: "📦", tip: "Set quantity, scan the parent case (SSCC), then scan each child item" },
  { id: "ship",         label: "Ship Package",       icon: "🚚", tip: "Scan the packed case and select the destination location" },
  { id: "receive",      label: "Receive Package",    icon: "📬", tip: "Scan the arriving package to confirm it has been received" },
  { id: "unpack",       label: "Unpack Package",     icon: "📤", tip: "Scan the case to open it and register items at this location" },
  { id: "dispense",     label: "Dispense",           icon: "💊", tip: "Scan individual items to issue them to the end distribution point" },
  { id: "decommission", label: "Decommission Label", icon: "❌", tip: "Scan a label and select a reason to remove it from circulation" },
  { id: "view",         label: "View Package",       icon: "👁", tip: "Scan a parent package to inspect its children and traceability chain" },
  { id: "verify",       label: "Verify Package",     icon: "✅", tip: "Scan the parent, then scan each child to confirm authenticity" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrackDemo() {
  const [phase, setPhase]               = useState<"generate" | "app">("generate");
  const [generatedProduct, setGeneratedProduct] = useState<ProductData | null>(null);
  const [activeSscc, setActiveSscc]     = useState<string | undefined>(undefined);
  const [activeSerials, setActiveSerials] = useState<string[] | undefined>(undefined);
  const [completedSteps, setCompletedSteps] = useState<Set<WorkflowStep>>(new Set());
  const [scannerActive, setScannerActive]       = useState(false);
  const [lastScanResult, setLastScanResult]     = useState<string>("");
  const [activePackQty, setActivePackQty]       = useState(0);
  const [ssccScanned, setSsccScanned]           = useState(false);
  const [vrfParentScanned, setVrfParentScanned] = useState(false);
  const [activeScreen, setActiveScreen]         = useState<string>("home");
  const [commissionedSerials, setCommissionedSerials] = useState<string[]>(
    () => lsLoad<string[]>(LS_COMM, [])
  );

  const activeProduct = generatedProduct || DEFAULT_PRODUCT;

  const handleGenerate = (product: ProductData) => {
    setGeneratedProduct(product);
  };

  const handleProceed = (sscc18: string, serials: string[]) => {
    setActiveSscc(sscc18);
    setActiveSerials(serials.length > 0 ? serials : undefined);
    setSsccScanned(false);
    setVrfParentScanned(false);
    setActiveScreen("home");
    setPhase("app");
  };

  const handleStepComplete = (step: WorkflowStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const simulateScan = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "S", bubbles: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  };

  // Which step to highlight as "next" (first incomplete, in order)
  const nextStep = WORKFLOW_STEPS.find(s => !completedSteps.has(s.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-2" style={{ background: COLOR }} />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">

        {/* Phase stepper */}
        <div className="flex items-center bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {([
            { id: "generate" as const, n: "1", label: "Generate Labels",  sub: "Create serialised SGTIN labels on the admin platform" },
            { id: "app"      as const, n: "2", label: "Mobile App",       sub: "Commission, pack, ship, receive and verify on the device" },
          ]).map(({ id, n, label, sub }, i) => {
            const active = phase === id;
            const done = id === "generate" && phase === "app";
            const locked = id === "app" && !generatedProduct;
            return (
              <button key={id} onMouseDown={e => e.preventDefault()}
                onClick={() => { if (!locked) setPhase(id); }}
                disabled={locked}
                className="flex-1 flex items-center gap-3 px-6 py-4 cursor-pointer border-0 text-left transition-colors"
                style={{
                  background: active ? `${COLOR}08` : "white",
                  borderBottom: active ? `3px solid ${COLOR}` : "3px solid transparent",
                  borderRight: i === 0 ? "1px solid #f3f4f6" : "none",
                  opacity: locked ? 0.45 : 1,
                }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 9999, flexShrink: 0,
                  background: done ? COLOR : active ? COLOR : "#f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {done
                    ? <span style={{ color: "white", fontSize: 13 }}>✓</span>
                    : <span style={{ color: active ? "white" : "#9ca3af", fontSize: 12, fontWeight: 900 }}>{n}</span>
                  }
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: active ? COLOR : done ? "#111" : "#6b7280", margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{sub}</p>
                </div>
                {locked && <span style={{ marginLeft: "auto", fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>Generate a label first</span>}
              </button>
            );
          })}
        </div>

        {/* Phase content */}
        <AnimatePresence mode="wait">

          {phase === "generate" && (
            <motion.div key="generate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <LabelGenerationPhase
                onGenerate={handleGenerate}
                onProceed={handleProceed}
                commissionedSerials={commissionedSerials}
              />
            </motion.div>
          )}

          {phase === "app" && (
            <motion.div key="app" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-black text-gray-900 text-xl mb-1">Mobile App Simulation</h2>
                    <p className="text-sm text-gray-500">
                      This is the Sproxil Track app used by warehouse staff, logistics teams and retailers.
                      Tap any menu item in the phone to walk through the flow.
                    </p>
                  </div>
                  <button onMouseDown={e => e.preventDefault()} onClick={() => setPhase("generate")}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer flex-shrink-0 ml-4"
                    style={{ borderColor: "#e5e7eb", color: "#6b7280", background: "white" }}>
                    ← Admin
                  </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                  {/* ── Left: Labels + Scanner ───────────────────────── */}
                  <div className="flex-1 space-y-4">

                    {/* Suggested next step */}
                    {nextStep ? (
                      <div className="rounded-xl p-4 border" style={{ background: `${COLOR}08`, borderColor: `${COLOR}30` }}>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: COLOR }}>Suggested Next Step</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{nextStep.icon}</span>
                          <div>
                            <p className="text-sm font-bold text-gray-900 mb-0.5">{nextStep.label}</p>
                            <p className="text-xs text-gray-500">{nextStep.tip}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl p-4 border" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                        <p className="text-sm font-bold text-green-700">🎉 All workflow steps completed!</p>
                        <p className="text-xs text-green-600 mt-1">Full supply chain cycle demonstrated.</p>
                      </div>
                    )}

                    {/* Context-aware label panel — SSCC or SGTIN based on active step */}
                    {(() => {
                      const SSCC_ALWAYS = ["ship", "receive", "unpack", "view"];
                      const showSscc = !!activeSscc && (
                        SSCC_ALWAYS.includes(activeScreen) ||
                        (activeScreen === "pack"   && !ssccScanned) ||
                        (activeScreen === "verify" && !vrfParentScanned)
                      );

                      const ssccTitle: Record<string, string> = {
                        pack:    "SSCC-18 — Pack / Case",
                        ship:    "SSCC-18 — Package to Ship",
                        receive: "SSCC-18 — Incoming Package",
                        unpack:  "SSCC-18 — Case to Unpack",
                        view:    "SSCC-18 — Package to View",
                        verify:  "SSCC-18 — Package to Verify",
                      };
                      const sgtinTitle: Record<string, string> = {
                        commission:   "Unit Labels — Commission",
                        pack:         "Unit Labels — Children to Pack",
                        dispense:     "Unit Labels — Dispense",
                        decommission: "Unit Label — Decommission",
                        verify:       "Unit Labels — Verify Children",
                      };

                      return (
                        <AnimatePresence mode="wait">
                          {showSscc ? (
                            <motion.div key={`sscc-${activeScreen}`}
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                {ssccTitle[activeScreen] ?? "SSCC-18 — Pack / Case"}
                              </p>
                              <div className="rounded-xl border overflow-hidden" style={{
                                background: `${COLOR}04`,
                                borderColor: scannerActive ? "#ef444440" : "#f3f4f6",
                                position: "relative",
                                transition: "border-color 0.2s",
                              }}>
                                {/* Corner scan brackets */}
                                {[["top-2 left-2","border-t-2 border-l-2"],["top-2 right-2","border-t-2 border-r-2"],["bottom-2 left-2","border-b-2 border-l-2"],["bottom-2 right-2","border-b-2 border-r-2"]].map(([pos, bdr], i) => (
                                  <div key={i} className={`absolute ${pos} ${bdr} w-3 h-3`}
                                    style={{ borderColor: scannerActive ? "#ef4444" : "#d1d5db", transition: "border-color 0.2s", zIndex: 3 }} />
                                ))}
                                {/* Red sweep overlay */}
                                <AnimatePresence>
                                  {scannerActive && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                      style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.05)", zIndex: 2, pointerEvents: "none" }}>
                                      <motion.div
                                        initial={{ top: 0 }} animate={{ top: "100%" }}
                                        transition={{ duration: 0.45, ease: "linear" }}
                                        style={{ position: "absolute", left: 0, right: 0, height: 3, background: "rgba(239,68,68,0.7)", boxShadow: "0 0 12px rgba(239,68,68,0.8)" }}
                                      />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                                <div className="flex items-center gap-2 px-4 pt-3 pb-1" style={{ position: "relative", zIndex: 4 }}>
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0" style={{ background: COLOR }}>00</div>
                                  <span className="font-mono font-bold text-gray-900 text-sm">{activeSscc}</span>
                                </div>
                                <div className="flex justify-center px-4 pb-2 pt-1" style={{ position: "relative", zIndex: 4 }}>
                                  <Barcode
                                    value={`(00)${activeSscc}`}
                                    format="CODE128" width={1.4} height={52}
                                    displayValue={false} background="transparent" lineColor="#1a1a1a" margin={0}
                                  />
                                </div>
                                <p className="text-[9px] font-mono text-gray-400 text-center pb-3" style={{ position: "relative", zIndex: 4 }}>(00){activeSscc}</p>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div key={`sgtin-${activeScreen}`}
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                                {sgtinTitle[activeScreen] ?? "Unit Labels — SGTIN"}
                              </p>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                {(() => {
                                  const allSerials = activeSerials ?? [activeProduct.serial];
                                  // In pack scan-children phase: limit to packQty; otherwise show all
                                  const visibleCount = (activeScreen === "pack" && ssccScanned && activePackQty > 0)
                                    ? Math.min(activePackQty, allSerials.length)
                                    : allSerials.length;
                                  return allSerials.slice(0, visibleCount).map((serial, i) => {
                                    const label = { ...activeProduct, serial };
                                    return (
                                      <div key={serial}>
                                        <p style={{ fontSize: 9, fontWeight: 600, color: "#9ca3af", marginBottom: 4 }}>Label {i + 1}</p>
                                        <ProductLabel
                                          product={label}
                                          qrValue={`(01)${toGtin14(label.gtin)}(21)${label.serial}`}
                                          scanning={scannerActive && i === 0}
                                          compact
                                        />
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      );
                    })()}

                    {/* Handheld scanner device */}
                    <div style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}>
                      <ScannerDevice
                        scanning={scannerActive}
                        lastScanned={lastScanResult || undefined}
                        onScan={() => {
                          if (scannerActive) return;
                          setScannerActive(true);
                          setTimeout(() => {
                            simulateScan();
                            setScannerActive(false);
                            // Derive what was just scanned for the LCD "done" state
                            const SSCC_SCREENS = ["ship", "receive", "unpack", "view", "pack", "verify"];
                            const isSSCC = SSCC_SCREENS.includes(activeScreen) && !ssccScanned && !vrfParentScanned;
                            setLastScanResult(isSSCC
                              ? (activeSscc ?? "")
                              : (activeSerials?.[0] ?? activeProduct.serial)
                            );
                          }, 420);
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Right: Phone emulator ─────────────────────────── */}
                  <div className="w-full lg:w-auto flex flex-col items-center gap-3 flex-shrink-0">
                    <TrackPhoneEmulator
                      key={activeProduct.batch}
                      product={{
                        name:    activeProduct.name,
                        batch:   activeProduct.batch,
                        serial:  activeProduct.serial,
                        barcode: activeProduct.barcode,
                        gtin:    activeProduct.gtin,
                        client:  activeProduct.client,
                        expiry:  activeProduct.expiry,
                      }}
                      sscc={activeSscc}
                      serials={activeSerials}
                      onStepComplete={handleStepComplete}
                      onPackParentScanned={() => setSsccScanned(true)}
                      onPackQtySet={qty => setActivePackQty(qty)}
                      onVerifyParentScanned={() => setVrfParentScanned(true)}
                      onScreenChange={s => {
                        setActiveScreen(s);
                        if (s !== "pack")   { setSsccScanned(false); setActivePackQty(0); }
                        if (s !== "verify") setVrfParentScanned(false);
                      }}
                      commissionedSerials={commissionedSerials}
                      onCommission={serials => {
                        setCommissionedSerials(prev => {
                          const updated = [...new Set([...prev, ...serials])];
                          lsSave(LS_COMM, updated);
                          return updated;
                        });
                      }}
                    />
                    <p className="text-xs text-gray-400 text-center max-w-xs">
                      Tap a menu item to open that workflow screen
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
