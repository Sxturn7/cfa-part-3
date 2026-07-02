import React, { useState } from "react";
import { Subject, ModuleProgress, ModuleStatus, LearningModule } from "../types";
import {
  Layers,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Target,
  Check,
  PlayCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Clock,
  Sparkles
} from "lucide-react";

interface GrowthTreeProps {
  subjects: Subject[];
  progress: Record<string, ModuleProgress>;
  totalStudyTime: number;
}

interface Point {
  x: number;
  y: number;
}

// Map Tailwind color names to beautiful high-vibrancy HEX codes for SVG rendering
const COLOR_MAP: Record<string, string> = {
  emerald: "#10B981", // Quant
  blue: "#3B82F6",    // Econ
  cyan: "#06B6D4",    // FSA
  indigo: "#6366F1",  // Corp
  pink: "#EC4899",    // Equity
  rose: "#F43F5E",    // Fixed Income
  violet: "#8B5CF6",  // Derivatives
  amber: "#F59E0B",   // Alt Investments
  teal: "#14B8A6",    // Portfolio
  purple: "#A855F7"   // Ethics
};

// Return lighter colors for hover/active states
const LIGHT_COLOR_MAP: Record<string, string> = {
  emerald: "#34D399",
  blue: "#60A5FA",
  cyan: "#22D3EE",
  indigo: "#818CF8",
  pink: "#F472B6",
  rose: "#FB7185",
  violet: "#A78BFA",
  amber: "#FBBF24",
  teal: "#2DD4BF",
  purple: "#C084FC"
};

// Calculate coordinates along a cubic Bezier curve
function getCubicBezierPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
}

// Calculate the tangent vector along a cubic Bezier curve (for organic leaf staggering)
function getCubicBezierTangent(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  const dx = 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x);
  const dy = 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y);

  return { x: dx, y: dy };
}

export default function GrowthTree({ subjects, progress, totalStudyTime }: GrowthTreeProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "quant");
  const [hoveredSubjectId, setHoveredSubjectId] = useState<string | null>(null);
  const [hoveredModule, setHoveredModule] = useState<{ module: LearningModule; subject: Subject; x: number; y: number } | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "active" | "mastered">("all");

  // Subject configurations inside our 800x640 canvas
  // Alternate left/right, growing from bottom to top of the trunk
  const BRANCH_CONFIGS: Record<string, { side: "left" | "right"; endY: number; startY: number }> = {
    ethics:      { side: "left",  endY: 130, startY: 190 }, // Topmost Left
    quant:       { side: "right", endY: 160, startY: 230 }, // Topmost Right
    econ:        { side: "left",  endY: 210, startY: 280 },
    fsa:         { side: "right", endY: 250, startY: 320 },
    corp:        { side: "left",  endY: 300, startY: 370 },
    equity:      { side: "right", endY: 340, startY: 410 },
    fixed:       { side: "left",  endY: 390, startY: 450 },
    derivatives: { side: "right", endY: 430, startY: 490 },
    alt:         { side: "left",  endY: 480, startY: 530 },
    portfolio:   { side: "right", endY: 520, startY: 560 }, // Bottommost Right
  };

  // Compile full statistics for subjects
  const subjectStats = subjects.map((subj) => {
    const mods = subj.modules;
    const completedCount = mods.filter(
      (m) => progress[m.id]?.status === ModuleStatus.COMPLETED
    ).length;
    const inProgressCount = mods.filter(
      (m) => progress[m.id]?.status === ModuleStatus.IN_PROGRESS
    ).length;
    const pct = mods.length > 0 ? (completedCount / mods.length) * 100 : 0;
    
    const completedWithScores = mods.filter(
      (m) => progress[m.id]?.status === ModuleStatus.COMPLETED && progress[m.id]?.quizScore !== null
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

  // Calculate overall metrics
  const totalModules = subjects.reduce((sum, s) => sum + s.modules.length, 0);
  const totalCompleted = subjects.reduce(
    (sum, s) =>
      sum + s.modules.filter((m) => progress[m.id]?.status === ModuleStatus.COMPLETED).length,
    0
  );
  const overallPct = totalModules > 0 ? (totalCompleted / totalModules) * 100 : 0;

  const selectedSubject = subjectStats.find((s) => s.id === selectedSubjectId) || subjectStats[0];

  // Apply filters if any
  const filteredSubjects = subjectStats.filter((subj) => {
    if (filterMode === "active") return subj.completedCount > 0 || subj.inProgressCount > 0;
    if (filterMode === "mastered") return subj.avgScore !== null && subj.avgScore >= 75;
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl relative overflow-hidden font-sans">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="text-emerald-500 h-5 w-5" />
            <span>Interactive Curriculum Knowledge Tree</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            An organic representation of your CFA Level I syllabus. Branches reflect subject streams, while growing staggered leaves represent individual modules. Hover to inspect, click to drill down.
          </p>
        </div>

        {/* View Mode Filters */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0 select-none">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition cursor-pointer ${
              filterMode === "all" ? "bg-emerald-600 text-white" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            All Subjects
          </button>
          <button
            onClick={() => setFilterMode("active")}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition cursor-pointer ${
              filterMode === "active" ? "bg-emerald-600 text-white" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterMode("mastered")}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition cursor-pointer ${
              filterMode === "mastered" ? "bg-emerald-600 text-white" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            High Scores (75%+)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left SVG Area - The Interactive Tree */}
        <div className="lg:col-span-2 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4 relative overflow-hidden flex items-center justify-center min-h-[500px]">
          
          {/* Subtle Cybernetic Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Core Legend Overlay */}
          <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-[10px] space-y-1 z-10">
            <span className="font-semibold text-slate-300 uppercase block tracking-wider mb-1">Leaf Status:</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-sm shadow-blue-500/50" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-750 border border-slate-600" />
              <span>Unstarted</span>
            </div>
          </div>

          <svg
            className="w-full h-auto max-w-[760px] aspect-[5/4]"
            viewBox="0 0 800 640"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* SVG Definitions for Gradients and Glow Filters */}
            <defs>
              {/* Organic Trunk Gradient */}
              <linearGradient id="trunkGrad" x1="400" y1="600" x2="400" y2="80">
                <stop offset="0%" stopColor="#0B0F19" />
                <stop offset="40%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>

              {/* Glowing effects */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Subject gradients to represent flowing knowledge streams */}
              {subjects.map((subj) => {
                const color = COLOR_MAP[subj.color] || "#3b82f6";
                return (
                  <linearGradient
                    key={`grad-${subj.id}`}
                    id={`branchGrad-${subj.id}`}
                    x1="400"
                    y1="320"
                    x2={BRANCH_CONFIGS[subj.id]?.side === "left" ? "140" : "660"}
                    y2={BRANCH_CONFIGS[subj.id]?.endY || 320}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#334155" stopOpacity="0.4" />
                    <stop offset="100%" stopColor={color} />
                  </linearGradient>
                );
              })}
            </defs>

            {/* DRAW ROOT SYSTEMS (Subtle lines spreading at bottom) */}
            <path
              d="M 380,610 Q 340,630 300,635 M 400,610 Q 400,635 410,640 M 420,610 Q 460,630 500,635"
              stroke="#1E293B"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* DRAW THE CORE SYLLABUS TRUNK */}
            {/* Organic tapering path starting broad at base Y=600 and narrowing at Y=80 */}
            <path
              d="M 360,600 C 375,350 388,180 395,80 L 405,80 C 412,180 425,350 440,600 Z"
              fill="url(#trunkGrad)"
              stroke="#0B0F19"
              strokeWidth="2"
            />

            {/* Inner "Sap" Flow Line - glows brighter based on overall coverage percentage */}
            <path
              d="M 400,580 C 400,450 400,250 400,90"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={0.15 + (overallPct / 100) * 0.65}
              filter="url(#glow)"
            />

            {/* CENTRAL CORE BASE - CFA LEVEL I CORE CONTAINER */}
            <g className="cursor-pointer" onClick={() => setSelectedSubjectId("all")}>
              <circle
                cx="400"
                cy="580"
                r="24"
                fill="#0F172A"
                stroke="#1E293B"
                strokeWidth="3"
                className="transition-all duration-300 hover:scale-105"
              />
              <circle
                cx="400"
                cy="580"
                r="20"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.5"
                opacity="0.8"
                className="animate-pulse"
              />
              <text
                x="400"
                y="584"
                fill="#F8FAFC"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
              >
                CFA I
              </text>
            </g>

            {/* DRAW SUBJECT BRANCHES & MODULE LEAVES */}
            {subjectStats.map((subj) => {
              const config = BRANCH_CONFIGS[subj.id];
              if (!config) return null;

              const isLeft = config.side === "left";
              const startPoint: Point = { x: 400, y: config.startY };
              const endPoint: Point = { x: isLeft ? 140 : 660, y: config.endY };

              // Cubic Bezier control points to sweep down then outwards and upwards
              const cp1: Point = {
                x: isLeft ? 330 : 470,
                y: config.startY + 15
              };
              const cp2: Point = {
                x: isLeft ? 220 : 580,
                y: config.endY - 5
              };

              // Determine highlights
              const isSelected = selectedSubjectId === subj.id;
              const isHovered = hoveredSubjectId === subj.id;
              const isDimmed =
                (hoveredSubjectId !== null && !isHovered) ||
                (hoveredSubjectId === null && selectedSubjectId !== "all" && !isSelected);

              const strokeColor = COLOR_MAP[subj.color] || "#3b82f6";
              const hoverColor = LIGHT_COLOR_MAP[subj.color] || strokeColor;

              return (
                <g
                  key={subj.id}
                  className="transition-all duration-300"
                  opacity={isDimmed ? 0.22 : 1}
                >
                  {/* Subtle branch background/path glow */}
                  <path
                    d={`M ${startPoint.x},${startPoint.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${endPoint.x},${endPoint.y}`}
                    stroke={strokeColor}
                    strokeWidth={isSelected || isHovered ? "12" : "5"}
                    opacity={isSelected || isHovered ? "0.08" : "0"}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />

                  {/* Flowing branch line */}
                  <path
                    d={`M ${startPoint.x},${startPoint.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${endPoint.x},${endPoint.y}`}
                    stroke={`url(#branchGrad-${subj.id})`}
                    strokeWidth={isSelected || isHovered ? "4" : "2.2"}
                    strokeLinecap="round"
                    className="transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedSubjectId(subj.id)}
                    onMouseEnter={() => setHoveredSubjectId(subj.id)}
                    onMouseLeave={() => setHoveredSubjectId(null)}
                  />

                  {/* MODULE LEAF NODES (Staggered along the Bezier curve) */}
                  {subj.modules.map((mod, index) => {
                    const modProgress = progress[mod.id];
                    const isCompleted = modProgress?.status === ModuleStatus.COMPLETED;
                    const isInProgress = modProgress?.status === ModuleStatus.IN_PROGRESS;

                    // Place leaf between t = 0.22 and 0.82
                    const t = 0.22 + (0.60 * index) / Math.max(1, subj.modules.length - 1);
                    const curvePt = getCubicBezierPoint(startPoint, cp1, cp2, endPoint, t);
                    const tangent = getCubicBezierTangent(startPoint, cp1, cp2, endPoint, t);

                    // Normalize tangent to find perpendicular vector
                    const len = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
                    const nx = len > 0 ? -tangent.y / len : 0;
                    const ny = len > 0 ? tangent.x / len : 0;

                    // Stagger leaf on alternative sides of the branch line
                    const staggerOffset = (index % 2 === 0 ? 1 : -1) * 11;
                    const leafX = curvePt.x + nx * staggerOffset;
                    const leafY = curvePt.y + ny * staggerOffset;

                    // Leaf color matching its learning status
                    const fill = isCompleted
                      ? strokeColor
                      : isInProgress
                      ? "#3B82F6"
                      : "#1E293B";

                    const stroke = isCompleted
                      ? "#FFFFFF"
                      : isInProgress
                      ? "#60A5FA"
                      : "#334155";

                    const isLeafHovered = hoveredModule?.module.id === mod.id;

                    return (
                      <g
                        key={mod.id}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={(e) => {
                          setHoveredSubjectId(subj.id);
                          setHoveredModule({
                            module: mod,
                            subject: subj,
                            x: leafX,
                            y: leafY
                          });
                        }}
                        onMouseLeave={() => {
                          setHoveredSubjectId(null);
                          setHoveredModule(null);
                        }}
                        onClick={() => {
                          setSelectedSubjectId(subj.id);
                        }}
                      >
                        {/* Little leaf-connecting stem */}
                        <line
                          x1={curvePt.x}
                          y1={curvePt.y}
                          x2={leafX}
                          y2={leafY}
                          stroke="#475569"
                          strokeWidth="1"
                          opacity="0.6"
                        />

                        {/* Outer pulsing ring for in-progress leaves */}
                        {isInProgress && (
                          <circle
                            cx={leafX}
                            cy={leafY}
                            r={isLeafHovered ? "11" : "8"}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="1.5"
                            className="animate-ping opacity-40"
                          />
                        )}

                        {/* Leaf node shape */}
                        <circle
                          cx={leafX}
                          cy={leafY}
                          r={isLeafHovered ? "7" : "5"}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={isLeafHovered ? "2.5" : "1.2"}
                          className="transition-all duration-200 shadow-sm"
                          filter={isCompleted || isInProgress ? "url(#glow)" : undefined}
                        />
                      </g>
                    );
                  })}

                  {/* TERMINAL SUBJECT NODE (BUD) */}
                  <g
                    className="cursor-pointer transition-all duration-300"
                    onClick={() => setSelectedSubjectId(subj.id)}
                    onMouseEnter={() => setHoveredSubjectId(subj.id)}
                    onMouseLeave={() => setHoveredSubjectId(null)}
                  >
                    {/* Glowing outer aura for subject bud */}
                    <circle
                      cx={endPoint.x}
                      cy={endPoint.y}
                      r={isSelected || isHovered ? "18" : "13"}
                      fill={`${strokeColor}1A`}
                      stroke={strokeColor}
                      strokeWidth="1.5"
                      strokeDasharray={subj.percent === 100 ? "none" : "3 1"}
                      className="transition-all duration-300"
                    />

                    {/* Inner core bud */}
                    <circle
                      cx={endPoint.x}
                      cy={endPoint.y}
                      r={isSelected || isHovered ? "10" : "7"}
                      fill={subj.completedCount > 0 ? strokeColor : "#0F172A"}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected || isHovered ? "2" : "1"}
                      className="transition-all duration-300"
                    />

                    {/* Completion score badge inside bud */}
                    {subj.percent > 0 && (
                      <text
                        x={endPoint.x}
                        y={endPoint.y + 3}
                        fill={subj.completedCount > 0 ? "#FFFFFF" : strokeColor}
                        fontSize="8"
                        fontWeight="extrabold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {Math.round(subj.percent)}
                      </text>
                    )}

                    {/* Label Texts - Placed left of left endpoints and right of right endpoints */}
                    <text
                      x={isLeft ? endPoint.x - 22 : endPoint.x + 22}
                      y={endPoint.y - 1}
                      fill={isSelected || isHovered ? "#FFFFFF" : "#D1D5DB"}
                      fontSize={isSelected || isHovered ? "11" : "9.5"}
                      fontWeight={isSelected || isHovered ? "bold" : "semibold"}
                      fontFamily="Inter, sans-serif"
                      textAnchor={isLeft ? "end" : "start"}
                      className="transition-all duration-300 drop-shadow-md"
                    >
                      {subj.name}
                    </text>

                    {/* Weight & Average Score Sub-text */}
                    <text
                      x={isLeft ? endPoint.x - 22 : endPoint.x + 22}
                      y={endPoint.y + 11}
                      fill={isSelected || isHovered ? strokeColor : "#9CA3AF"}
                      fontSize="8.5"
                      fontWeight="medium"
                      fontFamily="Inter, sans-serif"
                      textAnchor={isLeft ? "end" : "start"}
                      className="transition-all duration-300"
                    >
                      {subj.weight} • {subj.avgScore !== null ? `${Math.round(subj.avgScore)}% avg` : `${subj.completedCount}/${subj.modules.length} md`}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* FLOATING HOVER CARD INSIDE THE SVG CANVAS CONTAINER */}
            {/* Renders if a leaf module node is currently hovered */}
          </svg>

          {hoveredModule && (
            <div
              className="absolute bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-xl z-25 max-w-[220px] pointer-events-none text-left backdrop-blur-md"
              style={{
                left: `${Math.min(80, Math.max(10, (hoveredModule.x / 800) * 100))}%`,
                top: `${Math.min(75, Math.max(5, (hoveredModule.y / 640) * 100))}%`,
                transform: "translate(-50%, -105%)"
              }}
            >
              <span className={`text-[9px] font-bold tracking-tight uppercase px-1.5 py-0.5 rounded bg-slate-950/65 ${getSubjectThemeColor(hoveredModule.subject.color)}`}>
                {hoveredModule.subject.name}
              </span>
              <h5 className="text-[11px] font-bold text-slate-100 mt-1.5 leading-snug">
                M{hoveredModule.module.order}: {hoveredModule.module.name}
              </h5>
              <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                <span>Status:</span>
                <span className={`font-semibold uppercase ${
                  progress[hoveredModule.module.id]?.status === ModuleStatus.COMPLETED
                    ? "text-emerald-400"
                    : progress[hoveredModule.module.id]?.status === ModuleStatus.IN_PROGRESS
                    ? "text-blue-400 animate-pulse"
                    : "text-slate-500"
                }`}>
                  {progress[hoveredModule.module.id]?.status === ModuleStatus.COMPLETED
                    ? "Completed"
                    : progress[hoveredModule.module.id]?.status === ModuleStatus.IN_PROGRESS
                    ? "In Progress"
                    : "Not Started"}
                </span>
              </div>
              {progress[hoveredModule.module.id]?.status === ModuleStatus.COMPLETED && (
                <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400">
                  <span>Accuracy Score:</span>
                  <span className="font-bold text-slate-200 font-mono">
                    {progress[hoveredModule.module.id]?.quizScore !== null
                      ? `${progress[hoveredModule.module.id]?.quizScore}%`
                      : "No quiz taken"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Selected Subject Module Exploration Pane */}
        <div className="space-y-4">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between h-full">
            
            {selectedSubjectId === "all" ? (
              <div className="flex flex-col justify-center items-center text-center py-16 px-4 space-y-4 my-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center text-2xl">
                  🌳
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">CFA Curriculum Canopy</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Click any main subject branch, or hover over individual module leaves, to examine deep active recall analytics and diagnostic advice.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Total studied hours: <span className="text-emerald-400 font-bold">{(totalStudyTime / 60).toFixed(1)} hrs</span>
                  </span>
                </div>
              </div>
            ) : (
              <div>
                {/* Subject Header */}
                <div className="border-b border-slate-800 pb-3.5 mb-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className={`text-[10px] font-bold tracking-tight uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800`}>
                        {selectedSubject.name}
                      </span>
                      <h5 className="text-[10px] text-slate-400 block mt-2">
                        Exam weighting: <span className="text-slate-200 font-semibold">{selectedSubject.weight}</span>
                      </h5>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-slate-100 block">{Math.round(selectedSubject.percent)}%</span>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Studied</span>
                    </div>
                  </div>
                </div>

                {/* List of modules scrollable */}
                <span className="text-[10px] text-slate-400 font-semibold block mb-2 uppercase tracking-wider">
                  Course Modules & Spaced Review
                </span>
                
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
                  {selectedSubject.modules.map((m) => {
                    const modProgress = progress[m.id];
                    const isCompleted = modProgress?.status === ModuleStatus.COMPLETED;
                    const isInProgress = modProgress?.status === ModuleStatus.IN_PROGRESS;
                    const hasQuizScore = modProgress?.quizScore !== null && modProgress?.quizScore !== undefined;

                    return (
                      <div 
                        key={m.id}
                        className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between gap-3 ${
                          isCompleted 
                            ? "bg-slate-900/40 border-slate-800/80 text-slate-300"
                            : isInProgress
                            ? "bg-blue-950/10 border-blue-900/30 text-slate-200"
                            : "bg-slate-900/10 border-slate-900/30 text-slate-500"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isCompleted ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : isInProgress ? (
                            <PlayCircle className="h-3.5 w-3.5 text-blue-400 shrink-0 animate-pulse" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-700 mx-1 shrink-0" />
                          )}
                          <span className="truncate leading-snug font-medium">
                            M{m.order}: {m.name}
                          </span>
                        </div>

                        {/* Status values */}
                        <div className="shrink-0 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          {isCompleted && hasQuizScore ? (
                            <span className={`font-semibold ${modProgress.quizScore! >= 70 ? "text-emerald-400" : "text-amber-400"}`}>
                              {modProgress.quizScore}%
                            </span>
                          ) : isCompleted ? (
                            <span className="text-slate-400 text-[9px] uppercase font-bold">Done</span>
                          ) : isInProgress ? (
                            <span className="text-blue-400 text-[9px] uppercase font-bold animate-pulse">Active</span>
                          ) : (
                            <span className="text-slate-500 text-[9px]">Unstarted</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Adaptive Advisor block */}
                <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-850 text-left">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold flex items-center gap-1">
                    <Sparkles size={11} className="text-emerald-400" />
                    Diagnostic Advisor:
                  </span>
                  <p className="text-[11px] text-slate-300 block mt-1 leading-relaxed">
                    {selectedSubject.completedCount === 0 ? (
                      `No modules have been fully studied yet in ${selectedSubject.name}. Start by reading key introductory modules.`
                    ) : selectedSubject.avgScore !== null && selectedSubject.avgScore >= 75 ? (
                      `Outstanding recall average of ${Math.round(selectedSubject.avgScore)}%! You are ready to log Spaced Repetition reviews for this topic.`
                    ) : (
                      `Score average is at ${selectedSubject.avgScore ? Math.round(selectedSubject.avgScore) : "0"}%. Work through diagnostic questions or flashcards before scheduling next exam milestones.`
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* overall statistics bottom block */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span className="flex items-center gap-1 font-semibold uppercase tracking-tight">
                  <Target size={11} className="text-emerald-500" /> curriculum progress
                </span>
                <span className="text-emerald-400 font-bold">{overallPct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              {selectedSubjectId !== "all" && (
                <button
                  onClick={() => setSelectedSubjectId("all")}
                  className="w-full mt-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 text-[10px] font-semibold transition cursor-pointer"
                >
                  Clear Subject Filter
                </button>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

// Inline helper to get matching Tailwind text color values
function getSubjectThemeColor(color: string) {
  const map: Record<string, string> = {
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    cyan: "text-cyan-400",
    indigo: "text-indigo-400",
    pink: "text-pink-400",
    rose: "text-rose-400",
    violet: "text-violet-400",
    amber: "text-amber-400",
    teal: "text-teal-400",
    purple: "text-purple-400"
  };
  return map[color] || "text-blue-400";
}
