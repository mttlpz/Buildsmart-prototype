import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { TrendingDown, TrendingUp, Minus, BarChart2, Search, Tag } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { PriceRecord } from "@shared/schema";

function fmt(n: number) {
  return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

function abbrev(n: number) {
  if (n >= 1000) return "₱" + (n / 1000).toFixed(1) + "k";
  return "₱" + n.toFixed(0);
}

const COLORS = ["#E07B39", "#4f46e5", "#10b981", "#f59e0b", "#06b6d4", "#8b5cf6", "#ec4899"];

const DEMO_DATA: PriceRecord[] = [
  { id: 1, companyId: "demo", code: "WP-001", description: "Waterproofing Membrane", unit: "sqm", price: "1596", category: "Waterproofing", supplierName: "Mapei Philippines", sourceType: "pricelist", region: "NCR", quarter: null, isActive: true, createdAt: new Date() },
  { id: 2, companyId: "demo", code: "WP-001", description: "Waterproofing Membrane", unit: "sqm", price: "1480", category: "Waterproofing", supplierName: "BASF Construction", sourceType: "pricelist", region: "NCR", quarter: null, isActive: true, createdAt: new Date() },
  { id: 3, companyId: "demo", code: "WP-001", description: "Waterproofing Membrane", unit: "sqm", price: "1620", category: "Waterproofing", supplierName: "Sika Philippines", sourceType: "pricelist", region: "NCR", quarter: null, isActive: true, createdAt: new Date() },
  { id: 4, companyId: "demo", code: "SE-002", description: "Polyurethane Sealant", unit: "L", price: "560", category: "Sealants", supplierName: "Mapei Philippines", sourceType: "pricelist", region: "NCR", quarter: null, isActive: true, createdAt: new Date() },
  { id: 5, companyId: "demo", code: "SE-002", description: "Polyurethane Sealant", unit: "L", price: "510", category: "Sealants", supplierName: "Sika Philippines", sourceType: "pricelist", region: "NCR", quarter: null, isActive: true, createdAt: new Date() },
  { id: 6, companyId: "demo", code: "SE-002", description: "Polyurethane Sealant", unit: "L", price: "580", category: "Sealants", supplierName: "Vulcaseal Corp", sourceType: "pricelist", region: "NCR", quarter: null, isActive: true, createdAt: new Date() },
  { id: 7, companyId: "demo", code: "PR-003", description: "Surface Primer", unit: "L", price: "580", category: "Primers", supplierName: "Mapei Philippines", sourceType: "pricelist", region: "NCR", quarter: null, isActive: true, createdAt: new Date() },
  { id: 8, companyId: "demo", code: "PR-003", description: "Surface Primer", unit: "L", price: "540", category: "Primers", supplierName: "BASF Construction", sourceType: "pricelist", region: "NCR", quarter: null, isActive: true, createdAt: new Date() },
  { id: 9, companyId: "demo", code: "DR-004", description: "Drain Channel 100mm", unit: "m", price: "1596", category: "Drainage", supplierName: "ACE Hardware PH", sourceType: "pricelist", region: "NCR", quarter: null, isActive: true, createdAt: new Date() },
  { id: 10, companyId: "demo", code: "DR-004", description: "Drain Channel 100mm", unit: "m", price: "1450", category: "Drainage", supplierName: "True Value PH", sourceType: "pricelist", region: "NCR", quarter: null, isActive: true, createdAt: new Date() },
];

export function SupplierBenchmarking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: records = [] } = useQuery<PriceRecord[]>({ queryKey: ["/api/price-records"] });
  const allRecords = records.length > 0 ? records : DEMO_DATA;

  // All unique suppliers
  const suppliers = useMemo(() => {
    const s = [...new Set(allRecords.map((r) => r.supplierName).filter(Boolean) as string[])].sort();
    return s;
  }, [allRecords]);

  // All unique categories
  const categories = useMemo(() => {
    const c = [...new Set(allRecords.map((r) => r.category).filter(Boolean) as string[])].sort();
    return ["All", ...c];
  }, [allRecords]);

  // Group by description → supplier → min price
  const comparisonData = useMemo(() => {
    const byDesc = new Map<string, { unit: string; category: string; prices: Map<string, number[]> }>();
    allRecords.forEach((r) => {
      if (!r.supplierName) return;
      if (selectedCategory !== "All" && r.category !== selectedCategory) return;
      if (searchQuery && !r.description.toLowerCase().includes(searchQuery.toLowerCase())) return;
      if (!byDesc.has(r.description)) {
        byDesc.set(r.description, { unit: r.unit, category: r.category ?? "", prices: new Map() });
      }
      const entry = byDesc.get(r.description)!;
      if (!entry.prices.has(r.supplierName)) entry.prices.set(r.supplierName, []);
      entry.prices.get(r.supplierName)!.push(Number(r.price));
    });

    return [...byDesc.entries()].map(([desc, { unit, category, prices }]) => {
      const supplierPrices: Record<string, number> = {};
      prices.forEach((vals, sup) => {
        supplierPrices[sup] = Math.min(...vals);
      });
      const vals = Object.values(supplierPrices);
      const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
      const minSup = Object.entries(supplierPrices).sort((a, b) => a[1] - b[1])[0];
      const maxSup = Object.entries(supplierPrices).sort((a, b) => b[1] - a[1])[0];
      return { desc, unit, category, supplierPrices, avg, minSup, maxSup };
    });
  }, [allRecords, selectedCategory, searchQuery]);

  // Chart data: top 5 materials average price per supplier
  const chartData = useMemo(() => {
    return comparisonData.slice(0, 5).map((item) => ({
      name: item.desc.length > 22 ? item.desc.slice(0, 22) + "…" : item.desc,
      ...item.supplierPrices,
    }));
  }, [comparisonData]);

  // Summary stats per supplier
  const supplierStats = useMemo(() => {
    return suppliers.map((sup) => {
      const prices = allRecords.filter((r) => r.supplierName === sup).map((r) => Number(r.price));
      const avg = prices.reduce((a, b) => a + b, 0) / (prices.length || 1);
      const items = new Set(allRecords.filter((r) => r.supplierName === sup).map((r) => r.description)).size;
      return { sup, avg, items, count: prices.length };
    });
  }, [allRecords, suppliers]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50" style={{ fontFamily: "'Poppins', Helvetica, sans-serif" }}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <div>
            <h1 className="text-base font-bold text-gray-900">Supplier Benchmarking</h1>
            <p className="text-xs text-gray-500">Compare material prices across your suppliers</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials…"
                className="h-9 rounded-xl border border-gray-200 pl-9 pr-4 text-sm focus:border-[#E07B39] focus:outline-none"
                data-testid="input-search"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 rounded-xl border border-gray-200 px-3 text-sm focus:border-[#E07B39] focus:outline-none"
              data-testid="select-category"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto p-6 gap-5">
          {/* Supplier summary cards */}
          {supplierStats.length > 0 && (
            <div className="flex gap-4 flex-shrink-0 flex-wrap">
              {supplierStats.slice(0, 5).map(({ sup, avg, items }) => (
                <div key={sup} className="flex-1 min-w-[180px] rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 truncate">{sup}</p>
                  <p className="mt-1 text-lg font-extrabold text-gray-900">{fmt(avg)}</p>
                  <p className="text-xs text-gray-400">avg · {items} item{items !== 1 ? "s" : ""}</p>
                </div>
              ))}
            </div>
          )}

          {/* Bar chart comparison */}
          {chartData.length > 0 && suppliers.length > 1 && (
            <div className="flex-shrink-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <p className="font-bold text-gray-900">Price Comparison by Material</p>
                <p className="text-xs text-gray-400">Lowest quoted price per supplier (₱)</p>
              </div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => abbrev(Number(v))} />
                    <Tooltip
                      formatter={(value: any, name: string) => [fmt(Number(value)), name]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {suppliers.slice(0, 5).map((sup, i) => (
                      <Bar key={sup} dataKey={sup} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={32} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detail table */}
          <div className="flex-shrink-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <p className="font-bold text-gray-900">Material Price Matrix</p>
              <span className="text-xs text-gray-400">{comparisonData.length} item{comparisonData.length !== 1 ? "s" : ""}</span>
            </div>
            {comparisonData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <BarChart2 className="h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400">No data to compare</p>
                <p className="text-xs text-gray-300">Upload a pricelist with supplier names to benchmark</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Material</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
                      {suppliers.slice(0, 4).map((s) => (
                        <th key={s} className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide truncate max-w-[120px]">{s}</th>
                      ))}
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Best</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map(({ desc, unit, category, supplierPrices, avg, minSup }) => (
                      <tr key={desc} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-gray-900 max-w-[200px]">
                          <p className="truncate">{desc}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                            <Tag className="h-3 w-3" />
                            {category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 text-xs">{unit}</td>
                        {suppliers.slice(0, 4).map((s) => {
                          const price = supplierPrices[s];
                          const isBest = minSup?.[0] === s;
                          const isWorst = price !== undefined && Object.entries(supplierPrices).sort((a, b) => b[1] - a[1])[0]?.[0] === s;
                          return (
                            <td key={s} className="px-4 py-3.5 text-right tabular-nums">
                              {price !== undefined ? (
                                <span className={`font-semibold ${isBest ? "text-green-600" : isWorst ? "text-red-500" : "text-gray-700"}`}>
                                  {fmt(price)}
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3.5 text-right">
                          {minSup ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="font-bold text-green-600">{fmt(minSup[1])}</span>
                              <span className="text-[10px] text-gray-400 truncate max-w-[100px]">{minSup[0]}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Savings opportunity callout */}
          {comparisonData.some((r) => r.minSup && r.maxSup && r.maxSup[1] - r.minSup[1] > 50) && (
            <div className="flex-shrink-0 rounded-2xl border border-green-200 bg-green-50 p-5">
              <p className="text-sm font-bold text-green-800 mb-2">💡 Savings Opportunities Found</p>
              <div className="flex flex-wrap gap-3">
                {comparisonData
                  .filter((r) => r.minSup && r.maxSup && r.maxSup[1] - r.minSup[1] > 50)
                  .slice(0, 3)
                  .map(({ desc, minSup, maxSup, unit }) => (
                    <div key={desc} className="rounded-xl bg-white border border-green-100 px-4 py-3 flex-1 min-w-[200px]">
                      <p className="text-xs font-semibold text-gray-700 truncate">{desc}</p>
                      <p className="mt-0.5 text-xs text-green-700">
                        Save up to <span className="font-bold">{fmt(maxSup![1] - minSup![1])}/{unit}</span> switching to {minSup![0]}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
