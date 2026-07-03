import { useState } from "react";
import { useLocation } from "wouter";
import { BuildSmartCube, ALL_CELLS } from "@/components/BuildSmartCube";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, HardHat } from "lucide-react";

const GRADIENT_KEYFRAMES = `
@keyframes bsGradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

export function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ fontFamily: "'Poppins', Helvetica, sans-serif" }}
    >
      <style>{GRADIENT_KEYFRAMES}</style>

      {/* Left panel — animated gradient + cube */}
      <div
        className="hidden lg:flex w-[42%] flex-col items-center justify-center gap-10 relative"
        style={{
          background: "linear-gradient(-135deg, #6B1200, #E07B39, #9A2800, #E07B39, #6B1200)",
          backgroundSize: "400% 400%",
          animation: "bsGradientShift 12s ease-in-out infinite",
        }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 70%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="relative flex flex-col items-center gap-6">
          <BuildSmartCube filledCells={ALL_CELLS} size={1.5} />
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">BuildSmart</h1>
            <p className="mt-1 text-sm text-white/70 font-medium">Construction Estimating Platform</p>
          </div>
        </div>
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-white/50 text-xs font-medium">
          <span>Smart Estimation</span>
          <span>·</span>
          <span>Market Intelligence</span>
          <span>·</span>
          <span>Supplier Insights</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E07B39]">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">BuildSmart</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500">Sign in to your BuildSmart account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" data-testid="login-error">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#E07B39] focus:bg-white focus:ring-2 focus:ring-[#E07B39]/20"
                data-testid="input-email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
                <button
                  type="button"
                  className="text-xs text-[#E07B39] hover:underline font-medium"
                  data-testid="link-forgot-password"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-11 text-sm outline-none transition focus:border-[#E07B39] focus:bg-white focus:ring-2 focus:ring-[#E07B39]/20"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  data-testid="button-toggle-password"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-gray-300 accent-[#E07B39]"
                data-testid="checkbox-remember"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 select-none cursor-pointer">
                Remember me for 7 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#E07B39] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#C96A2C] disabled:opacity-60"
              data-testid="button-submit"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : null}
              {loading ? "Signing in…" : "Log In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-semibold text-[#E07B39] hover:underline"
              data-testid="link-signup"
            >
              Create one →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
