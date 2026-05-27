import { useState, useRef } from "react";
import { X, Plus, ChevronRight, Square, Ruler, PenLine, Hash } from "lucide-react";

type ShapeType = "rectangle" | "l-shaped" | "running-meter" | "manual-sqm";

interface QuickSegment {
  id: number;
  name: string;
  type: ShapeType;
  colorIdx: number;
  dims: Record<string, number>;
}

const COLORS = [
  { bg: "#fff7f0", border: "#E07B39", text: "#c96b2f", bar: "#E07B39",  light: "#ffe8d6" },
  { bg: "#eff6ff", border: "#3b82f6", text: "#1d4ed8", bar: "#3b82f6",  light: "#dbeafe" },
  { bg: "#f0fdf4", border: "#22c55e", text: "#15803d", bar: "#22c55e",  light: "#dcfce7" },
  { bg: "#faf5ff", border: "#a855f7", text: "#7e22ce", bar: "#a855f7",  light: "#f3e8ff" },
  { bg: "#fffbeb", border: "#f59e0b", text: "#b45309", bar: "#f59e0b",  light: "#fef3c7" },
  { bg: "#f0fdfa", border: "#14b8a6", text: "#0f766e", bar: "#14b8a6",  light: "#ccfbf1" },
  { bg: "#fdf2f8", border: "#ec4899", text: "#be185d", bar: "#ec4899",  light: "#fce7f3" },
  { bg: "#eef2ff", border: "#6366f1", text: "#3730a3", bar: "#6366f1",  light: "#e0e7ff" },
];

const SHAPE_BUTTONS: { type: ShapeType; label: string; sub: string; Icon: () => JSX.Element }[] = [
  {
    type: "rectangle",
    label: "Rectangle Area",
    sub: "Length × Width",
    Icon: () => (
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
        <rect x="1" y="1" width="20" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: "l-shaped",
    label: "L-Shaped Area",
    sub: "Overall minus notch",
    Icon: () => (
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
        <polyline points="1,1 12,1 12,7 21,7 21,15 1,15 1,1" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    type: "running-meter",
    label: "Running Meter",
    sub: "Linear length only",
    Icon: () => (
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
        <line x1="1" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,2" />
        <polyline points="17,4 21,8 17,12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: "manual-sqm",
    label: "Manual SQM",
    sub: "Enter area directly",
    Icon: () => (
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
        <text x="2" y="13" fontSize="10" fill="currentColor" fontWeight="bold">m²</text>
      </svg>
    ),
  },
];

const SHAPE_DEFAULTS: Record<ShapeType, Record<string, number>> = {
  "rectangle":    { length: 0, width: 0 },
  "l-shaped":     { overallL: 0, overallW: 0, notchL: 0, notchW: 0 },
  "running-meter":{ length: 0 },
  "manual-sqm":   { sqm: 0 },
};

const DIM_LABELS: Record<string, string> = {
  length: "Length (m)",
  width:  "Width (m)",
  overallL: "Overall Length (m)",
  overallW: "Overall Width (m)",
  notchL:   "Notch Length (m)",
  notchW:   "Notch Width (m)",
  sqm:      "Area (m²)",
};

function calcSqm(seg: QuickSegment): number {
  const d = seg.dims;
  switch (seg.type) {
    case "rectangle":     return (d.length || 0) * (d.width || 0);
    case "l-shaped":      return Math.max(0, (d.overallL || 0) * (d.overallW || 0) - (d.notchL || 0) * (d.notchW || 0));
    case "running-meter": return d.length || 0;
    case "manual-sqm":    return d.sqm || 0;
    default:              return 0;
  }
}

function calcUnit(type: ShapeType) {
  return type === "running-meter" ? "lm" : "sqm";
}

function ShapePreview({ seg }: { seg: QuickSegment }) {
  const c = COLORS[seg.colorIdx % COLORS.length];
  if (seg.type === "rectangle") {
    return (
      <svg width="100%" height="64" viewBox="0 0 200 64" preserveAspectRatio="xMidYMid meet">
        <rect x="20" y="8" width="160" height="48" rx="3" fill={c.light} stroke={c.border} strokeWidth="1.5" />
        <text x="100" y="38" textAnchor="middle" fontSize="11" fill={c.text} fontFamily="Poppins,sans-serif" fontWeight="500">
          {(seg.dims.length||0).toFixed(1)} m × {(seg.dims.width||0).toFixed(1)} m
        </text>
      </svg>
    );
  }
  if (seg.type === "l-shaped") {
    const oL = seg.dims.overallL || 4; const oW = seg.dims.overallW || 3;
    const nL = Math.min(seg.dims.notchL || 2, oL - 0.5); const nW = Math.min(seg.dims.notchW || 1.5, oW - 0.5);
    const scale = 40; const ox = 20; const oy = 8;
    const fw = oL * scale; const fh = oW * scale;
    const maxSide = Math.max(fw, fh, 1); const sf = 160 / maxSide;
    const w = fw * sf; const h = fh * sf; const nx = nL * scale * sf; const ny = nW * scale * sf;
    return (
      <svg width="100%" height="64" viewBox="0 0 200 64" preserveAspectRatio="xMidYMid meet">
        <polygon
          points={`${ox},${oy} ${ox+w},${oy} ${ox+w},${oy+h-ny} ${ox+w-nx},${oy+h-ny} ${ox+w-nx},${oy+h} ${ox},${oy+h}`}
          fill={c.light} stroke={c.border} strokeWidth="1.5"
        />
      </svg>
    );
  }
  if (seg.type === "running-meter") {
    return (
      <svg width="100%" height="40" viewBox="0 0 200 40">
        <line x1="10" y1="20" x2="190" y2="20" stroke={c.border} strokeWidth="2" strokeDasharray="6,3" />
        <polyline points="178,12 190,20 178,28" stroke={c.border} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <text x="100" y="14" textAnchor="middle" fontSize="10" fill={c.text} fontFamily="Poppins,sans-serif">
          {(seg.dims.length||0).toFixed(1)} m
        </text>
      </svg>
    );
  }
  return (
    <div className="flex h-10 items-center justify-center rounded text-sm font-bold" style={{ color: c.text, background: c.light }}>
      {(seg.dims.sqm||0).toFixed(2)} m²
    </div>
  );
}

function SegmentCard({
  seg, onDelete, onRename, onDimChange,
}: {
  seg: QuickSegment;
  onDelete: () => void;
  onRename: (name: string) => void;
  onDimChange: (key: string, val: number) => void;
}) {
  const c = COLORS[seg.colorIdx % COLORS.length];
  const sqm = calcSqm(seg);
  const unit = calcUnit(seg.type);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(seg.name);
  const nameRef = useRef<HTMLInputElement>(null);

  const commitName = () => { onRename(draft.trim() || seg.name); setEditing(false); };

  return (
    <div
      data-testid={`quick-card-${seg.id}`}
      className="relative flex flex-col gap-3 rounded-2xl border-2 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden"
      style={{ borderColor: c.border }}
    >
      {/* Color accent top bar */}
      <div className="h-1.5 w-full" style={{ background: c.border }} />

      <div className="flex flex-col gap-3 px-4 pb-4">
        {/* Header: name + type badge + delete */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                ref={nameRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={e => { if (e.key === "Enter") commitName(); if (e.key === "Escape") { setDraft(seg.name); setEditing(false); } }}
                className="w-full rounded-lg border px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2"
                style={{ borderColor: c.border, color: c.text }}
                autoFocus
              />
            ) : (
              <button
                onClick={() => { setDraft(seg.name); setEditing(true); setTimeout(() => nameRef.current?.select(), 10); }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold transition-colors hover:opacity-80"
                style={{ color: c.text, background: c.bg }}
                title="Click to rename"
              >
                <PenLine className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{seg.name}</span>
              </button>
            )}
            <p className="mt-1 px-2 text-[10px] uppercase tracking-wider text-gray-400">
              {SHAPE_BUTTONS.find(s => s.type === seg.type)?.label}
            </p>
          </div>
          <button
            data-testid={`delete-card-${seg.id}`}
            onClick={onDelete}
            className="flex-shrink-0 rounded-full p-1 text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shape preview */}
        <div className="rounded-xl overflow-hidden" style={{ background: c.bg }}>
          <ShapePreview seg={seg} />
        </div>

        {/* Dimension inputs */}
        <div className="flex flex-col gap-2">
          {Object.keys(SHAPE_DEFAULTS[seg.type]).map(key => (
            <div key={key} className="flex items-center justify-between gap-2">
              <label className="text-xs text-gray-500 flex-1">{DIM_LABELS[key] || key}</label>
              <div className="flex items-center gap-1">
                <input
                  data-testid={`dim-${seg.id}-${key}`}
                  type="number"
                  min={0}
                  step={0.1}
                  value={seg.dims[key] || ""}
                  onChange={e => onDimChange(key, parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 rounded-lg border px-2 py-1.5 text-right text-xs font-medium focus:outline-none focus:ring-2 transition"
                  style={{ borderColor: "#e5e7eb", outlineColor: c.border }}
                  onFocus={e => e.target.style.borderColor = c.border}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
                <span className="text-[10px] text-gray-400 w-6">{key === "sqm" ? "m²" : "m"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Result */}
        <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: c.bg }}>
          <span className="text-xs font-semibold text-gray-600">Calculated Area</span>
          <span className="text-base font-extrabold" style={{ color: c.text }}>
            {sqm > 0 ? sqm.toFixed(2) : "—"} <span className="text-xs font-normal">{unit}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

let _nextId = 1;
const COUNTER: Record<ShapeType, number> = { "rectangle": 0, "l-shaped": 0, "running-meter": 0, "manual-sqm": 0 };
const SHORT: Record<ShapeType, string> = {
  "rectangle": "Room",
  "l-shaped": "L-Area",
  "running-meter": "Meter",
  "manual-sqm": "Area",
};

export function QuickMeasurementTab({ onConfirm }: { onConfirm: () => void }) {
  const [segments, setSegments] = useState<QuickSegment[]>([]);
  const [colorCounter, setColorCounter] = useState(0);

  const addSegment = (type: ShapeType) => {
    COUNTER[type]++;
    const id = _nextId++;
    const name = `${SHORT[type]} ${COUNTER[type]}`;
    const colorIdx = colorCounter % COLORS.length;
    setColorCounter(c => c + 1);
    setSegments(prev => [...prev, {
      id, name, type, colorIdx,
      dims: { ...SHAPE_DEFAULTS[type] },
    }]);
  };

  const deleteSegment = (id: number) =>
    setSegments(prev => prev.filter(s => s.id !== id));

  const renameSegment = (id: number, name: string) =>
    setSegments(prev => prev.map(s => s.id === id ? { ...s, name } : s));

  const updateDim = (id: number, key: string, val: number) =>
    setSegments(prev => prev.map(s => s.id === id ? { ...s, dims: { ...s.dims, [key]: val } } : s));

  const totalSqm = segments.reduce((sum, s) => sum + calcSqm(s), 0);
  const maxSqm = Math.max(...segments.map(calcSqm), 1);
  const validCount = segments.filter(s => calcSqm(s) > 0).length;
  const canConfirm = validCount > 0;

  return (
    <div className="flex h-full gap-5 overflow-hidden">
      {/* ── Left: add buttons + cards ── */}
      <div className="flex flex-1 flex-col gap-5 min-w-0 overflow-hidden">
        {/* Add buttons */}
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          {SHAPE_BUTTONS.map(({ type, label, sub, Icon }) => (
            <button
              key={type}
              data-testid={`add-shape-${type}`}
              onClick={() => addSegment(type)}
              className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-[#E07B39] hover:bg-[#fff7f0] hover:text-[#E07B39] hover:shadow-md active:scale-95"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-[#ffe8d6]">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col items-start">
                <span className="leading-tight">{label}</span>
                <span className="text-[10px] font-normal text-gray-400">{sub}</span>
              </div>
              <Icon />
            </button>
          ))}
        </div>

        {/* Cards area */}
        <div className="flex-1 overflow-y-auto">
          {segments.length === 0 ? (
            /* Empty state */
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-16">
              <div className="flex gap-3 opacity-30">
                <Square className="h-8 w-8 text-gray-400" />
                <Ruler className="h-8 w-8 text-gray-400" />
                <Hash className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-400">No segments yet</p>
                <p className="mt-1 text-xs text-gray-300">Click any shape button above to add your first measurement</p>
              </div>
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", alignItems: "start" }}
            >
              {segments.map(seg => (
                <SegmentCard
                  key={seg.id}
                  seg={seg}
                  onDelete={() => deleteSegment(seg.id)}
                  onRename={name => renameSegment(seg.id, name)}
                  onDimChange={(key, val) => updateDim(seg.id, key, val)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: compilation panel ── */}
      <div className="flex w-72 flex-shrink-0 flex-col gap-4 overflow-hidden">
        <div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Panel header */}
          <div className="flex-shrink-0 border-b border-gray-100 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Segment Compilation</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-gray-900">{totalSqm.toFixed(2)}</span>
              <span className="text-sm text-gray-400">total sqm</span>
            </div>
          </div>

          {/* Bars */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {segments.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-gray-300">
                Segments will appear here
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {segments.map(seg => {
                  const c = COLORS[seg.colorIdx % COLORS.length];
                  const sqm = calcSqm(seg);
                  const unit = calcUnit(seg.type);
                  const pct = maxSqm > 0 ? (sqm / maxSqm) * 100 : 0;
                  return (
                    <div key={seg.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: c.bar }} />
                          <span className="truncate font-medium text-gray-700">{seg.name}</span>
                        </div>
                        <span className="flex-shrink-0 font-bold" style={{ color: c.text }}>
                          {sqm > 0 ? `${sqm.toFixed(2)} ${unit}` : "—"}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: c.bar }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Totals + counts */}
          <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Segments</span>
              <span className="font-semibold text-gray-800">{segments.length}</span>
            </div>
            <div className="mt-1 flex justify-between text-gray-500">
              <span>Valid (sqm &gt; 0)</span>
              <span className="font-semibold text-green-600">{validCount}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="font-bold text-gray-700">Total Area</span>
              <span className="font-extrabold text-[#E07B39]">{totalSqm.toFixed(2)} sqm</span>
            </div>
          </div>
        </div>

        {/* Confirm button */}
        <button
          data-testid="confirm-segments-btn"
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
            canConfirm
              ? "bg-[#E07B39] text-white shadow-md hover:bg-[#c96b2f] hover:shadow-lg active:scale-95"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          Confirm Segments
          <ChevronRight className="h-4 w-4" />
        </button>

        {!canConfirm && segments.length > 0 && (
          <p className="text-center text-xs text-gray-400">
            Enter at least one measurement to proceed
          </p>
        )}
        {!canConfirm && segments.length === 0 && (
          <p className="text-center text-xs text-gray-400">
            Add at least one segment to proceed
          </p>
        )}
      </div>
    </div>
  );
}
