import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  email: string | null;
  username: string;
  companyId: string | null;
  onboardingStep: number;
  companyName?: string;
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithUser: (user: AuthUser) => void;
  updateOnboardingStep: (step: number) => void;
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  loginWithUser: () => {},
  updateOnboardingStep: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => {
        setCurrentUser(user);
        setIsLoading(false);
      })
      .catch(() => {
        setCurrentUser(null);
        setIsLoading(false);
      });
  }, []);

  const login = async (username: string, password: string) => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!r.ok) {
      const err = await r.json();
      throw new Error(err.error || "Login failed");
    }
    const { user } = await r.json();
    setCurrentUser(user);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
  };

  const loginWithUser = (user: AuthUser) => {
    setCurrentUser(user);
  };

  const updateOnboardingStep = (step: number) => {
    setCurrentUser((u) => (u ? { ...u, onboardingStep: step } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        isLoading,
        login,
        logout,
        loginWithUser,
        updateOnboardingStep,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
