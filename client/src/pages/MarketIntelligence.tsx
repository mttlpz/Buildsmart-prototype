import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Filter, RefreshCw, Info, BarChart2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";

const SEED_HISTORICAL = [
  // Waterproofing
  { materialCategory: "Waterproofing", description: "Waterproofing Membrane", quarter: "Q1 2025", price: 1450, region: "NCR" },
  { materialCategory: "Waterproofing", description: "Waterproofing Membrane", quarter: "Q2 2025", price: 1510, region: "NCR" },
  { materialCategory: "Waterproofing", description: "Waterproofing Membrane", quarter: "Q3 2025", price: 1540, region: "NCR" },
  { materialCategory: "Waterproofing", description: "Waterproofing Membrane", quarter: "Q4 2025", price: 1580, region: "NCR" },
  { materialCategory: "Waterproofing", description: "Waterproofing Membrane", quarter: "Q1 2026", price: 1596, region: "NCR" },
  // Sealants
  { materialCategory: "Sealants", description: "Polyurethane Sealant", quarter: "Q1 2025", price: 480, region: "NCR" },
  { materialCategory: "Sealants", description: "Polyurethane Sealant", quarter: "Q2 2025", price: 510, region: "NCR" },
  { materialCategory: "Sealants", description: "Polyurethane Sealant", quarter: "Q3 2025", price: 535, region: "NCR" },
  { materialCategory: "Sealants", description: "Polyurethane Sealant", quarter: "Q4 2025", price: 548, region: "NCR" },
  { materialCategory: "Sealants", description: "Polyurethane Sealant", quarter: "Q1 2026", price: 560, region: "NCR" },
  // Primers
  { materialCategory: "Primers", description: "Surface Primer", quarter: "Q1 2025", price: 520, region: "NCR" },
  { materialCategory: "Primers", description: "Surface Primer", quarter: "Q2 2025", price: 545, region: "NCR" },
  { materialCategory: "Primers", description: "Surface Primer", quarter: "Q3 2025", price: 560, region: "NCR" },
  { materialCategory: "Primers", description: "Surface Primer", quarter: "Q4 2025", price: 572, region: "NCR" },
  { materialCategory: "Primers", description: "Surface Primer", quarter: "Q1 2026", price: 580, region: "NCR" },
  // Drainage
  { materialCategory: "Drainage", description: "Drain Channel 100mm", quarter: "Q1 2025", price: 1400, region: "NCR" },
  { materialCategory: "Drainage", description: "Drain Channel 100mm", quarter: "Q2 2025", price: 1450, region: "NCR" },
  { materialCategory: "Drainage", description: "Drain Channel 100mm", quarter: "Q3 2025", price: 1510, region: "NCR" },
  { materialCategory: "Drainage", description: "Drain Channel 100mm", quarter: "Q4 2025", price: 1560, region: "NCR" },
  { materialCategory: "Drainage", description: "Drain Channel 100mm", quarter: "Q1 2026", price: 1596, region: "NCR" },
];

const COLORS = ["#E07B39", "#4f46e5", "#10b981", "#f59e0b", "#06b6d4", "#8b5cf6"];
const QUARTERS = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026"];

function generateInsight(category: string, data: { quarter: string; price: number }[]): string {
  if (data.length < 2) return "Insufficient data to generate insights.";
  const first = data[0].price;
  const last = data[data.length - 1].price;
  const change = ((last - first) / first * 100).toFixed(1);
  const dir = last > first ? "increased" : last < first ? "decreased" : "remained stable";
  const recent = data.length >= 2 ? ((last - data[data.length - 2].price) / data[data.length - 2].price * 100).toFixed(1) : "0";
  return `${category} prices ${dir} by ${Math.abs(Number(change))}% over the past year (${data[0].quarter} to ${data[data.length - 1].quarter}). Most recent quarter-on-quarter movement: ${Number(recent) > 0 ? "+" : ""}${recent}%. ${Number(change) > 10 ? "Significant upward pressure detected — consider updating your pricelist and reviewing quotation markups." : Number(change) < -5 ? "A notable price drop may signal supplier competition or surplus — a good time to negotiate better terms." : "Prices are relatively stable in this category."}`;
}

const REGIONS = ["NCR", "Region I", "Region III", "CALABARZON", "Region VII", "Region XI"];

function fmt(n: number) {
  return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

export function MarketIntelligence() {
  const [selectedRegion, setSelectedRegion] = useState("NCR");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: historicalData = [] } = useQuery<any[]>({
    queryKey: ["/api/historical-prices"],
  });

  const allData = historicalData.length > 0 ? historicalData : SEED_HISTORICAL;

  const categories = useMemo(() => {
    const cats = [...new Set(allData.map((r: any) => r.materialCategory))].sort();
    return ["All", ...cats];
  }, [allData]);

  const filtered = useMemo(() => {
    return allData.filter((r: any) => {
      const matchRegion = !r.region || r.region === selectedRegion;
      const matchCat = selectedCategory === "All" || r.materialCategory === selectedCategory;
      return matchRegion && matchCat;
    });
  }, [allData, selectedRegion, selectedCategory]);

  const byCategory = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    filtered.forEach((r: any) => {
      if (!map.has(r.materialCategory)) map.set(r.materialCategory, new Map());
      map.get(r.materialCategory)!.set(r.quarter, Number(r.price));
    });
    return map;
  }, [filtered]);

  const chartData = useMemo(() => {
    return QUARTERS.map(q => {
      const row: any = { quarter: q };
      byCategory.forEach((qMap, cat) => {
        row[cat] = qMap.get(q) ?? null;
      });
      return row;
    });
  }, [byCategory]);

  const categoryList = [...byCategory.keys()];

  const TrendIndicator = ({ category }: { category: string }) => {
    const qMap = byCategory.get(category);
    if (!qMap || qMap.size < 2) return <Minus className="h-4 w-4 text-gray-400" />;
    const vals = QUARTERS.map(q => qMap.get(q)).filter(Boolean) as number[];
    if (vals.length < 2) return <Minus className="h-4 w-4 text-gray-400" />;
    const diff = vals[vals.length - 1] - vals[vals.length - 2];
    return diff > 0 ? <TrendingUp className="h-4 w-4 text-red-500" /> :
           diff < 0 ? <TrendingDown className="h-4 w-4 text-green-500" /> :
           <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-['Poppins',Helvetica,sans-serif]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <div>
            <h1 className="text-base font-bold text-gray-900">Analyze Market Intelligence</h1>
            <p className="text-xs text-gray-500">Historical price trends by material category and region</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E07B39] text-sm font-bold text-white">JC</div>
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">John Contractor</p>
              <p className="text-[10px] text-gray-500">JC Waterproofing Inc.</p>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto p-6 gap-5">
          {/* Filter bar */}
          <div className="flex flex-shrink-0 items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <Filter className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500">Region</label>
              <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-[#E07B39] focus:outline-none">
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500">Category</label>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-[#E07B39] focus:outline-none">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="ml-auto flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5">
              <Info className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs text-blue-600">Data sourced from uploaded pricelists & DPWH CMPD · Q1 2025 – Q1 2026</span>
            </div>
          </div>

          {/* Summary cards */}
          <div className="flex flex-shrink-0 gap-4">
            {categoryList.slice(0, 4).map((cat, i) => {
              const qMap = byCategory.get(cat)!;
              const vals = QUARTERS.map(q => qMap.get(q)).filter(Boolean) as number[];
              const latest = vals[vals.length - 1];
              const prev = vals[vals.length - 2];
              const change = prev ? ((latest - prev) / prev * 100) : 0;
              return (
                <div key={cat} className="flex flex-1 flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">{cat}</span>
                    <TrendIndicator category={cat} />
                  </div>
                  <p className="text-xl font-extrabold text-gray-900">{latest ? fmt(latest) : "—"}</p>
                  <p className={`text-xs font-semibold ${change > 0 ? "text-red-500" : change < 0 ? "text-green-600" : "text-gray-400"}`}>
                    {change > 0 ? "+" : ""}{change.toFixed(1)}% vs last quarter
                  </p>
                </div>
              );
            })}
          </div>

          {/* Main chart */}
          {chartData.length > 0 && categoryList.length > 0 ? (
            <div className="flex flex-shrink-0 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Price Trends — {selectedRegion}</p>
                  <p className="text-xs text-gray-400">Average unit price per material category across quarters</p>
                </div>
                <div className="flex gap-4">
                  {categoryList.map((cat, i) => (
                    <div key={cat} className="flex items-center gap-1.5">
                      <div className="h-2 w-4 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-gray-500">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} tickFormatter={v => "₱" + Number(v).toLocaleString()} />
                    <Tooltip
                      formatter={(value: any, name: string) => [fmt(Number(value)), name]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                    />
                    {categoryList.map((cat, i) => (
                      <Line key={cat} type="monotone" dataKey={cat} stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2.5} dot={{ fill: COLORS[i % COLORS.length], r: 4 }} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="flex flex-shrink-0 h-48 items-center justify-center rounded-2xl border border-gray-200 bg-white">
              <div className="text-center">
                <BarChart2 className="h-8 w-8 mx-auto text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">No price data for this region/category</p>
                <p className="text-xs text-gray-300">Upload a pricelist to start tracking trends</p>
              </div>
            </div>
          )}

          {/* AI Insights per category */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">AI Price Insights</p>
            {categoryList.map((cat, i) => {
              const qMap = byCategory.get(cat)!;
              const dataPoints = QUARTERS.map(q => ({ quarter: q, price: qMap.get(q) ?? 0 })).filter(d => d.price > 0);
              const insight = generateInsight(cat, dataPoints);
              return (
                <div key={cat} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: COLORS[i % COLORS.length] + "18" }}>
                    <TrendingUp className="h-5 w-5" style={{ color: COLORS[i % COLORS.length] }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{cat}</p>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">{insight}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
