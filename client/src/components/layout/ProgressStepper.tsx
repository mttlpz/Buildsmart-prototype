import { ChevronRight } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

interface ProgressStepperProps {
  steps: Step[];
  activeStep: number;
}

export function ProgressStepper({ steps, activeStep }: ProgressStepperProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, index) => {
        const isActive = step.number === activeStep;
        const isCompleted = step.number < activeStep;
        return (
          <div key={step.number} className="flex items-center">
            <div
              data-testid={`step-${step.number}`}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                isActive
                  ? "rounded-full bg-[#E07B39] text-white"
                  : isCompleted
                  ? "text-[#E07B39]"
                  : "text-gray-400"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-white text-[#E07B39]"
                    : isCompleted
                    ? "border-2 border-[#E07B39] text-[#E07B39]"
                    : "border-2 border-gray-300 text-gray-400"
                }`}
              >
                {step.number}
              </span>
              <span className="whitespace-nowrap">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="mx-1 h-4 w-4 flex-shrink-0 text-gray-400" />
            )}
          </div>
        );
      })}
    </div>
  );
}
