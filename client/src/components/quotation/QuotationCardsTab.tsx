import { useState } from "react";
import { Clock, CheckCircle2, Star, Shield, Zap, ChevronRight, HelpCircle, ArrowRight, Award, TrendingDown, PenLine } from "lucide-react";
import { QuotationBreakdownModal } from "./QuotationBreakdownModal";
import { RevisionTypeModal } from "./RevisionTypeModal";
import { MinorRevisionPanel } from "./MinorRevisionPanel";

export type QuoteType = "practical" | "premium";

interface QuotationCardsTabProps {
  onNext: () => void;
  onBack: () => void;
  onStructuralRevision: () => void;
}

const PRACTICAL = {
  type: "practical" as QuoteType,
  label: "Practical",
  tagline: "Cost-effective solution with quality materials",
  badge: "Recommended",
  accentColor: "#E07B39",
  accentBg: "bg-[#fff7f0]",
  accentBorder: "border-[#E07B39]",
  headerBg: "bg-[#E07B39]",
  price: 2_537_920,
  priceBreakdown: { materials: 1_240_400, labor: 940_800, equipment: 235_200, misc: 121_520 },
  timeline: "8 – 10 weeks",
  warranty: "1-year workmanship",
  materialGrade: "Standard Grade",
  team: "Mixed crew (in-house + sub)",
  highlights: [
    "Standard waterproofing membrane",
    "Budget-optimized material sourcing",
    "Phased payment terms available",
    "Includes site inspection & prep",
    "Mobilization within 5–7 days",
  ],
  flags: ["Cost-efficient", "Flexible scheduling", "Standard warranty"],
};

const PREMIUM = {
  type: "premium" as QuoteType,
  label: "Premium",
  tagline: "High-spec materials with expedited delivery",
  badge: "Best Quality",
  accentColor: "#4f46e5",
  accentBg: "bg-[#f0f4ff]",
  accentBorder: "border-indigo-300",
  headerBg: "bg-indigo-600",
  price: 3_799_600,
  priceBreakdown: { materials: 1_915_200, labor: 1_282_400, equipment: 420_000, misc: 182_000 },
  timeline: "6 – 7 weeks",
  warranty: "3-year comprehensive",
  materialGrade: "Premium / Imported Grade",
  team: "Specialist crew (certified)",
  highlights: [
    "Premium imported waterproofing system",
    "Certified specialist installation team",
    "Priority material procurement",
    "Extended 3-year warranty coverage",
    "Mobilization within 2–3 days",
  ],
  flags: ["Highest quality", "Faster completion", "Extended warranty"],
};

function fmt(n: number) {
  return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

function PriceBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-500">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-24 text-right font-medium text-gray-700">{fmt(value)}</span>
    </div>
  );
}

function QuoteCard({
  quote,
  onViewBreakdown,
}: {
  quote: typeof PRACTICAL;
  onViewBreakdown: () => void;
}) {
  const maxVal = 2_000_000;
  return (
    <div className={`flex flex-col rounded-2xl border-2 ${quote.accentBorder} bg-white shadow-lg overflow-hidden transition-shadow hover:shadow-xl`}
      data-testid={`quote-card-${quote.type}`}>
      {/* Header */}
      <div className={`${quote.headerBg} px-6 py-5 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
              {quote.type === "practical" ? "Option A" : "Option B"}
            </span>
            <h2 className="text-2xl font-bold leading-tight">{quote.label}</h2>
            <p className="mt-0.5 text-sm opacity-80">{quote.tagline}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur">{quote.badge}</span>
            {quote.type === "premium" && <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />}
            {quote.type === "practical" && <TrendingDown className="h-5 w-5 text-white/80" />}
          </div>
        </div>
        <div className="mt-4 border-t border-white/20 pt-4">
          <p className="text-xs uppercase tracking-widest opacity-70">Total Estimate</p>
          <p className="text-3xl font-extrabold">{fmt(quote.price)}</p>
          <p className="mt-0.5 text-xs opacity-70">≈ ₱{Math.round(quote.price / 302).toLocaleString("en-PH")} / sqm</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 p-6">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Clock,  label: "Timeline",      val: quote.timeline },
            { icon: Shield, label: "Warranty",       val: quote.warranty },
            { icon: Award,  label: "Material Grade", val: quote.materialGrade },
            { icon: Zap,    label: "Team",           val: quote.team },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className={`rounded-xl ${quote.accentBg} p-3`}>
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" style={{ color: quote.accentColor }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</span>
              </div>
              <p className="mt-0.5 text-xs font-semibold text-gray-800">{val}</p>
            </div>
          ))}
        </div>

        {/* Price breakdown bars */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Cost Breakdown</p>
          <div className="flex flex-col gap-1.5">
            <PriceBar label="Materials"  value={quote.priceBreakdown.materials}  max={maxVal} color={quote.accentColor} />
            <PriceBar label="Labor"      value={quote.priceBreakdown.labor}      max={maxVal} color={quote.accentColor} />
            <PriceBar label="Equipment"  value={quote.priceBreakdown.equipment}  max={maxVal} color={quote.accentColor} />
            <PriceBar label="Misc"       value={quote.priceBreakdown.misc}       max={maxVal} color={quote.accentColor} />
          </div>
        </div>

        {/* Highlights */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">What's Included</p>
          <ul className="flex flex-col gap-1.5">
            {quote.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-xs text-gray-700">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: quote.accentColor }} />
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-1.5">
          {quote.flags.map((f) => (
            <span key={f} className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${quote.accentBg}`} style={{ color: quote.accentColor }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
        <button
          data-testid={`btn-view-breakdown-${quote.type}`}
          onClick={onViewBreakdown}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: quote.accentColor }}
        >
          View Detailed Breakdown <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function QuotationCardsTab({ onNext, onBack, onStructuralRevision }: QuotationCardsTabProps) {
  const [breakdownOpen, setBreakdownOpen]   = useState(false);
  const [breakdownQuote, setBreakdownQuote] = useState<QuoteType>("practical");
  const [openCompare, setOpenCompare]       = useState(false);
  const [showRevision, setShowRevision]     = useState(false);
  const [minorOpen, setMinorOpen]           = useState(false);

  const openBreakdown = (q: QuoteType, compare = false) => {
    setBreakdownQuote(q);
    setOpenCompare(compare);
    setBreakdownOpen(true);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Generated Quotations</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Based on <span className="font-semibold text-gray-700">17 segments · 302 sqm · 2 floors</span> — choose the plan that fits your budget.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="btn-validate-edit"
            onClick={() => setShowRevision(true)}
            className="flex items-center gap-2 rounded-lg border border-[#E07B39] bg-[#fff7f0] px-4 py-2 text-sm font-semibold text-[#E07B39] hover:bg-[#ffe9d6]"
          >
            <PenLine className="h-4 w-4" /> Validate & Edit
          </button>
          <button
            data-testid="btn-back-assign-scope"
            onClick={onBack}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Project summary strip */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        {[
          { label: "Total Area", value: "302.0 sqm" },
          { label: "Segments",   value: "17" },
          { label: "Floors",     value: "2" },
          { label: "Work Type",  value: "Waterproofing" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
            <p className="mt-0.5 text-sm font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="flex flex-1 gap-5 overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-1">
          <QuoteCard quote={PRACTICAL} onViewBreakdown={() => openBreakdown("practical")} />
        </div>
        <div className="flex-1 overflow-y-auto pl-1">
          <QuoteCard quote={PREMIUM}   onViewBreakdown={() => openBreakdown("premium")} />
        </div>
      </div>

      {/* Help choosing */}
      <div className="mt-4 flex items-center justify-center gap-3 border-t border-gray-100 pt-4">
        <HelpCircle className="h-4 w-4 text-gray-400" />
        <p className="text-sm text-gray-500">Not sure which plan suits you best?</p>
        <button
          data-testid="btn-need-help-choosing"
          onClick={() => openBreakdown("practical", true)}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
        >
          Need help choosing? <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Breakdown modal */}
      {breakdownOpen && (
        <QuotationBreakdownModal
          quoteType={breakdownQuote}
          defaultTab={openCompare ? "comparison" : "segments"}
          onClose={() => { setBreakdownOpen(false); setOpenCompare(false); }}
        />
      )}

      {/* Revision type modal */}
      {showRevision && (
        <RevisionTypeModal
          onClose={() => setShowRevision(false)}
          onStructural={() => { setShowRevision(false); onStructuralRevision(); }}
          onMinor={() => { setShowRevision(false); setMinorOpen(true); }}
        />
      )}

      {/* Minor revision panel */}
      {minorOpen && (
        <MinorRevisionPanel
          onClose={() => setMinorOpen(false)}
          onApply={() => setMinorOpen(false)}
        />
      )}
    </div>
  );
}
