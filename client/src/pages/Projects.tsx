import { useState } from "react";
import { Link } from "wouter";
import { Layers, FileSpreadsheet, Archive, Eye, Plus, Search, Filter, AlertTriangle, CheckCircle2, Clock, MoreVertical, ChevronDown } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

function fmt(n: number | string | null | undefined) {
  if (n == null) return "—";
  return "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; bg: string; text: string }> = {
    draft:     { label: "Draft",     bg: "bg-gray-100",    text: "text-gray-600" },
    finalized: { label: "Finalized", bg: "bg-green-100",   text: "text-green-700" },
    archived:  { label: "Archived",  bg: "bg-red-100",     text: "text-red-600" },
  };
  const cfg = configs[status] ?? configs.draft;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    Practical: "bg-blue-50 text-blue-700",
    Standard:  "bg-purple-50 text-purple-700",
    Premium:   "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors[tier] ?? "bg-gray-100 text-gray-600"}`}>
      {tier}
    </span>
  );
}

export function Projects() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmArchive, setConfirmArchive] = useState<number | null>(null);

  const { data: quotations = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/quotations"] });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/quotations/${id}`, { status: "archived" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      setConfirmArchive(null);
    },
  });

  const filtered = (quotations as any[]).filter(q => {
    const matchSearch = q.projectName?.toLowerCase().includes(search.toLowerCase()) || q.clientName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const active = (quotations as any[]).filter(q => q.status !== "archived");
  const archived = (quotations as any[]).filter(q => q.status === "archived");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-['Poppins',Helvetica,sans-serif]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <div>
            <h1 className="text-base font-bold text-gray-900">Open Projects</h1>
            <p className="text-xs text-gray-500">Review and manage your saved quotations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E07B39] text-sm font-bold text-white">JC</div>
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">John Contractor</p>
              <p className="text-[10px] text-gray-500">JC Waterproofing Inc.</p>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-hidden p-6 gap-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 flex-shrink-0">
            {[
              { label: "Active Projects",   value: active.length,    icon: Layers,        color: "#E07B39" },
              { label: "Finalized",         value: (quotations as any[]).filter(q => q.status === "finalized").length, icon: CheckCircle2, color: "#22c55e" },
              { label: "Archived",          value: archived.length,  icon: Archive,        color: "#9ca3af" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: s.color + "18" }}>
                    <Icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="flex flex-shrink-0 items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by project name or client…"
                className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:border-[#E07B39] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="bg-transparent text-sm focus:outline-none">
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="finalized">Finalized</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <Link href="/quotation">
              <button className="flex items-center gap-2 rounded-xl bg-[#E07B39] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#c96b2f]">
                <Plus className="h-4 w-4" /> New Quotation
              </button>
            </Link>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-gray-400">Loading projects…</div>
            ) : filtered.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Layers className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-700">No projects yet</p>
                  <p className="mt-1 text-sm text-gray-400">
                    {search || filterStatus !== "all"
                      ? "Try adjusting your filters"
                      : "Generate your first quotation to create a project"}
                  </p>
                </div>
                {!search && filterStatus === "all" && (
                  <Link href="/quotation">
                    <button className="flex items-center gap-2 rounded-xl bg-[#E07B39] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#c96b2f]">
                      <Plus className="h-4 w-4" /> Create First Quotation
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-auto h-full">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Project Name", "Client", "Type", "Tier", "Practical", "Standard", "Premium", "Status", "Created", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((q: any) => (
                      <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">{q.projectName}</td>
                        <td className="px-4 py-3 text-gray-500">{q.clientName || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-gray-600">{q.quotationType}</span>
                        </td>
                        <td className="px-4 py-3"><TierBadge tier={q.tier} /></td>
                        <td className="px-4 py-3 font-medium text-gray-900">{fmt(q.practicalTotal)}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{fmt(q.standardTotal)}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{fmt(q.premiumTotal)}</td>
                        <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(q.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link href="/quotation">
                              <button className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-[#E07B39] hover:text-[#E07B39]">
                                <Eye className="h-3 w-3" /> Open
                              </button>
                            </Link>
                            {q.status !== "archived" && (
                              <button
                                onClick={() => setConfirmArchive(q.id)}
                                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:border-red-300 hover:text-red-500">
                                <Archive className="h-3 w-3" /> Archive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Archive Confirm Dialog */}
      {confirmArchive !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-4 text-base font-bold text-gray-900">Archive this project?</h3>
            <p className="mt-2 text-sm text-gray-500">The quotation will be moved to the archive and marked as inactive. This typically means the client has declined. You can still view it later.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirmArchive(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => archiveMutation.mutate(confirmArchive)}
                disabled={archiveMutation.isPending}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700">
                {archiveMutation.isPending ? "Archiving…" : "Archive Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
