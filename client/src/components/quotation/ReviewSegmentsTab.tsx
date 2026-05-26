import { useState, useEffect, useRef } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Layers, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface Segment {
  id: number;
  name: string;
  color: string;
  bg: string;
  area: string;
  floor: "main" | "lower";
  confirmed: boolean;
}

const detectedSegments: Segment[] = [
  { id: 1, name: "Living Room", color: "#d4a843", bg: "#fef3c7", area: "18×15 ft", floor: "main", confirmed: false },
  { id: 2, name: "Dining Room", color: "#84cc16", bg: "#ecfccb", area: "14×12 ft", floor: "main", confirmed: false },
  { id: 3, name: "Kitchen", color: "#f97316", bg: "#ffedd5", area: "12×10 ft", floor: "main", confirmed: false },
  { id: 4, name: "Bed 1 (Unit A)", color: "#93c5fd", bg: "#dbeafe", area: "14×14 ft", floor: "main", confirmed: false },
  { id: 5, name: "Bed 1 (Unit B)", color: "#93c5fd", bg: "#dbeafe", area: "14×14 ft", floor: "main", confirmed: false },
  { id: 6, name: "Garage", color: "#9ca3af", bg: "#f3f4f6", area: "22×20 ft", floor: "main", confirmed: false },
  { id: 7, name: "Deck", color: "#fbbf24", bg: "#fffbeb", area: "20×8 ft", floor: "main", confirmed: false },
  { id: 8, name: "Family Room", color: "#2dd4bf", bg: "#ccfbf1", area: "16×16 ft", floor: "lower", confirmed: false },
  { id: 9, name: "Game Area (A)", color: "#34d399", bg: "#d1fae5", area: "16×18 ft", floor: "lower", confirmed: false },
  { id: 10, name: "Game Area (B)", color: "#34d399", bg: "#d1fae5", area: "16×18 ft", floor: "lower", confirmed: false },
  { id: 11, name: "Bed 2", color: "#6ee7b7", bg: "#d1fae5", area: "8×8 ft", floor: "lower", confirmed: false },
  { id: 12, name: "Bed 3", color: "#6ee7b7", bg: "#d1fae5", area: "8×8 ft", floor: "lower", confirmed: false },
  { id: 13, name: "Crawl Space", color: "#a3e635", bg: "#ecfccb", area: "10×12 ft", floor: "lower", confirmed: false },
];

const FLOORS = [
  { id: "main" as const, label: "Main Floor Plan", image: "/figmaAssets/blueprint-main-floor.png" },
  { id: "lower" as const, label: "Lower Floor Plan", image: "/figmaAssets/blueprint-lower-floor.png" },
];

const SCAN_DURATION = 4000;
const SCAN_DELAY_PER_SEGMENT = SCAN_DURATION / detectedSegments.length;

interface ReviewSegmentsTabProps {
  onConfirm: () => void;
  onBack: () => void;
}

export function ReviewSegmentsTab({ onConfirm, onBack }: ReviewSegmentsTabProps) {
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);
  const [scanY, setScanY] = useState(0);
  const [visibleSegments, setVisibleSegments] = useState<number[]>([]);
  const [segments, setSegments] = useState(detectedSegments);
  const [activeFloor, setActiveFloor] = useState<"main" | "lower">("main");
  const [zoom, setZoom] = useState(1);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!scanning) return;

    const animate = (ts: number) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const pct = Math.min(elapsed / SCAN_DURATION, 1);
      setProgress(Math.round(pct * 100));
      setScanY(pct * 100);

      const count = Math.floor(pct * detectedSegments.length);
      setVisibleSegments(detectedSegments.slice(0, count).map((s) => s.id));

      if (pct < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setScanning(false);
        setVisibleSegments(detectedSegments.map((s) => s.id));
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [scanning]);

  const handleRescan = () => {
    startTimeRef.current = null;
    setProgress(0);
    setScanY(0);
    setVisibleSegments([]);
    setScanning(true);
  };

  const toggleConfirm = (id: number) => {
    setSegments((prev) => prev.map((s) => s.id === id ? { ...s, confirmed: !s.confirmed } : s));
  };

  const currentFloorSegments = segments.filter((s) => s.floor === activeFloor && visibleSegments.includes(s.id));
  const totalConfirmed = segments.filter((s) => s.confirmed).length;
  const allDone = !scanning && totalConfirmed === segments.length;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Review Segments</h2>
          <p className="text-xs text-gray-500">
            AI is detecting rooms and areas from your uploaded blueprint. Review and confirm each segment before proceeding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>
          <button
            data-testid="confirm-all-btn"
            onClick={onConfirm}
            disabled={scanning}
            className={`flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-semibold text-white transition-colors ${
              scanning ? "cursor-not-allowed bg-gray-300" : "bg-[#E07B39] hover:bg-[#c96b2f]"
            }`}
          >
            Confirm Segments <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
              {FLOORS.map((floor) => (
                <button
                  key={floor.id}
                  data-testid={`floor-tab-${floor.id}`}
                  onClick={() => setActiveFloor(floor.id)}
                  className={`px-4 py-2 text-xs font-semibold transition-colors ${
                    activeFloor === floor.id
                      ? "bg-[#E07B39] text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {floor.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                data-testid="zoom-out-btn"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="w-12 text-center text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
              <button
                data-testid="zoom-in-btn"
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                data-testid="rescan-btn"
                onClick={handleRescan}
                className="flex items-center gap-1 rounded border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Rescan
              </button>
            </div>
          </div>

          <div className="relative flex-1 min-h-[320px] overflow-hidden rounded-xl border border-gray-200 bg-gray-900 shadow-inner">
            <div
              className="absolute inset-0 overflow-auto flex items-center justify-center"
              style={{ padding: "12px" }}
            >
              <div
                className="relative"
                style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.2s ease" }}
              >
                <img
                  src={FLOORS.find((f) => f.id === activeFloor)?.image}
                  alt={activeFloor === "main" ? "Main Floor Plan" : "Lower Floor Plan"}
                  className="block w-full max-w-2xl rounded-lg shadow-lg"
                  data-testid="blueprint-image"
                />

                {scanning && (
                  <>
                    <div
                      className="pointer-events-none absolute left-0 right-0"
                      style={{ top: `${scanY}%`, height: "3px", background: "linear-gradient(90deg, transparent, #E07B39, #fbbf24, #E07B39, transparent)", boxShadow: "0 0 16px 4px rgba(251,191,36,0.7)", transition: "top 0.05s linear" }}
                    />
                    <div
                      className="pointer-events-none absolute left-0 right-0"
                      style={{ top: `${scanY}%`, height: "60px", background: "linear-gradient(to bottom, rgba(251,191,36,0.12), transparent)", transform: "translateY(-100%)" }}
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-lg" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.0) ${scanY}%, rgba(0,0,0,0.35) ${scanY}%)` }} />
                  </>
                )}

                {!scanning && currentFloorSegments.map((seg) => (
                  <div
                    key={seg.id}
                    style={{ borderColor: seg.color, backgroundColor: seg.bg + "55" }}
                    className="absolute inset-0 rounded-lg border-2 border-dashed opacity-0 animate-fade-in pointer-events-none"
                  />
                ))}
              </div>
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-3 rounded-lg bg-black/70 px-4 py-2.5 backdrop-blur-sm">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between">
                    <span className="text-xs font-medium text-white">
                      {scanning ? "Scanning blueprint…" : "Scan complete"}
                    </span>
                    <span className="text-xs font-bold text-[#fbbf24]">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full rounded-full transition-all duration-100"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg, #E07B39, #fbbf24)" }}
                    />
                  </div>
                </div>
                {!scanning && (
                  <div className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-2.5 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-xs font-medium text-green-400">{visibleSegments.length} segments found</span>
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

        <div className="flex w-60 flex-shrink-0 flex-col gap-3">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                  <Layers className="h-4 w-4 text-[#E07B39]" />
                  Detected Segments
                </h3>
                <span className="rounded-full bg-[#E07B39]/10 px-2 py-0.5 text-xs font-bold text-[#E07B39]">
                  {visibleSegments.length}/{detectedSegments.length}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#E07B39] transition-all duration-200"
                  style={{ width: `${(visibleSegments.length / detectedSegments.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex border-b border-gray-100">
              {FLOORS.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => setActiveFloor(floor.id)}
                  className={`flex-1 py-1.5 text-[10px] font-semibold transition-colors ${
                    activeFloor === floor.id ? "text-[#E07B39] border-b-2 border-[#E07B39]" : "text-gray-400"
                  }`}
                >
                  {floor.id === "main" ? "Main Floor" : "Lower Floor"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-2 max-h-[400px]">
              {scanning && visibleSegments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#E07B39]" />
                  <p className="text-xs text-gray-400">Scanning…</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {segments
                    .filter((s) => s.floor === activeFloor && visibleSegments.includes(s.id))
                    .map((seg) => (
                      <div
                        key={seg.id}
                        data-testid={`segment-item-${seg.id}`}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-all"
                        style={{ backgroundColor: seg.bg }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: seg.color }}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium" style={{ color: seg.color }}>
                              {seg.name}
                            </p>
                            <p className="text-[10px] text-gray-400">{seg.area}</p>
                          </div>
                        </div>
                        <button
                          data-testid={`confirm-segment-${seg.id}`}
                          onClick={() => toggleConfirm(seg.id)}
                          className={`ml-1 flex-shrink-0 rounded-full p-0.5 transition-all ${
                            seg.confirmed
                              ? "bg-green-500 text-white"
                              : "border border-gray-300 text-gray-300 hover:border-green-400 hover:text-green-400"
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  {segments.filter((s) => s.floor === activeFloor && visibleSegments.includes(s.id)).length === 0 && (
                    <p className="py-4 text-center text-xs text-gray-400">No segments on this floor yet</p>
                  )}
                </div>
              )}
            </div>

            {!scanning && (
              <div className="border-t border-gray-100 px-3 py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Confirmed</span>
                  <span className="font-bold text-green-600">{totalConfirmed} / {segments.length}</span>
                </div>
                <button
                  data-testid="confirm-all-segments-btn"
                  onClick={() => setSegments((prev) => prev.map((s) => ({ ...s, confirmed: true })))}
                  className="mt-1.5 w-full rounded border border-green-300 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                >
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
                  <p className="text-[10px] text-gray-500">Total Segments</p>
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
                  <p className="text-lg font-bold text-yellow-600">{segments.length - totalConfirmed}</p>
                  <p className="text-[10px] text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
