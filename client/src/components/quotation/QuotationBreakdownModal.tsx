import { useState } from "react";
import { X, ChevronDown, ChevronUp, Edit2, Check, BarChart2, Layers, BookOpen, ShoppingBag, GitCompare } from "lucide-react";
import type { QuoteType } from "./QuotationCardsTab";

type TabId = "segments" | "boq" | "benchmarking" | "cost-summary" | "comparison";

interface Props {
  quoteType: QuoteType;
  defaultTab?: TabId;
  onClose: () => void;
}

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "segments",     label: "Segment Breakdown",    icon: Layers    },
  { id: "boq",          label: "Bill of Quantities",   icon: BookOpen  },
  { id: "benchmarking", label: "Supplier Benchmarking",icon: ShoppingBag },
  { id: "cost-summary", label: "Cost Summary",         icon: BarChart2 },
  { id: "comparison",   label: "Quote Comparison",     icon: GitCompare },
];

const SEGMENTS_DATA = [
  { id: 1,  name: "Living Room (A)",  floor: "Main",  sqm: 25.1, color: "#d4a843", practical: { mat: 1820, labor: 1340, equip: 280, misc: 150 }, premium: { mat: 2850, labor: 1980, equip: 420, misc: 220 }, ref: "BuildSmart DB v2.4 · AUS-WP-MEM-01" },
  { id: 2,  name: "Dining Room (A)", floor: "Main",  sqm: 15.6, color: "#84cc16", practical: { mat: 1130, labor: 830,  equip: 175, misc: 95  }, premium: { mat: 1780, labor: 1230, equip: 260, misc: 140 }, ref: "BuildSmart DB v2.4 · AUS-WP-MEM-02" },
  { id: 3,  name: "Kitchen (A)",      floor: "Main",  sqm: 11.1, color: "#f97316", practical: { mat:  805, labor: 590,  equip: 125, misc: 68  }, premium: { mat: 1260, labor: 880,  equip: 185, misc: 100 }, ref: "BuildSmart DB v2.4 · AUS-WP-KIT-01" },
  { id: 4,  name: "Bed 1 (Unit A)",   floor: "Main",  sqm: 18.2, color: "#60a5fa", practical: { mat: 1320, labor: 970,  equip: 205, misc: 110 }, premium: { mat: 2070, labor: 1430, equip: 305, misc: 165 }, ref: "BuildSmart DB v2.4 · AUS-WP-BED-01" },
  { id: 5,  name: "Bed 1 (Unit B)",   floor: "Main",  sqm: 18.2, color: "#818cf8", practical: { mat: 1320, labor: 970,  equip: 205, misc: 110 }, premium: { mat: 2070, labor: 1430, equip: 305, misc: 165 }, ref: "BuildSmart DB v2.4 · AUS-WP-BED-01" },
  { id: 6,  name: "Living Room (B)",  floor: "Main",  sqm: 25.1, color: "#f59e0b", practical: { mat: 1820, labor: 1340, equip: 280, misc: 150 }, premium: { mat: 2850, labor: 1980, equip: 420, misc: 220 }, ref: "BuildSmart DB v2.4 · AUS-WP-MEM-01" },
  { id: 7,  name: "Dining Room (B)", floor: "Main",  sqm: 15.6, color: "#65a30d", practical: { mat: 1130, labor: 830,  equip: 175, misc: 95  }, premium: { mat: 1780, labor: 1230, equip: 260, misc: 140 }, ref: "BuildSmart DB v2.4 · AUS-WP-MEM-02" },
  { id: 8,  name: "Kitchen (B)",      floor: "Main",  sqm: 11.1, color: "#ea580c", practical: { mat:  805, labor: 590,  equip: 125, misc: 68  }, premium: { mat: 1260, labor: 880,  equip: 185, misc: 100 }, ref: "BuildSmart DB v2.4 · AUS-WP-KIT-01" },
  { id: 9,  name: "Garage",           floor: "Main",  sqm: 40.9, color: "#9ca3af", practical: { mat: 2965, labor: 2180, equip: 460, misc: 245 }, premium: { mat: 4640, labor: 3220, equip: 685, misc: 365 }, ref: "BuildSmart DB v2.4 · AUS-WP-GAR-01" },
  { id: 10, name: "Deck",             floor: "Main",  sqm: 14.9, color: "#fbbf24", practical: { mat: 1080, labor: 795,  equip: 168, misc: 90  }, premium: { mat: 1690, labor: 1175, equip: 248, misc: 133 }, ref: "BuildSmart DB v2.4 · AUS-WP-DEC-01" },
  { id: 11, name: "Family Room (A)",  floor: "Lower", sqm: 23.8, color: "#2dd4bf", practical: { mat: 1725, labor: 1270, equip: 268, misc: 143 }, premium: { mat: 2700, labor: 1875, equip: 398, misc: 210 }, ref: "BuildSmart DB v2.4 · AUS-WP-FAM-01" },
  { id: 12, name: "Game Area (A)",    floor: "Lower", sqm: 26.8, color: "#34d399", practical: { mat: 1942, labor: 1430, equip: 301, misc: 161 }, premium: { mat: 3040, labor: 2110, equip: 448, misc: 236 }, ref: "BuildSmart DB v2.4 · AUS-WP-REC-01" },
  { id: 13, name: "Game Area (B)",    floor: "Lower", sqm: 26.8, color: "#10b981", practical: { mat: 1942, labor: 1430, equip: 301, misc: 161 }, premium: { mat: 3040, labor: 2110, equip: 448, misc: 236 }, ref: "BuildSmart DB v2.4 · AUS-WP-REC-01" },
  { id: 14, name: "Bed 2 (Unit A)",   floor: "Lower", sqm:  5.9, color: "#5eead4", practical: { mat:  428, labor: 315,  equip:  66, misc: 35  }, premium: { mat:  670, labor: 465,  equip:  98, misc: 52  }, ref: "BuildSmart DB v2.4 · AUS-WP-BED-02" },
  { id: 15, name: "Bed 3 (Unit A)",   floor: "Lower", sqm:  5.9, color: "#38bdf8", practical: { mat:  428, labor: 315,  equip:  66, misc: 35  }, premium: { mat:  670, labor: 465,  equip:  98, misc: 52  }, ref: "BuildSmart DB v2.4 · AUS-WP-BED-02" },
  { id: 16, name: "Bed 2 (Unit B)",   floor: "Lower", sqm:  5.9, color: "#7dd3fc", practical: { mat:  428, labor: 315,  equip:  66, misc: 35  }, premium: { mat:  670, labor: 465,  equip:  98, misc: 52  }, ref: "BuildSmart DB v2.4 · AUS-WP-BED-02" },
  { id: 17, name: "Crawl Space",      floor: "Lower", sqm: 11.1, color: "#a3e635", practical: { mat:  805, labor: 590,  equip: 125, misc: 68  }, premium: { mat: 1260, labor: 880,  equip: 185, misc: 100 }, ref: "BuildSmart DB v2.4 · AUS-WP-CRAWL-01" },
];

const BOQ_ITEMS = [
  { code: "WP-MEM-STD", description: "Waterproofing Membrane (Standard)",  unit: "m²",  qtyP: 302, rateP: 28.50, qtyPr: 302, ratePr: 44.80 },
  { code: "WP-MEM-FLT", description: "Membrane Flashing (perimeter)",      unit: "lm",  qtyP: 184, rateP: 12.20, qtyPr: 184, ratePr: 19.60 },
  { code: "PRM-COAT",   description: "Primer Coat Application",            unit: "m²",  qtyP: 302, rateP:  5.80, qtyPr: 302, ratePr:  8.40 },
  { code: "LAB-WP",     description: "Labour – Waterproofing Crew",        unit: "hr",  qtyP: 480, rateP: 35.00, qtyPr: 400, ratePr: 57.25 },
  { code: "EQP-TORCH",  description: "Equipment – Torch & Heat Welder",    unit: "day", qtyP:  14, rateP: 85.00, qtyPr:  10, ratePr: 145.00 },
  { code: "EQP-PUMP",   description: "Equipment – Pressure Test Pump",     unit: "day", qtyP:   6, rateP: 65.00, qtyPr:   6, ratePr: 65.00 },
  { code: "SEALANT",    description: "Sealant & Gap Filler",               unit: "tube",qtyP:  48, rateP:  8.50, qtyPr:  48, ratePr: 14.20 },
  { code: "DRAIN-GRATE","description": "Drainage Grates & Covers",         unit: "pc",  qtyP:  12, rateP: 32.00, qtyPr:  12, ratePr: 58.00 },
  { code: "SCAFFOLD",   description: "Scaffolding (erect & dismantle)",    unit: "ls",  qtyP:   1, rateP:1850.00,qtyPr:   1, ratePr:1850.00 },
  { code: "CLEANUP",    description: "Post-work Clean-up & Disposal",      unit: "ls",  qtyP:   1, rateP: 680.00,qtyPr:   1, ratePr: 680.00 },
  { code: "INSP",       description: "Site Inspection & QA Testing",       unit: "ls",  qtyP:   1, rateP: 950.00,qtyPr:   1, ratePr:1650.00 },
  { code: "MISC",       description: "Contingency & Miscellaneous",        unit: "ls",  qtyP:   1, rateP:2170.00,qtyPr:   1, ratePr:3250.00 },
];

interface BenchmarkItem {
  code: string; name: string; specP: string; specPr: string; catalogMatch: string; catalogPrice: number; quoted: number; saving: number; edited?: string;
}

const BENCHMARK_DATA: BenchmarkItem[] = [
  { code: "WP-MEM-STD",  name: "Waterproofing Membrane",      specP: "Sika 2K-PU Standard 2mm",  specPr: "Tremco ExoAir 430 Premium",  catalogMatch: "Mapei Mapelastic 1.5mm", catalogPrice: 22.80, quoted: 28.50, saving: 5.70  },
  { code: "WP-MEM-FLT",  name: "Membrane Flashing",           specP: "Ardex WPM 300 (std)",       specPr: "Ardex WPM 300 (prem)",        catalogMatch: "Fosroc Nitobond AR",     catalogPrice: 10.50, quoted: 12.20, saving: 1.70  },
  { code: "PRM-COAT",    name: "Primer Coat",                  specP: "Sika Primer 3N",             specPr: "Tremco Primer 55",            catalogMatch: "Mapei Eco Prim Grip",    catalogPrice:  4.20, quoted:  5.80, saving: 1.60  },
  { code: "SEALANT",     name: "Sealant & Gap Filler",         specP: "Selleys All Clear",          specPr: "Tremco Spectrem 2",           catalogMatch: "Bostik Seal N Flex",     catalogPrice:  6.90, quoted:  8.50, saving: 1.60  },
  { code: "DRAIN-GRATE", name: "Drainage Grates",              specP: "Reln Slotted (poly)",        specPr: "Stainless 316 Grade",         catalogMatch: "ACO Drain Channel",      catalogPrice: 28.50, quoted: 32.00, saving: 3.50  },
];

function fmt(n: number, dec = 2) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function DonutChart({ slices }: { slices: { pct: number; color: string; label: string; value: string }[] }) {
  let cum = 0;
  const r = 70; const cx = 90; const cy = 90;
  const paths = slices.map((s) => {
    const start = cum; cum += s.pct;
    const startR = (start / 100) * 2 * Math.PI - Math.PI / 2;
    const endR   = (cum   / 100) * 2 * Math.PI - Math.PI / 2;
    const laf = s.pct > 50 ? 1 : 0;
    const x1 = cx + r * Math.cos(startR); const y1 = cy + r * Math.sin(startR);
    const x2 = cx + r * Math.cos(endR);   const y2 = cy + r * Math.sin(endR);
    const ri = 40;
    const xi1 = cx + ri * Math.cos(startR); const yi1 = cy + ri * Math.sin(startR);
    const xi2 = cx + ri * Math.cos(endR);   const yi2 = cy + ri * Math.sin(endR);
    return { d: `M ${x1} ${y1} A ${r} ${r} 0 ${laf} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ri} ${ri} 0 ${laf} 0 ${xi1} ${yi1} Z`, color: s.color };
  });
  return (
    <svg width="180" height="180">
      {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="2" />)}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#6b7280" fontFamily="Poppins,sans-serif">Total</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#111827" fontFamily="Poppins,sans-serif">302 sqm</text>
    </svg>
  );
}

function SegmentBreakdownTab({ quoteType }: { quoteType: QuoteType }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const key = quoteType === "practical" ? "practical" : "premium";
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Segment</th>
            <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Floor</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">sqm</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Materials</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Labor</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Equipment</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Misc</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Total</th>
            <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Details</th>
          </tr>
        </thead>
        <tbody>
          {SEGMENTS_DATA.map((seg) => {
            const d = seg[key];
            const total = d.mat + d.labor + d.equip + d.misc;
            const isOpen = expanded === seg.id;
            return (
              <>
                <tr key={seg.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ background: seg.color }} />
                      <span className="font-medium text-gray-800">{seg.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{seg.floor}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{seg.sqm}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{fmt(d.mat)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{fmt(d.labor)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{fmt(d.equip)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{fmt(d.misc)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-900">{fmt(total)}</td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => setExpanded(isOpen ? null : seg.id)} className="text-gray-400 hover:text-gray-700">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr key={`${seg.id}-detail`} className="bg-gray-50">
                    <td colSpan={9} className="px-6 pb-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Requirements</p>
                          <ul className="space-y-0.5 text-xs text-gray-600">
                            <li>• Waterproofing membrane: {(seg.sqm * 1.15).toFixed(1)} m² (15% waste allowance)</li>
                            <li>• Primer coat: {seg.sqm.toFixed(1)} m²</li>
                            <li>• Perimeter flashing: {(Math.sqrt(seg.sqm) * 4).toFixed(1)} lm</li>
                            <li>• Labour hours: {Math.round(seg.sqm * (quoteType === "practical" ? 1.6 : 1.3))} hrs</li>
                            <li>• Sealant (tube): {Math.ceil(seg.sqm / 6)} tube(s)</li>
                          </ul>
                        </div>
                        <div>
                          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Pricing Reference</p>
                          <div className="rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-600">
                            <p className="font-medium text-gray-800">{seg.ref}</p>
                            <p className="mt-0.5 text-gray-400">Rate source: BuildSmart Market Index · May 2026</p>
                            <p className="mt-0.5 text-gray-400">Confidence: High · Last updated: 14 days ago</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-300 bg-gray-100">
            <td className="px-3 py-2.5 font-bold text-gray-900" colSpan={3}>TOTAL</td>
            <td className="px-3 py-2.5 text-right font-bold text-gray-900">{fmt(SEGMENTS_DATA.reduce((s, g) => s + g[key].mat,   0))}</td>
            <td className="px-3 py-2.5 text-right font-bold text-gray-900">{fmt(SEGMENTS_DATA.reduce((s, g) => s + g[key].labor, 0))}</td>
            <td className="px-3 py-2.5 text-right font-bold text-gray-900">{fmt(SEGMENTS_DATA.reduce((s, g) => s + g[key].equip, 0))}</td>
            <td className="px-3 py-2.5 text-right font-bold text-gray-900">{fmt(SEGMENTS_DATA.reduce((s, g) => s + g[key].misc,  0))}</td>
            <td className="px-3 py-2.5 text-right font-bold text-[#E07B39]">{fmt(SEGMENTS_DATA.reduce((s, g) => s + g[key].mat + g[key].labor + g[key].equip + g[key].misc, 0))}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function BOQTab({ quoteType }: { quoteType: QuoteType }) {
  const isP = quoteType === "practical";
  const grandTotal = BOQ_ITEMS.reduce((s, i) => s + (isP ? i.qtyP * i.rateP : i.qtyPr * i.ratePr), 0);
  return (
    <div className="overflow-x-auto">
      <p className="mb-3 text-sm text-gray-500">Overall Bill of Quantities — {quoteType === "practical" ? "Practical" : "Premium"} scenario</p>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Item Code</th>
            <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Description</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Unit</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Qty</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Unit Rate</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Amount</th>
          </tr>
        </thead>
        <tbody>
          {BOQ_ITEMS.map((item, idx) => {
            const qty  = isP ? item.qtyP  : item.qtyPr;
            const rate = isP ? item.rateP : item.ratePr;
            return (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-gray-500">{item.code}</td>
                <td className="px-3 py-2 text-gray-800">{item.description}</td>
                <td className="px-3 py-2 text-right text-gray-500">{item.unit}</td>
                <td className="px-3 py-2 text-right text-gray-700">{qty.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-gray-700">{fmt(rate)}</td>
                <td className="px-3 py-2 text-right font-semibold text-gray-900">{fmt(qty * rate)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-300 bg-gray-100">
            <td className="px-3 py-2.5 font-bold text-gray-900" colSpan={5}>GRAND TOTAL</td>
            <td className="px-3 py-2.5 text-right text-lg font-extrabold text-[#E07B39]">{fmt(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function BenchmarkingTab({ quoteType }: { quoteType: QuoteType }) {
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <div>
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <ShoppingBag className="h-4 w-4 text-blue-500" />
        <p className="text-sm text-blue-700">
          BuildSmart found catalog alternatives for <strong>{BENCHMARK_DATA.length} materials</strong>.
          You can substitute items or edit specifications manually.
        </p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Item</th>
            <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Quoted Spec</th>
            <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Catalog Alternative</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Quoted Rate</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Alt Rate</th>
            <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Saving/unit</th>
            <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Override</th>
          </tr>
        </thead>
        <tbody>
          {BENCHMARK_DATA.map((item) => {
            const specUsed = quoteType === "practical" ? item.specP : item.specPr;
            const isEditing = editing === item.code;
            const override  = edits[item.code];
            return (
              <tr key={item.code} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-800">{item.name}</td>
                <td className="px-3 py-2 text-gray-500">{override || specUsed}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">{item.catalogMatch}</span>
                </td>
                <td className="px-3 py-2 text-right text-gray-700">{fmt(item.quoted)}/unit</td>
                <td className="px-3 py-2 text-right font-semibold text-green-700">{fmt(item.catalogPrice)}/unit</td>
                <td className="px-3 py-2 text-right font-semibold text-green-600">−{fmt(item.saving)}</td>
                <td className="px-3 py-2 text-center">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-28 rounded border border-gray-300 px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#E07B39]"
                        placeholder="Enter spec…"
                        autoFocus
                      />
                      <button onClick={() => { setEdits((p) => ({ ...p, [item.code]: draft })); setEditing(null); }}
                        className="rounded bg-[#E07B39] p-0.5 text-white">
                        <Check className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setDraft(override || specUsed); setEditing(item.code); }}
                      className="flex items-center gap-0.5 rounded border border-gray-200 px-2 py-0.5 text-gray-500 hover:bg-gray-100">
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-3 text-sm">
        <p className="font-semibold text-green-800">Potential Saving</p>
        <p className="text-green-700">Substituting all catalog alternatives saves approximately <strong>{fmt(BENCHMARK_DATA.reduce((s, i) => s + i.saving * (quoteType === "practical" ? 302 : 302), 0) * 0.032)}</strong> on this quote.</p>
      </div>
    </div>
  );
}

function CostSummaryTab({ quoteType }: { quoteType: QuoteType }) {
  const key = quoteType === "practical" ? "practical" : "premium";
  const totMat   = SEGMENTS_DATA.reduce((s, g) => s + g[key].mat,   0);
  const totLab   = SEGMENTS_DATA.reduce((s, g) => s + g[key].labor, 0);
  const totEquip = SEGMENTS_DATA.reduce((s, g) => s + g[key].equip, 0);
  const totMisc  = SEGMENTS_DATA.reduce((s, g) => s + g[key].misc,  0);
  const grand    = totMat + totLab + totEquip + totMisc;

  const slices = [
    { pct: Math.round((totMat   / grand) * 100), color: "#E07B39",  label: "Materials",  value: fmt(totMat)   },
    { pct: Math.round((totLab   / grand) * 100), color: "#4f46e5",  label: "Labor",      value: fmt(totLab)   },
    { pct: Math.round((totEquip / grand) * 100), color: "#10b981",  label: "Equipment",  value: fmt(totEquip) },
    { pct: Math.round((totMisc  / grand) * 100), color: "#f59e0b",  label: "Misc",       value: fmt(totMisc)  },
  ];

  const floorMain  = SEGMENTS_DATA.filter(s => s.floor === "Main").reduce((a, s)  => a + s[key].mat + s[key].labor + s[key].equip + s[key].misc, 0);
  const floorLower = SEGMENTS_DATA.filter(s => s.floor === "Lower").reduce((a, s) => a + s[key].mat + s[key].labor + s[key].equip + s[key].misc, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Top row: donut + legend */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Cost Distribution</p>
          <DonutChart slices={slices} />
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {slices.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ background: s.color }} />
                <span className="text-gray-500">{s.label}</span>
                <span className="ml-auto font-semibold text-gray-800">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {slices.map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
                  <span className="text-sm font-medium text-gray-700">{s.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.pct}% of total</p>
                </div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floor split */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">Cost by Floor</p>
        <div className="flex gap-4">
          {[
            { label: "Main Floor",  value: floorMain,  color: "#E07B39" },
            { label: "Lower Floor", value: floorLower, color: "#4f46e5" },
          ].map((f) => (
            <div key={f.label} className="flex-1 rounded-xl border p-4" style={{ borderColor: f.color + "40", background: f.color + "08" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: f.color }}>{f.label}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{fmt(f.value)}</p>
              <p className="text-xs text-gray-500">{Math.round((f.value / grand) * 100)}% of total</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-sqm rate */}
      <div className="rounded-xl border border-gray-100 bg-[#fff7f0] p-4">
        <p className="text-xs text-gray-500">Effective Rate per sqm</p>
        <p className="text-2xl font-extrabold text-[#E07B39]">{fmt(grand / 302)}<span className="text-sm font-normal text-gray-500"> / m²</span></p>
        <p className="mt-1 text-xs text-gray-500">Grand Total: <span className="font-semibold text-gray-800">{fmt(grand)}</span></p>
      </div>
    </div>
  );
}

function ComparisonTab() {
  const rows = [
    { label: "Total Cost",         p: "$45,320",             pr: "$67,850",             note: "Premium is 50% more" },
    { label: "Materials Grade",    p: "Standard",            pr: "Premium / Imported",  note: "Higher durability" },
    { label: "Timeline",           p: "8–10 weeks",          pr: "6–7 weeks",           note: "2–3 weeks faster" },
    { label: "Warranty",           p: "1-year workmanship",  pr: "3-year comprehensive",note: "3× coverage" },
    { label: "Team",               p: "Mixed crew",          pr: "Certified specialists",note: "Higher skill level" },
    { label: "Mobilization",       p: "5–7 days",            pr: "2–3 days",            note: "Faster start" },
    { label: "Material Source",    p: "Local suppliers",     pr: "Preferred importers",  note: "Better quality control" },
    { label: "Cost per sqm",       p: "$150 / m²",           pr: "$225 / m²",           note: "+$75 per sqm" },
    { label: "Materials Cost",     p: "$22,150",             pr: "$34,200",             note: "+$12,050" },
    { label: "Labor Cost",         p: "$16,800",             pr: "$22,900",             note: "+$6,100" },
    { label: "Equipment Cost",     p: "$4,200",              pr: "$7,500",              note: "+$3,300" },
    { label: "Miscellaneous",      p: "$2,170",              pr: "$3,250",              note: "+$1,080" },
    { label: "Payment Terms",      p: "Phased (3 milestones)", pr: "2-stage (50/50)",    note: "" },
    { label: "Post-work QA",       p: "Standard inspection", pr: "Full QA + water test", note: "More thorough" },
    { label: "Best For",           p: "Budget-conscious",    pr: "Long-term investment", note: "" },
  ];

  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Practical",          color: "#E07B39", desc: "Budget-optimized · Standard-grade" },
          { label: "vs",                 color: "#9ca3af", desc: ""                                   },
          { label: "Premium",            color: "#4f46e5", desc: "High-spec · Extended warranty"      },
        ].map((h, i) => (
          <div key={i} className={`${i === 1 ? "flex items-center justify-center" : "rounded-xl p-3"}`}
               style={i !== 1 ? { background: h.color + "12", border: `1.5px solid ${h.color}40` } : {}}>
            {i === 1 ? (
              <span className="text-lg font-bold text-gray-400">VS</span>
            ) : (
              <>
                <p className="text-sm font-bold" style={{ color: h.color }}>{h.label}</p>
                <p className="text-xs text-gray-500">{h.desc}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Attribute</th>
            <th className="px-3 py-2.5 text-center font-semibold" style={{ color: "#E07B39" }}>Practical</th>
            <th className="px-3 py-2.5 text-center font-semibold" style={{ color: "#4f46e5" }}>Premium</th>
            <th className="px-3 py-2.5 text-left font-semibold text-gray-400">Difference</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
              <td className="px-3 py-2 font-medium text-gray-700">{row.label}</td>
              <td className="px-3 py-2 text-center text-gray-800">{row.p}</td>
              <td className="px-3 py-2 text-center font-semibold text-indigo-700">{row.pr}</td>
              <td className="px-3 py-2 text-gray-400 italic">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-5 rounded-xl border border-[#E07B39]/20 bg-[#fff7f0] p-4">
        <p className="mb-1 text-sm font-bold text-[#E07B39]">Our Recommendation</p>
        <p className="text-sm text-gray-700">
          If you intend to use these spaces long-term or plan to sell/lease the property, the <strong>Premium</strong> option offers better ROI due to the extended warranty and superior material durability.
          For a tight budget or short-term use, the <strong>Practical</strong> plan covers all essential waterproofing needs adequately.
        </p>
      </div>
    </div>
  );
}

export function QuotationBreakdownModal({ quoteType, defaultTab = "segments", onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const [selectedQuote, setSelectedQuote] = useState<QuoteType>(quoteType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex h-[92vh] w-[96vw] max-w-7xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Detailed Breakdown</h2>
              <p className="text-xs text-gray-500">Full cost transparency for your quotation</p>
            </div>
            {/* Quote switcher */}
            <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white text-xs">
              {(["practical", "premium"] as QuoteType[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedQuote(q)}
                  className={`px-3 py-1.5 font-semibold capitalize transition-colors ${
                    selectedQuote === q
                      ? q === "practical" ? "bg-[#E07B39] text-white" : "bg-indigo-600 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <button
            data-testid="btn-close-breakdown"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-shrink-0 border-b border-gray-200 bg-white px-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                data-testid={`breakdown-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors ${
                  activeTab === tab.id ? "text-[#E07B39]" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07B39]" />}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "segments"     && <SegmentBreakdownTab quoteType={selectedQuote} />}
          {activeTab === "boq"          && <BOQTab              quoteType={selectedQuote} />}
          {activeTab === "benchmarking" && <BenchmarkingTab     quoteType={selectedQuote} />}
          {activeTab === "cost-summary" && <CostSummaryTab      quoteType={selectedQuote} />}
          {activeTab === "comparison"   && <ComparisonTab />}
        </div>
      </div>
    </div>
  );
}
