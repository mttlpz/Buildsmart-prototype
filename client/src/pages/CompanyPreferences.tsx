import { useState } from "react";
import { Tag, Layers, Users, DollarSign, ArrowLeftRight, Truck, Plus, ChevronRight, CheckCircle2, AlertTriangle, X, Pencil, Power, Save, Info, Zap } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

// ── Shared helpers ─────────────────────────────────────────────────────────────
const REGIONS = ["NCR", "Region I", "Region II", "Region III", "CALABARZON", "Region V", "Region VI", "Region VII", "Region VIII", "Region IX", "Region X", "Region XI", "CAR", "CARAGA"];
const TRADES = ["Mason", "Carpenter", "Electrician", "Plumber", "Waterproofer", "Painter", "Steel Worker", "Tile Setter"];
const MATERIAL_CATS = ["Waterproofing", "Sealants", "Primers", "Drainage", "Concrete", "Steel", "Timber", "Electrical", "Plumbing", "Tiles & Finishes"];
const SCOPE_SPECS = ["Waterproofing", "General Construction", "Electrical", "Plumbing", "Tiling & Finishes", "Painting", "Civil Works"];
const FALLBACK_RULES = ["next_preferred", "cheapest_available", "skip_item", "standard"];
const SOURCE_OPTIONS = ["Uploaded Pricelist", "Supplier Direct Price", "DPWH CMPD"];
const TIERS = ["Practical", "Standard", "Premium"];
const RULE_TYPES = ["Bulk discount", "Negotiated price", "Minimum order", "Preferred supplier"] as const;

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
      {active ? "Active" : "Disabled"}
    </span>
  );
}

function SplitPanel({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">{children}</div>;
}

function LeftPanel({ children }: { children: React.ReactNode }) {
  return <div className="flex w-80 flex-shrink-0 flex-col overflow-hidden border-r border-gray-100">{children}</div>;
}

function RightPanel({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col overflow-y-auto p-6">{children}</div>;
}

function EmptyRight({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <Plus className="h-7 w-7 text-gray-400" />
      </div>
      <div>
        <p className="font-semibold text-gray-700">No rule selected</p>
        <p className="mt-1 text-sm text-gray-400">Select a rule from the list to view details, or add a new one.</p>
      </div>
      <button onClick={onAdd} className="flex items-center gap-2 rounded-xl bg-[#E07B39] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c96b2f]">
        <Plus className="h-4 w-4" /> Add Rule
      </button>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#E07B39] focus:outline-none" />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[] }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#E07B39] focus:outline-none">
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Tab 1: Material Rules ─────────────────────────────────────────────────────
function MaterialRulesTab() {
  const [selected, setSelected] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ scopeTemplate: SCOPE_SPECS[0], materialCategory: MATERIAL_CATS[0], preferredMaterial: "", priority: "1", fallbackRule: "next_preferred" });

  const { data: rules = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/material-rules"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/material-rules", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/material-rules"] }); setShowForm(false); setForm({ scopeTemplate: SCOPE_SPECS[0], materialCategory: MATERIAL_CATS[0], preferredMaterial: "", priority: "1", fallbackRule: "next_preferred" }); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: any) => apiRequest("PATCH", `/api/material-rules/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/material-rules"] }),
  });

  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <SplitPanel>
      <LeftPanel>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Configured Rules ({(rules as any[]).length})</p>
          <button onClick={() => { setShowForm(true); setSelected(null); }} className="flex items-center gap-1 rounded-lg bg-[#E07B39] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#c96b2f]">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? <div className="p-4 text-sm text-gray-400">Loading…</div> :
           (rules as any[]).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-sm text-gray-400">
              <Tag className="mb-2 h-8 w-8 text-gray-200" />
              No material rules configured yet.
            </div>
          ) : (rules as any[]).map((r: any) => (
            <button key={r.id} onClick={() => { setSelected(r); setShowForm(false); }}
              className={`flex w-full flex-col items-start gap-1 border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${selected?.id === r.id ? "bg-orange-50" : ""}`}>
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 truncate">{r.preferredMaterial}</span>
                <StatusBadge active={r.isActive} />
              </div>
              <span className="text-xs text-gray-400">{r.scopeTemplate} · {r.materialCategory}</span>
              <span className="text-xs text-gray-300">Priority {r.priority} · Fallback: {r.fallbackRule}</span>
            </button>
          ))}
        </div>
      </LeftPanel>

      <RightPanel>
        {showForm ? (
          <div className="flex flex-col gap-5 max-w-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Add Material Rule</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-gray-500">Define which material is preferred for a given scope template and category.</p>
            <Select label="Scope Template" value={form.scopeTemplate} onChange={f("scopeTemplate")} options={SCOPE_SPECS} />
            <Select label="Material Category" value={form.materialCategory} onChange={f("materialCategory")} options={MATERIAL_CATS} />
            <Input label="Preferred Material (brand/product name)" value={form.preferredMaterial} onChange={f("preferredMaterial")} placeholder="e.g. Sika Bituseal T-140 SA" />
            <Input label="Priority (1 = highest)" type="number" value={form.priority} onChange={f("priority")} placeholder="1" />
            <Select label="Fallback Rule" value={form.fallbackRule} onChange={f("fallbackRule")} options={FALLBACK_RULES} />
            <button onClick={() => createMutation.mutate({ ...form, priority: Number(form.priority) })}
              disabled={!form.preferredMaterial || createMutation.isPending}
              className="flex items-center gap-2 self-start rounded-xl bg-[#E07B39] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c96b2f] disabled:opacity-50">
              {createMutation.isPending ? "Saving…" : <><Save className="h-4 w-4" /> Save Rule</>}
            </button>
          </div>
        ) : selected ? (
          <div className="flex flex-col gap-5 max-w-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{selected.preferredMaterial}</h3>
              <StatusBadge active={selected.isActive} />
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs">
              {[
                ["Scope Template", selected.scopeTemplate],
                ["Material Category", selected.materialCategory],
                ["Preferred Material", selected.preferredMaterial],
                ["Priority", selected.priority],
                ["Fallback Rule", selected.fallbackRule],
              ].map(([k, v]) => (
                <div key={k as string}><p className="font-semibold text-gray-400">{k}</p><p className="mt-0.5 text-gray-800">{v}</p></div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => toggleMutation.mutate({ id: selected.id, isActive: !selected.isActive })}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${selected.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
                <Power className="h-4 w-4" /> {selected.isActive ? "Disable Rule" : "Enable Rule"}
              </button>
            </div>
          </div>
        ) : <EmptyRight onAdd={() => setShowForm(true)} />}
      </RightPanel>
    </SplitPanel>
  );
}

// ── Tab 2: Scope Templates ────────────────────────────────────────────────────
function ScopeTemplatesTab() {
  const [selected, setSelected] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", serviceSpecialization: SCOPE_SPECS[0], workItems: [{ item: "", unit: "m²", quantity: 0 }] });

  const { data: templates = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/scope-templates"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/scope-templates", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/scope-templates"] }); setShowForm(false); setForm({ name: "", serviceSpecialization: SCOPE_SPECS[0], workItems: [{ item: "", unit: "m²", quantity: 0 }] }); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: any) => apiRequest("PATCH", `/api/scope-templates/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/scope-templates"] }),
  });

  const addWorkItem = () => setForm(p => ({ ...p, workItems: [...p.workItems, { item: "", unit: "m²", quantity: 0 }] }));
  const removeWorkItem = (i: number) => setForm(p => ({ ...p, workItems: p.workItems.filter((_, idx) => idx !== i) }));
  const updateWorkItem = (i: number, field: string, val: any) => setForm(p => ({
    ...p, workItems: p.workItems.map((wi, idx) => idx === i ? { ...wi, [field]: val } : wi)
  }));

  return (
    <SplitPanel>
      <LeftPanel>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Templates ({(templates as any[]).length})</p>
          <button onClick={() => { setShowForm(true); setSelected(null); }} className="flex items-center gap-1 rounded-lg bg-[#E07B39] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#c96b2f]"><Plus className="h-3 w-3" /> Add</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? <div className="p-4 text-sm text-gray-400">Loading…</div> :
           (templates as any[]).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-sm text-gray-400"><Layers className="mb-2 h-8 w-8 text-gray-200" />No scope templates yet.</div>
          ) : (templates as any[]).map((t: any) => (
            <button key={t.id} onClick={() => { setSelected(t); setShowForm(false); }}
              className={`flex w-full flex-col gap-1 border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 ${selected?.id === t.id ? "bg-orange-50" : ""}`}>
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">{t.name}</span>
                <StatusBadge active={t.isActive} />
              </div>
              <span className="text-xs text-gray-400">{t.serviceSpecialization}</span>
              <span className="text-xs text-gray-300">{(t.workItems as any[]).length} work items</span>
            </button>
          ))}
        </div>
      </LeftPanel>

      <RightPanel>
        {showForm ? (
          <div className="flex flex-col gap-5 max-w-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Add Scope Template</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <Input label="Template Name" value={form.name} onChange={(v: string) => setForm(p => ({ ...p, name: v }))} placeholder="e.g. Standard Roof Waterproofing" />
            <Select label="Service Specialization" value={form.serviceSpecialization} onChange={(v: string) => setForm(p => ({ ...p, serviceSpecialization: v }))} options={SCOPE_SPECS} />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600">Work Items</label>
                <button onClick={addWorkItem} className="text-xs font-medium text-[#E07B39] hover:underline">+ Add Item</button>
              </div>
              {form.workItems.map((wi, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-2">
                  <input value={wi.item} onChange={e => updateWorkItem(i, "item", e.target.value)} placeholder="Item description"
                    className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-[#E07B39] focus:outline-none" />
                  <select value={wi.unit} onChange={e => updateWorkItem(i, "unit", e.target.value)}
                    className="w-16 rounded-lg border border-gray-200 px-1 py-1.5 text-xs focus:outline-none">
                    {["m²", "m", "pc", "bag", "L", "kg", "set"].map(u => <option key={u}>{u}</option>)}
                  </select>
                  <button onClick={() => removeWorkItem(i)} className="text-gray-300 hover:text-red-400"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => createMutation.mutate({ ...form, workItems: form.workItems.filter(wi => wi.item) })}
              disabled={!form.name || createMutation.isPending}
              className="flex items-center gap-2 self-start rounded-xl bg-[#E07B39] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c96b2f] disabled:opacity-50">
              {createMutation.isPending ? "Saving…" : <><Save className="h-4 w-4" /> Save Template</>}
            </button>
          </div>
        ) : selected ? (
          <div className="flex flex-col gap-4 max-w-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{selected.name}</h3>
              <StatusBadge active={selected.isActive} />
            </div>
            <p className="text-sm text-gray-500">{selected.serviceSpecialization}</p>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500">Work Items ({(selected.workItems as any[]).length})</div>
              {(selected.workItems as any[]).map((wi: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-t border-gray-50 px-4 py-2.5 text-sm">
                  <span className="text-gray-800">{wi.item}</span>
                  <span className="text-gray-400 text-xs">{wi.unit}</span>
                </div>
              ))}
            </div>
            <button onClick={() => toggleMutation.mutate({ id: selected.id, isActive: !selected.isActive })}
              className={`flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${selected.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
              <Power className="h-4 w-4" /> {selected.isActive ? "Disable" : "Enable"}
            </button>
          </div>
        ) : <EmptyRight onAdd={() => setShowForm(true)} />}
      </RightPanel>
    </SplitPanel>
  );
}

// ── Tab 3: Labor Rates ────────────────────────────────────────────────────────
function LaborRatesTab() {
  const [selected, setSelected] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ region: "NCR", trade: TRADES[0], ratePerDay: "", productivityIndex: "1.00", fallbackRule: "standard" });
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const { data: rates = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/labor-rates"] });
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/labor-rates", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/labor-rates"] }); setShowForm(false); setForm({ region: "NCR", trade: TRADES[0], ratePerDay: "", productivityIndex: "1.00", fallbackRule: "standard" }); },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: any) => apiRequest("PATCH", `/api/labor-rates/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/labor-rates"] }),
  });

  return (
    <SplitPanel>
      <LeftPanel>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Labor Rates ({(rates as any[]).length})</p>
          <button onClick={() => { setShowForm(true); setSelected(null); }} className="flex items-center gap-1 rounded-lg bg-[#E07B39] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#c96b2f]"><Plus className="h-3 w-3" /> Add</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? <div className="p-4 text-sm text-gray-400">Loading…</div> :
           (rates as any[]).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-sm text-gray-400"><Users className="mb-2 h-8 w-8 text-gray-200" />No labor rates yet.</div>
          ) : (rates as any[]).map((r: any) => (
            <button key={r.id} onClick={() => { setSelected(r); setShowForm(false); }}
              className={`flex w-full flex-col gap-1 border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 ${selected?.id === r.id ? "bg-orange-50" : ""}`}>
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">{r.trade}</span>
                <StatusBadge active={r.isActive} />
              </div>
              <span className="text-xs text-gray-400">{r.region}</span>
              <span className="text-xs text-gray-500">₱{Number(r.ratePerDay).toLocaleString()}/day · PI: {r.productivityIndex}</span>
            </button>
          ))}
        </div>
      </LeftPanel>

      <RightPanel>
        {showForm ? (
          <div className="flex flex-col gap-5 max-w-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Add Labor Rate</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <Select label="Region" value={form.region} onChange={f("region")} options={REGIONS} />
            <Select label="Trade" value={form.trade} onChange={f("trade")} options={TRADES} />
            <Input label="Rate Per Day (₱)" type="number" value={form.ratePerDay} onChange={f("ratePerDay")} placeholder="e.g. 800" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Productivity Index (0.5 – 1.5)</label>
              <input type="range" min="0.5" max="1.5" step="0.05" value={form.productivityIndex}
                onChange={e => setForm(p => ({ ...p, productivityIndex: e.target.value }))}
                className="accent-[#E07B39]" />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0.5 (Slow)</span>
                <span className="font-bold text-gray-700">{Number(form.productivityIndex).toFixed(2)}</span>
                <span>1.5 (Fast)</span>
              </div>
            </div>
            <Select label="Fallback Rule" value={form.fallbackRule} onChange={f("fallbackRule")} options={FALLBACK_RULES} />
            <button onClick={() => createMutation.mutate({ ...form, ratePerDay: form.ratePerDay, productivityIndex: form.productivityIndex })}
              disabled={!form.ratePerDay || createMutation.isPending}
              className="flex items-center gap-2 self-start rounded-xl bg-[#E07B39] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c96b2f] disabled:opacity-50">
              {createMutation.isPending ? "Saving…" : <><Save className="h-4 w-4" /> Save Rate</>}
            </button>
          </div>
        ) : selected ? (
          <div className="flex flex-col gap-4 max-w-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{selected.trade} — {selected.region}</h3>
              <StatusBadge active={selected.isActive} />
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs">
              {[["Region", selected.region], ["Trade", selected.trade], ["Rate / Day", `₱${Number(selected.ratePerDay).toLocaleString()}`], ["Productivity Index", selected.productivityIndex], ["Fallback Rule", selected.fallbackRule]].map(([k, v]) => (
                <div key={k as string}><p className="font-semibold text-gray-400">{k}</p><p className="mt-0.5 text-gray-800">{v}</p></div>
              ))}
            </div>
            <button onClick={() => toggleMutation.mutate({ id: selected.id, isActive: !selected.isActive })}
              className={`flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${selected.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
              <Power className="h-4 w-4" /> {selected.isActive ? "Disable" : "Enable"}
            </button>
          </div>
        ) : <EmptyRight onAdd={() => setShowForm(true)} />}
      </RightPanel>
    </SplitPanel>
  );
}

// ── Tab 4: Pricing Strategies ─────────────────────────────────────────────────
function PricingStrategiesTab() {
  const { data: strategies = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/pricing-strategies"] });

  const [forms, setForms] = useState<Record<string, any>>({
    Practical: { markupPct: "8", contingencyPct: "5", overheadPct: "7", profitMarginPct: "5", sourcePriority: ["DPWH CMPD", "Uploaded Pricelist", "Supplier Direct Price"], fallbackRule: "cheapest_available", warrantyTerms: "1 year workmanship", paymentTerms: "50% DP, 50% on completion" },
    Standard:  { markupPct: "12", contingencyPct: "8", overheadPct: "10", profitMarginPct: "8", sourcePriority: ["Uploaded Pricelist", "Supplier Direct Price", "DPWH CMPD"], fallbackRule: "next_preferred", warrantyTerms: "2 years workmanship", paymentTerms: "30% DP, 40% progress, 30% on completion" },
    Premium:   { markupPct: "18", contingencyPct: "10", overheadPct: "12", profitMarginPct: "12", sourcePriority: ["Supplier Direct Price", "Uploaded Pricelist", "DPWH CMPD"], fallbackRule: "next_preferred", warrantyTerms: "3 years workmanship + materials", paymentTerms: "20% DP, 30% 30/60/90 days, 20% retention" },
  });

  const TIER_COLORS: Record<string, string> = { Practical: "#4f46e5", Standard: "#E07B39", Premium: "#f59e0b" };

  const saveMutation = useMutation({
    mutationFn: ({ tier, data }: any) => apiRequest("POST", "/api/pricing-strategies", { ...data, tier }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/pricing-strategies"] }),
  });

  const f = (tier: string, k: string) => (v: string) => setForms(p => ({ ...p, [tier]: { ...p[tier], [k]: v } }));

  // Merge server data into forms
  const merged: Record<string, any> = { ...forms };
  (strategies as any[]).forEach((s: any) => { if (s.tier) merged[s.tier] = { ...forms[s.tier], ...s }; });

  return (
    <div className="flex flex-1 gap-4 overflow-hidden">
      {TIERS.map(tier => {
        const d = merged[tier] || forms[tier];
        const color = TIER_COLORS[tier];
        const saved = (strategies as any[]).some((s: any) => s.tier === tier);
        return (
          <div key={tier} className={`flex flex-1 flex-col gap-4 overflow-y-auto rounded-2xl border-2 bg-white p-5 shadow-sm ${saved ? "border-green-200" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-gray-900">{tier}</p>
                {saved && <p className="text-xs text-green-600 font-semibold">Configured</p>}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: color + "18" }}>
                <DollarSign className="h-5 w-5" style={{ color }} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: "Markup %", key: "markupPct" },
                { label: "Contingency %", key: "contingencyPct" },
                { label: "Overhead %", key: "overheadPct" },
                { label: "Profit Margin %", key: "profitMarginPct" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-gray-600">{label}</label>
                    <span className="font-bold" style={{ color }}>{d[key] || 0}%</span>
                  </div>
                  <input type="range" min="0" max="50" step="0.5" value={d[key] || 0}
                    onChange={e => f(tier, key)(e.target.value)} className="w-full mt-1" style={{ accentColor: color }} />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600">Price Source Priority</label>
              <div className="flex flex-col gap-1">
                {SOURCE_OPTIONS.map((src, i) => {
                  const priority = (d.sourcePriority as string[]) || SOURCE_OPTIONS;
                  const pos = priority.indexOf(src);
                  return (
                    <div key={src} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5 text-xs">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: pos >= 0 ? color : "#d1d5db" }}>
                        {pos >= 0 ? pos + 1 : "—"}
                      </span>
                      <span className="text-gray-700">{src}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Warranty Terms</label>
              <input value={d.warrantyTerms || ""} onChange={e => f(tier, "warrantyTerms")(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-[#E07B39] focus:outline-none" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Payment Terms</label>
              <textarea value={d.paymentTerms || ""} onChange={e => f(tier, "paymentTerms")(e.target.value)} rows={2}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-[#E07B39] focus:outline-none resize-none" />
            </div>

            <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
              <p className="font-semibold text-gray-700">Effective Markup</p>
              <p className="mt-1 text-lg font-extrabold" style={{ color }}>
                {(Number(d.markupPct || 0) + Number(d.contingencyPct || 0) + Number(d.overheadPct || 0) + Number(d.profitMarginPct || 0)).toFixed(1)}%
              </p>
              <p className="text-gray-400">Total applied to base material cost</p>
            </div>

            <button onClick={() => saveMutation.mutate({ tier, data: forms[tier] })}
              disabled={saveMutation.isPending}
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
              style={{ background: color }}>
              {saveMutation.isPending ? "Saving…" : <><Save className="h-4 w-4" /> Save {tier}</>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab 5: Unit Conversions ───────────────────────────────────────────────────
function UnitConversionsTab() {
  const [selected, setSelected] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ materialCategory: MATERIAL_CATS[0], fromUnit: "", toUnit: "", conversionFactor: "", wastagePct: "0" });
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const { data: conversions = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/unit-conversions"] });
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/unit-conversions", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/unit-conversions"] }); setShowForm(false); setForm({ materialCategory: MATERIAL_CATS[0], fromUnit: "", toUnit: "", conversionFactor: "", wastagePct: "0" }); },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: any) => apiRequest("PATCH", `/api/unit-conversions/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/unit-conversions"] }),
  });

  return (
    <SplitPanel>
      <LeftPanel>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Conversions ({(conversions as any[]).length})</p>
          <button onClick={() => { setShowForm(true); setSelected(null); }} className="flex items-center gap-1 rounded-lg bg-[#E07B39] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#c96b2f]"><Plus className="h-3 w-3" /> Add</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? <div className="p-4 text-sm text-gray-400">Loading…</div> :
           (conversions as any[]).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-sm text-gray-400"><ArrowLeftRight className="mb-2 h-8 w-8 text-gray-200" />No conversions yet.</div>
          ) : (conversions as any[]).map((c: any) => (
            <button key={c.id} onClick={() => { setSelected(c); setShowForm(false); }}
              className={`flex w-full flex-col gap-1 border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 ${selected?.id === c.id ? "bg-orange-50" : ""}`}>
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">{c.materialCategory}</span>
                <StatusBadge active={c.isActive} />
              </div>
              <span className="text-xs text-gray-500">{c.fromUnit} → {c.toUnit} × {c.conversionFactor}</span>
              <span className="text-xs text-gray-400">Wastage: {c.wastagePct}%</span>
            </button>
          ))}
        </div>
      </LeftPanel>

      <RightPanel>
        {showForm ? (
          <div className="flex flex-col gap-5 max-w-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Add Unit Conversion</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Defines how to convert quantities between units, and adds a wastage allowance to automatically account for material loss.
            </div>
            <Select label="Material Category" value={form.materialCategory} onChange={f("materialCategory")} options={MATERIAL_CATS} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="From Unit" value={form.fromUnit} onChange={f("fromUnit")} placeholder="e.g. m²" />
              <Input label="To Unit" value={form.toUnit} onChange={f("toUnit")} placeholder="e.g. roll" />
            </div>
            <Input label="Conversion Factor" type="number" value={form.conversionFactor} onChange={f("conversionFactor")} placeholder="e.g. 0.5 (1 m² = 0.5 rolls)" />
            <div>
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-gray-600">Wastage Allowance %</label>
                <span className="font-bold text-[#E07B39]">{form.wastagePct}%</span>
              </div>
              <input type="range" min="0" max="30" step="0.5" value={form.wastagePct}
                onChange={e => setForm(p => ({ ...p, wastagePct: e.target.value }))} className="w-full mt-1 accent-[#E07B39]" />
            </div>
            <button onClick={() => createMutation.mutate(form)}
              disabled={!form.fromUnit || !form.toUnit || !form.conversionFactor || createMutation.isPending}
              className="flex items-center gap-2 self-start rounded-xl bg-[#E07B39] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c96b2f] disabled:opacity-50">
              {createMutation.isPending ? "Saving…" : <><Save className="h-4 w-4" /> Save Conversion</>}
            </button>
          </div>
        ) : selected ? (
          <div className="flex flex-col gap-4 max-w-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{selected.materialCategory} Conversion</h3>
              <StatusBadge active={selected.isActive} />
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs">
              {[["Category", selected.materialCategory], ["From Unit", selected.fromUnit], ["To Unit", selected.toUnit], ["Factor", selected.conversionFactor], ["Wastage", `${selected.wastagePct}%`]].map(([k, v]) => (
                <div key={k as string}><p className="font-semibold text-gray-400">{k}</p><p className="mt-0.5 text-gray-800">{v}</p></div>
              ))}
            </div>
            <button onClick={() => toggleMutation.mutate({ id: selected.id, isActive: !selected.isActive })}
              className={`flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${selected.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
              <Power className="h-4 w-4" /> {selected.isActive ? "Disable" : "Enable"}
            </button>
          </div>
        ) : <EmptyRight onAdd={() => setShowForm(true)} />}
      </RightPanel>
    </SplitPanel>
  );
}

// ── Tab 6: Supplier Discount Rules ────────────────────────────────────────────
function SupplierDiscountRulesTab() {
  const [selected, setSelected] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [depError, setDepError] = useState<string | null>(null);
  const [form, setForm] = useState({ supplierName: "", ruleType: "Bulk discount" as typeof RULE_TYPES[number], discountPct: "", minOrderAmount: "", isHardExclusion: false, details: "" });
  const f = (k: string) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  const { data: rules = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/supplier-discount-rules"] });
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/supplier-discount-rules", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/supplier-discount-rules"] }); setShowForm(false); setForm({ supplierName: "", ruleType: "Bulk discount", discountPct: "", minOrderAmount: "", isHardExclusion: false, details: "" }); },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: any) => apiRequest("PATCH", `/api/supplier-discount-rules/${id}`, { isActive }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/supplier-discount-rules"] }); setDepError(null); },
    onError: async (err: any) => {
      const text = await err?.response?.text?.() ?? "";
      if (text.includes("DEPENDENCY:")) setDepError("This rule is referenced in active quotations. Disabling it may affect existing cost calculations. Remove it from those quotations first.");
      else setDepError("Failed to update rule.");
    },
  });

  const RULE_TYPE_COLORS: Record<string, string> = {
    "Bulk discount": "#4f46e5",
    "Negotiated price": "#E07B39",
    "Minimum order": "#f59e0b",
    "Preferred supplier": "#10b981",
  };

  return (
    <SplitPanel>
      <LeftPanel>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Supplier Rules ({(rules as any[]).length})</p>
          <button onClick={() => { setShowForm(true); setSelected(null); setDepError(null); }} className="flex items-center gap-1 rounded-lg bg-[#E07B39] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#c96b2f]"><Plus className="h-3 w-3" /> Add</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? <div className="p-4 text-sm text-gray-400">Loading…</div> :
           (rules as any[]).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-sm text-gray-400"><Truck className="mb-2 h-8 w-8 text-gray-200" />No supplier discount rules yet.</div>
          ) : (rules as any[]).map((r: any) => (
            <button key={r.id} onClick={() => { setSelected(r); setShowForm(false); setDepError(null); }}
              className={`flex w-full flex-col gap-1 border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 ${selected?.id === r.id ? "bg-orange-50" : ""}`}>
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 truncate">{r.supplierName}</span>
                <StatusBadge active={r.isActive} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: RULE_TYPE_COLORS[r.ruleType] ?? "#9ca3af" }}>{r.ruleType}</span>
              {r.referencedInQuotations > 0 && <span className="text-[10px] text-amber-600">Used in {r.referencedInQuotations} quotation(s)</span>}
            </button>
          ))}
        </div>
      </LeftPanel>

      <RightPanel>
        {showForm ? (
          <div className="flex flex-col gap-5 max-w-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Add Supplier Discount Rule</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <Input label="Supplier Name" value={form.supplierName} onChange={f("supplierName")} placeholder="e.g. Sika Philippines Inc." />
            <Select label="Rule Type" value={form.ruleType} onChange={v => setForm(p => ({ ...p, ruleType: v as any, discountPct: "", minOrderAmount: "", isHardExclusion: false }))} options={[...RULE_TYPES]} />

            {/* Conditional fields per rule type */}
            {(form.ruleType === "Bulk discount" || form.ruleType === "Negotiated price") && (
              <Input label={form.ruleType === "Bulk discount" ? "Discount %" : "Negotiated Discount %"} type="number" value={form.discountPct} onChange={f("discountPct")} placeholder="e.g. 15" />
            )}

            {form.ruleType === "Minimum order" && (
              <>
                <Input label="Minimum Order Amount (₱)" type="number" value={form.minOrderAmount} onChange={f("minOrderAmount")} placeholder="e.g. 50000" />
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">If order is below minimum</label>
                  <div className="flex gap-3">
                    <label className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border-2 p-3 text-sm ${!form.isHardExclusion ? "border-[#E07B39] bg-[#fff7f0]" : "border-gray-200"}`}>
                      <input type="radio" checked={!form.isHardExclusion} onChange={() => setForm(p => ({ ...p, isHardExclusion: false }))} className="accent-[#E07B39]" />
                      <div><p className="font-semibold">Soft warning</p><p className="text-xs text-gray-400">Show alert, allow override</p></div>
                    </label>
                    <label className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border-2 p-3 text-sm ${form.isHardExclusion ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                      <input type="radio" checked={form.isHardExclusion} onChange={() => setForm(p => ({ ...p, isHardExclusion: true }))} className="accent-red-500" />
                      <div><p className="font-semibold text-red-700">Hard exclusion</p><p className="text-xs text-gray-400">Supplier removed from selection</p></div>
                    </label>
                  </div>
                </div>
              </>
            )}

            {form.ruleType === "Preferred supplier" && (
              <div className="flex items-start gap-3 rounded-xl bg-green-50 px-4 py-3 text-xs text-green-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                This supplier will be prioritized in material selection when their pricing is comparable to alternatives.
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Notes / Details</label>
              <textarea value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))} rows={2} placeholder="Optional details about this rule…"
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#E07B39] focus:outline-none resize-none" />
            </div>

            <button onClick={() => createMutation.mutate({ ...form, discountPct: form.discountPct || null, minOrderAmount: form.minOrderAmount || null })}
              disabled={!form.supplierName || createMutation.isPending}
              className="flex items-center gap-2 self-start rounded-xl bg-[#E07B39] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c96b2f] disabled:opacity-50">
              {createMutation.isPending ? "Saving…" : <><Save className="h-4 w-4" /> Save Rule</>}
            </button>
          </div>
        ) : selected ? (
          <div className="flex flex-col gap-4 max-w-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900">{selected.supplierName}</h3>
                <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: RULE_TYPE_COLORS[selected.ruleType] ?? "#9ca3af" }}>
                  {selected.ruleType}
                </span>
              </div>
              <StatusBadge active={selected.isActive} />
            </div>

            {depError && (
              <div className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {depError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs">
              {[
                ["Supplier", selected.supplierName],
                ["Rule Type", selected.ruleType],
                selected.discountPct && ["Discount", `${selected.discountPct}%`],
                selected.minOrderAmount && ["Min Order Amount", `₱${Number(selected.minOrderAmount).toLocaleString()}`],
                selected.minOrderAmount && ["Hard Exclusion", selected.isHardExclusion ? "Yes (supplier excluded below threshold)" : "No (soft warning only)"],
                selected.details && ["Notes", selected.details],
                ["Used in Quotations", selected.referencedInQuotations],
              ].filter(Boolean).map(([k, v]: any) => (
                <div key={k}><p className="font-semibold text-gray-400">{k}</p><p className="mt-0.5 text-gray-800">{v}</p></div>
              ))}
            </div>

            <button onClick={() => toggleMutation.mutate({ id: selected.id, isActive: !selected.isActive })}
              className={`flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${selected.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
              <Power className="h-4 w-4" /> {selected.isActive ? "Disable Rule" : "Enable Rule"}
            </button>
          </div>
        ) : <EmptyRight onAdd={() => setShowForm(true)} />}
      </RightPanel>
    </SplitPanel>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const TABS = [
  { id: "material",  label: "Material Rules",       icon: Tag },
  { id: "scope",     label: "Scope Templates",       icon: Layers },
  { id: "labor",     label: "Labor Rates",           icon: Users },
  { id: "pricing",   label: "Pricing Strategies",    icon: DollarSign },
  { id: "units",     label: "Unit Conversions",      icon: ArrowLeftRight },
  { id: "suppliers", label: "Supplier Discounts",    icon: Truck },
];

export function CompanyPreferences() {
  const [activeTab, setActiveTab] = useState("material");
  const { onboardingStep, advanceOnboarding } = useApp();

  // For onboarding completion check
  const { data: materialRules = [] } = useQuery<any[]>({ queryKey: ["/api/material-rules"] });
  const { data: pricingStrategies = [] } = useQuery<any[]>({ queryKey: ["/api/pricing-strategies"] });

  const hasAnyRule = (materialRules as any[]).length > 0 || (pricingStrategies as any[]).length > 0;
  const showSetupBanner = onboardingStep === 1;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-['Poppins',Helvetica,sans-serif]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <div>
            <h1 className="text-base font-bold text-gray-900">Company Rules & Preferences</h1>
            <p className="text-xs text-gray-500">Configure material, labor, pricing, and supplier rules used in quotation generation</p>
          </div>
          <div className="flex items-center gap-3">
            {showSetupBanner && hasAnyRule && (
              <button
                onClick={() => advanceOnboarding(2)}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700">
                <Zap className="h-4 w-4" /> Complete Setup
              </button>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E07B39] text-sm font-bold text-white">JC</div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 leading-tight">John Contractor</p>
              <p className="text-[10px] text-gray-500">JC Waterproofing Inc.</p>
            </div>
          </div>
        </header>

        {/* Setup Banner */}
        {showSetupBanner && (
          <div className="flex flex-shrink-0 items-center gap-3 border-b border-amber-200 bg-amber-50 px-6 py-3">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              <strong>Step 2 of 2:</strong> Configure your company rules. Set up at least one rule in any category, then click "Complete Setup" above to unlock all BuildSmart features.
            </p>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex flex-shrink-0 overflow-x-auto border-b border-gray-200 bg-white">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-shrink-0 items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors ${active ? "text-[#E07B39]" : "text-gray-500 hover:text-gray-700"}`}>
                <Icon className="h-4 w-4" />
                {tab.label}
                {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07B39]" />}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <main className="flex flex-1 overflow-hidden p-5">
          {activeTab === "material"  && <MaterialRulesTab />}
          {activeTab === "scope"     && <ScopeTemplatesTab />}
          {activeTab === "labor"     && <LaborRatesTab />}
          {activeTab === "pricing"   && <PricingStrategiesTab />}
          {activeTab === "units"     && <UnitConversionsTab />}
          {activeTab === "suppliers" && <SupplierDiscountRulesTab />}
        </main>
      </div>
    </div>
  );
}
