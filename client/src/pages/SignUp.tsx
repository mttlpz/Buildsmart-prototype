import { useState, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { BuildSmartCube } from "@/components/BuildSmartCube";
import { useAuth } from "@/context/AuthContext";
import { ChevronRight, Eye, EyeOff, Upload, X, Check, HardHat } from "lucide-react";
import type { AuthUser } from "@/context/AuthContext";

const GRADIENT_KEYFRAMES = `
@keyframes bsGradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

const REGIONS = ["Metro Manila", "North Luzon", "South Luzon", "Visayas", "Mindanao"];
const SECTORS = ["Residential", "Commercial", "Industrial", "Institutional", "Infrastructure"];
const ROLES = ["Main Contractor", "Subcontractor", "Developer", "Consultant", "Supplier", "Owner-Builder"];
const SPECIALIZATIONS = ["Waterproofing", "Tile Works", "Painting", "Structural", "MEP", "Civil Works", "Roofing", "Facade"];

type Step = 1 | 2 | 3;

interface FormData {
  logoFile: File | null;
  logoDataUrl: string;
  companyName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  email: string;
  password: string;
  confirmPassword: string;
  serviceRegions: string[];
  projectSectors: string[];
  companyRole: string;
  specializations: string[];
}

const INIT: FormData = {
  logoFile: null, logoDataUrl: "", companyName: "", phone: "", address: "", city: "", province: "",
  email: "", password: "", confirmPassword: "",
  serviceRegions: [], projectSectors: [], companyRole: "", specializations: [],
};

function computeFilledCells(d: FormData): string[] {
  const cells: string[] = [];
  if (d.logoFile || d.logoDataUrl) cells.push("A1", "A2", "B1", "B2");
  if (d.companyName.trim()) cells.push("A3", "A4", "B3");
  if (d.phone.replace(/\D/g, "").length >= 7) cells.push("A5", "A6", "B4");
  if (d.address.trim()) cells.push("B5", "B6", "C1", "C2");
  if (d.city.trim()) cells.push("C3", "C4");
  if (d.province.trim()) cells.push("C5", "C6");
  if (d.email.includes("@") && d.email.includes(".")) cells.push("D1", "D2", "D3");
  if (d.password.length >= 6) cells.push("D4", "D5");
  if (d.password.length >= 6 && d.password === d.confirmPassword) cells.push("D6", "E1");
  const regionCells = ["E2", "E3", "E4", "E5", "E6"];
  d.serviceRegions.forEach((_, i) => { if (regionCells[i]) cells.push(regionCells[i]); });
  if (d.projectSectors.length > 0) cells.push("F1");
  if (d.projectSectors.length > 1) cells.push("F2");
  if (d.projectSectors.length > 2) cells.push("F3");
  if (d.companyRole) cells.push("F4", "F5");
  if (d.specializations.length > 0) cells.push("F6");
  if (d.specializations.length > 1) cells.push("G1");
  if (d.specializations.length > 2) cells.push("G2");
  const allDefined = ["A1","A2","A3","A4","A5","A6","B1","B2","B3","B4","B5","B6","C1","C2","C3","C4","C5","C6",
    "D1","D2","D3","D4","D5","D6","E1","E2","E3","E4","E5","E6","F1","F2","F3","F4","F5","F6","G1","G2"];
  if (allDefined.every(c => cells.includes(c))) {
    ["G3","G4","G5","G6","H1","H2","H3","H4","H5","H6"].forEach(c => cells.push(c));
  }
  return [...new Set(cells)];
}

function PillSelect({ options, selected, onChange, max }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; max?: number }) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else if (!max || selected.length < max) {
      onChange([...selected, opt]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${active ? "bg-[#E07B39] border-[#E07B39] text-white" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-[#E07B39] hover:text-[#E07B39]"}`}
            data-testid={`pill-${opt.toLowerCase().replace(/\s+/g, "-")}`}>
            {active && <Check className="h-3 w-3" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ProgressBar({ step }: { step: Step }) {
  const steps = [{ n: 1, label: "Company Info" }, { n: 2, label: "Account Setup" }, { n: 3, label: "Service Profile" }];
  return (
    <div className="flex items-center gap-2">
      {steps.map(({ n, label }, i) => (
        <div key={n} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${n < step ? "bg-[#E07B39] text-white" : n === step ? "bg-[#E07B39] text-white ring-4 ring-[#E07B39]/20" : "bg-gray-100 text-gray-400"}`}>
              {n < step ? <Check className="h-3.5 w-3.5" /> : n}
            </div>
            <span className={`text-[10px] font-semibold whitespace-nowrap ${n === step ? "text-[#E07B39]" : "text-gray-400"}`}>{label}</span>
          </div>
          {i < steps.length - 1 && <div className={`h-0.5 w-10 mb-3 rounded transition ${n < step ? "bg-[#E07B39]" : "bg-gray-100"}`} />}
        </div>
      ))}
    </div>
  );
}

export function SignUp() {
  const { loginWithUser } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INIT);
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filledCells = useMemo(() => computeFilledCells(form), [form]);

  const set = (field: keyof FormData, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  const handleLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => set("logoDataUrl", e.target?.result as string);
    reader.readAsDataURL(file);
    set("logoFile", file);
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.province.trim()) e.province = "Province / Region is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.email || !form.email.includes("@")) e.email = "Enter a valid email address";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!form.companyRole) e.companyRole = "Please select your company role";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setSubmitting(true);
    setApiError("");
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          company: {
            name: form.companyName,
            company_address: form.address,
            contact_number: form.phone,
            city: form.city,
            region: form.province,
            project_sector: form.projectSectors,
            company_role: form.companyRole,
            specialization: form.specializations,
            company_logo: form.logoDataUrl || undefined,
          },
        }),
      });
      if (!r.ok) {
        const err = await r.json();
        setApiError(err.error || "Registration failed. Please try again.");
        setSubmitting(false);
        return;
      }
      const { user } = await r.json();
      loginWithUser(user as AuthUser);
      navigate("/pricelist");
    } catch {
      setApiError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full rounded-xl border ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} px-4 py-2.5 text-sm outline-none transition focus:border-[#E07B39] focus:bg-white focus:ring-2 focus:ring-[#E07B39]/20`;

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Poppins', Helvetica, sans-serif" }}>
      <style>{GRADIENT_KEYFRAMES}</style>

      {/* Left panel — animated gradient + live cube */}
      <div className="hidden lg:flex w-[42%] flex-col items-center justify-center gap-10 relative"
        style={{ background: "linear-gradient(-135deg, #6B1200, #E07B39, #9A2800, #E07B39, #6B1200)", backgroundSize: "400% 400%", animation: "bsGradientShift 12s ease-in-out infinite" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 70%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative flex flex-col items-center gap-6">
          <BuildSmartCube filledCells={filledCells} size={1.5} />
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">BuildSmart</h1>
            <p className="mt-1 text-sm text-white/70 font-medium">{filledCells.length} / 48 setup cells filled</p>
          </div>
        </div>
        <div className="absolute bottom-8 flex gap-2">
          {([1, 2, 3] as Step[]).map(s => (
            <div key={s} className={`h-2 rounded-full transition-all ${step === s ? "w-6 bg-white" : "w-2 bg-white/30"}`} />
          ))}
        </div>
      </div>

      {/* Right panel — wizard form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E07B39]">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">BuildSmart</span>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Create your account</h2>
            <p className="mt-1 text-sm text-gray-500">Set up BuildSmart for your company in 3 steps</p>
          </div>

          <div className="mb-5"><ProgressBar step={step} /></div>

          {apiError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" data-testid="signup-error">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* ── Step 1: Company Info ── */}
            {step === 1 && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Company Logo (optional)</label>
                  {form.logoDataUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={form.logoDataUrl} alt="Logo" className="h-14 w-14 rounded-xl object-cover border border-gray-200" />
                      <button type="button" onClick={() => { set("logoFile", null); set("logoDataUrl", ""); }}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
                        <X className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleLogo(f); }}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-5 cursor-pointer hover:border-[#E07B39] hover:bg-orange-50/30 transition"
                      data-testid="dropzone-logo">
                      <Upload className="h-5 w-5 text-gray-400" />
                      <p className="text-xs text-gray-500">Drop logo here or <span className="text-[#E07B39] font-semibold">browse</span></p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleLogo(f); }} data-testid="input-logo" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Company Name *</label>
                  <input value={form.companyName} onChange={e => set("companyName", e.target.value)}
                    placeholder="e.g. JC Waterproofing Inc." className={inputCls("companyName")} data-testid="input-company-name" />
                  {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Office Phone *</label>
                  <input value={form.phone} onChange={e => set("phone", e.target.value)}
                    placeholder="+63 917 123 4567" className={inputCls("phone")} data-testid="input-phone" />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Company Address *</label>
                  <input value={form.address} onChange={e => set("address", e.target.value)}
                    placeholder="Unit/Floor, Building, Street" className={inputCls("address")} data-testid="input-address" />
                  {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">City *</label>
                    <input value={form.city} onChange={e => set("city", e.target.value)}
                      placeholder="Quezon City" className={inputCls("city")} data-testid="input-city" />
                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Province *</label>
                    <input value={form.province} onChange={e => set("province", e.target.value)}
                      placeholder="NCR" className={inputCls("province")} data-testid="input-province" />
                    {errors.province && <p className="text-xs text-red-500">{errors.province}</p>}
                  </div>
                </div>

                <button type="button" onClick={handleNext}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#E07B39] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#C96A2C]"
                  data-testid="button-next-step1">
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* ── Step 2: Account Setup ── */}
            {step === 2 && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Address *</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    placeholder="you@company.com" className={inputCls("email")} autoFocus data-testid="input-email" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password *</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)}
                      placeholder="At least 6 characters" className={`${inputCls("password")} pr-11`} data-testid="input-password" />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" data-testid="button-toggle-password">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  {form.password.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${form.password.length < 6 ? "w-1/4 bg-red-400" : form.password.length < 10 ? "w-1/2 bg-yellow-400" : "w-full bg-green-500"}`} />
                      </div>
                      <span className={`text-[10px] font-semibold ${form.password.length < 6 ? "text-red-400" : form.password.length < 10 ? "text-yellow-500" : "text-green-600"}`}>
                        {form.password.length < 6 ? "Weak" : form.password.length < 10 ? "Good" : "Strong"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Re-type Password *</label>
                  <div className="relative">
                    <input type={showCPw ? "text" : "password"} value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
                      placeholder="Confirm password" className={`${inputCls("confirmPassword")} pr-11`} data-testid="input-confirm-password" />
                    <button type="button" onClick={() => setShowCPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" data-testid="button-toggle-confirm-password">
                      {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                  {form.confirmPassword.length > 0 && form.password === form.confirmPassword && (
                    <p className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Passwords match</p>
                  )}
                </div>

                <div className="flex gap-3 mt-1">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                    data-testid="button-back-step2">Back</button>
                  <button type="button" onClick={handleNext}
                    className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-[#E07B39] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#C96A2C]"
                    data-testid="button-next-step2">
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}

            {/* ── Step 3: Service Profile ── */}
            {step === 3 && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Service Regions <span className="normal-case font-normal text-gray-400">(select all that apply)</span>
                  </label>
                  <PillSelect options={REGIONS} selected={form.serviceRegions} onChange={v => set("serviceRegions", v)} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Project Sectors <span className="normal-case font-normal text-gray-400">(up to 3)</span>
                  </label>
                  <PillSelect options={SECTORS} selected={form.projectSectors} onChange={v => set("projectSectors", v)} max={3} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Company Role *</label>
                  <select value={form.companyRole} onChange={e => set("companyRole", e.target.value)}
                    className={inputCls("companyRole")} data-testid="select-company-role">
                    <option value="">Select your role…</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.companyRole && <p className="text-xs text-red-500">{errors.companyRole}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Service Specialization <span className="normal-case font-normal text-gray-400">(up to 3)</span>
                  </label>
                  <PillSelect options={SPECIALIZATIONS} selected={form.specializations} onChange={v => set("specializations", v)} max={3} />
                </div>

                <div className="flex gap-3 mt-1">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                    data-testid="button-back-step3">Back</button>
                  <button type="submit" disabled={submitting}
                    className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-[#E07B39] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#C96A2C] disabled:opacity-60"
                    data-testid="button-submit">
                    {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
                    {submitting ? "Creating account…" : "Create Account →"}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-[#E07B39] hover:underline" data-testid="link-login">Sign in →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
