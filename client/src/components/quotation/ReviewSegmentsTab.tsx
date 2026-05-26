import { useState, useEffect, useRef } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Layers, ZoomIn, ZoomOut, RotateCcw, Ruler, Brain } from "lucide-react";

interface Region {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Segment {
  id: number;
  name: string;
  color: string;
  bg: string;
  sqm: number;
  confidence: number;
  floor: "main" | "lower";
  confirmed: boolean;
  region: Region;
}

const detectedSegments: Segment[] = [
  { id: 1,  name: "Living Room (A)",   color: "#d4a843", bg: "#fef3c7", sqm: 25.1,  confidence: 96, floor: "main",  confirmed: false, region: { top: 22, left: 18, width: 15, height: 28 } },
  { id: 2,  name: "Dining Room (A)",   color: "#84cc16", bg: "#ecfccb", sqm: 15.6,  confidence: 93, floor: "main",  confirmed: false, region: { top: 50, left: 17, width: 15, height: 22 } },
  { id: 3,  name: "Kitchen (A)",       color: "#f97316", bg: "#ffedd5", sqm: 11.1,  confidence: 89, floor: "main",  confirmed: false, region: { top: 42, left: 34, width: 10, height: 18 } },
  { id: 4,  name: "Bed 1 (Unit A)",    color: "#60a5fa", bg: "#dbeafe", sqm: 18.2,  confidence: 97, floor: "main",  confirmed: false, region: { top: 17, left: 31, width: 17, height: 22 } },
  { id: 5,  name: "Bed 1 (Unit B)",    color: "#818cf8", bg: "#e0e7ff", sqm: 18.2,  confidence: 94, floor: "main",  confirmed: false, region: { top: 17, left: 51, width: 14, height: 22 } },
  { id: 6,  name: "Living Room (B)",   color: "#f59e0b", bg: "#fef3c7", sqm: 25.1,  confidence: 95, floor: "main",  confirmed: false, region: { top: 22, left: 63, width: 14, height: 26 } },
  { id: 7,  name: "Dining Room (B)",   color: "#65a30d", bg: "#ecfccb", sqm: 15.6,  confidence: 91, floor: "main",  confirmed: false, region: { top: 48, left: 63, width: 14, height: 20 } },
  { id: 8,  name: "Kitchen (B)",       color: "#ea580c", bg: "#ffedd5", sqm: 11.1,  confidence: 88, floor: "main",  confirmed: false, region: { top: 42, left: 52, width: 10, height: 16 } },
  { id: 9,  name: "Garage",            color: "#9ca3af", bg: "#f3f4f6", sqm: 40.9,  confidence: 91, floor: "main",  confirmed: false, region: { top: 55, left: 36, width: 18, height: 22 } },
  { id: 10, name: "Deck",              color: "#fbbf24", bg: "#fffbeb", sqm: 14.9,  confidence: 85, floor: "main",  confirmed: false, region: { top:  5, left: 27, width: 40, height: 11 } },
  { id: 11, name: "Family Room (A)",   color: "#2dd4bf", bg: "#ccfbf1", sqm: 23.8,  confidence: 95, floor: "lower", confirmed: false, region: { top: 22, left: 16, width: 16, height: 27 } },
  { id: 12, name: "Game Area (A)",     color: "#34d399", bg: "#d1fae5", sqm: 26.8,  confidence: 88, floor: "lower", confirmed: false, region: { top: 42, left: 14, width: 18, height: 24 } },
  { id: 13, name: "Game Area (B)",     color: "#10b981", bg: "#d1fae5", sqm: 26.8,  confidence: 87, floor: "lower", confirmed: false, region: { top: 40, left: 56, width: 15, height: 24 } },
  { id: 14, name: "Bed 2 (Unit A)",    color: "#5eead4", bg: "#ccfbf1", sqm:  5.9,  confidence: 92, floor: "lower", confirmed: false, region: { top: 12, left: 27, width: 12, height: 18 } },
  { id: 15, name: "Bed 3 (Unit A)",    color: "#38bdf8", bg: "#e0f2fe", sqm:  5.9,  confidence: 90, floor: "lower", confirmed: false, region: { top: 12, left: 39, width: 12, height: 18 } },
  { id: 16, name: "Bed 2 (Unit B)",    color: "#7dd3fc", bg: "#e0f2fe", sqm:  5.9,  confidence: 89, floor: "lower", confirmed: false, region: { top: 12, left: 53, width: 12, height: 18 } },
  { id: 17, name: "Crawl Space",       color: "#a3e635", bg: "#ecfccb", sqm: 11.1,  confidence: 82, floor: "lower", confirmed: false, region: { top: 52, left: 36, width: 20, height: 22 } },
];

const FLOORS = [
  { id: "main"  as const, label: "Main Floor Plan",  image: "/figmaAssets/blueprint-main-floor.png"  },
  { id: "lower" as const, label: "Lower Floor Plan", image: "/figmaAssets/blueprint-lower-floor.png" },
];

const SCAN_DURATION = 4000;

interface TooltipState {
  x: number;
  y: number;
  segId: number;
}

interface ReviewSegmentsTabProps {
  onConfirm: () => void;
  onBack: () => void;
}

function confidenceColor(c: number) {
  if (c >= 90) return "text-green-500";
  if (c >= 80) return "text-yellow-500";
  return "text-red-400";
}
function confidenceBg(c: number) {
  if (c >= 90) return "bg-green-500";
  if (c >= 80) return "bg-yellow-400";
  return "bg-red-400";
}
function confidenceLabel(c: number) {
  if (c >= 93) return "High";
  if (c >= 85) return "Medium";
  return "Low";
}

export function ReviewSegmentsTab({ onConfirm, onBack }: ReviewSegmentsTabProps) {
  const [scanning, setScanning]           = useState(true);
  const [progress, setProgress]           = useState(0);
  const [scanY, setScanY]                 = useState(0);
  const [visibleIds, setVisibleIds]       = useState<number[]>([]);
  const [segments, setSegments]           = useState(detectedSegments);
  const [activeFloor, setActiveFloor]     = useState<"main" | "lower">("main");
  const [zoom, setZoom]                   = useState(1);
  const [hoveredId, setHoveredId]         = useState<number | null>(null);
  const [tooltip, setTooltip]             = useState<TooltipState | null>(null);

  const animRef      = useRef<number | null>(null);
  const startRef     = useRef<number | null>(null);
  const panelRef     = useRef<HTMLDivElement>(null);
  const itemRefs     = useRef<Record<number, HTMLDivElement | null>>({});
  const imgWrapRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scanning) return;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const pct = Math.min((ts - startRef.current) / SCAN_DURATION, 1);
      setProgress(Math.round(pct * 100));
      setScanY(pct * 100);
      const count = Math.floor(pct * detectedSegments.length);
      setVisibleIds(detectedSegments.slice(0, count).map((s) => s.id));
      if (pct < 1) { animRef.current = requestAnimationFrame(animate); }
      else { setScanning(false); setVisibleIds(detectedSegments.map((s) => s.id)); }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [scanning]);

  useEffect(() => {
    if (!hoveredId) return;
    const el = itemRefs.current[hoveredId];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [hoveredId]);

  const handleRescan = () => {
    startRef.current = null;
    setProgress(0); setScanY(0);
    setVisibleIds([]); setScanning(true);
    setHoveredId(null); setTooltip(null);
  };

  const toggleConfirm = (id: number) =>
    setSegments((prev) => prev.map((s) => s.id === id ? { ...s, confirmed: !s.confirmed } : s));

  const floorSegsVisible = segments.filter((s) => s.floor === activeFloor && visibleIds.includes(s.id));
  const totalConfirmed   = segments.filter((s) => s.confirmed).length;

  const handleOverlayMove = (e: React.MouseEvent, segId: number) => {
    const rect = imgWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltip({ x, y, segId });
    setHoveredId(segId);
  };

  const handleOverlayLeave = () => {
    setTooltip(null);
    setHoveredId(null);
  };

  const hoveredSeg = tooltip ? segments.find((s) => s.id === tooltip.segId) : null;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Review Segments</h2>
          <p className="text-xs text-gray-500">
            AI is detecting rooms and areas from your uploaded blueprint. Hover over a segment to inspect it, then confirm before proceeding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button data-testid="back-btn" onClick={onBack}
            className="flex items-center gap-1.5 rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>
          <button data-testid="confirm-all-btn" onClick={onConfirm} disabled={scanning}
            className={`flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-semibold text-white transition-colors ${scanning ? "cursor-not-allowed bg-gray-300" : "bg-[#E07B39] hover:bg-[#c96b2f]"}`}>
            Confirm Segments <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Blueprint Viewer */}
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
              {FLOORS.map((floor) => (
                <button key={floor.id} data-testid={`floor-tab-${floor.id}`}
                  onClick={() => { setActiveFloor(floor.id); setHoveredId(null); setTooltip(null); }}
                  className={`px-4 py-2 text-xs font-semibold transition-colors ${activeFloor === floor.id ? "bg-[#E07B39] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                  {floor.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button data-testid="zoom-out-btn" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="w-12 text-center text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
              <button data-testid="zoom-in-btn" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button data-testid="rescan-btn" onClick={handleRescan}
                className="flex items-center gap-1 rounded border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">
                <RotateCcw className="h-3.5 w-3.5" /> Rescan
              </button>
            </div>
          </div>

          {/* Blueprint canvas */}
          <div className="relative flex-1 min-h-[320px] overflow-hidden rounded-xl border border-gray-200 bg-gray-900 shadow-inner">
            <div ref={imgWrapRef} className="absolute inset-0 overflow-auto flex items-center justify-center" style={{ padding: "12px" }}>
              <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.2s ease" }}>
                <img
                  src={FLOORS.find((f) => f.id === activeFloor)?.image}
                  alt={activeFloor === "main" ? "Main Floor Plan" : "Lower Floor Plan"}
                  className="block w-full max-w-2xl rounded-lg shadow-lg select-none"
                  data-testid="blueprint-image"
                  draggable={false}
                />

                {/* Scan beam */}
                {scanning && (
                  <>
                    <div className="pointer-events-none absolute left-0 right-0"
                      style={{ top: `${scanY}%`, height: "3px", background: "linear-gradient(90deg,transparent,#E07B39,#fbbf24,#E07B39,transparent)", boxShadow: "0 0 16px 4px rgba(251,191,36,0.7)", transition: "top 0.05s linear" }} />
                    <div className="pointer-events-none absolute left-0 right-0"
                      style={{ top: `${scanY}%`, height: "60px", background: "linear-gradient(to bottom,rgba(251,191,36,0.12),transparent)", transform: "translateY(-100%)" }} />
                    <div className="pointer-events-none absolute inset-0 rounded-lg"
                      style={{ background: `linear-gradient(to bottom,rgba(0,0,0,0) ${scanY}%,rgba(0,0,0,0.35) ${scanY}%)` }} />
                  </>
                )}

                {/* Segment overlays — shown after scan */}
                {!scanning && floorSegsVisible.map((seg) => {
                  const isHovered = hoveredId === seg.id;
                  return (
                    <div
                      key={seg.id}
                      data-testid={`overlay-${seg.id}`}
                      onMouseMove={(e) => handleOverlayMove(e, seg.id)}
                      onMouseLeave={handleOverlayLeave}
                      style={{
                        position: "absolute",
                        top:    `${seg.region.top}%`,
                        left:   `${seg.region.left}%`,
                        width:  `${seg.region.width}%`,
                        height: `${seg.region.height}%`,
                        backgroundColor: isHovered ? seg.color + "55" : seg.color + "22",
                        borderColor: seg.color,
                        borderWidth: isHovered ? "2.5px" : "1.5px",
                        borderStyle: "solid",
                        borderRadius: "4px",
                        cursor: "crosshair",
                        transition: "background-color 0.15s ease, border-width 0.1s ease, box-shadow 0.15s ease",
                        boxShadow: isHovered ? `0 0 0 3px ${seg.color}55, inset 0 0 12px ${seg.color}33` : "none",
                        zIndex: isHovered ? 20 : 10,
                      }}
                    >
                      {/* Label chip visible on hover */}
                      {isHovered && (
                        <span
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold shadow"
                          style={{ backgroundColor: seg.color, color: "#fff", pointerEvents: "none" }}
                        >
                          {seg.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating tooltip — positioned relative to the imgWrap container */}
            {tooltip && hoveredSeg && (
              <div
                className="pointer-events-none absolute z-50"
                style={{
                  left: tooltip.x + 16,
                  top:  tooltip.y - 10,
                  maxWidth: "210px",
                }}
              >
                <div className="rounded-xl shadow-2xl overflow-hidden border border-white/10" style={{ backgroundColor: "#1e1e2e" }}>
                  {/* Color header */}
                  <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: hoveredSeg.color }}>
                    <span className="h-2 w-2 rounded-full bg-white/70" />
                    <span className="text-xs font-bold text-white truncate">{hoveredSeg.name}</span>
                  </div>
                  <div className="px-3 py-2.5 flex flex-col gap-2">
                    {/* SQM */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Ruler className="h-3 w-3 flex-shrink-0" />
                        <span className="text-[10px] uppercase tracking-wide">Total Area</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {hoveredSeg.sqm.toFixed(1)} <span className="text-[10px] font-normal text-gray-400">sqm</span>
                      </span>
                    </div>
                    {/* Confidence */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Brain className="h-3 w-3 flex-shrink-0" />
                          <span className="text-[10px] uppercase tracking-wide">Confidence</span>
                        </div>
                        <span className={`text-xs font-bold ${confidenceColor(hoveredSeg.confidence)}`}>
                          {hoveredSeg.confidence}% — {confidenceLabel(hoveredSeg.confidence)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${confidenceBg(hoveredSeg.confidence)}`}
                          style={{ width: `${hoveredSeg.confidence}%` }}
                        />
                      </div>
                    </div>
                    {/* Floor tag */}
                    <div className="flex justify-end">
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-gray-400 uppercase tracking-wide">
                        {hoveredSeg.floor === "main" ? "Main Floor" : "Lower Floor"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress bar overlay */}
            <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
              <div className="flex items-center gap-3 rounded-lg bg-black/70 px-4 py-2.5 backdrop-blur-sm">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between">
                    <span className="text-xs font-medium text-white">{scanning ? "Scanning blueprint…" : "Scan complete — hover a region to inspect"}</span>
                    <span className="text-xs font-bold text-[#fbbf24]">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                    <div className="h-full rounded-full transition-all duration-100"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg,#E07B39,#fbbf24)" }} />
                  </div>
                </div>
                {!scanning && (
                  <div className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-2.5 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-xs font-medium text-green-400">{visibleIds.length} found</span>
                  </div>
                )}
              </div>
            </div>

            {scanning && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-[#E07B39]/90 px-3 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 animate-ping rounded-full bg-white" />
                <span className="text-xs font-semibold text-white">Scanning</span>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex w-60 flex-shrink-0 flex-col gap-3">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                  <Layers className="h-4 w-4 text-[#E07B39]" />
                  Detected Segments
                </h3>
                <span className="rounded-full bg-[#E07B39]/10 px-2 py-0.5 text-xs font-bold text-[#E07B39]">
                  {visibleIds.length}/{detectedSegments.length}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#E07B39] transition-all duration-200"
                  style={{ width: `${(visibleIds.length / detectedSegments.length) * 100}%` }} />
              </div>
            </div>

            {/* Floor tabs */}
            <div className="flex border-b border-gray-100">
              {FLOORS.map((floor) => (
                <button key={floor.id} onClick={() => { setActiveFloor(floor.id); setHoveredId(null); setTooltip(null); }}
                  className={`flex-1 py-1.5 text-[10px] font-semibold transition-colors ${activeFloor === floor.id ? "text-[#E07B39] border-b-2 border-[#E07B39]" : "text-gray-400"}`}>
                  {floor.id === "main" ? "Main Floor" : "Lower Floor"}
                </button>
              ))}
            </div>

            {/* Segment list */}
            <div ref={panelRef} className="flex-1 overflow-y-auto p-2 max-h-[380px] scroll-smooth">
              {scanning && visibleIds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#E07B39]" />
                  <p className="text-xs text-gray-400">Scanning…</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {segments.filter((s) => s.floor === activeFloor && visibleIds.includes(s.id)).map((seg) => {
                    const isHighlighted = hoveredId === seg.id;
                    return (
                      <div
                        key={seg.id}
                        ref={(el) => { itemRefs.current[seg.id] = el; }}
                        data-testid={`segment-item-${seg.id}`}
                        onMouseEnter={() => setHoveredId(seg.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="rounded-lg px-2 py-1.5 transition-all duration-150 cursor-default"
                        style={{
                          backgroundColor: isHighlighted ? seg.color + "33" : seg.bg,
                          outline: isHighlighted ? `2px solid ${seg.color}` : "2px solid transparent",
                          outlineOffset: "-1px",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold" style={{ color: seg.color }}>{seg.name}</p>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-500">{seg.sqm.toFixed(1)} sqm</span>
                                <span className={`text-[10px] font-medium ${confidenceColor(seg.confidence)}`}>
                                  · {seg.confidence}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            data-testid={`confirm-segment-${seg.id}`}
                            onClick={() => toggleConfirm(seg.id)}
                            className={`ml-1 flex-shrink-0 rounded-full p-0.5 transition-all ${seg.confirmed ? "bg-green-500 text-white" : "border border-gray-300 text-gray-300 hover:border-green-400 hover:text-green-400"}`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {/* Confidence mini-bar */}
                        {isHighlighted && (
                          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-black/10">
                            <div className={`h-full rounded-full ${confidenceBg(seg.confidence)}`}
                              style={{ width: `${seg.confidence}%`, transition: "width 0.3s ease" }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {segments.filter((s) => s.floor === activeFloor && visibleIds.includes(s.id)).length === 0 && (
                    <p className="py-4 text-center text-xs text-gray-400">No segments on this floor yet</p>
                  )}
                </div>
              )}
            </div>

            {!scanning && (
              <div className="border-t border-gray-100 px-3 py-2">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Confirmed</span>
                  <span className="font-bold text-green-600">{totalConfirmed} / {segments.length}</span>
                </div>
                <button data-testid="confirm-all-segments-btn"
                  onClick={() => setSegments((prev) => prev.map((s) => ({ ...s, confirmed: true })))}
                  className="w-full rounded border border-green-300 py-1 text-xs font-medium text-green-600 hover:bg-green-50">
                  Confirm All
                </button>
              </div>
            )}
          </div>

          {!scanning && (
            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <h4 className="mb-2 text-xs font-semibold text-gray-600">Scan Summary</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-orange-50 p-2 text-center">
                  <p className="text-lg font-bold text-[#E07B39]">{detectedSegments.length}</p>
                  <p className="text-[10px] text-gray-500">Segments</p>
                </div>
                <div className="rounded-lg bg-green-50 p-2 text-center">
                  <p className="text-lg font-bold text-green-600">{totalConfirmed}</p>
                  <p className="text-[10px] text-gray-500">Confirmed</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-2 text-center">
                  <p className="text-lg font-bold text-blue-600">2</p>
                  <p className="text-[10px] text-gray-500">Floor Plans</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-2 text-center">
                  <p className="text-lg font-bold text-yellow-600">
                    {Math.round(segments.reduce((a, s) => a + s.confidence, 0) / segments.length)}%
                  </p>
                  <p className="text-[10px] text-gray-500">Avg. Confidence</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
