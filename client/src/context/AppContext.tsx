import { createContext, useContext, useState, useEffect } from "react";

export type OnboardingStep = 0 | 1 | 2;
// 0 = new account — must complete pricelist first
// 1 = pricelist done — must complete company rules
// 2 = fully setup — all features unlocked

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

const STORAGE_KEY = "buildsmart_onboarding_step";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const n = saved ? parseInt(saved, 10) : 0;
      return (n >= 0 && n <= 2 ? n : 0) as OnboardingStep;
    } catch { return 0; }
  });

  const advanceOnboarding = (step: OnboardingStep) => {
    setOnboardingStep(step);
    try { localStorage.setItem(STORAGE_KEY, String(step)); } catch {}
  };

  return (
    <AppContext.Provider value={{ onboardingStep, advanceOnboarding, isSetupComplete: onboardingStep >= 2 }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
