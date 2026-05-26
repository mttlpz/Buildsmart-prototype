import { useState, useMemo } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Copy, ClipboardList, StickyNote, Layers, ChevronDown, AlertCircle } from "lucide-react";

interface SegmentInfo {
  id: number;
  name: string;
  color: string;
  bg: string;
  sqm: number;
  floor: "main" | "lower";
}

const ALL_SEGMENTS: SegmentInfo[] = [
  { id: 1,  name: "Living Room (A)",  color: "#d4a843", bg: "#fef3c7", sqm: 25.1,  floor: "main"  },
  { id: 2,  name: "Dining Room (A)", color: "#84cc16", bg: "#ecfccb", sqm: 15.6,  floor: "main"  },
  { id: 3,  name: "Kitchen (A)",      color: "#f97316", bg: "#ffedd5", sqm: 11.1,  floor: "main"  },
  { id: 4,  name: "Bed 1 (Unit A)",   color: "#60a5fa", bg: "#dbeafe", sqm: 18.2,  floor: "main"  },
  { id: 5,  name: "Bed 1 (Unit B)",   color: "#818cf8", bg: "#e0e7ff", sqm: 18.2,  floor: "main"  },
  { id: 6,  name: "Living Room (B)",  color: "#f59e0b", bg: "#fef3c7", sqm: 25.1,  floor: "main"  },
  { id: 7,  name: "Dining Room (B)", color: "#65a30d", bg: "#ecfccb", sqm: 15.6,  floor: "main"  },
  { id: 8,  name: "Kitchen (B)",      color: "#ea580c", bg: "#ffedd5", sqm: 11.1,  floor: "main"  },
  { id: 9,  name: "Garage",           color: "#9ca3af", bg: "#f3f4f6", sqm: 40.9,  floor: "main"  },
  { id: 10, name: "Deck",             color: "#fbbf24", bg: "#fffbeb", sqm: 14.9,  floor: "main"  },
  { id: 11, name: "Family Room (A)",  color: "#2dd4bf", bg: "#ccfbf1", sqm: 23.8,  floor: "lower" },
  { id: 12, name: "Game Area (A)",    color: "#34d399", bg: "#d1fae5", sqm: 26.8,  floor: "lower" },
  { id: 13, name: "Game Area (B)",    color: "#10b981", bg: "#d1fae5", sqm: 26.8,  floor: "lower" },
  { id: 14, name: "Bed 2 (Unit A)",   color: "#5eead4", bg: "#ccfbf1", sqm:  5.9,  floor: "lower" },
  { id: 15, name: "Bed 3 (Unit A)",   color: "#38bdf8", bg: "#e0f2fe", sqm:  5.9,  floor: "lower" },
  { id: 16, name: "Bed 2 (Unit B)",   color: "#7dd3fc", bg: "#e0f2fe", sqm:  5.9,  floor: "lower" },
  { id: 17, name: "Crawl Space",      color: "#a3e635", bg: "#ecfccb", sqm: 11.1,  floor: "lower" },
];

type Priority   = "High" | "Medium" | "Low" | "";
type WorkType   = "Waterproofing" | "Painting" | "Flooring" | "Roofing" | "Tiling" | "Concrete Works" | "Custom" | "";
type ScopeWork  = "Full Installation" | "Repair Only" | "Inspection & Assessment" | "Maintenance" | "Demolition" | "New Construction" | "";
type Material   = "Standard" | "Premium" | "Economy" | "Custom" | "";
type Contractor = "In-house Team" | "Sub-contractor A" | "Sub-contractor B" | "Sub-contractor C" | "TBD" | "";

interface ScopeConfig {
  workType:           WorkType;
  scopeOfWork:        ScopeWork;
  material:           Material;
  contractor:         Contractor;
  priority:           Priority;
  includeInQuote:     boolean;
  requiresInspection: boolean;
  isRush:             boolean;
  includeLabor:       boolean;
  includeMaterial:    boolean;
  includeEquipment:   boolean;
  notes:              string;
}

const DEFAULT_CONFIG: ScopeConfig = {
  workType:           "",
  scopeOfWork:        "",
  material:           "",
  contractor:         "",
  priority:           "",
  includeInQuote:     true,
  requiresInspection: false,
  isRush:             false,
  includeLabor:       true,
  includeMaterial:    true,
  includeEquipment:   false,
  notes:              "",
};

function SelectField({ label, value, options, onChange, required }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">
        {label}{required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-xs text-gray-800 shadow-sm outline-none focus:border-[#E07B39] focus:ring-1 focus:ring-[#E07B39]/30 transition-colors"
        >
          <option value="">— Select —</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function CheckField({ label, checked, onChange, accent }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; accent?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:border-gray-200 hover:bg-gray-50 transition-colors select-none">
      <span
        onClick={() => onChange(!checked)}
        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
          checked ? "border-transparent" : "border-gray-300 bg-white"
        }`}
        style={checked ? { backgroundColor: accent || "#E07B39", borderColor: accent || "#E07B39" } : {}}
      >
        {checked && (
          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span onClick={() => onChange(!checked)}>{label}</span>
    </label>
  );
}

interface AssignScopeTabProps {
  onNext: () => void;
  onBack: () => void;
}

export function AssignScopeTab({ onNext, onBack }: AssignScopeTabProps) {
  const [selectedIds, setSelectedIds]     = useState<Set<number>>(new Set(ALL_SEGMENTS.map((s) => s.id)));
  const [activeSegId, setActiveSegId]     = useState<number>(ALL_SEGMENTS[0].id);
  const [configs, setConfigs]             = useState<Record<number, ScopeConfig>>(
    Object.fromEntries(ALL_SEGMENTS.map((s) => [s.id, { ...DEFAULT_CONFIG }]))
  );
  const [floorFilter, setFloorFilter]     = useState<"all" | "main" | "lower">("all");
  const [applyBanner, setApplyBanner]     = useState<string | null>(null);

  const activeSeg  = ALL_SEGMENTS.find((s) => s.id === activeSegId)!;
  const activeConf = configs[activeSegId];

  const filteredSegs = useMemo(
    () => ALL_SEGMENTS.filter((s) => floorFilter === "all" || s.floor === floorFilter),
    [floorFilter]
  );

  const updateConfig = (id: number, patch: Partial<ScopeConfig>) => {
    setConfigs((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const applyToAll = () => {
    const src = configs[activeSegId];
    setConfigs((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, { ...src }])));
    setApplyBanner(`Configuration applied to all ${ALL_SEGMENTS.length} segments.`);
    setTimeout(() => setApplyBanner(null), 3000);
  };

  const applyToSelected = () => {
    if (selectedIds.size === 0) return;
    const src = configs[activeSegId];
    setConfigs((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => { next[id] = { ...src }; });
      return next;
    });
    setApplyBanner(`Configuration applied to ${selectedIds.size} selected segment${selectedIds.size > 1 ? "s" : ""}.`);
    setTimeout(() => setApplyBanner(null), 3000);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSegs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSegs.map((s) => s.id)));
    }
  };

  const configuredCount = ALL_SEGMENTS.filter((s) => configs[s.id].workType !== "").length;
  const totalSqm        = ALL_SEGMENTS.reduce((a, s) => a + s.sqm, 0);

  const set = (patch: Partial<ScopeConfig>) => updateConfig(activeSegId, patch);

  return (
    <div className="flex h-full flex-col gap-0 overflow-hidden">
      {/* Top bar */}
      <div className="flex flex-shrink-0 items-center justify-between pb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Assign Scope</h2>
          <p className="text-xs text-gray-500">Configure the scope of work for each confirmed segment. Use <strong>Apply to All</strong> to bulk-set a configuration.</p>
        </div>
        <div className="flex items-center gap-2">
          <button data-testid="back-btn" onClick={onBack}
            className="flex items-center gap-1.5 rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>
          <button data-testid="next-btn" onClick={onNext}
            className="flex items-center gap-1.5 rounded bg-[#E07B39] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#c96b2f]">
            Generate Quotation <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Apply banner */}
      {applyBanner && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-xs font-medium text-green-700 shadow-sm">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" /> {applyBanner}
        </div>
      )}

      {/* Three-column layout */}
      <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">

        {/* ── Column 1: Segment list ── */}
        <div className="flex w-56 flex-shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* List header */}
          <div className="border-b border-gray-100 px-3 py-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Layers className="h-3.5 w-3.5 text-[#E07B39]" /> Segments
                <span className="rounded-full bg-[#E07B39]/10 px-1.5 text-[10px] font-bold text-[#E07B39]">{ALL_SEGMENTS.length}</span>
              </span>
              <button onClick={toggleSelectAll} className="text-[10px] font-medium text-[#E07B39] hover:underline">
                {selectedIds.size === filteredSegs.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            {/* Floor filter pills */}
            <div className="flex gap-1">
              {(["all", "main", "lower"] as const).map((f) => (
                <button key={f} onClick={() => setFloorFilter(f)}
                  className={`flex-1 rounded-md py-0.5 text-[10px] font-semibold capitalize transition-colors ${floorFilter === f ? "bg-[#E07B39] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {f === "all" ? "All" : f === "main" ? "Main" : "Lower"}
                </button>
              ))}
            </div>
          </div>

          {/* Segment list */}
          <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-0.5">
            {filteredSegs.map((seg) => {
              const conf     = configs[seg.id];
              const isActive = seg.id === activeSegId;
              const isSel    = selectedIds.has(seg.id);
              const isDone   = conf.workType !== "";
              return (
                <div key={seg.id}
                  data-testid={`seg-list-${seg.id}`}
                  onClick={() => setActiveSegId(seg.id)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-all ${isActive ? "ring-2 shadow-sm" : "hover:bg-gray-50"}`}
                  style={isActive ? { ringColor: seg.color, backgroundColor: seg.bg, outlineColor: seg.color, outline: `2px solid ${seg.color}` } : {}}
                >
                  {/* Checkbox */}
                  <span
                    onClick={(e) => { e.stopPropagation(); toggleSelect(seg.id); }}
                    className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${isSel ? "border-transparent" : "border-gray-300 bg-white"}`}
                    style={isSel ? { backgroundColor: seg.color, borderColor: seg.color } : {}}
                  >
                    {isSel && (
                      <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[11px] font-semibold text-gray-700">{seg.name}</p>
                    <p className="text-[10px] text-gray-400">{seg.sqm} sqm</p>
                  </div>
                  {isDone && <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-green-500" />}
                </div>
              );
            })}
          </div>

          {/* Progress footer */}
          <div className="border-t border-gray-100 px-3 py-2">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>Configured</span>
              <span className="font-bold text-gray-700">{configuredCount}/{ALL_SEGMENTS.length}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-[#E07B39] transition-all"
                style={{ width: `${(configuredCount / ALL_SEGMENTS.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* ── Column 2: Scope form ── */}
        <div className="flex flex-1 flex-col gap-3 min-w-0 overflow-y-auto">
          {/* Apply bar */}
          <div className="flex-shrink-0 flex items-center justify-between rounded-xl border border-dashed border-[#E07B39]/40 bg-orange-50/60 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-[#E07B39]" />
              <div>
                <p className="text-xs font-semibold text-gray-700">Apply Configuration</p>
                <p className="text-[10px] text-gray-500">
                  Propagate the current settings to other segments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button data-testid="apply-to-selected-btn" onClick={applyToSelected}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-1.5 rounded-lg border border-[#E07B39] px-3 py-1.5 text-xs font-semibold text-[#E07B39] hover:bg-[#E07B39]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Apply to Selected
                <span className="rounded-full bg-[#E07B39]/10 px-1.5 text-[10px] font-bold text-[#E07B39]">{selectedIds.size}</span>
              </button>
              <button data-testid="apply-to-all-btn" onClick={applyToAll}
                className="flex items-center gap-1.5 rounded-lg bg-[#E07B39] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#c96b2f] transition-colors">
                Apply to All
                <span className="rounded-full bg-white/20 px-1.5 text-[10px] font-bold">{ALL_SEGMENTS.length}</span>
              </button>
            </div>
          </div>

          {/* Active segment header */}
          <div className="flex-shrink-0 flex items-center gap-3 rounded-xl px-4 py-3 border border-gray-100 shadow-sm"
            style={{ backgroundColor: activeSeg.bg }}>
            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: activeSeg.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{activeSeg.name}</p>
              <p className="text-xs text-gray-500 capitalize">{activeSeg.floor} floor · {activeSeg.sqm} sqm</p>
            </div>
            {activeConf.workType && (
              <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white" style={{ backgroundColor: activeSeg.color }}>
                {activeConf.workType}
              </span>
            )}
          </div>

          {/* Form body */}
          <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm overflow-y-auto">
            <div className="p-4 flex flex-col gap-5">

              {/* Section: Work Details */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-[#E07B39]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Work Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Work Type" value={activeConf.workType} required
                    options={["Waterproofing","Painting","Flooring","Roofing","Tiling","Concrete Works","Custom"]}
                    onChange={(v) => set({ workType: v as WorkType })} />
                  <SelectField label="Scope of Work" value={activeConf.scopeOfWork} required
                    options={["Full Installation","Repair Only","Inspection & Assessment","Maintenance","Demolition","New Construction"]}
                    onChange={(v) => set({ scopeOfWork: v as ScopeWork })} />
                  <SelectField label="Material Preference" value={activeConf.material}
                    options={["Standard","Premium","Economy","Custom"]}
                    onChange={(v) => set({ material: v as Material })} />
                  <SelectField label="Assigned Contractor" value={activeConf.contractor}
                    options={["In-house Team","Sub-contractor A","Sub-contractor B","Sub-contractor C","TBD"]}
                    onChange={(v) => set({ contractor: v as Contractor })} />
                </div>
                <div className="mt-3">
                  <SelectField label="Priority Level" value={activeConf.priority}
                    options={["High","Medium","Low"]}
                    onChange={(v) => set({ priority: v as Priority })} />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100" />

              {/* Section: Inclusions */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#E07B39]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Inclusions & Options</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <CheckField label="Include in Quotation"     checked={activeConf.includeInQuote}     onChange={(v) => set({ includeInQuote: v })}     accent="#E07B39" />
                  <CheckField label="Include Labor Cost"       checked={activeConf.includeLabor}       onChange={(v) => set({ includeLabor: v })}       accent="#E07B39" />
                  <CheckField label="Include Material Cost"    checked={activeConf.includeMaterial}    onChange={(v) => set({ includeMaterial: v })}    accent="#E07B39" />
                  <CheckField label="Include Equipment Cost"   checked={activeConf.includeEquipment}   onChange={(v) => set({ includeEquipment: v })}   accent="#E07B39" />
                  <CheckField label="Requires Site Inspection" checked={activeConf.requiresInspection} onChange={(v) => set({ requiresInspection: v })} accent="#f59e0b" />
                  <CheckField label="Rush / Urgent Order"      checked={activeConf.isRush}             onChange={(v) => set({ isRush: v })}             accent="#ef4444" />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100" />

              {/* Section: Notes */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-[#E07B39]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Scope Notes</h3>
                </div>
                <textarea
                  data-testid="scope-notes"
                  value={activeConf.notes}
                  onChange={(e) => set({ notes: e.target.value })}
                  rows={4}
                  placeholder="Add specific instructions, conditions, or remarks for this segment's scope of work…"
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#E07B39] focus:ring-1 focus:ring-[#E07B39]/30 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Column 3: Summary panel ── */}
        <div className="flex w-52 flex-shrink-0 flex-col gap-3">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="text-xs font-bold text-gray-700">Scope Overview</h3>
            </div>
            <div className="flex flex-col gap-2 p-3">
              <StatRow label="Total Segments"    value={String(ALL_SEGMENTS.length)}       accent="#E07B39" />
              <StatRow label="Configured"        value={String(configuredCount)}            accent="#22c55e" />
              <StatRow label="Pending"           value={String(ALL_SEGMENTS.length - configuredCount)} accent="#f59e0b" />
              <StatRow label="Total Area"        value={`${totalSqm.toFixed(1)} sqm`}     accent="#60a5fa" />
              <StatRow label="In Quotation"      value={String(Object.values(configs).filter((c) => c.includeInQuote).length)} accent="#8b5cf6" />
            </div>
          </div>

          {/* Per-work-type breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="text-xs font-bold text-gray-700">By Work Type</h3>
            </div>
            <div className="flex flex-col gap-1 p-3">
              {getWorkTypeSummary(configs).length === 0 ? (
                <p className="text-center text-[10px] text-gray-400 py-3">No work types assigned yet</p>
              ) : (
                getWorkTypeSummary(configs).map(({ type, count, sqm }) => (
                  <div key={type} className="flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1.5">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-700">{type}</p>
                      <p className="text-[10px] text-gray-400">{count} seg · {sqm.toFixed(1)} sqm</p>
                    </div>
                    <span className="rounded-full bg-[#E07B39]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#E07B39]">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rush / inspection flags */}
          {(Object.values(configs).some((c) => c.isRush) || Object.values(configs).some((c) => c.requiresInspection)) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                <h3 className="text-xs font-bold text-amber-700">Flags</h3>
              </div>
              <div className="flex flex-col gap-1">
                {Object.values(configs).some((c) => c.isRush) && (
                  <p className="text-[11px] text-amber-700">⚡ {Object.values(configs).filter((c) => c.isRush).length} rush segment(s)</p>
                )}
                {Object.values(configs).some((c) => c.requiresInspection) && (
                  <p className="text-[11px] text-amber-700">🔍 {Object.values(configs).filter((c) => c.requiresInspection).length} need inspection</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[11px] font-bold" style={{ color: accent }}>{value}</span>
    </div>
  );
}

function getWorkTypeSummary(configs: Record<number, ScopeConfig>) {
  const map: Record<string, { count: number; sqm: number }> = {};
  ALL_SEGMENTS.forEach((seg) => {
    const wt = configs[seg.id]?.workType;
    if (!wt) return;
    if (!map[wt]) map[wt] = { count: 0, sqm: 0 };
    map[wt].count++;
    map[wt].sqm += seg.sqm;
  });
  return Object.entries(map).map(([type, d]) => ({ type, ...d }));
}
