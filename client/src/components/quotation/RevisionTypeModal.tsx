import { X, Layers, Settings2, ArrowRight, AlertTriangle, Edit3 } from "lucide-react";

interface Props {
  onClose: () => void;
  onStructural: () => void;
  onMinor: () => void;
}

export function RevisionTypeModal({ onClose, onStructural, onMinor }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Validate & Edit Quotation</h2>
            <p className="mt-0.5 text-sm text-gray-500">Choose the type of revision you need to make</p>
          </div>
          <button
            data-testid="btn-close-revision-modal"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-5 p-6">
          {/* Structural / Major */}
          <button
            data-testid="btn-revision-structural"
            onClick={onStructural}
            className="group flex flex-col rounded-2xl border-2 border-red-100 bg-red-50 p-6 text-left transition-all hover:border-red-300 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 group-hover:bg-red-200">
                <Layers className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">Structural</p>
                <p className="text-base font-bold text-gray-900">Major Revision</p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-100/60 p-3 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <p>This restarts the estimation process from the segment review stage.</p>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Use when the scope of work has fundamentally changed — rooms added/removed, floor plan corrections, or significant area reclassifications.
            </p>

            <ul className="mt-4 flex flex-col gap-1.5 text-xs text-gray-500">
              {[
                "Re-confirm or remove segments",
                "Update floor classifications",
                "Re-assign scope to segments",
                "Full quotation re-generation",
              ].map((s) => (
                <li key={s} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  {s}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-red-600 group-hover:gap-2.5 transition-all">
              Begin Structural Review <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Minor */}
          <button
            data-testid="btn-revision-minor"
            onClick={onMinor}
            className="group flex flex-col rounded-2xl border-2 border-[#E07B39]/20 bg-[#fff7f0] p-6 text-left transition-all hover:border-[#E07B39]/50 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E07B39]/15 group-hover:bg-[#E07B39]/25">
                <Edit3 className="h-5 w-5 text-[#E07B39]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#E07B39]">Minor</p>
                <p className="text-base font-bold text-gray-900">Minor Revision</p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#E07B39]/10 p-3 text-xs text-[#b85c20]">
              <Settings2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <p>Fine-tune line items without restarting the full process.</p>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Use when the scope is correct but you want to swap suppliers, update material grades, adjust labor rates, timeline, or choose a different price reference.
            </p>

            <ul className="mt-4 flex flex-col gap-1.5 text-xs text-gray-500">
              {[
                "Change supplier per material",
                "Edit labor & equipment rates",
                "Toggle Internal vs DPWH prices",
                "Adjust timeline per segment",
                "Resolve supplier quantity conflicts",
              ].map((s) => (
                <li key={s} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E07B39]" />
                  {s}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-[#E07B39] group-hover:gap-2.5 transition-all">
              Open Minor Revision <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 text-center text-xs text-gray-400">
          You can always return to this quotation after revisions are saved.
        </div>
      </div>
    </div>
  );
}
