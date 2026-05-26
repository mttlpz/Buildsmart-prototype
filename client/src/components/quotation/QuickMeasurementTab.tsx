import { useState } from "react";
import { Check, X } from "lucide-react";

type ShapeType = "rectangle" | "l-shaped" | "running-meter" | "manual-sqm";

interface Segment {
  id: number;
  name: string;
  type: ShapeType;
  color: string;
  bgColor: string;
  borderColor: string;
  dimensions: Record<string, number>;
  grouped?: boolean;
}

const shapeTypes = [
  { id: "rectangle" as ShapeType, label: "Rectangle Area", sub: "Length x Width", icon: RectIcon },
  { id: "l-shaped" as ShapeType, label: "L-Shaped Area", sub: "4 dimensions", icon: LShapeIcon },
  { id: "running-meter" as ShapeType, label: "Running Meter", sub: "Length only", icon: RunningIcon },
  { id: "manual-sqm" as ShapeType, label: "Manual SQM", sub: "Enter area directly", icon: ManualIcon },
];

const initialSegments: Segment[] = [
  { id: 1, name: "Rectangle Segment 1", type: "rectangle", color: "text-green-700", bgColor: "bg-green-100", borderColor: "border-green-400", dimensions: { length: 12, width: 8 } },
  { id: 2, name: "L-Shaped Kitchen", type: "l-shaped", color: "text-yellow-700", bgColor: "bg-yellow-100", borderColor: "border-yellow-400", dimensions: { wall1: 12, wall2: 12, wall3: 12, wall4: 12, wall5: 12, wall6: 12 } },
  { id: 3, name: "Linear Cyclone Fence 1", type: "running-meter", color: "text-orange-700", bgColor: "bg-orange-100", borderColor: "border-orange-400", dimensions: { totalLength: 25 } },
  { id: 4, name: "Roof Deck", type: "rectangle", color: "text-blue-700", bgColor: "bg-blue-100", borderColor: "border-blue-400", dimensions: { length: 12, width: 8 } },
  { id: 5, name: "Linear Cyclone Fence 2", type: "running-meter", color: "text-orange-700", bgColor: "bg-orange-100", borderColor: "border-orange-400", dimensions: { totalLength: 25 } },
  { id: 6, name: "Linear Cyclone Fence 3", type: "running-meter", color: "text-orange-700", bgColor: "bg-orange-100", borderColor: "border-orange-400", dimensions: { totalLength: 25 } },
];

function getArea(seg: Segment): number {
  if (seg.type === "rectangle") return (seg.dimensions.length || 0) * (seg.dimensions.width || 0);
  if (seg.type === "l-shaped") {
    const w1 = seg.dimensions.wall1 || 0;
    const w2 = seg.dimensions.wall2 || 0;
    const w3 = seg.dimensions.wall3 || 0;
    const w4 = seg.dimensions.wall4 || 0;
    return w1 * w2 + w3 * w4;
  }
  if (seg.type === "running-meter") return seg.dimensions.totalLength || 0;
  return seg.dimensions.area || 0;
}

function getAreaUnit(seg: Segment): string {
  return seg.type === "running-meter" ? "m" : "sqm";
}

function getDimensionLabel(seg: Segment): string {
  if (seg.type === "rectangle") return `${seg.dimensions.length || 0} m x ${seg.dimensions.width || 0} m`;
  if (seg.type === "running-meter") return `${seg.dimensions.totalLength || 0} m`;
  return "-";
}

export function QuickMeasurementTab({ onConfirm }: { onConfirm: () => void }) {
  const [segments, setSegments] = useState<Segment[]>(initialSegments);
  const [selectedShape, setSelectedShape] = useState<ShapeType>("rectangle");
  const [groupName, setGroupName] = useState("");

  const updateDimension = (segId: number, key: string, value: number) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === segId ? { ...s, dimensions: { ...s.dimensions, [key]: value } } : s))
    );
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <p className="text-xs text-gray-500">
          Uploading Blueprint File is part 1 of a 7 part step. Enter your area measurements manually to generate a quotation without a blueprint file.
        </p>

        <div className="flex gap-2 flex-wrap">
          {shapeTypes.map((shape) => {
            const Icon = shape.icon;
            return (
              <button
                key={shape.id}
                data-testid={`shape-type-${shape.id}`}
                onClick={() => setSelectedShape(shape.id)}
                className={`flex items-center gap-2 rounded border px-3 py-2 text-xs transition-colors ${
                  selectedShape === shape.id
                    ? "border-[#E07B39] bg-orange-50 text-[#E07B39]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <Icon />
                <div className="text-left">
                  <div className="font-medium">{shape.label}</div>
                  <div className="text-[10px] text-gray-400">{shape.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {segments.map((seg) => (
            <SegmentCard key={seg.id} segment={seg} onUpdate={updateDimension} />
          ))}
        </div>

        <div className="flex justify-end">
          <button
            data-testid="confirm-segments-btn"
            onClick={onConfirm}
            className="flex items-center gap-2 rounded bg-gray-400 px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#E07B39] transition-colors"
          >
            Confirm Segments
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-56 flex-shrink-0">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <span className="text-base">⊞</span> Detected Segments
          </h3>
          <div className="flex flex-col gap-2">
            {segments.map((seg) => (
              <button
                key={seg.id}
                data-testid={`detected-segment-${seg.id}`}
                className={`rounded px-2 py-1.5 text-left text-xs font-medium ${seg.bgColor} ${seg.color}`}
              >
                <div>{seg.name}</div>
                <div className="text-[10px] font-normal opacity-75">
                  {getArea(seg).toLocaleString()} {getAreaUnit(seg)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <span className="text-base">⊞</span> Group Segments
          </h3>
          <input
            data-testid="group-name-input"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name..."
            className="mb-2 w-full rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-[#E07B39]"
          />
          <div className="flex flex-col gap-1">
            {segments.map((seg) => (
              <div key={seg.id} className={`flex items-center justify-between rounded px-2 py-1 text-xs ${seg.bgColor} ${seg.color}`}>
                <span>{seg.name}</span>
                {seg.grouped && <Check className="h-3 w-3" />}
              </div>
            ))}
          </div>
          <button
            data-testid="group-segments-btn"
            className="mt-2 w-full rounded border border-gray-300 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1"
          >
            <span>⊞</span> Group Segments
          </button>
        </div>
      </div>
    </div>
  );
}

function SegmentCard({ segment, onUpdate }: { segment: Segment; onUpdate: (id: number, key: string, value: number) => void }) {
  const area = getArea(segment);
  const unit = getAreaUnit(segment);

  const dimEntries = Object.entries(segment.dimensions);

  return (
    <div className={`rounded-lg border-l-4 ${segment.borderColor} border border-gray-200 bg-white p-3 flex flex-col gap-2`} data-testid={`segment-card-${segment.id}`}>
      <div className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${segment.bgColor} ${segment.color}`}>
        {segment.name}
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-600">Enter Dimensions</p>
        <div className="flex flex-col gap-1.5">
          {dimEntries.map(([key, val]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-xs capitalize text-gray-500 w-24 flex-shrink-0">
                {key.replace(/([A-Z])/g, " $1").replace(/^wall(\d)/, "Wall $1")}
              </span>
              <div className="flex items-center gap-1">
                <input
                  data-testid={`dim-${segment.id}-${key}`}
                  type="number"
                  value={val}
                  onChange={(e) => onUpdate(segment.id, key, parseFloat(e.target.value) || 0)}
                  className="w-16 rounded border border-gray-200 px-2 py-1 text-right text-xs outline-none focus:border-[#E07B39]"
                />
                <span className="text-xs text-gray-400">m</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-600">Preview</p>
        <SegmentPreview segment={segment} />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-600">Segment Summary</p>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400">
              <th className="pb-1 text-left font-normal">#</th>
              <th className="pb-1 text-left font-normal">Segment</th>
              <th className="pb-1 text-left font-normal">Type</th>
              <th className="pb-1 text-left font-normal">Dimensions</th>
              <th className="pb-1 text-right font-normal">Area</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-0.5 text-gray-500">1</td>
              <td className="py-0.5 text-gray-700 truncate max-w-[60px]">{segment.name}</td>
              <td className="py-0.5 text-gray-500 capitalize">{segment.type.replace("-", " ").slice(0, 6)}.</td>
              <td className="py-0.5 text-gray-500">{getDimensionLabel(segment)}</td>
              <td className="py-0.5 text-right text-gray-700">{area} {unit}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-1.5 flex justify-between border-t border-gray-100 pt-1">
          <span className="text-[10px] font-semibold text-gray-700">Total Estimated Area</span>
          <span className="text-[10px] font-bold text-gray-800">{area.toLocaleString()} {unit}</span>
        </div>
      </div>
    </div>
  );
}

function SegmentPreview({ segment }: { segment: Segment }) {
  const w = 80, h = 50;
  const pad = 8;

  if (segment.type === "rectangle") {
    const rw = w - pad * 2;
    const rh = h - pad * 2;
    return (
      <svg width={w} height={h} className="overflow-visible">
        <rect x={pad} y={pad} width={rw} height={rh} fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1" />
        <line x1={pad} y1={pad / 2} x2={pad + rw} y2={pad / 2} stroke="#9ca3af" strokeWidth="0.5" markerEnd="url(#arr)" />
        <text x={pad + rw / 2} y={pad / 2 - 2} textAnchor="middle" fontSize="7" fill="#6b7280">length</text>
        <line x1={pad / 2} y1={pad} x2={pad / 2} y2={pad + rh} stroke="#9ca3af" strokeWidth="0.5" />
        <text x={pad / 2 - 2} y={pad + rh / 2} textAnchor="middle" fontSize="7" fill="#6b7280" transform={`rotate(-90, ${pad / 2 - 2}, ${pad + rh / 2})`}>width</text>
      </svg>
    );
  }

  if (segment.type === "l-shaped") {
    return (
      <svg width={w} height={h}>
        <polyline points={`${pad},${pad} ${pad + 40},${pad} ${pad + 40},${h / 2} ${pad + 70},${h / 2} ${pad + 70},${h - pad} ${pad},${h - pad} ${pad},${pad}`} fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1" />
      </svg>
    );
  }

  if (segment.type === "running-meter") {
    return (
      <svg width={w} height={h}>
        <line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4,2" />
        <text x={w / 2} y={h / 2 - 4} textAnchor="middle" fontSize="7" fill="#6b7280">Wall 4</text>
      </svg>
    );
  }

  return (
    <div className="flex h-12 items-center justify-center rounded bg-gray-50 text-xs text-gray-400">
      Manual entry
    </div>
  );
}

function RectIcon() {
  return (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <rect x="1" y="1" width="22" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function LShapeIcon() {
  return (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <polyline points="1,1 13,1 13,9 23,9 23,17 1,17 1,1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function RunningIcon() {
  return (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <line x1="1" y1="9" x2="23" y2="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,2" />
      <polyline points="19,5 23,9 19,13" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ManualIcon() {
  return (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <text x="4" y="13" fontSize="11" fill="currentColor" fontWeight="bold">m²</text>
    </svg>
  );
}
