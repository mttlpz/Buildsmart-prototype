import { Link } from "wouter";
import { FileSpreadsheet, Tag, Layers, TrendingUp, Settings, Truck, BarChart2, ChevronRight, CheckCircle2, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useApp } from "@/context/AppContext";
import { useQuery } from "@tanstack/react-query";

const SETUP_STEPS = [
  {
    step: 1,
    title: "Upload Your Pricelist",
    description: "Add your supplier price list so BuildSmart can calculate accurate costs.",
    href: "/pricelist",
    icon: Tag,
    color: "#E07B39",
  },
  {
    step: 2,
    title: "Configure Company Rules",
    description: "Set up material preferences, labor rates, and pricing strategies.",
    href: "/management",
    icon: Settings,
    color: "#4f46e5",
  },
];

const MAIN_FUNCTIONS = [
  { label: "Quotation Generation",     href: "/quotation",   icon: FileSpreadsheet, color: "#E07B39",  desc: "Create accurate project cost estimates" },
  { label: "Pricelist Management",     href: "/pricelist",   icon: Tag,             color: "#10b981",  desc: "Manage your material price catalog" },
  { label: "Company Rules & Prefs",    href: "/management",  icon: Settings,        color: "#4f46e5",  desc: "Configure business rules and strategies" },
  { label: "Open Projects",            href: "/projects",    icon: Layers,          color: "#f59e0b",  desc: "Review and manage saved quotations" },
  { label: "Market Intelligence",      href: "/analysis",    icon: TrendingUp,      color: "#06b6d4",  desc: "Analyze material price trends" },
  { label: "Benchmark Suppliers",      href: "/suppliers",   icon: Truck,           color: "#8b5cf6",  desc: "Compare supplier prices and rankings" },
];

export function Dashboard() {
  const { onboardingStep, isSetupComplete } = useApp();
  const { data: quotations = [] } = useQuery<any[]>({ queryKey: ["/api/quotations"] });
  const { data: priceRecords = [] } = useQuery<any[]>({ queryKey: ["/api/price-records"] });

  const activeProjects = (quotations as any[]).filter(q => q.status !== "archived").length;

  if (!isSetupComplete) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-['Poppins',Helvetica,sans-serif]">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
            <div>
              <h1 className="text-base font-bold text-gray-900">Welcome to BuildSmart</h1>
              <p className="text-xs text-gray-500">Complete your account setup to start generating quotations</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E07B39] text-sm font-bold text-white">JC</div>
              <div>
                <p className="text-xs font-semibold text-gray-800 leading-tight">John Contractor</p>
                <p className="text-[10px] text-gray-500">JC Waterproofing Inc.</p>
              </div>
            </div>
          </header>

          <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Account Setup Required</h2>
              <p className="mt-2 max-w-md text-sm text-gray-500">
                To ensure efficient Quotation Generation, you must configure your company rules and establish a regional pricelist baseline first. Complete these two steps to unlock all features.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-2xl">
              {SETUP_STEPS.map(s => {
                const Icon = s.icon;
                const done = onboardingStep >= s.step;
                const current = onboardingStep === s.step - 1;
                return (
                  <Link key={s.step} href={done || current ? s.href : "#"}>
                    <div className={`flex items-center gap-5 rounded-2xl border-2 p-6 transition-all cursor-pointer ${
                      done ? "border-green-300 bg-green-50" :
                      current ? "border-[#E07B39] bg-[#fff7f0] shadow-md" :
                      "border-gray-200 bg-white opacity-50 cursor-not-allowed"
                    }`}>
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: (done ? "#22c55e" : current ? s.color : "#9ca3af") + "18" }}>
                        {done ? <CheckCircle2 className="h-7 w-7 text-green-600" /> : <Icon className="h-7 w-7" style={{ color: done ? "#22c55e" : current ? s.color : "#9ca3af" }} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: done ? "#16a34a" : current ? s.color : "#9ca3af" }}>
                            Step {s.step}
                          </span>
                          {done && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Completed</span>}
                          {current && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">Action Required</span>}
                        </div>
                        <p className="mt-0.5 font-bold text-gray-900">{s.title}</p>
                        <p className="text-sm text-gray-500">{s.description}</p>
                      </div>
                      {(done || current) && <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-['Poppins',Helvetica,sans-serif]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <div>
            <h1 className="text-base font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-500">JC Waterproofing Inc. — ready to generate quotations</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E07B39] text-sm font-bold text-white">JC</div>
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">John Contractor</p>
              <p className="text-[10px] text-gray-500">JC Waterproofing Inc.</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Quick stats */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            {[
              { label: "Price Records",   value: (priceRecords as any[]).length,  icon: Tag,            color: "#E07B39" },
              { label: "Active Projects", value: activeProjects,                  icon: Layers,         color: "#4f46e5" },
              { label: "Quotations",      value: (quotations as any[]).length,    icon: FileSpreadsheet, color: "#10b981" },
              { label: "Account Status",  value: "Active",                        icon: CheckCircle2,   color: "#22c55e" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: s.color + "18" }}>
                    <Icon className="h-6 w-6" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick action */}
          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#E07B39] to-[#c96b2f] p-6 text-white shadow-md">
            <Zap className="h-10 w-10 flex-shrink-0 opacity-90" />
            <div className="flex-1">
              <p className="text-lg font-bold">Ready to Generate a Quotation?</p>
              <p className="text-sm opacity-80">Upload a blueprint or use quick measurement to get started</p>
            </div>
            <Link href="/quotation">
              <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#E07B39] hover:bg-orange-50">
                Start Now <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Main function grid */}
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Select Main Function</p>
          <div className="grid grid-cols-3 gap-4">
            {MAIN_FUNCTIONS.map(fn => {
              const Icon = fn.icon;
              return (
                <Link key={fn.href} href={fn.href}>
                  <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-gray-200 hover:shadow-md cursor-pointer group">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-110" style={{ background: fn.color + "18" }}>
                      <Icon className="h-6 w-6" style={{ color: fn.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 group-hover:text-[#E07B39] transition-colors">{fn.label}</p>
                      <p className="text-xs text-gray-400 truncate">{fn.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
