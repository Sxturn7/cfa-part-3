import React, { useState, useMemo } from "react";
import { Subject, ModuleProgress, ModuleStatus, LearningModule } from "../types";
import BorderGlow from "./BorderGlow";
import {
  Layers,
  ChevronRight,
  BookOpen,
  Target,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Eye,
  Settings,
  Flame,
  Award,
  Compass,
  Zap
} from "lucide-react";

interface GrowthTreeProps {
  subjects: Subject[];
  progress: Record<string, ModuleProgress>;
  totalStudyTime: number;
  isDashboard?: boolean;
}

interface Point {
  x: number;
  y: number;
}

// Gorgeous autumn colors mapped to subjects for beautiful coppery/crimson look
const AUTUMN_COLORS: Record<string, { fill: string; hover: string; glow: string }> = {
  ethics:      { fill: "#DC2626", hover: "#EF4444", glow: "rgba(220, 38, 38, 0.4)" }, // Crimson Red
  quant:       { fill: "#EA580C", hover: "#F97316", glow: "rgba(234, 88, 12, 0.4)" }, // Orange Copper
  econ:        { fill: "#D97706", hover: "#F59E0B", glow: "rgba(217, 119, 6, 0.4)" }, // Amber Gold
  fsa:         { fill: "#B91C1C", hover: "#DC2626", glow: "rgba(185, 28, 28, 0.4)" }, // Scarlet
  corporate:   { fill: "#BE123C", hover: "#E11D48", glow: "rgba(190, 18, 60, 0.4)" }, // Terracotta Rose
  equity:      { fill: "#C2410C", hover: "#EA580C", glow: "rgba(194, 65, 12, 0.4)" }, // Rust Orange
  fixed:       { fill: "#991B1B", hover: "#B91C1C", glow: "rgba(153, 27, 27, 0.4)" }, // Dark Cherry
  derivatives: { fill: "#854D0E", hover: "#A16207", glow: "rgba(133, 77, 14, 0.4)" }, // Bronze Amber
  alt:         { fill: "#B45309", hover: "#D97706", glow: "rgba(180, 83, 9, 0.4)" }, // Coppery Brown
  portfolio:   { fill: "#9A3412", hover: "#C2410C", glow: "rgba(154, 52, 18, 0.4)" }, // Burnt Sienna
};

// Alternate spring emerald look if they want to toggle!
const SPRING_COLORS: Record<string, { fill: string; hover: string; glow: string }> = {
  ethics:      { fill: "#059669", hover: "#10B981", glow: "rgba(5, 150, 105, 0.4)" }, // Emerald
  quant:       { fill: "#0D9488", hover: "#14B8A6", glow: "rgba(13, 148, 136, 0.4)" }, // Teal
  econ:        { fill: "#0891B2", hover: "#06B6D4", glow: "rgba(8, 145, 178, 0.4)" }, // Cyan
  fsa:         { fill: "#2563EB", hover: "#3B82F6", glow: "rgba(37, 99, 235, 0.4)" }, // Royal Blue
  corporate:   { fill: "#4F46E5", hover: "#6366F1", glow: "rgba(79, 70, 229, 0.4)" }, // Indigo
  equity:      { fill: "#16A34A", hover: "#22C55E", glow: "rgba(22, 163, 74, 0.4)" }, // Vibrant Green
  fixed:       { fill: "#65A30D", hover: "#84CC16", glow: "rgba(101, 163, 13, 0.4)" }, // Lime
  derivatives: { fill: "#84CC16", hover: "#A3E635", glow: "rgba(132, 204, 22, 0.4)" }, // Light Lime
  alt:         { fill: "#0F766E", hover: "#115E59", glow: "rgba(15, 118, 110, 0.4)" }, // Dark Forest
  portfolio:   { fill: "#047857", hover: "#065F46", glow: "rgba(4, 120, 87, 0.4)" }, // Deep Emerald
};

const SECONDARY_BRANCHES = [
  // Left side branches sprouting from the left limb (around 310, 310 or 250, 280)
  { d: "M 320,320 Q 310,230 330,140", w: 4 }, // to ethics
  { d: "M 310,310 Q 270,250 230,180", w: 4 }, // to econ
  { d: "M 315,315 Q 310,280 310,240", w: 3 }, // to corporate
  { d: "M 250,280 Q 220,275 190,270", w: 3 }, // to fixed
  { d: "M 325,325 Q 290,335 260,340", w: 3 }, // to alt

  // Right side branches sprouting from the right limb (around 450, 295 or 540, 250)
  { d: "M 445,305 Q 460,210 470,130", w: 4 }, // to quant
  { d: "M 450,295 Q 510,230 570,180", w: 4 }, // to fsa
  { d: "M 448,300 Q 470,270 490,245", w: 3 }, // to equity
  { d: "M 540,250 Q 580,260 610,270", w: 3 }, // to derivatives
  { d: "M 440,310 Q 490,330 540,345", w: 3 }  // to portfolio
];

export default function GrowthTree({ subjects, progress, totalStudyTime, isDashboard = false }: GrowthTreeProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("quant");
  const [paletteMode, setPaletteMode] = useState<"autumn" | "spring">("autumn");
  const [canopyMode, setCanopyMode] = useState<"dynamic" | "preview">("dynamic");
  const [hoveredSubjectId, setHoveredSubjectId] = useState<string | null>(null);
  
  // Hovered leaf/module tooltip state
  const [hoveredLeaf, setHoveredLeaf] = useState<{
    module: LearningModule;
    subjectId: string;
    subjectName: string;
    x: number;
    y: number;
  } | null>(null);

  const colors = paletteMode === "autumn" ? AUTUMN_COLORS : SPRING_COLORS;

  // 1. Core Coordinate centers of foliage clusters forming a magnificent dense rounded tree canopy
  const SUBJECT_CENTERS: Record<string, Point> = {
    ethics:      { x: 330, y: 140 }, // High Left Center
    quant:       { x: 470, y: 130 }, // High Right Center
    econ:        { x: 230, y: 180 }, // Outer Left High
    fsa:         { x: 570, y: 180 }, // Outer Right High
    corporate:   { x: 310, y: 240 }, // Middle Left Inner
    equity:      { x: 490, y: 245 }, // Middle Right Inner
    fixed:       { x: 190, y: 270 }, // Outer Left Low
    derivatives: { x: 610, y: 270 }, // Outer Right Low
    alt:         { x: 260, y: 340 }, // Bottom Left
    portfolio:   { x: 540, y: 345 }, // Bottom Right
  };

  // Compile subjects metrics
  const subjectStats = useMemo(() => {
    return subjects.map((subj) => {
      const mods = subj.modules;
      const completedCount = mods.filter(
        (m) => progress[m.id]?.status === ModuleStatus.COMPLETED
      ).length;
      const inProgressCount = mods.filter(
        (m) => progress[m.id]?.status === ModuleStatus.IN_PROGRESS
      ).length;
      const totalCount = mods.length;
      const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      const scoredMods = mods.filter(
        (m) => progress[m.id]?.status === ModuleStatus.COMPLETED && progress[m.id]?.quizScore !== null
      );
      const avgScore = scoredMods.length > 0
        ? Math.round(scoredMods.reduce((acc, m) => acc + (progress[m.id].quizScore || 0), 0) / scoredMods.length)
        : null;

      return {
        ...subj,
        completedCount,
        inProgressCount,
        totalCount,
        percent: pct,
        avgScore,
      };
    });
  }, [subjects, progress]);

  const selectedSubject = useMemo(() => {
    return subjectStats.find((s) => s.id === selectedSubjectId) || subjectStats[0];
  }, [subjectStats, selectedSubjectId]);

  // Overall metrics
  const overallCompleted = useMemo(() => {
    return subjectStats.reduce((sum, s) => sum + s.completedCount, 0);
  }, [subjectStats]);

  const overallModules = useMemo(() => {
    return subjectStats.reduce((sum, s) => sum + s.totalCount, 0);
  }, [subjectStats]);

  const overallPercent = Math.round((overallCompleted / overallModules) * 100);

  // Generate deterministic layout coordinates for each of the 93 leaves
  const leafNodes = useMemo(() => {
    const list: Array<{
      module: LearningModule;
      subjectId: string;
      subjectName: string;
      x: number;
      y: number;
      angle: number;
      radius: number;
    }> = [];

    subjects.forEach((subj) => {
      const center = SUBJECT_CENTERS[subj.id] || { x: 400, y: 250 };
      const N = subj.modules.length;
      
      subj.modules.forEach((mod, idx) => {
        // Distribute leaf nodes using a beautiful phyllotaxis spiral around center point with generous spacing
        const angle = (idx * 137.5 * Math.PI) / 180; // Golden angle phyllotaxis
        const radius = 24 + Math.sqrt(idx) * 16.5; // Wider distribution to allow breathing room
        
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);

        list.push({
          module: mod,
          subjectId: subj.id,
          subjectName: subj.name,
          x,
          y,
          angle,
          radius,
        });
      });
    });

    return list;
  }, [subjects]);

  // Growth titles based on completion percentage
  const getGrowthTitle = (pct: number) => {
    if (pct === 0) return "Dormant Seed";
    if (pct < 15) return "Sprouted Acorn";
    if (pct < 40) return "Young Sapling";
    if (pct < 70) return "Budding Oak";
    if (pct < 95) return "Majestic Crown";
    return "Syllabus Titan";
  };

  return (
    <BorderGlow
      borderRadius={24}
      glowRadius={300}
      glowIntensity={0.6}
      backgroundColor="var(--theme-card)"
      colors={["var(--theme-accent)", "transparent"]}
      className="w-full shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="p-7 text-[var(--theme-text-dark)] relative overflow-hidden font-sans">
      
      {/* 1. Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[var(--theme-border)]/50 pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-wider bg-[var(--theme-accent-light)] text-[var(--theme-accent)] border border-[var(--theme-accent)]/10 font-semibold font-mono px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 mb-2.5">
            <Sparkles size={11} className="animate-spin-slow" /> Level I Progress Biome
          </span>
          <h3 className="text-lg font-semibold text-[var(--theme-text-dark)] tracking-tight leading-none">
            Knowledge Tree
          </h3>
          <p className="text-xs text-[var(--theme-text-main)] mt-2 leading-relaxed max-w-xl opacity-85">
            Your study progress, transformed into a living ecosystem that grows with every completed module.
          </p>
        </div>

        {/* Action Widgets Toolbar */}
        <div className="flex flex-wrap items-center gap-3 select-none">
          {/* Canopy Mode Selector */}
          <div className="flex bg-[var(--theme-beige)]/60 p-0.5 rounded-xl border border-[var(--theme-border)]/50">
            <button
              type="button"
              onClick={() => setCanopyMode("dynamic")}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                canopyMode === "dynamic" ? "bg-[var(--theme-card)] text-[var(--theme-text-dark)] shadow-xs" : "text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)]"
              }`}
              title="Grow leaves only as you complete curriculum modules"
            >
              <Zap size={11} />
              <span>Progress Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setCanopyMode("preview")}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                canopyMode === "preview" ? "bg-[var(--theme-card)] text-[var(--theme-text-dark)] shadow-xs" : "text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)]"
              }`}
              title="View how gorgeous the full tree canopy looks"
            >
              <Eye size={11} />
              <span>Full Canopy</span>
            </button>
          </div>

          {/* Palette Selector */}
          <div className="flex bg-[var(--theme-beige)]/60 p-0.5 rounded-xl border border-[var(--theme-border)]/50">
            <button
              type="button"
              onClick={() => setPaletteMode("autumn")}
              className={`px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                paletteMode === "autumn" ? "bg-[var(--theme-card)] text-amber-700 shadow-xs" : "text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)]"
              }`}
            >
              🍁 Autumn
            </button>
            <button
              type="button"
              onClick={() => setPaletteMode("spring")}
              className={`px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                paletteMode === "spring" ? "bg-[var(--theme-card)] text-emerald-700 shadow-xs" : "text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)]"
              }`}
            >
              🌿 Spring
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className={`grid grid-cols-1 ${isDashboard ? "lg:grid-cols-1" : "lg:grid-cols-3"} gap-6 items-stretch`}>
        
        {/* Left Side: The Interactive SVG Canvas */}
        <div className={`${isDashboard ? "w-full" : "lg:col-span-2"} bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden flex items-center justify-center min-h-[500px]`}>
          
          <svg
            className={`w-full ${isDashboard ? "max-w-full h-[550px]" : "max-w-[660px] h-[500px]"} select-none`}
            viewBox="0 0 800 600"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Defs for sky gradients and foliage backdrops */}
            <defs>
              {/* Sky linear gradient */}
              <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B132B" />
                <stop offset="60%" stopColor="#1C2541" />
                <stop offset="100%" stopColor="#3A506B" />
              </linearGradient>

              {/* Autumn Meadow Sky Gradient */}
              <linearGradient id="autumnSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="60%" stopColor="#1E1E38" />
                <stop offset="85%" stopColor="#5B3E31" />
                <stop offset="100%" stopColor="#8C5C38" />
              </linearGradient>

              {/* Spring Meadow Sky Gradient */}
              <linearGradient id="springSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="60%" stopColor="#0E1E2A" />
                <stop offset="85%" stopColor="#064E3B" />
                <stop offset="100%" stopColor="#022C22" />
              </linearGradient>

              {/* Trunk textured gradient */}
              <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1E1510" />
                <stop offset="40%" stopColor="#36251C" />
                <stop offset="70%" stopColor="#4A3428" />
                <stop offset="100%" stopColor="#1E1510" />
              </linearGradient>

              {/* Meadow grass background gradient */}
              <linearGradient id="meadowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CA8A04" />
                <stop offset="100%" stopColor="#713F12" />
              </linearGradient>
              
              <linearGradient id="meadowBackGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#854D0E" />
                <stop offset="100%" stopColor="#451A03" />
              </linearGradient>

              {/* Spring Meadow grass background gradient */}
              <linearGradient id="springMeadow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#064E3B" />
              </linearGradient>
              
              <linearGradient id="springMeadowBack" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>

              {/* Shadow filter for realistic canvas leaves */}
              <filter id="leafShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* A. Landscape Backdrop */}
            <rect width="800" height="600" rx="16" fill={paletteMode === "autumn" ? "url(#autumnSky)" : "url(#springSky)"} />

            {/* Gentle ambient floating white clouds */}
            <g opacity="0.12" fill="#FFFFFF">
              <path d="M 80,120 Q 110,90 140,120 T 200,120 T 240,140 L 60,140 Z" />
              <path d="M 550,100 Q 580,70 610,100 T 670,100 T 710,120 L 530,120 Z" />
              <path d="M 310,80 Q 330,60 350,80 T 390,80 T 420,100 L 290,100 Z" />
            </g>

            {/* B. Rolling Wildflower Meadows (Hills at bottom) */}
            {/* Back meadow hill */}
            <path
              d="M -50,500 Q 150,460 380,510 T 850,480 L 850,620 L -50,620 Z"
              fill={paletteMode === "autumn" ? "url(#meadowBackGrad)" : "url(#springMeadowBack)"}
            />
            {/* Front meadow hill */}
            <path
              d="M -50,540 Q 220,500 480,550 T 850,530 L 850,620 L -50,620 Z"
              fill={paletteMode === "autumn" ? "url(#meadowGrad)" : "url(#springMeadow)"}
            />

            {/* Meadow wildflowers dots */}
            <g fill={paletteMode === "autumn" ? "#FEF08A" : "#F472B6"} opacity="0.75">
              <circle cx="60" cy="560" r="1.5" />
              <circle cx="120" cy="570" r="2" />
              <circle cx="210" cy="555" r="1.5" />
              <circle cx="280" cy="580" r="2" />
              <circle cx="340" cy="565" r="1.2" />
              <circle cx="490" cy="570" r="2" />
              <circle cx="560" cy="560" r="1.5" />
              <circle cx="680" cy="580" r="2" />
              <circle cx="740" cy="565" r="1.5" />
              {/* cute secondary spring flowers (white & lavender vs red) */}
              <circle cx="150" cy="585" r="1.5" fill={paletteMode === "autumn" ? "#EF4444" : "#E879F9"} />
              <circle cx="410" cy="580" r="2" fill={paletteMode === "autumn" ? "#EF4444" : "#FFFFFF"} />
              <circle cx="630" cy="575" r="1.5" fill={paletteMode === "autumn" ? "#EF4444" : "#E879F9"} />
            </g>

            {/* C. The Magnificent Winding Wood Trunk */}
            {/* Organic main trunk starting wide at 560px Y, tapering up */}
            <path
              d="M 378,560 
                 C 382,490 386,430 398,380 
                 C 385,350 355,330 310,310 
                 C 285,290 265,280 250,280
                 L 252,275
                 C 270,275 292,285 318,302
                 C 358,322 388,340 402,365
                 C 408,345 422,320 450,295
                 C 480,270 515,260 540,250
                 L 542,255
                 C 518,265 485,275 456,299
                 C 426,325 412,352 406,375
                 C 406,420 408,485 414,560 Z"
              fill="url(#trunkGrad)"
            />

            {/* Dynamic trunk wood texturing strokes */}
            <g stroke="#120B07" strokeWidth="1.2" fill="none" opacity="0.35">
              <path d="M 383,560 C 387,495 391,435 401,385" />
              <path d="M 396,560 C 400,490 402,440 408,390" />
              <path d="M 408,560 C 411,500 410,450 412,400" />
              {/* secondary organic branching details */}
              <path d="M 390,360 C 350,335 320,320 280,300" strokeWidth="0.8" />
              <path d="M 416,350 C 445,325 475,310 510,290" strokeWidth="0.8" />
            </g>

            {/* Secondary Organic Wood Branches connecting main trunk limbs to subject centers */}
            <g stroke="url(#trunkGrad)" fill="none" strokeLinecap="round" opacity="0.85">
              {SECONDARY_BRANCHES.map((branch, idx) => (
                <path
                  key={`branch-${idx}`}
                  d={branch.d}
                  strokeWidth={branch.w}
                />
              ))}
            </g>

            {/* D. Elegant Background Foliage Clouds (Adds lush depth & full crown visual) */}
            {subjects.map((subj) => {
              const center = SUBJECT_CENTERS[subj.id];
              const col = colors[subj.id] || { fill: "#FFF" };
              const isActive = hoveredSubjectId === subj.id || selectedSubjectId === subj.id;
              
              if (!center) return null;

              return (
                <g key={`foliage-back-${subj.id}`}>
                  {/* Fluffy surrounding organic circles of the subject area's brand color */}
                  <circle
                    cx={center.x}
                    cy={center.y}
                    r={isActive ? "60" : "46"}
                    fill={col.fill}
                    opacity={isActive ? "0.14" : "0.05"}
                    style={{ filter: "blur(14px)", transition: "all 0.4s" }}
                  />
                  <circle
                    cx={center.x - 12}
                    cy={center.y + 8}
                    r="32"
                    fill={col.fill}
                    opacity={isActive ? "0.06" : "0.03"}
                    style={{ filter: "blur(10px)", transition: "all 0.4s" }}
                  />
                  <circle
                    cx={center.x + 14}
                    cy={center.y - 10}
                    r="34"
                    fill={col.fill}
                    opacity={isActive ? "0.06" : "0.03"}
                    style={{ filter: "blur(10px)", transition: "all 0.4s" }}
                  />
                </g>
              );
            })}

            {/* E. Interactive Clickable Subject Hotspot Centers */}
            {subjects.map((subj) => {
              const center = SUBJECT_CENTERS[subj.id];
              const stat = subjectStats.find(s => s.id === subj.id);
              const isSelected = selectedSubjectId === subj.id;
              const isHovered = hoveredSubjectId === subj.id;
              const col = colors[subj.id] || { fill: "#FFF", hover: "#FFF", glow: "rgba(255,255,255,0.2)" };

              if (!center) return null;

              return (
                <g
                  key={`subj-node-${subj.id}`}
                  className="cursor-pointer"
                  onClick={() => setSelectedSubjectId(subj.id)}
                  onMouseEnter={() => setHoveredSubjectId(subj.id)}
                  onMouseLeave={() => setHoveredSubjectId(null)}
                >
                  {/* Outer Pulsing Aura Ring */}
                  <circle
                    cx={center.x}
                    cy={center.y}
                    r={isSelected ? "18" : isHovered ? "15" : "11"}
                    fill="none"
                    stroke={col.fill}
                    strokeWidth={isSelected ? "3" : "1.5"}
                    opacity={isSelected ? "0.9" : "0.4"}
                    className={isSelected ? "animate-pulse" : ""}
                    style={{ transition: "all 0.3s" }}
                  />
                  {/* Core visual flower center */}
                  <circle
                    cx={center.x}
                    cy={center.y}
                    r={isSelected ? "8" : "5"}
                    fill={isSelected ? "#FFF" : col.fill}
                    style={{ transition: "all 0.3s" }}
                  />
                  {/* Subject Tiny Text Label for Fast Spatial Mapping */}
                  <text
                    x={center.x}
                    y={center.y - 25}
                    textAnchor="middle"
                    fill={isSelected ? "#FFF" : isHovered ? col.hover : "#94A3B8"}
                    fontSize={isSelected ? "11" : "9.5"}
                    fontWeight={isSelected ? "bold" : "bold"}
                    className="font-mono tracking-tight pointer-events-none drop-shadow"
                    style={{ transition: "all 0.3s" }}
                  >
                    {subj.name.split(" ")[0]}
                  </text>
                  <text
                    x={center.x}
                    y={center.y + 24}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="9.5"
                    fontWeight="bold"
                    className="font-mono pointer-events-none select-none"
                  >
                    {stat ? `${Math.round(stat.percent)}%` : "0%"}
                  </text>
                </g>
              );
            })}

            {/* E. Delicate Twigs sprouting from Subject Centers to Leaves */}
            <g strokeLinecap="round" fill="none">
              {leafNodes.map((node, leafIdx) => {
                const p = progress[node.module.id] || { status: ModuleStatus.NOT_STARTED };
                const isCompleted = p.status === ModuleStatus.COMPLETED;
                const isInProgress = p.status === ModuleStatus.IN_PROGRESS;
                const col = colors[node.subjectId] || { fill: "#FFF" };

                const isHidden = canopyMode === "dynamic" && !isCompleted && !isInProgress;
                const center = SUBJECT_CENTERS[node.subjectId] || { x: 400, y: 250 };

                // Draw a beautiful, organic curved path instead of a straight line!
                const mx = (center.x + node.x) / 2;
                const my = (center.y + node.y) / 2;
                const dx = node.x - center.x;
                const dy = node.y - center.y;
                const len = Math.sqrt(dx*dx + dy*dy);
                const nx = -dy / (len || 1);
                const ny = dx / (len || 1);
                const offset = 8 * Math.sin(leafIdx + 1); // deterministic curve offset
                const cx = mx + nx * offset;
                const cy = my + ny * offset;

                // Style based on state
                let strokeColor = "#475569";
                let strokeWidth = "0.4";
                let opacity = "0.15";

                if (isCompleted) {
                  strokeColor = col.fill;
                  strokeWidth = "0.8";
                  opacity = "0.45";
                } else if (isInProgress) {
                  strokeColor = "#F59E0B";
                  strokeWidth = "0.7";
                  opacity = "0.4";
                } else {
                  opacity = isHidden ? "0.08" : "0.18";
                }

                return (
                  <path
                    key={`stem-${node.module.id}`}
                    d={`M ${center.x},${center.y} Q ${cx},${cy} ${node.x},${node.y}`}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                  />
                );
              })}
            </g>

            {/* F. The Growing Leaf Nodes representing 93 modules */}
            {leafNodes.map((node) => {
              const p = progress[node.module.id] || {
                status: ModuleStatus.NOT_STARTED,
              };

              const isCompleted = p.status === ModuleStatus.COMPLETED;
              const isInProgress = p.status === ModuleStatus.IN_PROGRESS;
              
              const isHidden = canopyMode === "dynamic" && !isCompleted && !isInProgress;
              if (isHidden) return null; // Already rendered bare twig in the stems group!

              const col = colors[node.subjectId] || { fill: "#FFF", hover: "#FFF", glow: "rgba(0,0,0,0.1)" };
              
              let leafColor = "#334155";
              let strokeColor = "none";
              let leafOpacity = 0.25;
              let scale = 0.52;
              let isGlow = false;

              if (isCompleted) {
                leafColor = col.fill;
                leafOpacity = 0.95;
                scale = 0.76;
                isGlow = true;
              } else if (isInProgress) {
                leafColor = "#F59E0B";
                strokeColor = "#D97706";
                leafOpacity = 0.9;
                scale = 0.65;
              } else {
                leafColor = paletteMode === "autumn" ? "#7C2D12" : "#064E3B";
                strokeColor = paletteMode === "autumn" ? "#B45309" : "#047857";
                leafOpacity = 0.35;
                scale = 0.55;
              }

              const center = SUBJECT_CENTERS[node.subjectId] || { x: 400, y: 250 };
              const angleRad = Math.atan2(node.y - center.y, node.x - center.x);
              const angleDeg = (angleRad * 180) / Math.PI + 90; // Point leaf outward

              return (
                <g
                  key={`leaf-${node.module.id}`}
                  transform={`translate(${node.x}, ${node.y}) rotate(${angleDeg}) scale(${scale})`}
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => setSelectedSubjectId(node.subjectId)}
                  onMouseEnter={() => {
                    setHoveredSubjectId(node.subjectId);
                    setHoveredLeaf({
                      module: node.module,
                      subjectId: node.subjectId,
                      subjectName: node.subjectName,
                      x: node.x,
                      y: node.y,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredSubjectId(null);
                    setHoveredLeaf(null);
                  }}
                >
                  {/* Soft glow radial background behind the leaf */}
                  {isGlow && (
                    <circle
                      cx="0"
                      cy="-10"
                      r="14"
                      fill={col.fill}
                      opacity="0.25"
                      className="animate-pulse"
                    />
                  )}

                  {/* High Quality Styled Leaf Path with glowing outline */}
                  <path
                    d="M 0,0 C -6,-5 -10,-15 0,-24 C 10,-15 6,-5 0,0 Z"
                    fill={isCompleted ? col.fill : leafColor}
                    stroke={isCompleted ? col.hover : strokeColor}
                    strokeWidth={isCompleted ? "1.6" : "1.2"}
                    fillOpacity={isCompleted ? "0.9" : "0.35"}
                    strokeOpacity={isCompleted ? "1" : "0.55"}
                    filter="url(#leafShadow)"
                  />

                  {/* Elegant, delicate central vein of leaf */}
                  <path
                    d="M 0,0 L 0,-18"
                    fill="none"
                    stroke={isCompleted ? "#FFFFFF" : isInProgress ? "#B45309" : (paletteMode === "autumn" ? "#9A3412" : "#047857")}
                    strokeWidth="0.8"
                    opacity={isCompleted ? "0.7" : isInProgress ? "0.5" : "0.3"}
                    strokeLinecap="round"
                  />

                  {/* Invisible Large Pointer Target circle to ensure smooth, pleasant mouse interaction */}
                  <circle cx="0" cy="-10" r="15" fill="transparent" />
                </g>
              );
            })}
          </svg>

          {/* Absolute Hovered Leaf Tooltip Glass Drawer */}
          {hoveredLeaf && (
            <div
              className="absolute bg-slate-950/95 border border-slate-800 text-slate-100 p-4 rounded-xl shadow-2xl z-40 max-w-[280px] w-full animate-fadeIn backdrop-blur-md"
              style={{
                // Position intelligently dynamically relative to the SVG hover point
                left: `${Math.min(460, Math.max(20, hoveredLeaf.x * 0.8 - 40))}px`,
                top: `${Math.min(380, Math.max(10, hoveredLeaf.y * 0.8 - 140))}px`,
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                <span className="text-[9px] uppercase font-mono font-bold text-amber-500">
                  {hoveredLeaf.subjectName}
                </span>
                <span className="text-[9px] font-mono font-semibold bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                  MOD {hoveredLeaf.module.order}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-2">
                {hoveredLeaf.module.name}
              </h4>

              {/* Status details inside tooltip */}
              <div className="mt-3 space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-mono">Status:</span>
                  {(() => {
                    const status = progress[hoveredLeaf.module.id]?.status || ModuleStatus.NOT_STARTED;
                    if (status === ModuleStatus.COMPLETED) {
                      return <span className="text-emerald-400 font-semibold flex items-center gap-1">✓ Completed</span>;
                    }
                    if (status === ModuleStatus.IN_PROGRESS) {
                      return <span className="text-amber-400 font-semibold flex items-center gap-1">⏱ Active</span>;
                    }
                    return <span className="text-slate-500">Not Started</span>;
                  })()}
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-mono">Study Time:</span>
                  <span className="text-slate-300 font-semibold font-mono">
                    {progress[hoveredLeaf.module.id]?.studyTimeMinutes || 0} mins
                  </span>
                </div>

                {progress[hoveredLeaf.module.id]?.quizScore !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-mono">Best Score:</span>
                    <span className="text-blue-400 font-bold font-mono">
                      {progress[hoveredLeaf.module.id]?.quizScore}%
                    </span>
                  </div>
                )}

                {progress[hoveredLeaf.module.id]?.revisionCycle ? (
                  <div className="flex justify-between border-t border-slate-900 pt-1 mt-1">
                    <span className="text-slate-550 font-mono">Spaced Rep Cycle:</span>
                    <span className="text-amber-500 font-bold font-mono">
                      Cycle {progress[hoveredLeaf.module.id]?.revisionCycle}/3
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Core Legend Overlay Inside Canvas */}
          <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-850 p-2.5 rounded-xl text-[9px] font-mono space-y-1 backdrop-blur-sm shadow-lg pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#DC2626]" />
              <span className="text-slate-300">Completed Leaf</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#F59E0B] animate-pulse" />
              <span className="text-slate-300">Active Study Bud</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-[#78350F]" />
              <span className="text-slate-400">Locked / Hidden Twig</span>
            </div>
          </div>

          {/* Quick interactive celebration alert when tree is blooming */}
          {overallCompleted > 0 && (
            <div className="absolute top-4 right-4 bg-slate-950/80 border border-slate-850 px-3 py-1.5 rounded-full text-[10px] font-mono flex items-center gap-1.5 backdrop-blur-sm shadow pointer-events-none">
              <Flame size={12} className="text-amber-500 animate-bounce" />
              <span>Canopy Blooms: <strong className="text-white">{overallCompleted}</strong> / {overallModules} leaves</span>
            </div>
          )}
        </div>

        {/* Right Side: Beautiful Interactive Details Sidebar Panel */}
        {!isDashboard && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-inner flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Overall Canopy Score card */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl relative overflow-hidden">
              <div className="absolute right-3 top-3 text-slate-800 pointer-events-none">
                <Award size={48} className="opacity-15" />
              </div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">
                CURRENT BIOME RANK
              </span>
              <h4 className="text-base font-bold text-white font-serif mt-1">
                {getGrowthTitle(overallPercent)}
              </h4>
              
              <div className="mt-3.5 space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Syllabus Covered:</span>
                  <span className="text-white font-bold">{overallPercent}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Interactive Subject selector rail list */}
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono block mb-2">
                SUBJECT AREAS LIST (CLICK TO INSPECT)
              </span>
              
              <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto py-1.5 pr-1 scrollbar-thin">
                {subjectStats.map((subj) => {
                  const isSelected = selectedSubjectId === subj.id;
                  const col = colors[subj.id] || { fill: "#FFF" };

                  return (
                    <button
                      key={subj.id}
                      type="button"
                      onClick={() => setSelectedSubjectId(subj.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg border transition text-left outline-none cursor-pointer ${
                        isSelected
                          ? "bg-slate-950 border-slate-750 shadow-inner"
                          : "bg-slate-950/20 border-slate-900 hover:bg-slate-950/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: col.fill }}
                        />
                        <span className="text-[11px] font-medium text-slate-200 truncate">
                          {subj.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-slate-400">
                          {subj.completedCount}/{subj.totalCount}
                        </span>
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0"
                          style={{
                            color: col.fill,
                            backgroundColor: `rgba(255,255,255,0.02)`,
                            border: `1px solid rgba(255,255,255,0.05)`
                          }}
                        >
                          {Math.round(subj.percent)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Subject Detailed Analysis */}
            <div className="border-t border-slate-800/80 pt-4">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono block mb-1">
                FOLIAGE DETAILS: {selectedSubject.name.toUpperCase()}
              </span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Weight: <strong className="text-white">{selectedSubject.weight}</strong> of the final Level I exam. Contains <strong className="text-amber-500">{selectedSubject.totalCount}</strong> curriculum modules.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-3.5">
                <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-lg text-center">
                  <span className="text-[8px] font-mono text-slate-500 block uppercase">Mastered</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {selectedSubject.completedCount} <span className="text-[10px] font-normal text-slate-500">mods</span>
                  </span>
                </div>

                <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-lg text-center">
                  <span className="text-[8px] font-mono text-slate-500 block uppercase">Active Study</span>
                  <span className="text-sm font-bold font-mono text-amber-500">
                    {selectedSubject.inProgressCount} <span className="text-[10px] font-normal text-slate-500">mods</span>
                  </span>
                </div>
              </div>

              {selectedSubject.avgScore !== null && (
                <div className="mt-2.5 bg-indigo-950/15 border border-indigo-900/30 rounded-xl px-3 py-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">Average Quiz Performance:</span>
                  <span className="font-extrabold text-indigo-400 font-mono text-xs">
                    {selectedSubject.avgScore}%
                  </span>
                </div>
              )}
            </div>

          </div>

          <div className="border-t border-slate-800/80 pt-4 mt-4 flex items-center gap-2 text-[10px] text-slate-500">
            <Compass size={14} className="text-slate-500 animate-spin-slow shrink-0" />
            <span>Interactive map of the syllabus. Expand or complete modules to watch branches mature.</span>
          </div>

        </div>
        )}

      </div>
    </div>
  </BorderGlow>
  );
}
