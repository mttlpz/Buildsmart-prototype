import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

export type OnboardingStep = 0 | 1 | 2;

interface AppContextValue {
  onboardingStep: OnboardingStep;
  advanceOnboarding: (step: OnboardingStep) => void;
  isSetupComplete: boolean;
}

const AppContext = createContext<AppContextValue>({
  onboardingStep: 0,
  advanceOnboarding: () => {},
  isSetupComplete: false,
});

const LS_KEY = "buildsmart_onboarding_step";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, updateOnboardingStep } = useAuth();

  const [localStep, setLocalStep] = useState<OnboardingStep>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      const n = saved ? parseInt(saved, 10) : 0;
      return (n >= 0 && n <= 2 ? n : 0) as OnboardingStep;
    } catch {
      return 0;
    }
  });

  const onboardingStep: OnboardingStep = currentUser
    ? (Math.min(currentUser.onboardingStep, 2) as OnboardingStep)
    : localStep;

  const advanceOnboarding = (step: OnboardingStep) => {
    if (currentUser) {
      fetch("/api/users/onboarding-step", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step }),
      })
        .then((r) => {
          if (r.ok) updateOnboardingStep(step);
        })
        .catch(() => {});
    } else {
      setLocalStep(step);
      try {
        localStorage.setItem(LS_KEY, String(step));
      } catch {}
    }
  };

  return (
    <AppContext.Provider
      value={{
        onboardingStep,
        advanceOnboarding,
        isSetupComplete: onboardingStep >= 2,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
