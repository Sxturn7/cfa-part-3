import React, { useState } from "react";
import { Subject, ModuleProgress } from "../types";
import { Sparkles, CloudRain, Sun, Info, Target, Award, ListChecks } from "lucide-react";

interface GrowthTreeProps {
  subjects: Subject[];
  progress: Record<string, ModuleProgress>;
  totalStudyTime: number;
}

export default function GrowthTree({ subjects, progress }: GrowthTreeProps) {
  const [hoveredSubjectId, setHoveredSubjectId] = useState<string | null>(null);
  const [isRaining, setIsRaining] = useState(false);
  const [isShining, setIsShining] = useState(false);

  // Calculate stats for each subject
  const subjectStats = subjects.map((subj) => {
    const mods = subj.modules;
    const completedCount = mods.filter(
      (m) => progress[m.id]?.status === "completed"
    ).length;
    const inProgressCount = mods.filter(
      (m) => progress[m.id]?.status === "in_progress"
    ).length;
    const pct = mods.length > 0 ? (completedCount / mods.length) * 100 : 0;
    
    // Calculate average quiz score
    const completedWithScores = mods.filter(
      (m) => progress[m.id]?.status === "completed" && progress[m.id]?.quizScore !== null
    );
    const avgScore =
      completedWithScores.length > 0
        ? completedWithScores.reduce((acc, m) => acc + (progress[m.id].quizScore || 0), 0) /
          completedWithScores.length
        : null;

    return {
      ...subj,
      completedCount,
      inProgressCount,
      percent: pct,
      avgScore,
    };
  });

  // Overall calculations
  const totalModules = subjects.reduce((sum, s) => sum + s.modules.length, 0);
  const totalCompleted = subjects.reduce(
    (sum, s) =>
      sum + s.modules.filter((m) => progress[m.id]?.status === "completed").length,
    0
  );
  const overallPct = totalModules > 0 ? (totalCompleted / totalModules) * 100 : 0;

  // Growth level definition
  let growthMilestone = "Desert Seedling";
  let growthIcon = "🌱";
  let growthDescription = "The soil is rich and ready. Sprout your first modules in Quantitative Methods to watch the foundation grow!";
  
  if (overallPct >= 80) {
    growthMilestone = "Golden Blooming Giant";
    growthIcon = "🌸";
    growthDescription = "Breathtaking coverage! Your tree is fully laden with golden score blossoms. You are fully primed to crush the actual CFA exam!";
  } else if (overallPct >= 50) {
    growthMilestone = "Verdant Forest Canopy";
    growthIcon = "🌳";
    growthDescription = "Incredible dedication. More than half of the Level I curriculum is mastered. Spaced repetition is hardening your memory.";
  } else if (overallPct >= 20) {
    growthMilestone = "Healthy Sapling";
    growthIcon = "🌿";
    growthDescription = "Multiple branches have spouted healthy leaves! Keep logging live study sessions to fill in the gaps.";
  } else if (overallPct > 0) {
    growthMilestone = "Active Sprout";
    growthIcon = "🌱";
    growthDescription = "The tree has broken ground! First leaves have sprouted. Water your branches regularly with revision tests.";
  }

  // Branch layouts
  const branches = [
    { name: "Quant Methods", x: 260, y: 350, tx: 100, ty: 280, color: "#a3b18a", subjectId: "quant" },
    { name: "Economics", x: 280, y: 330, tx: 140, ty: 210, color: "#83c5be", subjectId: "econ" },
    { name: "Port. Management", x: 290, y: 310, tx: 130, ty: 130, color: "#457b9d", subjectId: "portfolio" },
    { name: "Corp. Issuers", x: 300, y: 290, tx: 210, ty: 70, color: "#f4a261", subjectId: "corporate" },
    { name: "FSA", x: 315, y: 280, tx: 300, ty: 40, color: "#e76f51", subjectId: "fsa" },
    { name: "Equity Inv.", x: 340, y: 280, tx: 400, ty: 40, color: "#b58285", subjectId: "equity" },
    { name: "Fixed Income", x: 360, y: 290, tx: 490, ty: 70, color: "#e09f3e", subjectId: "fixed" },
    { name: "Derivatives", x: 370, y: 310, tx: 570, ty: 130, color: "#9e2a2b", subjectId: "derivatives" },
    { name: "Alt. Investments", x: 380, y: 330, tx: 560, ty: 210, color: "#3d5a80", subjectId: "alt" },
    { name: "Ethics", x: 400, y: 350, tx: 600, ty: 280, color: "#588157", subjectId: "ethics" },
  ];

  // Currently hovered subject metrics
  const activeHoveredStat = hoveredSubjectId 
    ? subjectStats.find(s => s.id === hoveredSubjectId)
    : null;

  const triggerRain = () => {
    setIsRaining(true);
    setIsShining(false);
    setTimeout(() => setIsRaining(false), 5000);
  };

  const triggerSunshine = () => {
    setIsShining(true);
    setIsRaining(false);
    setTimeout(() => setIsShining(false), 5000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl relative overflow-hidden">
      {/* Background active rain overlay */}
      {isRaining && (
        <div className="absolute inset-0 bg-blue-950/20 pointer-events-none z-10 animate-pulse">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_bottom,rgba(56,189,248,0.14)_1px,transparent_1px)] bg-[size:10px_20px] animate-rain" />
        </div>
      )}

      {/* Background active shine overlay */}
      {isShining && (
        <div className="absolute inset-0 bg-amber-500/5 pointer-events-none z-10 transition-all duration-1000">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08)_0%,transparent_70%)] animate-pulse" />
        </div>
      )}

      <div className="absolute top-0 right-0 p-4 z-20 flex gap-2">
        <button
          onClick={triggerRain}
          disabled={isRaining}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono transition border cursor-pointer ${
            isRaining
              ? "bg-blue-950/80 text-blue-400 border-blue-900"
              : "bg-slate-800 text-blue-300 border-slate-700 hover:bg-slate-750"
          }`}
          title="Water active subjects (makes in-progress modules glow!)"
        >
          <CloudRain size={12} className={isRaining ? "animate-bounce" : ""} />
          <span>{isRaining ? "Irrigating..." : "Water Tree 🌧️"}</span>
        </button>

        <button
          onClick={triggerSunshine}
          disabled={isShining}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono transition border cursor-pointer ${
            isShining
              ? "bg-amber-950/80 text-amber-400 border-amber-900"
              : "bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-750"
          }`}
          title="Shine sun (glows high quiz score flowers!)"
        >
          <Sun size={12} className={isShining ? "animate-spin-slow" : ""} />
          <span>{isShining ? "Blooming..." : "Feed Sun ☀️"}</span>
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
          🌳 Interactive Knowledge Tree
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Visual representation of your candidate coverage. Your tree sprouts leaves as you complete readings, and buds with golden blossoms when you score 75%+ on quizzes. Hover over any branch to audit specific module performance!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start relative z-10">
        
        {/* SVG visual tree stage (Takes 3 columns on large screens) */}
        <div className="lg:col-span-3 flex justify-center bg-slate-950/80 rounded-xl border border-slate-800 p-4 relative overflow-hidden min-h-[420px]">
          {/* Subtle tech background grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          {/* Active Spring Rain overlay lines */}
          {isRaining && (
            <div className="absolute top-2 left-10 text-[10px] text-blue-400 bg-blue-950/40 border border-blue-900/60 rounded px-2 py-0.5 font-mono animate-bounce">
              🌧️ Sprouted seeds are absorbing active study hours!
            </div>
          )}

          {/* Active Sunburst overlay indicator */}
          {isShining && (
            <div className="absolute top-2 left-10 text-[10px] text-amber-400 bg-amber-950/40 border border-amber-900/60 rounded px-2 py-0.5 font-mono animate-pulse">
              ☀️ Sunlit golden score flowers are blooming!
            </div>
          )}

          <svg
            viewBox="0 0 700 480"
            className="w-full max-w-[640px] h-auto drop-shadow-[0_0_15px_rgba(15,23,42,0.9)]"
          >
            <defs>
              <linearGradient id="trunkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#403c2b" />
                <stop offset="50%" stopColor="#2c2419" />
                <stop offset="100%" stopColor="#120e0a" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Earth roots base */}
            <ellipse cx="350" cy="450" rx="220" ry="20" fill="#1e293b" opacity="0.6" />
            <ellipse cx="350" cy="445" rx="160" ry="12" fill="#5A6344" opacity="0.25" />

            {/* Organic main trunk */}
            <path
              d="M320 450 C325 390, 290 350, 310 300 C320 275, 330 255, 330 230 L370 230 C370 255, 380 275, 390 300 C410 350, 375 390, 380 450 Z"
              fill="url(#trunkGrad)"
            />

            {/* Bark wood grain detail */}
            <path
              d="M335 410 C340 380, 345 330, 355 295 L360 295 C350 330, 345 380, 340 410"
              stroke="#5a4d3c"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M362 430 C365 400, 358 350, 365 315"
              stroke="#5a4d3c"
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
            />

            {/* Draw Branches */}
            {branches.map((b, idx) => {
              const stat = subjectStats.find((s) => s.id === b.subjectId)!;
              const hasCompleted = stat.completedCount > 0;
              const hasInProgress = stat.inProgressCount > 0;
              const isHovered = hoveredSubjectId === b.subjectId;

              // Compute branch color based on progress status and user active state
              let strokeColor = "#334155"; // not started gray
              if (hasCompleted) {
                strokeColor = b.color;
              } else if (hasInProgress) {
                strokeColor = "#38bdf8"; // highlighted in-progress color
              }

              // Double size glow effect during spring rain or hovered branch
              let glowColor = b.color;
              let extraGlowClass = "";
              if (isRaining && hasInProgress) {
                glowColor = "#38bdf8";
                extraGlowClass = "animate-pulse stroke-2";
              } else if (isShining && stat.avgScore !== null && stat.avgScore >= 75) {
                glowColor = "#fbbf24";
                extraGlowClass = "animate-pulse";
              }

              // Compute leaves array based on completion progress
              const leafCount = Math.ceil((stat.completedCount / stat.modules.length) * 14);
              const leafArray = Array.from({ length: leafCount });

              // Golden blossom if average score >= 75%
              const hasBlossom = stat.avgScore !== null && stat.avgScore >= 75;

              return (
                <g 
                  key={b.name} 
                  onMouseEnter={() => setHoveredSubjectId(b.subjectId)}
                  onMouseLeave={() => setHoveredSubjectId(null)}
                  className="transition-all duration-300 ease-in-out cursor-pointer"
                >
                  {/* Outer aura branch guide glow */}
                  {(isHovered || (isRaining && hasInProgress) || (isShining && hasBlossom)) && (
                    <path
                      d={`M${b.x} ${b.y} Q${(b.x + b.tx) / 2 + 10} ${(b.y + b.ty) / 2 - 20}, ${b.tx} ${b.ty}`}
                      fill="none"
                      stroke={glowColor}
                      strokeWidth={14}
                      strokeLinecap="round"
                      opacity="0.25"
                      className="transition-all duration-300"
                    />
                  )}

                  {/* Standard Branch bezier curve */}
                  <path
                    d={`M${b.x} ${b.y} Q${(b.x + b.tx) / 2 + 10} ${(b.y + b.ty) / 2 - 20}, ${b.tx} ${b.ty}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isHovered ? 5.5 : 3.5}
                    strokeLinecap="round"
                    className={`transition-all duration-300 ${extraGlowClass}`}
                  />

                  {/* Tiny decorative terminal buds/points at tips */}
                  <circle cx={b.tx} cy={b.ty} r={isHovered ? 4.5 : 3} fill={hasCompleted ? b.color : "#475569"} />

                  {/* Leaf items generated on the branch */}
                  {leafArray.map((_, leafIdx) => {
                    // Bezier interpolation logic for placing leaf coordinates
                    const t = (leafIdx + 1) / (leafCount + 1);
                    const bxControl = (b.x + b.tx) / 2 + 10;
                    const byControl = (b.y + b.ty) / 2 - 20;

                    const mt = 1 - t;
                    const lx = mt * mt * b.x + 2 * mt * t * bxControl + t * t * b.tx;
                    const ly = mt * mt * b.y + 2 * mt * t * byControl + t * t * b.ty;

                    // Leaf styling
                    const angle = (leafIdx % 2 === 0 ? 35 : -35) + (t * 22);
                    let leafFill = b.color;
                    
                    if (isShining && hasBlossom && leafIdx < 3) {
                      leafFill = "#fbbf24"; // flash with golden yellow
                    }

                    return (
                      <g key={leafIdx} transform={`translate(${lx}, ${ly}) rotate(${angle})`}>
                        <path
                          d="M0 0 Q-5 -8, 0 -15 Q5 -8, 0 0"
                          fill={leafFill}
                          fillOpacity={isHovered ? 0.95 : 0.8}
                          stroke="#020617"
                          strokeWidth="0.5"
                          className="transition-all duration-300"
                        />
                      </g>
                    );
                  })}

                  {/* Glowing Flowers (Quiz Averages >= 75%) */}
                  {hasBlossom && (
                    <g transform={`translate(${b.tx}, ${b.ty - 6})`}>
                      <circle cx="0" cy="0" r="8" fill="#fbbf24" opacity="0.4" className="animate-ping" />
                      {/* Petals */}
                      <circle cx="-3" cy="0" r="3" fill="#fbbf24" />
                      <circle cx="3" cy="0" r="3" fill="#fbbf24" />
                      <circle cx="0" cy="-3" r="3" fill="#fbbf24" />
                      <circle cx="0" cy="3" r="3" fill="#fbbf24" />
                      <circle cx="0" cy="0" r="2.5" fill="#f59e0b" />
                    </g>
                  )}

                  {/* In Progress indicator */}
                  {hasInProgress && !hasCompleted && (
                    <g transform={`translate(${b.tx}, ${b.ty - 6})`} className="animate-bounce">
                      <circle cx="0" cy="0" r="4.5" fill="#38bdf8" />
                      <circle cx="0" cy="0" r="6" fill="#38bdf8" opacity="0.3" className="animate-ping" />
                    </g>
                  )}

                  {/* Floating micro branch tags */}
                  <g transform={`translate(${b.tx}, ${b.ty - (hasBlossom ? 16 : 10)})`}>
                    <rect
                      x="-42"
                      y="-8"
                      width="84"
                      height="15"
                      rx="3.5"
                      fill="#030712"
                      stroke={isHovered ? b.color : "#1e293b"}
                      strokeWidth={isHovered ? 1.5 : 1}
                      opacity={isHovered ? 0.95 : 0.75}
                    />
                    <text
                      textAnchor="middle"
                      fill={hasCompleted ? "#f8fafc" : "#94a3b8"}
                      fontSize="7.5"
                      fontFamily="monospace"
                      fontWeight={isHovered ? "bold" : "normal"}
                      y="2"
                    >
                      {stat.name.length > 12 ? stat.name.substring(0, 10) + ".." : stat.name}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Tree Central Root Core */}
            <g transform="translate(350, 415)">
              <rect x="-65" y="-13" width="130" height="26" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <text textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold" y="3" letterSpacing="0.5">
                CFA LEVEL I ENGINE
              </text>
            </g>
          </svg>
        </div>

        {/* Dynamic Bento Box Analytics sidebar (Takes 1 column) */}
        <div className="space-y-4 h-full flex flex-col justify-between">
          
          {/* Active Hover Details Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex-1">
            <h4 className="text-[10px] font-bold uppercase font-mono text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-3">
              <Info size={12} className="text-blue-400" /> Hover branch diagnostic
            </h4>

            {activeHoveredStat ? (
              <div className="space-y-3.5 animate-fadeIn">
                <div>
                  <span 
                    className="text-xs font-bold px-2 py-0.5 rounded font-mono text-slate-900 uppercase block w-max"
                    style={{ backgroundColor: activeHoveredStat.color }}
                  >
                    {activeHoveredStat.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    Exam weight: {activeHoveredStat.weight}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <div className="text-[9px] text-slate-500 font-mono">COMPLETED</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono">
                      {activeHoveredStat.completedCount} / {activeHoveredStat.modules.length}
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <div className="text-[9px] text-slate-500 font-mono">QUIZ AVG</div>
                    <div className="text-xs font-bold text-indigo-400 font-mono">
                      {activeHoveredStat.avgScore !== null ? `${Math.round(activeHoveredStat.avgScore)}%` : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Next recommended module */}
                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850">
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">NEXT STUDY OBJECTIVE:</span>
                  <span className="text-[11px] text-slate-200 block font-medium mt-0.5 truncate">
                    {activeHoveredStat.modules.find(m => !progress[m.id] || progress[m.id].status !== "completed")?.name || "All modules completed! ✨"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 space-y-2">
                <p className="text-[11px]">Hover over any subject's branch, leaves, or label to display detailed module performance metrics instantly!</p>
              </div>
            )}
          </div>

          {/* Overall Ecosystem Level Bento Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-[10px] font-bold uppercase font-mono text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-3">
              <Target size={12} className="text-amber-500" /> Tree maturity status
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{growthIcon}</div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{growthMilestone}</span>
                  <span className="text-[9px] text-slate-400 font-mono uppercase">Ecosystem Milestone</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-850">
                {growthDescription}
              </p>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Grand Progress</span>
                  <span className="text-emerald-400 font-bold">{overallPct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
