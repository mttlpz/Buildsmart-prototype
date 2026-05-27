import { useState } from "react";
import { ChevronDown, Upload } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProgressStepper } from "@/components/layout/ProgressStepper";
import { UploadBlueprintTab } from "@/components/quotation/UploadBlueprintTab";
import { QuickMeasurementTab } from "@/components/quotation/QuickMeasurementTab";
import { ReviewSegmentsTab } from "@/components/quotation/ReviewSegmentsTab";
import { AssignScopeTab } from "@/components/quotation/AssignScopeTab";
import { GeneratingQuotationScreen } from "@/components/quotation/GeneratingQuotationScreen";
import { QuotationCardsTab } from "@/components/quotation/QuotationCardsTab";

type ActiveTab = "upload" | "quick";

const uploadSteps = [
  { number: 1, label: "Upload Blueprint" },
  { number: 2, label: "Review Segments" },
  { number: 3, label: "Assign Scope" },
  { number: 4, label: "Generate Quotation" },
  { number: 5, label: "Review & Finalize" },
];

const quickSteps = [
  { number: 1, label: "Quick Measurement" },
  { number: 2, label: "Assign Scope" },
  { number: 3, label: "Generate Quotation" },
  { number: 4, label: "Review & Finalize" },
];

export function QuotationGeneration() {
  const [activeTab, setActiveTab]           = useState<ActiveTab>("upload");
  const [activeStep, setActiveStep]         = useState(1);
  const [quotationReady, setQuotationReady] = useState(false);

  const steps = activeTab === "upload" ? uploadSteps : quickSteps;

  // ── Upload path ──────────────────────────────────────────
  const isUploadReview   = activeTab === "upload" && activeStep === 2;
  const isUploadScope    = activeTab === "upload" && activeStep === 3;
  const isUploadGen      = activeTab === "upload" && activeStep === 4 && !quotationReady;
  const isUploadResults  = activeTab === "upload" && activeStep === 4 && quotationReady;

  // ── Quick path ───────────────────────────────────────────
  const isQuickScope     = activeTab === "quick"  && activeStep === 2;
  const isQuickGen       = activeTab === "quick"  && activeStep === 3 && !quotationReady;
  const isQuickResults   = activeTab === "quick"  && activeStep === 3 && quotationReady;

  // fullscreen hides the main tab-picker shell
  const isFullscreen = isUploadReview || isUploadScope || isUploadGen || isUploadResults
                     || isQuickScope  || isQuickGen    || isQuickResults;

  const handleGenerateQuotation = () => {
    setQuotationReady(false);
    setActiveStep(activeTab === "upload" ? 4 : 3);
  };

  const handleStructuralRevision = () => {
    setQuotationReady(false);
    if (activeTab === "upload") {
      // Go back to Review Segments in reclassify mode
      setActiveStep(2);
    } else {
      // Go back to Quick Measurement (step 1)
      setActiveStep(1);
    }
  };

  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setActiveStep(1);
    setQuotationReady(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-['Poppins',Helvetica,sans-serif]">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Global header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 shadow-sm">
          <div className="flex items-center gap-3 min-w-0 overflow-x-auto">
            <ProgressStepper steps={steps} activeStep={activeStep} />
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 ml-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E07B39] text-sm font-bold text-white">
              JC
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-gray-800 leading-tight">John Contractor</p>
              <p className="text-[10px] text-gray-500 leading-tight">JC Waterproofing Inc.</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </header>

        {/* ═══ UPLOAD: Step 2 — Review Segments ═══ */}
        {isUploadReview && (
          <div className="flex flex-1 overflow-hidden">
            <main className="flex flex-1 flex-col overflow-hidden p-5">
              <ReviewSegmentsTab
                onConfirm={() => setActiveStep(3)}
                onBack={() => setActiveStep(1)}
              />
            </main>
          </div>
        )}

        {/* ═══ UPLOAD: Step 3 / QUICK: Step 2 — Assign Scope ═══ */}
        {(isUploadScope || isQuickScope) && (
          <div className="flex flex-1 overflow-hidden">
            <main className="flex flex-1 flex-col overflow-hidden p-5">
              <AssignScopeTab
                onNext={handleGenerateQuotation}
                onBack={() => setActiveStep(activeTab === "upload" ? 2 : 1)}
              />
            </main>
          </div>
        )}

        {/* ═══ UPLOAD: Step 4a / QUICK: Step 3a — Generating (loading) ═══ */}
        {(isUploadGen || isQuickGen) && (
          <div className="flex flex-1 overflow-hidden p-5">
            <div className="flex-1">
              <GeneratingQuotationScreen onComplete={() => setQuotationReady(true)} />
            </div>
          </div>
        )}

        {/* ═══ UPLOAD: Step 4b / QUICK: Step 3b — Quotation Results ═══ */}
        {(isUploadResults || isQuickResults) && (
          <div className="flex flex-1 overflow-hidden p-5">
            <div className="flex flex-1 flex-col overflow-hidden">
              <QuotationCardsTab
                onNext={() => setActiveStep(activeTab === "upload" ? 5 : 4)}
                onBack={() => {
                  setQuotationReady(false);
                  setActiveStep(activeTab === "upload" ? 3 : 2);
                }}
                onStructuralRevision={handleStructuralRevision}
              />
            </div>
          </div>
        )}

        {/* ═══ Step 1 — Tab picker + content (Upload or Quick) ═══ */}
        {!isFullscreen && (
          <div className="flex flex-1 overflow-hidden">
            <main className="flex flex-1 flex-col overflow-hidden">
              {/* Tab switcher */}
              <div className="border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex">
                  <button
                    data-testid="tab-upload-blueprint"
                    onClick={() => switchTab("upload")}
                    className={`relative px-8 py-4 text-sm font-semibold transition-colors ${
                      activeTab === "upload" ? "text-[#E07B39]" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Upload Blueprint
                    {activeTab === "upload" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07B39]" />}
                  </button>
                  <button
                    data-testid="tab-quick-measurement"
                    onClick={() => switchTab("quick")}
                    className={`relative px-8 py-4 text-sm font-semibold transition-colors ${
                      activeTab === "quick" ? "text-[#E07B39]" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Quick Measurement
                    {activeTab === "quick" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07B39]" />}
                  </button>
                </div>
              </div>

              {/* Upload Blueprint tab */}
              {activeTab === "upload" && (
                <div className="flex flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-5">
                    <UploadBlueprintTab onBeginSegmentation={() => setActiveStep(2)} />
                  </div>
                  <aside className="w-52 flex-shrink-0 border-l border-gray-200 bg-white p-3">
                    <div>
                      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                        <Upload className="h-4 w-4" /> Upload Session
                      </h3>
                      <div className="rounded border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                        No uploads yet
                      </div>
                    </div>
                  </aside>
                </div>
              )}

              {/* Quick Measurement tab — full width, right panel built-in */}
              {activeTab === "quick" && (
                <div className="flex flex-1 overflow-hidden p-5">
                  <QuickMeasurementTab onConfirm={() => setActiveStep(2)} />
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
