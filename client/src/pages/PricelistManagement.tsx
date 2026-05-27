import { useState, useRef } from "react";
import { ChevronDown, Upload, Link2, Search, RefreshCw, CheckCircle2, AlertTriangle, Info, ChevronRight, ChevronLeft, FileSpreadsheet, Check, X, ArrowRight, Eye, Download, Tag, Zap, Database } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProgressStepper } from "@/components/layout/ProgressStepper";

const PRICELIST_STEPS = [
  { number: 1, label: "Upload File" },
  { number: 2, label: "Review & Detect" },
  { number: 3, label: "Map & Confirm" },
];

const SAMPLE_ROWS = [
  { code: "WP-SIK-001", description: "Sika Bituseal T-140 SA Waterproofing Membrane",     unit: "m²",   price: 1596,  category: "Waterproofing", supplier: "Sika Philippines Inc." },
  { code: "WP-SIK-002", description: "Sika-1 Waterproof Mortar Compound 25kg",            unit: "bag",  price: 1820,  category: "Waterproofing", supplier: "Sika Philippines Inc." },
  { code: "WP-MAP-001", description: "Mapelastic AquaDefense Liquid Membrane 3.5kg",      unit: "pail", price: 2240,  category: "Waterproofing", supplier: "Mapei Philippines Corp." },
  { code: "WP-MAP-002", description: "Mapelastic Foundation Flexible Waterproof Mortar",  unit: "kg",   price: 210,   category: "Waterproofing", supplier: "Mapei Philippines Corp." },
  { code: "WP-FOS-001", description: "Fosroc Nitocote EN Epoxy Waterproofing Coating",    unit: "L",    price: 2800,  category: "Waterproofing", supplier: "Fosroc Philippines" },
  { code: "WP-ARD-001", description: "Ardex WPM 300 Flexible Waterproof Membrane",        unit: "m²",   price: 683,   category: "Waterproofing", supplier: "Ardex Philippines" },
  { code: "SS-SIK-001", description: "Sikaflex Pro-3WF Weatherseal Sealant 600ml",        unit: "ssg",  price: 560,   category: "Sealants",      supplier: "Sika Philippines Inc." },
  { code: "SS-BOS-001", description: "Bostik Seal N Flex 1 Polyurethane Sealant 310ml",   unit: "tube", price: 392,   category: "Sealants",      supplier: "Bostik Philippines" },
  { code: "PRM-MAP-001","description": "Mapei Eco Prim Grip Surface Primer 1L",            unit: "L",    price: 580,   category: "Primers",       supplier: "Mapei Philippines Corp." },
  { code: "PRM-SIK-001", description: "Sika Primer-3N Universal Bonding Agent 1L",        unit: "L",    price: 728,   category: "Primers",       supplier: "Sika Philippines Inc." },
  { code: "DRN-ACO-001", description: "ACO Drain Channel 100mm x 1000mm",                 unit: "pc",   price: 1596,  category: "Drainage",      supplier: "ACO Phil. Distribution" },
  { code: "DRN-REL-001", description: "Reln 100mm Slotted Drain Grate 1m Length",         unit: "pc",   price: 1288,  category: "Drainage",      supplier: "Reln Philippines" },
];

const DPWH_ROWS = [
  { code: "DPWH-WP-01", description: "Waterproofing Membrane (Standard Grade)",       unit: "m²",   price: 1900,  region: "NCR",  published: "Jan 2026" },
  { code: "DPWH-WP-02", description: "Waterproofing Membrane Flashing (Perimeter)",   unit: "lm",   price: 820,   region: "NCR",  published: "Jan 2026" },
  { code: "DPWH-WP-03", description: "Primer Coat Application",                       unit: "m²",   price: 390,   region: "NCR",  published: "Jan 2026" },
  { code: "DPWH-SS-01", description: "Sealant & Gap Filler (Polyurethane Type)",      unit: "tube", price: 560,   region: "NCR",  published: "Jan 2026" },
  { code: "DPWH-DR-01", description: "Drainage Grate (Polymer/Stainless)",            unit: "pc",   price: 1960,  region: "NCR",  published: "Jan 2026" },
];

const DETECTED_COLUMNS = [
  { raw: "Item Code",    mapped: "code",        confidence: 98, type: "text",   required: true },
  { raw: "Description", mapped: "description",  confidence: 97, type: "text",   required: true },
  { raw: "Unit",        mapped: "unit",         confidence: 95, type: "text",   required: true },
  { raw: "Price",       mapped: "price",        confidence: 96, type: "number", required: true },
  { raw: "Category",    mapped: "category",     confidence: 88, type: "text",   required: false },
  { raw: "Supplier",    mapped: "supplier",     confidence: 91, type: "text",   required: false },
];

const CATALOG_FIELDS = ["code", "description", "unit", "price", "category", "supplier", "— skip —"];

const FETCH_SOURCES = [
  { id: "dpwh-cmpd", label: "DPWH CMPD", sub: "Official Gov. Construction Materials Price Data", icon: Database },
  { id: "supplier-url", label: "Supplier Website", sub: "Fetch directly from a supplier's price page", icon: Link2 },
  { id: "buildSmart-market", label: "BuildSmart Market Index", sub: "Our curated national price index", icon: Tag },
];

const REGIONS = ["NCR", "Region I", "Region II", "Region III", "Region IV-A", "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII", "Region IX", "Region X", "Region XI", "Region XII", "CAR", "CARAGA", "BARMM"];

function fmt(n: number) {
  return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

function UploadFileStep({ onNext }: { onNext: (source: "upload" | "fetch") => void }) {
  const [activeTab, setActiveTab] = useState<"upload" | "fetch">("upload");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [fetchSource, setFetchSource] = useState("dpwh-cmpd");
  const [region, setRegion] = useState("NCR");
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleFetch = () => {
    setFetching(true);
    setTimeout(() => { setFetching(false); setFetched(true); }, 2200);
  };

  return (
    <div className="flex gap-6 overflow-hidden h-full">
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex flex-shrink-0 border-b border-gray-200">
          <button onClick={() => setActiveTab("upload")}
            className={`relative px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "upload" ? "text-[#E07B39]" : "text-gray-500 hover:text-gray-700"}`}>
            Upload Pricelist
            {activeTab === "upload" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07B39]" />}
          </button>
          <button onClick={() => setActiveTab("fetch")}
            className={`relative px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "fetch" ? "text-[#E07B39]" : "text-gray-500 hover:text-gray-700"}`}>
            Fetch Pricelist
            {activeTab === "fetch" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07B39]" />}
          </button>
        </div>

        {/* Upload tab */}
        {activeTab === "upload" && (
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
            <p className="text-sm text-gray-500">Upload your supplier price list file to add or update prices in your Catalog</p>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-16 ${
                dragging ? "border-[#E07B39] bg-[#fff7f0]" : file ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-[#E07B39] hover:bg-[#fff7f0]"
              }`}
            >
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
              {file ? (
                <>
                  <FileSpreadsheet className="h-10 w-10 text-green-500" />
                  <div className="text-center">
                    <p className="font-semibold text-green-700">{file.name}</p>
                    <p className="text-sm text-green-600">{(file.size / 1024).toFixed(1)} KB — ready to process</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setFile(null); }}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:border-red-300 hover:text-red-500">
                    <X className="h-3 w-3" /> Remove
                  </button>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400" />
                  <div className="text-center">
                    <p className="text-base font-semibold text-gray-700"><span className="font-bold">Drag & Drop</span> your Files Here</p>
                  </div>
                  <button className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-[#E07B39] hover:text-[#E07B39]">
                    Or Browse Files
                  </button>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {["XLSX", "XLS", "CSV"].map(fmt => (
                      <span key={fmt} className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 font-semibold">{fmt}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {file && (
              <button
                data-testid="btn-process-upload"
                onClick={() => onNext("upload")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E07B39] py-3 text-sm font-bold text-white hover:bg-[#c96b2f]"
              >
                Process File <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Fetch tab */}
        {activeTab === "fetch" && (
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
            <p className="text-sm text-gray-500">Fetch the latest price data directly from official sources or supplier portals</p>

            <div className="grid grid-cols-3 gap-3">
              {FETCH_SOURCES.map(s => {
                const Icon = s.icon;
                return (
                  <button key={s.id} onClick={() => setFetchSource(s.id)}
                    className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                      fetchSource === s.id ? "border-[#E07B39] bg-[#fff7f0]" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${fetchSource === s.id ? "bg-[#E07B39] text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${fetchSource === s.id ? "text-[#E07B39]" : "text-gray-800"}`}>{s.label}</p>
                      <p className="text-xs text-gray-500">{s.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {fetchSource === "dpwh-cmpd" && (
              <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3">
                  <Database className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-700">DPWH Construction Materials Price Data — Updated quarterly by DPWH</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Region</label>
                    <select value={region} onChange={e => setRegion(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#E07B39] focus:outline-none">
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">Quarter</label>
                    <select className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#E07B39] focus:outline-none">
                      <option>Q1 2026 (Latest)</option>
                      <option>Q4 2025</option>
                      <option>Q3 2025</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Material Category Filter (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {["Waterproofing", "Concrete", "Steel", "Timber", "Electrical", "Plumbing"].map(cat => (
                      <button key={cat} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:border-[#E07B39] hover:text-[#E07B39]">
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                {fetched ? (
                  <div className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Successfully fetched {DPWH_ROWS.length} price records from DPWH CMPD ({region})</p>
                      <p className="text-xs text-green-600">Data current as of Q1 2026 · Ready for review</p>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleFetch} disabled={fetching}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all ${fetching ? "bg-gray-300" : "bg-[#E07B39] hover:bg-[#c96b2f]"}`}>
                    {fetching ? <><RefreshCw className="h-4 w-4 animate-spin" /> Fetching DPWH data…</> : <><Search className="h-4 w-4" /> Fetch Latest DPWH Prices</>}
                  </button>
                )}
                {fetched && (
                  <button onClick={() => onNext("fetch")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white hover:bg-gray-700">
                    Review Fetched Data <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {fetchSource === "supplier-url" && (
              <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Supplier Price Page URL</label>
                  <div className="flex gap-2">
                    <input type="url" placeholder="https://supplier.com/price-list" defaultValue=""
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#E07B39] focus:outline-none" />
                    <button className="flex items-center gap-2 rounded-xl bg-[#E07B39] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c96b2f]">
                      <Link2 className="h-4 w-4" /> Fetch
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  BuildSmart will attempt to parse the page automatically. Results may vary based on the supplier's website structure.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right guide panel */}
      <div className="flex w-72 flex-shrink-0 flex-col gap-4 overflow-y-auto">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="mb-4 text-sm font-bold text-gray-800">Quick Upload Guide</p>
          <p className="mb-3 text-xs font-semibold text-gray-500">Everything you need to know before uploading your file</p>

          <div className="flex flex-col gap-3">
            {[
              {
                icon: FileSpreadsheet, color: "#E07B39",
                title: "Accepted formats",
                body: "Upload files in any of the following formats:",
                badges: ["XLSX", "XLS", "CSV"],
              },
              {
                icon: Search, color: "#4f46e5",
                title: "Auto-detection",
                body: "After you upload, BuildSmart will automatically:",
                list: ["Analyze your file", "Normalize data", "Validate for issues", "Categorize materials", "Prepare for quotation"],
              },
              {
                icon: Tag, color: "#10b981",
                title: "Recommended Structure (Optional)",
                body: "For better accuracy, organize data into:",
                list: ["Supplier Table", "Item / Material Table", "Price Table"],
              },
              {
                icon: Info, color: "#f59e0b",
                title: "No Problem!",
                body: "BuildSmart can detect and map custom column structures in Review & Detect. No manual template conversion required.",
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: card.color + "18" }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: card.color }} />
                    </div>
                    <p className="text-xs font-bold text-gray-700">{card.title}</p>
                  </div>
                  <p className="mb-1.5 text-xs text-gray-500">{card.body}</p>
                  {card.badges && (
                    <div className="flex gap-1.5">
                      {card.badges.map(b => (
                        <span key={b} className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-bold text-gray-600">{b}</span>
                      ))}
                    </div>
                  )}
                  {card.list && (
                    <ul className="flex flex-col gap-0.5">
                      {card.list.map(li => (
                        <li key={li} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Check className="h-3 w-3 flex-shrink-0 text-green-500" /> {li}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewDetectStep({ source, onNext, onBack }: { source: "upload" | "fetch"; onNext: () => void; onBack: () => void }) {
  const rows = source === "fetch" ? DPWH_ROWS : SAMPLE_ROWS;
  const [colEdits, setColEdits] = useState<Record<string, string>>(
    Object.fromEntries(DETECTED_COLUMNS.map(c => [c.raw, c.mapped]))
  );

  const issues = DETECTED_COLUMNS.filter(c => c.confidence < 90).length;

  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden">
      <div className="flex flex-shrink-0 items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Review & Detect</h2>
          <p className="text-xs text-gray-500">
            {source === "fetch" ? "BuildSmart fetched " : "BuildSmart analyzed "}<strong>{rows.length} price records</strong>.
            Verify the detected columns before mapping.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={onNext} className="flex items-center gap-2 rounded-lg bg-[#E07B39] px-4 py-2 text-sm font-bold text-white hover:bg-[#c96b2f]">
            Map & Confirm <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status banner */}
      <div className={`flex flex-shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm ${issues ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
        {issues ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        {issues
          ? <><strong>{issues} column{issues > 1 ? "s" : ""} with low confidence</strong> — please review the highlighted columns below before proceeding.</>
          : <><strong>All columns detected with high confidence.</strong> You're good to proceed to mapping.</>
        }
      </div>

      <div className="flex flex-1 gap-5 overflow-hidden">
        {/* Column detection panel */}
        <div className="flex w-80 flex-shrink-0 flex-col gap-3 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Detected Columns</p>
          {DETECTED_COLUMNS.map(col => {
            const conf = col.confidence;
            const edited = colEdits[col.raw] !== col.mapped;
            return (
              <div key={col.raw} className={`rounded-xl border p-3 ${conf < 90 ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">{col.raw}</span>
                  {col.required && <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">Required</span>}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 flex-shrink-0 text-gray-400" />
                  <select value={colEdits[col.raw]} onChange={e => setColEdits(p => ({ ...p, [col.raw]: e.target.value }))}
                    className={`flex-1 rounded-lg border px-2 py-1 text-xs focus:outline-none ${edited ? "border-[#E07B39] text-[#E07B39]" : "border-gray-200 text-gray-700"}`}>
                    {CATALOG_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${conf}%`, background: conf >= 90 ? "#22c55e" : "#f59e0b" }} />
                  </div>
                  <span className={`text-[10px] font-bold ${conf >= 90 ? "text-green-600" : "text-amber-600"}`}>{conf}%</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400">{conf >= 93 ? "High" : conf >= 85 ? "Med" : "Low"}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Data preview table */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Data Preview — {rows.length} rows</p>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">{rows.length} valid rows detected</span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-500">#</th>
                  {source === "fetch" ? (
                    <>
                      <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Code</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Description</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Unit</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Unit Price</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Region</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Published</th>
                    </>
                  ) : (
                    <>
                      <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Code</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Description</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Unit</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Price</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Category</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Supplier</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {(rows as any[]).map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-gray-500">{row.code}</td>
                    <td className="max-w-xs truncate px-3 py-2 text-gray-800">{row.description}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{row.unit}</td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-900">{fmt(row.price)}</td>
                    {source === "fetch" ? (
                      <>
                        <td className="px-3 py-2 text-center"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{row.region}</span></td>
                        <td className="px-3 py-2 text-center text-gray-400">{row.published}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">{row.category}</span></td>
                        <td className="px-3 py-2 text-gray-500">{row.supplier}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapConfirmStep({ source, onBack, onDone }: { source: "upload" | "fetch"; onBack: () => void; onDone: () => void }) {
  const rows = source === "fetch" ? DPWH_ROWS : SAMPLE_ROWS;
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => { setConfirming(false); setDone(true); }, 2000);
  };

  const categories = [...new Set((rows as any[]).map(r => r.category || "Waterproofing"))];

  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Pricelist Added!</h2>
          <p className="mt-2 text-gray-500">{rows.length} price records have been saved to your BuildSmart catalog and are ready for use in quotation generation.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { label: "Items Added",    value: String(rows.length), color: "#E07B39" },
            { label: "Categories",     value: String(categories.length || 3), color: "#4f46e5" },
            { label: "Source",         value: source === "fetch" ? "DPWH CMPD" : "Uploaded File", color: "#10b981" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-gray-100 bg-white px-8 py-4 text-center shadow-sm">
              <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onDone} className="flex items-center gap-2 rounded-xl bg-[#E07B39] px-6 py-3 text-sm font-bold text-white hover:bg-[#c96b2f]">
            <Eye className="h-4 w-4" /> View Catalog
          </button>
          <button onClick={onDone} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Upload className="h-4 w-4" /> Upload Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden">
      <div className="flex flex-shrink-0 items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Map & Confirm</h2>
          <p className="text-xs text-gray-500">Review the final mapping and confirm to add {rows.length} items to your catalog</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={handleConfirm} disabled={confirming}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white transition-all ${confirming ? "bg-gray-300" : "bg-[#E07B39] hover:bg-[#c96b2f]"}`}>
            {confirming ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</> : <><Zap className="h-4 w-4" /> Add to Catalog</>}
          </button>
        </div>
      </div>

      {/* Mapping summary cards */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3">
        {[
          { icon: FileSpreadsheet, label: "Total Records",  value: String(rows.length), color: "#E07B39" },
          { icon: Check,           label: "Valid Rows",      value: String(rows.length), color: "#22c55e" },
          { icon: Tag,             label: "Categories",      value: source === "fetch" ? "1" : "4", color: "#4f46e5" },
          { icon: AlertTriangle,   label: "Issues Found",    value: "0", color: "#f59e0b" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: s.color + "18" }}>
                <Icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Column mapping table */}
      <div className="flex-shrink-0 rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Column Mapping Configuration</p>
        </div>
        <div className="grid grid-cols-4 gap-0 divide-x divide-gray-100 text-xs">
          {DETECTED_COLUMNS.map(col => (
            <div key={col.raw} className="flex flex-col gap-1.5 p-3">
              <p className="font-semibold text-gray-700">{col.raw}</p>
              <div className="flex items-center gap-1 text-gray-400">
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium text-[#E07B39]">{col.mapped}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-12 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-1 rounded-full bg-green-500" style={{ width: `${col.confidence}%` }} />
                </div>
                <span className="text-gray-400">{col.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final data table */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Final Mapped Data — {rows.length} items to be added</p>
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <Download className="h-3 w-3" /> Export Preview
          </button>
        </div>
        <div className="overflow-auto h-full">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-100">
                {["#", "Code", "Description", "Unit", "Price", "Category", "Source"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(rows as any[]).map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2 font-mono text-gray-500">{row.code}</td>
                  <td className="max-w-[220px] truncate px-3 py-2 text-gray-800">{row.description}</td>
                  <td className="px-3 py-2 text-gray-500">{row.unit}</td>
                  <td className="px-3 py-2 font-semibold text-gray-900">{fmt(row.price)}</td>
                  <td className="px-3 py-2"><span className="rounded-full bg-[#fff7f0] px-2 py-0.5 text-[10px] font-semibold text-[#E07B39]">{row.category || "Waterproofing"}</span></td>
                  <td className="px-3 py-2 text-gray-400">{source === "fetch" ? "DPWH CMPD" : row.supplier || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function PricelistManagement() {
  const [activeStep, setActiveStep] = useState(1);
  const [source, setSource] = useState<"upload" | "fetch">("upload");

  const handleStep1Next = (src: "upload" | "fetch") => { setSource(src); setActiveStep(2); };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-['Poppins',Helvetica,sans-serif]">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 shadow-sm">
          <div className="flex items-center gap-3 min-w-0 overflow-x-auto">
            <ProgressStepper steps={PRICELIST_STEPS} activeStep={activeStep} />
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 ml-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E07B39] text-sm font-bold text-white">JC</div>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-gray-800 leading-tight">John Contractor</p>
              <p className="text-[10px] text-gray-500 leading-tight">JC Waterproofing Inc.</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </header>

        {/* Page title */}
        <div className="flex flex-shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-6 py-3">
          <div>
            <h1 className="text-base font-bold text-gray-900">Pricelist Management</h1>
            <p className="text-xs text-gray-500">Add, update, and manage your material price catalog</p>
          </div>
        </div>

        {/* Main content */}
        <main className="flex flex-1 overflow-hidden p-6">
          {activeStep === 1 && <UploadFileStep onNext={handleStep1Next} />}
          {activeStep === 2 && <ReviewDetectStep source={source} onNext={() => setActiveStep(3)} onBack={() => setActiveStep(1)} />}
          {activeStep === 3 && <MapConfirmStep source={source} onBack={() => setActiveStep(2)} onDone={() => { setActiveStep(1); setSource("upload"); }} />}
        </main>
      </div>
    </div>
  );
}
