import { useState } from "react";
import { ChevronDown, Upload, Layers } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProgressStepper } from "@/components/layout/ProgressStepper";
import { UploadBlueprintTab } from "@/components/quotation/UploadBlueprintTab";
import { QuickMeasurementTab } from "@/components/quotation/QuickMeasurementTab";
import { ReviewSegmentsTab } from "@/components/quotation/ReviewSegmentsTab";

type ActiveTab = "upload" | "quick";

const uploadSteps = [
  { number: 1, label: "Upload Blueprint" },
  { number: 2, label: "Review Segments" },
  { number: 3, label: "Assign Scope" },
  { number: 4, label: "Generate Quotation" },
  { number: 5, label: "Review & Finalize" },
];

const quickSteps = [
  { number: 1, label: "Quick Measurement & Assign Scope" },
  { number: 2, label: "Generate Quotation" },
  { number: 3, label: "Review & Finalize" },
];

export function QuotationGeneration() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("upload");
  const [activeStep, setActiveStep] = useState(1);

  const steps = activeTab === "upload" ? uploadSteps : quickSteps;

  const isReviewing = activeTab === "upload" && activeStep === 2;

  const handleBeginSegmentation = () => setActiveStep(2);
  const handleConfirmSegments = () => setActiveStep(3);
  const handleBackToUpload = () => setActiveStep(1);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-['Poppins',Helvetica,sans-serif]">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
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

        {isReviewing ? (
          <div className="flex flex-1 overflow-hidden">
            <main className="flex flex-1 flex-col overflow-y-auto p-5">
              <ReviewSegmentsTab
                onConfirm={handleConfirmSegments}
                onBack={handleBackToUpload}
              />
            </main>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <main className="flex flex-1 flex-col overflow-y-auto">
              <div className="border-b border-gray-200 bg-white">
                <div className="flex">
                  <button
                    data-testid="tab-upload-blueprint"
                    onClick={() => { setActiveTab("upload"); setActiveStep(1); }}
                    className={`relative px-8 py-4 text-sm font-semibold transition-colors ${
                      activeTab === "upload"
                        ? "text-[#E07B39]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Upload Blueprint
                    {activeTab === "upload" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07B39]" />
                    )}
                  </button>
                  <button
                    data-testid="tab-quick-measurement"
                    onClick={() => { setActiveTab("quick"); setActiveStep(1); }}
                    className={`relative px-8 py-4 text-sm font-semibold transition-colors ${
                      activeTab === "quick"
                        ? "text-[#E07B39]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Quick Measurement
                    {activeTab === "quick" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07B39]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1 p-5">
                {activeTab === "upload" ? (
                  <UploadBlueprintTab onBeginSegmentation={handleBeginSegmentation} />
                ) : (
                  <QuickMeasurementTab onConfirm={handleConfirmSegments} />
                )}
              </div>
            </main>

            <aside className="w-52 flex-shrink-0 border-l border-gray-200 bg-white p-3">
              {activeTab === "upload" ? (
                <div>
                  <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <Upload className="h-4 w-4" />
                    Upload Session
                  </h3>
                  <div className="rounded border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                    No uploads yet
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <Layers className="h-4 w-4" />
                    Group Segments
                  </h3>
                  <div className="rounded border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                    No groups yet
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
