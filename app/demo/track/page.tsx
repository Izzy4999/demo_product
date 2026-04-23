"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import TrackPhoneEmulator, { WorkflowStep } from "@/components/TrackPhoneEmulator";

const COLOR = "#2D9D3A";

// ─── Static data ──────────────────────────────────────────────────────────────

const CLIENTS = ["Sanofi Nigeria", "GlaxoSmithKline NG", "Roche Nigeria"];

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

interface GeneratedLabel {
  id: string; client: string; product: string; batch: string;
  serial: string; gtin: string; mfg: string; expiry: string;
  volume: number; generated: string; data: ProductData;
}

// Bulk serial records
interface SGTINRow { index: number; ai: string; gtin14: string; serial: string; batch: string; expiry: string; }
interface SSCCRow  { index: number; ai: string; sscc18: string; batch: string; client: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
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
function generateSSCCs(gtin: string, batch: string, client: string, count: number): SSCCRow[] {
  const rows: SSCCRow[] = [];
  for (let i = 1; i <= count; i++) {
    const sscc18 = buildSSCC(gtin, i);
    rows.push({ index: i, ai: `(00)${sscc18}`, sscc18, batch, client });
  }
  return rows;
}

// ─── Mock pre-existing labels ─────────────────────────────────────────────────

const INITIAL_LABELS: GeneratedLabel[] = [
  {
    id: "lbl-001", client: "Sanofi Nigeria", product: "Panadol Extra 500mg × 24",
    batch: "L213048-A", serial: "SN-0000001-AA", gtin: "05900232924",
    mfg: "01 Jan 2024", expiry: "01 Jun 2026", volume: 200, generated: "22 Apr 2026",
    data: {
      name: "Panadol Extra 500mg × 24", batch: "L213048-A", sku: "PAN-EX-24-NG",
      expiry: "06/2026", barcode: "5900232924", gtin: "05900232924",
      client: "Sanofi Nigeria", mfg: "01 Jan 2024", serial: "SN-0000001-AA", volume: 200,
    },
  },
  {
    id: "lbl-002", client: "Sanofi Nigeria", product: "Panadol Extra 500mg × 12",
    batch: "L213049-B", serial: "SN-0000047-BJ", gtin: "05900232923",
    mfg: "10 Jan 2024", expiry: "01 Jul 2026", volume: 100, generated: "22 Apr 2026",
    data: {
      name: "Panadol Extra 500mg × 12", batch: "L213049-B", sku: "PAN-EX-12-NG",
      expiry: "07/2026", barcode: "5900232923", gtin: "05900232923",
      client: "Sanofi Nigeria", mfg: "10 Jan 2024", serial: "SN-0000047-BJ", volume: 100,
    },
  },
];

const DEFAULT_PRODUCT: ProductData = {
  name: "Panadol Extra 500mg × 12", batch: "L213050-A", sku: "PAN-EX-12-NG",
  expiry: "08/2026", barcode: "5900232923", gtin: "05900232923",
  client: "Sanofi Nigeria", mfg: "15 Jan 2024", serial: "SN-0000089-AB", volume: 100,
};

// ─── ProductLabel (used in Phase 1 preview) ───────────────────────────────────

function ProductLabel({ product, qrValue, scanning }: { product: ProductData; qrValue: string; scanning: boolean }) {
  return (
    <div style={{
      background: "white", borderRadius: 12, padding: "14px 16px",
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
        <div key={i} className={`absolute ${pos} ${border} w-4 h-4`} style={{ borderColor: scanning ? "#ef4444" : "#d1d5db", transition: "border-color 0.2s" }} />
      ))}

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", position: "relative", zIndex: 2 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: COLOR, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 10, fontWeight: 900 }}>S</span>
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase" }}>Sproxil Track™</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#111", margin: 0, lineHeight: 1.2 }}>{product.name}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", marginTop: 8 }}>
            {[["Batch", product.batch], ["Serial", product.serial], ["GTIN", product.gtin], ["Expiry", product.expiry]].map(([k, v]) => (
              <div key={k}>
                <p style={{ fontSize: 8, color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</p>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#374151", margin: 0, fontFamily: "monospace" }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
          <div style={{ padding: 4, background: "white", border: "1px solid #e5e7eb", borderRadius: 6 }}>
            <QRCodeSVG value={qrValue} size={76} level="M" />
          </div>
          <p style={{ fontSize: 7, color: "#9ca3af", margin: 0, textAlign: "center" }}>Scan to verify</p>
        </div>
      </div>
    </div>
  );
}

// ─── Label Generation Phase ───────────────────────────────────────────────────

const PAGE_SIZE = 50;

function LabelGenerationPhase({ onGenerate, onProceed, generatedProduct }: {
  labels: GeneratedLabel[];
  onGenerate: (label: GeneratedLabel, product: ProductData) => void;
  onProceed: () => void;
  generatedProduct: ProductData | null;
}) {
  const [tab, setTab] = useState<"sgtin" | "sscc">("sgtin");

  // SGTIN state
  const [sgtinForm, setSgtinForm] = useState({
    client: CLIENTS[0], gtin: GTIN_OPTIONS[0].gtin, batch: "L213050-A",
    volume: "1200", seqType: "sequential", numType: "alphanumeric",
    mfgDate: "2024-01-15", expiryDate: "2026-08-01",
  });
  const [sgtins, setSgtins]       = useState<SGTINRow[]>([]);
  const [sgtinPage, setSgtinPage] = useState(0);
  const [sgtinGenerating, setSgtinGenerating] = useState(false);
  const [sgtinCount, setSgtinCount] = useState(0);

  // SSCC state
  const [ssccForm, setSsccForm] = useState({
    client: CLIENTS[0], gtin: GTIN_OPTIONS[0].gtin, batch: "L213050-A", count: "50",
  });
  const [ssccs, setSsccs]       = useState<SSCCRow[]>([]);
  const [ssccPage, setSsccPage] = useState(0);
  const [ssccGenerating, setSsccGenerating] = useState(false);
  const [ssccCount, setSsccCount] = useState(0);

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
    const vol = Math.min(Math.max(parseInt(sgtinForm.volume) || 100, 1), 5000);
    setSgtinGenerating(true);
    setSgtinCount(0);
    setSgtinPage(0);
    const expShort = expiryShort(sgtinForm.expiryDate);

    // Generate in chunks so the counter animation is visible
    let done = 0;
    const chunk = 100;
    const all: SGTINRow[] = [];

    const tick = () => {
      const end = Math.min(done + chunk, vol);
      const partial = generateSGTINs(sgtinForm.gtin, sgtinForm.batch, expShort, end - done, sgtinForm.seqType, sgtinForm.numType);
      // re-index from done+1
      partial.forEach((r, i) => { r.index = done + i + 1; });
      all.push(...partial);
      done = end;
      setSgtinCount(done);
      if (done < vol) {
        setTimeout(tick, 16);
      } else {
        setSgtins(all);
        setSgtinGenerating(false);
        // surface a product + label for the mobile app phase
        const gtinOpt = GTIN_OPTIONS.find(g => g.gtin === sgtinForm.gtin) || GTIN_OPTIONS[0];
        const product: ProductData = {
          name: gtinOpt.name, batch: sgtinForm.batch, sku: gtinOpt.sku,
          expiry: expShort, barcode: gtinOpt.barcode, gtin: gtinOpt.gtin,
          client: sgtinForm.client, mfg: fmtDate(sgtinForm.mfgDate),
          serial: all[0].serial, volume: vol,
        };
        const label: GeneratedLabel = {
          id: `lbl-${Date.now()}`, client: sgtinForm.client, product: gtinOpt.name,
          batch: sgtinForm.batch, serial: all[0].serial, gtin: gtinOpt.gtin,
          mfg: fmtDate(sgtinForm.mfgDate), expiry: fmtDate(sgtinForm.expiryDate),
          volume: vol,
          generated: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          data: product,
        };
        onGenerate(label, product);
      }
    };
    setTimeout(tick, 50);
  };

  // ── Generate SSCCs ───────────────────────────────────────────────────────────
  const handleGenerateSSCCs = () => {
    const count = Math.min(Math.max(parseInt(ssccForm.count) || 50, 1), 1000);
    setSsccGenerating(true);
    setSsccCount(0);
    setSsccPage(0);

    let done = 0;
    const chunk = 50;
    const all: SSCCRow[] = [];

    const tick = () => {
      const end = Math.min(done + chunk, count);
      const partial = generateSSCCs(ssccForm.gtin, ssccForm.batch, ssccForm.client, end - done);
      partial.forEach((r, i) => { r.index = done + i + 1; });
      all.push(...partial);
      done = end;
      setSsccCount(done);
      if (done < count) {
        setTimeout(tick, 16);
      } else {
        setSsccs(all);
        setSsccGenerating(false);
      }
    };
    setTimeout(tick, 50);
  };

  // ── Pagination helpers ───────────────────────────────────────────────────────
  const sgtinPageData = sgtins.slice(sgtinPage * PAGE_SIZE, (sgtinPage + 1) * PAGE_SIZE);
  const sgtinPages    = Math.ceil(sgtins.length / PAGE_SIZE);
  const ssccPageData  = ssccs.slice(ssccPage * PAGE_SIZE, (ssccPage + 1) * PAGE_SIZE);
  const ssccPages     = Math.ceil(ssccs.length / PAGE_SIZE);

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

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {(["sgtin", "sscc"] as const).map(t => (
            <button key={t} onMouseDown={e => e.preventDefault()} onClick={() => setTab(t)}
              className="px-5 py-3 text-sm font-bold cursor-pointer border-0 bg-transparent border-b-2 transition-colors flex items-center gap-2"
              style={{ borderBottomColor: tab === t ? COLOR : "transparent", color: tab === t ? COLOR : "#6b7280", marginBottom: -1 }}>
              {t === "sgtin" ? "SGTINs" : "SSCCs"}
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: tab === t ? `${COLOR}15` : "#f3f4f6", color: tab === t ? COLOR : "#9ca3af" }}>
                {t === "sgtin" ? "Unit / Child" : "Pack / Parent"}
              </span>
            </button>
          ))}
        </div>

        {/* ── SGTIN TAB ──────────────────────────────────────────────────────── */}
        {tab === "sgtin" && (
          <div>
            {/* Form */}
            <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: COLOR }}>
                Generate SGTIN Batch — Unit-Level Serial Numbers
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label style={labelStyle}>Client</label>
                  <select value={sgtinForm.client} onChange={e => setS("client", e.target.value)} style={inputStyle}>
                    {CLIENTS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Product / GTIN</label>
                  <select value={sgtinForm.gtin} onChange={e => setS("gtin", e.target.value)} style={inputStyle}>
                    {GTIN_OPTIONS.map(g => <option key={g.gtin} value={g.gtin}>{g.name} — {g.gtin}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Lot / Batch No.</label>
                  <input value={sgtinForm.batch} onChange={e => setS("batch", e.target.value)} style={inputStyle} placeholder="e.g. L213050-A" />
                </div>
                <div>
                  <label style={labelStyle}>Volume (units)</label>
                  <input type="number" min={1} max={5000} value={sgtinForm.volume} onChange={e => setS("volume", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>MFG Date</label>
                  <input type="date" value={sgtinForm.mfgDate} onChange={e => setS("mfgDate", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Expiry Date</label>
                  <input type="date" value={sgtinForm.expiryDate} onChange={e => setS("expiryDate", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-3">
                  <span style={labelStyle}>Sequence:</span>
                  {["sequential", "random"].map(v => (
                    <label key={v} className="flex items-center gap-1.5 text-xs cursor-pointer font-semibold" style={{ color: sgtinForm.seqType === v ? "#111" : "#6b7280" }}>
                      <input type="radio" name="sgtinSeq" value={v} checked={sgtinForm.seqType === v} onChange={() => setS("seqType", v)} style={{ accentColor: COLOR }} />
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span style={labelStyle}>Format:</span>
                  {[["alphanumeric", "Alpha-Numeric"], ["numeric", "Numeric"]].map(([v, lbl]) => (
                    <label key={v} className="flex items-center gap-1.5 text-xs cursor-pointer font-semibold" style={{ color: sgtinForm.numType === v ? "#111" : "#6b7280" }}>
                      <input type="radio" name="sgtinNum" value={v} checked={sgtinForm.numType === v} onChange={() => setS("numType", v)} style={{ accentColor: COLOR }} />
                      {lbl}
                    </label>
                  ))}
                </div>
                <button onMouseDown={e => e.preventDefault()} onClick={handleGenerateSGTINs} disabled={sgtinGenerating}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold cursor-pointer border-0 disabled:opacity-60"
                  style={{ background: COLOR }}>
                  {sgtinGenerating ? `Generating… ${sgtinCount.toLocaleString()}` : `Generate ${parseInt(sgtinForm.volume || "0").toLocaleString()} SGTINs →`}
                </button>
              </div>
            </div>

            {/* SGTIN results */}
            {sgtins.length > 0 && (
              <div>
                {/* Stats bar */}
                <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 bg-white flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLOR }} />
                    <span className="text-sm font-black text-gray-900">{sgtins.length.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">SGTINs generated</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <span className="text-xs font-mono text-gray-500">GTIN-14: {toGtin14(sgtinForm.gtin)}</span>
                  <div className="h-4 w-px bg-gray-200" />
                  <span className="text-xs font-mono text-gray-500">Batch: {sgtinForm.batch}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-gray-400">Page {sgtinPage + 1} of {sgtinPages}</span>
                    <button disabled={sgtinPage === 0} onClick={() => setSgtinPage(p => p - 1)}
                      className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-30 cursor-pointer">←</button>
                    <button disabled={sgtinPage >= sgtinPages - 1} onClick={() => setSgtinPage(p => p + 1)}
                      className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-30 cursor-pointer">→</button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {["#", "GS1 Application Identifier (AI)", "GTIN-14", "Serial Number", "Batch / Lot", "Expiry"].map(h => (
                          <th key={h} style={{ padding: "9px 16px", fontSize: 10, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap", borderBottom: "1px solid #f3f4f6" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sgtinPageData.map(row => (
                        <tr key={row.index} style={{ borderBottom: "1px solid #f9fafb" }}>
                          <td style={{ padding: "8px 16px", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{row.index.toLocaleString()}</td>
                          <td style={{ padding: "8px 16px", fontSize: 11, fontFamily: "monospace", color: "#111", whiteSpace: "nowrap" }}>
                            <span style={{ color: "#6b7280" }}>(01)</span>{row.gtin14}
                            <span style={{ color: "#6b7280" }}>(21)</span>{row.serial}
                          </td>
                          <td style={{ padding: "8px 16px", fontSize: 11, fontFamily: "monospace", color: "#374151" }}>{row.gtin14}</td>
                          <td style={{ padding: "8px 16px", fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: COLOR }}>{row.serial}</td>
                          <td style={{ padding: "8px 16px", fontSize: 11, fontFamily: "monospace", color: "#374151" }}>{row.batch}</td>
                          <td style={{ padding: "8px 16px", fontSize: 11, fontFamily: "monospace", color: "#374151" }}>{row.expiry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {sgtins.length === 0 && !sgtinGenerating && (
              <div className="py-16 text-center text-gray-400 text-sm">
                No SGTINs generated yet. Fill in the form above and click <strong>Generate</strong>.
              </div>
            )}

            {sgtinGenerating && (
              <div className="py-16 flex flex-col items-center gap-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  style={{ width: 32, height: 32, border: `3px solid ${COLOR}30`, borderTopColor: COLOR, borderRadius: 9999 }} />
                <div className="text-center">
                  <p className="font-black text-2xl" style={{ color: COLOR }}>{sgtinCount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">SGTINs generated…</p>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label style={labelStyle}>Client</label>
                  <select value={ssccForm.client} onChange={e => setC("client", e.target.value)} style={inputStyle}>
                    {CLIENTS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Product / GTIN</label>
                  <select value={ssccForm.gtin} onChange={e => setC("gtin", e.target.value)} style={inputStyle}>
                    {GTIN_OPTIONS.map(g => <option key={g.gtin} value={g.gtin}>{g.name} — {g.gtin}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Batch Reference</label>
                  <input value={ssccForm.batch} onChange={e => setC("batch", e.target.value)} style={inputStyle} placeholder="e.g. L213050-A" />
                </div>
                <div>
                  <label style={labelStyle}>Number of Cases</label>
                  <input type="number" min={1} max={1000} value={ssccForm.count} onChange={e => setC("count", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onMouseDown={e => e.preventDefault()} onClick={handleGenerateSSCCs} disabled={ssccGenerating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold cursor-pointer border-0 disabled:opacity-60"
                  style={{ background: COLOR }}>
                  {ssccGenerating ? `Generating… ${ssccCount.toLocaleString()}` : `Generate ${parseInt(ssccForm.count || "0").toLocaleString()} SSCCs →`}
                </button>
              </div>
            </div>

            {/* SSCC results */}
            {ssccs.length > 0 && (
              <div>
                <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 bg-white flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLOR }} />
                    <span className="text-sm font-black text-gray-900">{ssccs.length.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">SSCCs generated</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <span className="text-xs font-mono text-gray-500">Batch ref: {ssccForm.batch}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-gray-400">Page {ssccPage + 1} of {ssccPages}</span>
                    <button disabled={ssccPage === 0} onClick={() => setSsccPage(p => p - 1)}
                      className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-30 cursor-pointer">←</button>
                    <button disabled={ssccPage >= ssccPages - 1} onClick={() => setSsccPage(p => p + 1)}
                      className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-30 cursor-pointer">→</button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        {["#", "GS1 Application Identifier (AI)", "SSCC-18", "Batch Reference", "Client"].map(h => (
                          <th key={h} style={{ padding: "9px 16px", fontSize: 10, fontWeight: 700, color: "#6b7280", textAlign: "left", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap", borderBottom: "1px solid #f3f4f6" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ssccPageData.map(row => (
                        <tr key={row.index} style={{ borderBottom: "1px solid #f9fafb" }}>
                          <td style={{ padding: "8px 16px", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{row.index.toLocaleString()}</td>
                          <td style={{ padding: "8px 16px", fontSize: 11, fontFamily: "monospace", color: "#111", whiteSpace: "nowrap" }}>
                            <span style={{ color: "#6b7280" }}>(00)</span>{row.sscc18}
                          </td>
                          <td style={{ padding: "8px 16px", fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: COLOR }}>{row.sscc18}</td>
                          <td style={{ padding: "8px 16px", fontSize: 11, fontFamily: "monospace", color: "#374151" }}>{row.batch}</td>
                          <td style={{ padding: "8px 16px", fontSize: 11, color: "#374151" }}>{row.client}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {ssccs.length === 0 && !ssccGenerating && (
              <div className="py-16 text-center text-gray-400 text-sm">
                No SSCCs generated yet. Fill in the form above and click <strong>Generate</strong>.
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

      {/* Label preview + proceed */}
      <AnimatePresence>
        {generatedProduct && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: COLOR }}>Label Preview</p>
                <p className="text-sm text-gray-500">Ready to be printed and attached — proceed to the mobile app flow</p>
              </div>
              <button onMouseDown={e => e.preventDefault()} onClick={onProceed}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold cursor-pointer border-0"
                style={{ background: COLOR }}>
                Open Mobile App →
              </button>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="w-full lg:w-96">
                <ProductLabel product={generatedProduct} qrValue={`SPROXIL:TRACK:${generatedProduct.batch}:${generatedProduct.barcode}`} scanning={false} />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                {[
                  ["Client", generatedProduct.client], ["Product", generatedProduct.name],
                  ["GTIN-14", toGtin14(generatedProduct.gtin)], ["Batch", generatedProduct.batch],
                  ["First Serial", generatedProduct.serial], ["Volume", `${generatedProduct.volume.toLocaleString()} units`],
                  ["MFG", generatedProduct.mfg], ["Expiry", generatedProduct.expiry],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{k}</p>
                    <p className="text-sm font-bold text-gray-800 truncate" style={{ fontFamily: ["GTIN-14","Batch","First Serial"].includes(k) ? "monospace" : "inherit" }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [labels, setLabels]             = useState<GeneratedLabel[]>(INITIAL_LABELS);
  const [generatedProduct, setGeneratedProduct] = useState<ProductData | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<WorkflowStep>>(new Set());

  const activeProduct = generatedProduct || DEFAULT_PRODUCT;

  const handleGenerate = (label: GeneratedLabel, product: ProductData) => {
    setLabels(prev => {
      const exists = prev.find(l => l.id === label.id);
      return exists ? prev : [...prev, label];
    });
    setGeneratedProduct(product);
  };

  const handleStepComplete = (step: WorkflowStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
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
                labels={labels}
                onGenerate={handleGenerate}
                onProceed={() => setPhase("app")}
                generatedProduct={generatedProduct}
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

                {/* Active label info */}
                <div className="flex items-center gap-2 mb-6 p-3 rounded-xl border" style={{ background: `${COLOR}08`, borderColor: `${COLOR}30` }}>
                  <div style={{ width: 8, height: 8, borderRadius: 9999, background: COLOR, flexShrink: 0 }} />
                  <p className="text-xs text-gray-700">
                    Active label: <strong>{activeProduct.name}</strong> · Batch <span className="font-mono">{activeProduct.batch}</span> · Serial <span className="font-mono">{activeProduct.serial}</span>
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                  {/* ── Left: Workflow guide ─────────────────────────── */}
                  <div className="flex-1 space-y-4">

                    {/* Next step tip */}
                    {nextStep && (
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
                    )}
                    {!nextStep && (
                      <div className="rounded-xl p-4 border" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                        <p className="text-sm font-bold text-green-700">🎉 All workflow steps completed!</p>
                        <p className="text-xs text-green-600 mt-1">Full supply chain cycle demonstrated.</p>
                      </div>
                    )}

                    {/* Workflow steps list */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-400">Workflow Steps</p>
                      <div className="flex flex-col gap-2">
                        {WORKFLOW_STEPS.map((step, i) => {
                          const done = completedSteps.has(step.id);
                          const isNext = step.id === nextStep?.id;
                          return (
                            <motion.div key={step.id}
                              animate={{ backgroundColor: done ? "#f0fdf4" : isNext ? `${COLOR}08` : "white" }}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                              style={{ borderColor: done ? "#bbf7d0" : isNext ? `${COLOR}30` : "#f3f4f6" }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: 9999, flexShrink: 0,
                                background: done ? "#16a34a" : isNext ? COLOR : "#f3f4f6",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: done ? 12 : 14,
                              }}>
                                {done ? <span style={{ color: "white" }}>✓</span> : <span>{step.icon}</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate" style={{ color: done ? "#15803d" : isNext ? "#111" : "#6b7280", margin: 0 }}>
                                  {step.label}
                                </p>
                              </div>
                              {done && <span className="text-[10px] font-bold text-green-600">Done</span>}
                              {isNext && <span className="text-[10px] font-bold" style={{ color: COLOR }}>Next →</span>}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="pt-1">
                      <div className="flex justify-between mb-1.5">
                        <p className="text-xs font-bold text-gray-500">Progress</p>
                        <p className="text-xs font-bold" style={{ color: COLOR }}>{completedSteps.size} / {WORKFLOW_STEPS.length}</p>
                      </div>
                      <div style={{ height: 6, background: "#f3f4f6", borderRadius: 9999, overflow: "hidden" }}>
                        <motion.div
                          animate={{ width: `${(completedSteps.size / WORKFLOW_STEPS.length) * 100}%` }}
                          style={{ height: "100%", background: COLOR, borderRadius: 9999, transition: "width 0.4s ease" }}
                        />
                      </div>
                    </div>

                    {/* Scanner hint */}
                    <div className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                      <p className="text-[11px] font-semibold text-gray-500 leading-relaxed">
                        💡 <strong className="text-gray-700">Physical scanner:</strong> works in all scan screens — just scan any barcode and the app responds automatically. Or tap the <strong className="text-gray-700">▶ Scan</strong> button inside the phone to simulate.
                      </p>
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
                      onStepComplete={handleStepComplete}
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
