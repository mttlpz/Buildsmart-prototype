import { useEffect, useState } from "react";
import { CheckCircle2, Zap } from "lucide-react";

interface GeneratingQuotationScreenProps {
  onComplete: () => void;
}

const STAGES = [
  { label: "Analyzing segment dimensions & materials…", duration: 1600 },
  { label: "Fetching live supplier pricing…",           duration: 1400 },
  { label: "Benchmarking labor & equipment rates…",    duration: 1500 },
  { label: "Computing Practical scenario…",            duration: 1300 },
  { label: "Computing Premium scenario…",              duration: 1200 },
  { label: "Finalizing quote comparison…",             duration: 1000 },
];

const PRICE_PAIRS = [
  { a: 2_139_200, b: 2_956_800 },
  { a: 2_326_800, b: 3_208_800 },
  { a: 2_413_600, b: 3_466_400 },
  { a: 2_507_680, b: 3_662_400 },
  { a: 2_537_920, b: 3_799_600 },
];

function DonutRing({ progress }: { progress: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;
  return (
    <svg width="140" height="140" className="rotate-[-90deg]">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f3f0eb" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke="#E07B39"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
    </svg>
  );
}

export function GeneratingQuotationScreen({ onComplete }: GeneratingQuotationScreenProps) {
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [priceIdx, setPriceIdx] = useState(0);
  const [done, setDone]         = useState(false);
  const [flipState, setFlipState] = useState(false);
  const [countUp, setCountUp]   = useState({ a: 0, b: 0 });

  useEffect(() => {
    const total = STAGES.reduce((s, st) => s + st.duration, 0);
    let elapsed = 0;
    let si = 0;
    const run = () => {
      if (si >= STAGES.length) { setDone(true); setTimeout(onComplete, 1200); return; }
      setStageIdx(si);
      const st = STAGES[si];
      const steps = 30;
      const stepMs = st.duration / steps;
      const startProg = (elapsed / total) * 100;
      const endProg = ((elapsed + st.duration) / total) * 100;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        setProgress(startProg + ((endProg - startProg) * step) / steps);
        if (step >= steps) { clearInterval(timer); elapsed += st.duration; si++; run(); }
      }, stepMs);
    };
    run();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setPriceIdx(p => (p + 1) % PRICE_PAIRS.length);
      setFlipState(f => !f);
    }, 900);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const pair = PRICE_PAIRS[priceIdx];
    let tick = 0;
    const t = setInterval(() => {
      tick++;
      const frac = Math.min(tick / 8, 1);
      setCountUp({ a: Math.round(frac * pair.a), b: Math.round(frac * pair.b) });
      if (frac >= 1) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [priceIdx]);

  const fmt = (n: number) => "₱" + n.toLocaleString("en-PH");

  const CARD_POSITIONS = [
    { x: -160, y: -20, rotate: -12, scale: 0.92, opacity: 0.85, label: "Practical", price: "₱2.54M", color: "orange" },
    { x:  160, y: -20, rotate:  12, scale: 0.92, opacity: 0.85, label: "Premium",   price: "₱3.80M", color: "blue"   },
    { x:  -80, y:  40, rotate:  -6, scale: 0.88, opacity: 0.55, label: "Option C",  price: "₱3.08M", color: "orange" },
    { x:   80, y:  40, rotate:   6, scale: 0.88, opacity: 0.55, label: "Option D",  price: "₱4.03M", color: "blue"   },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center bg-white rounded-xl overflow-hidden">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-10">

        {/* Animated card stage */}
        <div className="relative flex h-64 w-full items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-80 rounded-full bg-[#E07B39]/10 blur-3xl" />
          </div>

          {CARD_POSITIONS.map((c, i) => (
            <div key={i} className="absolute rounded-2xl border shadow-lg"
              style={{
                width: 160, height: 100,
                transform: `translate(${c.x}px, ${c.y}px) rotate(${c.rotate}deg) scale(${c.scale})`,
                opacity: c.opacity,
                background: c.color === "orange" ? "#fff7f0" : "#f0f4ff",
                borderColor: c.color === "orange" ? "#E07B39" : "#818cf8",
                transition: "all 0.9s cubic-bezier(0.34,1.56,0.64,1)",
              }}>
              <div className="p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: c.color === "orange" ? "#E07B39" : "#818cf8" }}>{c.label}</p>
                <p className="mt-1 text-base font-bold text-gray-800">{c.price}</p>
                <div className="mt-2 h-1 rounded-full" style={{ background: c.color === "orange" ? "#E07B39" : "#818cf8", opacity: 0.3, width: "60%" }} />
              </div>
            </div>
          ))}

          <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-xl">
            <div className="flex flex-col items-center rounded-xl border border-[#E07B39]/30 bg-[#fff7f0] px-5 py-3 transition-all duration-300"
              style={{ transform: flipState ? "translateY(-4px)" : "translateY(0)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#E07B39]">Practical</p>
              <p className="mt-1 text-lg font-bold text-gray-900 tabular-nums">{fmt(countUp.a)}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">VS</div>
            <div className="flex flex-col items-center rounded-xl border border-indigo-200 bg-[#f0f4ff] px-5 py-3 transition-all duration-300"
              style={{ transform: flipState ? "translateY(0)" : "translateY(-4px)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500">Premium</p>
              <p className="mt-1 text-lg font-bold text-gray-900 tabular-nums">{fmt(countUp.b)}</p>
            </div>
          </div>
        </div>

        {/* Donut + stages */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <DonutRing progress={progress} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {done ? <CheckCircle2 className="h-8 w-8 text-[#E07B39]" /> : (
                <><p className="text-xl font-bold text-gray-900">{Math.round(progress)}%</p><Zap className="h-3.5 w-3.5 text-[#E07B39]" /></>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 text-center">
            {STAGES.map((s, i) => (
              <p key={i} className={`text-sm transition-all duration-300 ${
                i < stageIdx ? "text-green-500 line-through opacity-50" :
                i === stageIdx ? "font-semibold text-[#E07B39]" : "text-gray-300"
              }`}>
                {i < stageIdx ? "✓ " : i === stageIdx ? "⟳ " : "  "}{s.label}
              </p>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          BuildSmart is analyzing your 17 segments across 2 floors — this usually takes under 10 seconds.
        </p>
      </div>
    </div>
  );
}
