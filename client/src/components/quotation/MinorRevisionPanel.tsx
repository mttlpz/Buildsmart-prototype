import { useState, useMemo } from "react";
import { X, AlertTriangle, CheckCircle2, Info, ChevronDown, Edit2, Check, RefreshCw, Database, FileText } from "lucide-react";

type PriceRef = "internal" | "dpwh";

interface Supplier {
  id: string;
  name: string;
  unitPrice: number;
  stock: number;
  unit: string;
  type: "internal" | "external";
}

interface BOQRow {
  code: string;
  description: string;
  unit: string;
  qty: number;
  internalPrice: number;
  dpwhPrice: number;
  suppliers: Supplier[];
  selectedSupplier: string;
  editedQty?: number;
  editedPrice?: number;
  editedTimeline?: string;
}

const SUPPLIER_CATALOG: Record<string, Supplier[]> = {
  "WP-MEM-STD": [
    { id: "SUP-01", name: "Sika Philippines Inc.",   unitPrice: 1596,    stock: 450, unit: "m²", type: "internal" },
    { id: "SUP-02", name: "Mapei Philippines Corp.",  unitPrice: 1278,    stock: 180, unit: "m²", type: "internal" },
    { id: "SUP-03", name: "Fosroc Philippines",       unitPrice: 1764,    stock: 600, unit: "m²", type: "internal" },
  ],
  "WP-MEM-FLT": [
    { id: "SUP-01", name: "Sika Philippines Inc.",   unitPrice: 683,     stock: 250, unit: "lm", type: "internal" },
    { id: "SUP-04", name: "Ardex Philippines",        unitPrice: 588,     stock: 120, unit: "lm", type: "internal" },
    { id: "SUP-03", name: "Fosroc Philippines",       unitPrice: 735,     stock: 300, unit: "lm", type: "internal" },
  ],
  "PRM-COAT": [
    { id: "SUP-01", name: "Sika Philippines Inc.",   unitPrice: 325,     stock: 400, unit: "m²", type: "internal" },
    { id: "SUP-02", name: "Mapei Philippines Corp.",  unitPrice: 280,     stock: 350, unit: "m²", type: "internal" },
  ],
  "LAB-WP": [
    { id: "CREW-A", name: "JC In-house Crew",         unitPrice: 1960,    stock: 999, unit: "hr", type: "internal" },
    { id: "CREW-B", name: "Sub-contractor A",          unitPrice: 2240,    stock: 999, unit: "hr", type: "internal" },
    { id: "CREW-C", name: "Sub-contractor B",          unitPrice: 1820,    stock: 999, unit: "hr", type: "internal" },
  ],
  "EQP-TORCH": [
    { id: "EQP-01", name: "ABC Equipment Rental",      unitPrice: 4760,    stock: 30,  unit: "day", type: "internal" },
    { id: "EQP-02", name: "XYZ Tool Hire",             unitPrice: 4200,    stock: 10,  unit: "day", type: "internal" },
  ],
  "EQP-PUMP": [
    { id: "EQP-01", name: "ABC Equipment Rental",      unitPrice: 3640,    stock: 20,  unit: "day", type: "internal" },
    { id: "EQP-02", name: "XYZ Tool Hire",             unitPrice: 3360,    stock: 8,   unit: "day", type: "internal" },
  ],
  "SEALANT": [
    { id: "SUP-01", name: "Sika Philippines Inc.",   unitPrice: 476,     stock: 200, unit: "tube", type: "internal" },
    { id: "SUP-05", name: "Bostik Philippines",       unitPrice: 392,     stock: 80,  unit: "tube", type: "internal" },
  ],
  "DRAIN-GRATE": [
    { id: "SUP-06", name: "ACO Phil. Distribution",   unitPrice: 1596,    stock: 50,  unit: "pc", type: "internal" },
    { id: "SUP-07", name: "Reln Philippines",          unitPrice: 1288,    stock: 8,   unit: "pc", type: "internal" },
  ],
  "SCAFFOLD": [
    { id: "SCF-01", name: "Metro Scaffolding Corp.",   unitPrice: 103600,  stock: 999, unit: "ls", type: "internal" },
  ],
  "CLEANUP": [
    { id: "CLN-01", name: "JC In-house Crew",         unitPrice: 38080,   stock: 999, unit: "ls", type: "internal" },
  ],
  "INSP": [
    { id: "INS-01", name: "BuildSmart QA Team",        unitPrice: 53200,   stock: 999, unit: "ls", type: "internal" },
  ],
  "MISC": [
    { id: "MSC-01", name: "Contingency (Internal)",    unitPrice: 121520,  stock: 999, unit: "ls", type: "internal" },
  ],
};

const INITIAL_ROWS: BOQRow[] = [
  { code: "WP-MEM-STD", description: "Waterproofing Membrane (Standard)", unit: "m²",   qty: 302, internalPrice: 1596,   dpwhPrice: 1900,   suppliers: SUPPLIER_CATALOG["WP-MEM-STD"],  selectedSupplier: "SUP-01" },
  { code: "WP-MEM-FLT", description: "Membrane Flashing (perimeter)",      unit: "lm",   qty: 184, internalPrice: 683,    dpwhPrice: 820,    suppliers: SUPPLIER_CATALOG["WP-MEM-FLT"],  selectedSupplier: "SUP-01" },
  { code: "PRM-COAT",   description: "Primer Coat Application",            unit: "m²",   qty: 302, internalPrice: 325,    dpwhPrice: 390,    suppliers: SUPPLIER_CATALOG["PRM-COAT"],    selectedSupplier: "SUP-01" },
  { code: "LAB-WP",     description: "Labour – Waterproofing Crew",        unit: "hr",   qty: 480, internalPrice: 1960,   dpwhPrice: 2380,   suppliers: SUPPLIER_CATALOG["LAB-WP"],      selectedSupplier: "CREW-A" },
  { code: "EQP-TORCH",  description: "Equipment – Torch & Heat Welder",    unit: "day",  qty: 14,  internalPrice: 4760,   dpwhPrice: 5880,   suppliers: SUPPLIER_CATALOG["EQP-TORCH"],   selectedSupplier: "EQP-01" },
  { code: "EQP-PUMP",   description: "Equipment – Pressure Test Pump",     unit: "day",  qty: 6,   internalPrice: 3640,   dpwhPrice: 4480,   suppliers: SUPPLIER_CATALOG["EQP-PUMP"],    selectedSupplier: "EQP-01" },
  { code: "SEALANT",    description: "Sealant & Gap Filler",               unit: "tube", qty: 48,  internalPrice: 476,    dpwhPrice: 560,    suppliers: SUPPLIER_CATALOG["SEALANT"],     selectedSupplier: "SUP-01" },
  { code: "DRAIN-GRATE",description: "Drainage Grates & Covers",           unit: "pc",   qty: 12,  internalPrice: 1596,   dpwhPrice: 1960,   suppliers: SUPPLIER_CATALOG["DRAIN-GRATE"], selectedSupplier: "SUP-06" },
  { code: "SCAFFOLD",   description: "Scaffolding (erect & dismantle)",    unit: "ls",   qty: 1,   internalPrice: 103600, dpwhPrice: 126000, suppliers: SUPPLIER_CATALOG["SCAFFOLD"],    selectedSupplier: "SCF-01" },
  { code: "CLEANUP",    description: "Post-work Clean-up & Disposal",      unit: "ls",   qty: 1,   internalPrice: 38080,  dpwhPrice: 44800,  suppliers: SUPPLIER_CATALOG["CLEANUP"],     selectedSupplier: "CLN-01" },
  { code: "INSP",       description: "Site Inspection & QA Testing",       unit: "ls",   qty: 1,   internalPrice: 53200,  dpwhPrice: 64400,  suppliers: SUPPLIER_CATALOG["INSP"],        selectedSupplier: "INS-01" },
  { code: "MISC",       description: "Contingency & Miscellaneous",        unit: "ls",   qty: 1,   internalPrice: 121520, dpwhPrice: 145600, suppliers: SUPPLIER_CATALOG["MISC"],        selectedSupplier: "MSC-01" },
];

function fmt(n: number) {
  return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface RowEdits { qty?: number; price?: number; supplierId?: string; timeline?: string; }

interface Props { onClose: () => void; onApply: () => void; }

function SupplierDropdown({
  suppliers, selectedId, qty, currentPrice, onSelect, onPriceOverride,
}: {
  suppliers: Supplier[]; selectedId: string; qty: number; currentPrice: number;
  onSelect: (id: string) => void; onPriceOverride: (p: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const sel = suppliers.find(s => s.id === selectedId) || suppliers[0];
  const hasConflict = sel && sel.stock < qty && sel.stock !== 999;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between gap-1 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
          hasConflict ? "border-red-300 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <span className="truncate font-medium text-gray-700">{sel?.name}</span>
        {hasConflict && <AlertTriangle className="h-3 w-3 flex-shrink-0 text-red-500" />}
        <ChevronDown className="h-3 w-3 flex-shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Select Supplier · need {qty} {sel?.unit}</p>
          </div>
          {suppliers.map((sup) => {
            const conflict = sup.stock < qty && sup.stock !== 999;
            const isSel = sup.id === selectedId;
            return (
              <button
                key={sup.id}
                onClick={() => { onSelect(sup.id); onPriceOverride(sup.unitPrice); setOpen(false); }}
                className={`flex w-full items-start justify-between px-3 py-2.5 text-xs transition-colors hover:bg-gray-50 ${isSel ? "bg-[#fff7f0]" : ""}`}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <div className="flex items-center gap-1.5">
                    {isSel && <Check className="h-3 w-3 text-[#E07B39]" />}
                    <span className={`font-semibold ${isSel ? "text-[#E07B39]" : "text-gray-800"}`}>{sup.name}</span>
                    {sup.type === "internal" && (
                      <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">INTERNAL</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>Stock: <span className={conflict ? "font-bold text-red-600" : "font-semibold text-gray-700"}>{sup.stock === 999 ? "Unlimited" : sup.stock + " " + sup.unit}</span></span>
                    {conflict && <span className="flex items-center gap-0.5 text-red-500"><AlertTriangle className="h-2.5 w-2.5" /> Insufficient</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{fmt(sup.unitPrice)}</p>
                  <p className="text-gray-400">per {sup.unit}</p>
                  {sup.unitPrice < currentPrice && (
                    <p className="text-green-600">−{fmt(currentPrice - sup.unitPrice)} saving</p>
                  )}
                  {sup.unitPrice > currentPrice && (
                    <p className="text-red-500">+{fmt(sup.unitPrice - currentPrice)} more</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MinorRevisionPanel({ onClose, onApply }: Props) {
  const [priceRef, setPriceRef] = useState<PriceRef>("internal");
  const [rows, setRows] = useState<BOQRow[]>(INITIAL_ROWS);
  const [edits, setEdits] = useState<Record<string, RowEdits>>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const getEffectiveRow = (row: BOQRow) => {
    const e = edits[row.code] || {};
    const sup = row.suppliers.find(s => s.id === (e.supplierId || row.selectedSupplier)) || row.suppliers[0];
    const basePrice = priceRef === "internal" ? row.internalPrice : row.dpwhPrice;
    const price = e.price ?? sup?.unitPrice ?? basePrice;
    const qty = e.qty ?? row.qty;
    return { ...row, qty, price, supplierId: e.supplierId || row.selectedSupplier, sup };
  };

  const conflicts = useMemo(() => rows.filter((r) => {
    const eff = getEffectiveRow(r);
    return eff.sup && eff.sup.stock < eff.qty && eff.sup.stock !== 999;
  }), [rows, edits]);

  const originalTotal = rows.reduce((s, r) => {
    const basePrice = priceRef === "internal" ? r.internalPrice : r.dpwhPrice;
    return s + basePrice * r.qty;
  }, 0);

  const revisedTotal = rows.reduce((s, r) => {
    const eff = getEffectiveRow(r);
    return s + eff.price * eff.qty;
  }, 0);

  const diff = revisedTotal - originalTotal;

  const updateEdit = (code: string, patch: Partial<RowEdits>) =>
    setEdits(prev => ({ ...prev, [code]: { ...prev[code], ...patch } }));

  const startEdit = (key: string, current: string) => { setEditingCell(key); setDraft(current); };
  const commitEdit = (code: string, field: "qty" | "price") => {
    const val = parseFloat(draft);
    if (!isNaN(val) && val > 0) updateEdit(code, { [field]: val });
    setEditingCell(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex h-[94vh] w-[98vw] max-w-7xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Minor Revision</h2>
            <p className="text-xs text-gray-500">Edit line items, switch suppliers, and adjust quantities without restarting the process</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Price reference toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Price Reference:</span>
              <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white text-xs">
                <button
                  onClick={() => setPriceRef("internal")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-colors ${priceRef === "internal" ? "bg-[#E07B39] text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <FileText className="h-3 w-3" /> Internal Pricelist
                </button>
                <button
                  onClick={() => setPriceRef("dpwh")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-colors ${priceRef === "dpwh" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <Database className="h-3 w-3" /> DPWH CMPD
                </button>
              </div>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200">
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Price ref notice */}
        <div className={`flex flex-shrink-0 items-center gap-2 px-6 py-2 text-xs ${priceRef === "internal" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
          {priceRef === "internal" ? (
            <><CheckCircle2 className="h-3.5 w-3.5" /> Using <strong>Internal Pricelist</strong> — company-exclusive rates sourced from uploaded supplier data. Prices are typically lower and preferred by the system.</>
          ) : (
            <><Info className="h-3.5 w-3.5" /> Using <strong>DPWH CMPD</strong> (Construction Materials Price Data) — official published government rates. Usually higher than internal prices. Fetched via pipeline.</>
          )}
        </div>

        {/* Conflict banner */}
        {conflicts.length > 0 && (
          <div className="flex flex-shrink-0 items-start gap-3 border-b border-red-200 bg-red-50 px-6 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-bold text-red-700">{conflicts.length} Supplier Quantity Conflict{conflicts.length > 1 ? "s" : ""} Detected</p>
              <p className="text-xs text-red-600">
                {conflicts.map(r => {
                  const eff = getEffectiveRow(r);
                  return `${r.description}: need ${eff.qty} ${r.unit}, ${eff.sup?.name} only has ${eff.sup?.stock}`;
                }).join(" · ")}
              </p>
              <p className="mt-0.5 text-xs text-red-500">Switch to a supplier with sufficient stock, or split the order by adjusting quantities.</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-200 bg-gray-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Code</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Description</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500">Unit</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">Qty</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 min-w-[220px]">Supplier</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">
                  Unit Price
                  <span className={`ml-1 rounded px-1 text-[9px] font-bold ${priceRef === "internal" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {priceRef === "internal" ? "INTERNAL" : "DPWH"}
                  </span>
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">Total</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-500">Stock</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const eff = getEffectiveRow(row);
                const basePrice = priceRef === "internal" ? row.internalPrice : row.dpwhPrice;
                const conflict = eff.sup && eff.sup.stock < eff.qty && eff.sup.stock !== 999;
                const rowTotal = eff.price * eff.qty;
                const baseTotal = basePrice * row.qty;
                const changed = Math.abs(rowTotal - baseTotal) > 1;

                return (
                  <tr key={row.code} className={`border-b border-gray-100 transition-colors ${conflict ? "bg-red-50/60" : changed ? "bg-amber-50/40" : "hover:bg-gray-50"}`}>
                    <td className="px-4 py-2.5 font-mono text-gray-500">{row.code}</td>
                    <td className="px-4 py-2.5 text-gray-800">{row.description}</td>
                    <td className="px-4 py-2.5 text-center text-gray-500">{row.unit}</td>

                    {/* Qty */}
                    <td className="px-4 py-2.5 text-right">
                      {editingCell === `${row.code}-qty` ? (
                        <input
                          value={draft}
                          onChange={e => setDraft(e.target.value)}
                          onBlur={() => commitEdit(row.code, "qty")}
                          onKeyDown={e => e.key === "Enter" && commitEdit(row.code, "qty")}
                          className="w-16 rounded border border-[#E07B39] px-1.5 py-0.5 text-right text-xs focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => startEdit(`${row.code}-qty`, String(eff.qty))}
                          className="flex items-center gap-0.5 ml-auto rounded border border-transparent px-1.5 py-0.5 text-gray-700 hover:border-gray-300 hover:bg-white"
                        >
                          {eff.qty}
                          <Edit2 className="h-2.5 w-2.5 text-gray-400" />
                        </button>
                      )}
                    </td>

                    {/* Supplier */}
                    <td className="px-4 py-2.5">
                      <SupplierDropdown
                        suppliers={row.suppliers}
                        selectedId={eff.supplierId}
                        qty={eff.qty}
                        currentPrice={basePrice}
                        onSelect={(id) => updateEdit(row.code, { supplierId: id })}
                        onPriceOverride={(p) => updateEdit(row.code, { price: p })}
                      />
                    </td>

                    {/* Unit Price */}
                    <td className="px-4 py-2.5 text-right">
                      {editingCell === `${row.code}-price` ? (
                        <input
                          value={draft}
                          onChange={e => setDraft(e.target.value)}
                          onBlur={() => commitEdit(row.code, "price")}
                          onKeyDown={e => e.key === "Enter" && commitEdit(row.code, "price")}
                          className="w-24 rounded border border-[#E07B39] px-1.5 py-0.5 text-right text-xs focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => startEdit(`${row.code}-price`, String(eff.price))}
                          className="flex items-center gap-0.5 ml-auto rounded border border-transparent px-1.5 py-0.5 hover:border-gray-300 hover:bg-white"
                        >
                          <span className={`font-semibold ${eff.price < basePrice ? "text-green-600" : eff.price > basePrice ? "text-red-500" : "text-gray-800"}`}>
                            {fmt(eff.price)}
                          </span>
                          <Edit2 className="h-2.5 w-2.5 text-gray-400" />
                        </button>
                      )}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-2.5 text-right font-bold text-gray-900">
                      {fmt(rowTotal)}
                      {changed && (
                        <span className={`ml-1.5 text-[9px] font-semibold ${rowTotal < baseTotal ? "text-green-600" : "text-red-500"}`}>
                          {rowTotal < baseTotal ? "▼" : "▲"}{fmt(Math.abs(rowTotal - baseTotal))}
                        </span>
                      )}
                    </td>

                    {/* Stock indicator */}
                    <td className="px-4 py-2.5 text-center">
                      {eff.sup?.stock === 999 ? (
                        <span className="text-gray-400">—</span>
                      ) : conflict ? (
                        <span className="flex items-center justify-center gap-0.5 font-bold text-red-600">
                          <AlertTriangle className="h-3 w-3" /> {eff.sup?.stock}/{eff.qty}
                        </span>
                      ) : (
                        <span className="font-semibold text-green-600">{eff.sup?.stock} ✓</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Original Total</p>
              <p className="text-base font-bold text-gray-600">{fmt(originalTotal)}</p>
            </div>
            <div className="text-gray-300">→</div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Revised Total</p>
              <p className={`text-base font-bold ${diff < 0 ? "text-green-600" : diff > 0 ? "text-red-500" : "text-gray-900"}`}>
                {fmt(revisedTotal)}
              </p>
            </div>
            {Math.abs(diff) > 1 && (
              <div className={`rounded-lg px-3 py-1.5 text-xs font-bold ${diff < 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {diff < 0 ? "Saving " : "Increase "}
                {fmt(Math.abs(diff))} ({((Math.abs(diff) / originalTotal) * 100).toFixed(1)}%)
              </div>
            )}
            {conflicts.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-600">
                <AlertTriangle className="h-3 w-3" /> {conflicts.length} unresolved conflict{conflicts.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEdits({}); }}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </button>
            <button onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              data-testid="btn-apply-revisions"
              onClick={onApply}
              className="flex items-center gap-2 rounded-lg bg-[#E07B39] px-5 py-2 text-sm font-semibold text-white hover:bg-[#c96b2f]"
            >
              <Check className="h-4 w-4" /> Apply Revisions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
