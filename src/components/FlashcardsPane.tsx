import React, { useState, useEffect } from "react";
import { UserProfile, Flashcard, Subject } from "../types";
import { 
  Sparkles, 
  RotateCw, 
  Check, 
  X, 
  Plus, 
  Filter, 
  BookOpen, 
  Award, 
  Trash2, 
  HelpCircle,
  Bookmark
} from "lucide-react";

// High-yield preloaded CFA Level I flashcards (29 total premium cards)
const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: "pre_quant_1",
    moduleId: "quant",
    front: "What is the formula for the Sharpe Ratio?",
    back: "Sharpe Ratio = (Rp - Rf) / σp\n\nWhere:\n• Rp = Portfolio return\n• Rf = Risk-free rate of return\n• σp = Portfolio standard deviation\n\nIt measures excess return per unit of total risk.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_quant_2",
    moduleId: "quant",
    front: "What is the Central Limit Theorem (CLT)?",
    back: "The CLT states that for a large sample size (typically n ≥ 30) from any population distribution, the sample mean will be approximately normally distributed with:\n• Mean = Population Mean (μ)\n• Variance = Population Variance divided by n (σ² / n)",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_quant_3",
    moduleId: "quant",
    front: "What is Chebyshev's Inequality and its formula?",
    back: "Chebyshev's Inequality states that for any set of observations, the minimum proportion of observations that lie within k standard deviations of the mean is:\n\n1 - (1 / k²)\n\nWhere k > 1. This applies to any distribution (normal, skewed, etc.).\n• For k = 2: at least 75% of observations.\n• For k = 3: at least 89% of observations.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_quant_4",
    moduleId: "quant",
    front: "Distinguish between Type I and Type II errors in hypothesis testing.",
    back: "• Type I Error: Rejecting a true null hypothesis (false positive). The probability of a Type I error is α (the significance level).\n• Type II Error: Failing to reject a false null hypothesis (false negative). The probability of a Type II error is β.\n\nNote: Power of a test = 1 - β.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_econ_1",
    moduleId: "econ",
    front: "Define GDP Deflator and its formula.",
    back: "GDP Deflator is a measure of price inflation across all domestic goods.\n\nGDP Deflator = (Nominal GDP / Real GDP) * 100",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_econ_2",
    moduleId: "econ",
    front: "Explain the difference between substitution effect and income effect for a normal good.",
    back: "When the price of a normal good falls:\n• Substitution Effect: Consumers buy more of this good because it is relatively cheaper (always positive).\n• Income Effect: Real purchasing power increases, leading to buying more of this normal good (positive).\n\nBoth effects work in the same direction to increase quantity demanded.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_econ_3",
    moduleId: "econ",
    front: "What is the formula for Price Elasticity of Demand using the Midpoint Method?",
    back: "Elasticity = (ΔQ / Q_avg) / (ΔP / P_avg)\n\nWhere:\n• ΔQ = Q2 - Q1\n• Q_avg = (Q1 + Q2) / 2\n• ΔP = P2 - P1\n• P_avg = (P1 + P2) / 2\n\nIf |Elasticity| > 1, demand is elastic. If |Elasticity| < 1, demand is inelastic.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_econ_4",
    moduleId: "econ",
    front: "Contrast the Keynesian and Monetarist views on macroeconomic equilibrium.",
    back: "• Keynesians: Believe wages and prices are sticky downward. Active fiscal policy is necessary to guide aggregate demand and restore full employment.\n• Monetarists: Believe the money supply growth rate is the primary driver of inflation and economic cycles. Advise steady money supply growth and minimal government intervention.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_fsa_1",
    moduleId: "fsa",
    front: "What is the DuPont Analysis formula (3-step and 5-step)?",
    back: "3-Step DuPont ROE:\nROE = Net Profit Margin * Asset Turnover * Leverage Ratio\nROE = (Net Income / Revenue) * (Revenue / Assets) * (Assets / Equity)\n\n5-Step DuPont ROE breaks Net Profit Margin down:\nROE = Tax Burden * Interest Burden * EBIT Margin * Asset Turnover * Leverage Ratio",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_fsa_2",
    moduleId: "fsa",
    front: "What is the difference between Direct and Indirect cash flow methods under IFRS and US GAAP?",
    back: "• US GAAP: Direct method is encouraged, but if used, a reconciliation of net income to operating cash flow is required. Indirect method does not require this reconciliation.\n• IFRS: Direct or indirect methods are accepted; no reconciliation is required for the direct method.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_fsa_3",
    moduleId: "fsa",
    front: "How do you calculate Free Cash Flow to Firm (FCFF) starting from Net Income?",
    back: "FCFF = NI + NCC + Int*(1 - Tax Rate) - FCInv - WCInv\n\nWhere:\n• NI = Net Income\n• NCC = Non-Cash Charges (Depreciation/Amortization)\n• Int = Interest Expense\n• FCInv = Fixed Capital Investment (CapEx)\n• WCInv = Working Capital Investment",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_fsa_4",
    moduleId: "fsa",
    front: "In a period of rising prices, compare LIFO vs FIFO impacts.",
    back: "Under rising prices:\n• FIFO (First-In, First-Out): COGS is lower (uses older, cheaper inventory) → Net Income is higher → Taxes are higher → Ending Inventory is higher.\n• LIFO (Last-In, First-Out): COGS is higher → Net Income is lower → Taxes are lower (conserves cash) → Ending Inventory is lower.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_fsa_5",
    moduleId: "fsa",
    front: "What is the Cash Conversion Cycle (CCC) formula?",
    back: "CCC = Days Inventory Outstanding (DIO) + Days Sales Outstanding (DSO) - Days Payable Outstanding (DPO)\n\nWhere:\n• DIO = 365 / Inventory Turnover\n• DSO = 365 / Receivables Turnover\n• DPO = 365 / Payables Turnover\n\nIt measures the length of time (in days) a company's cash is tied up in operations.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_corporate_1",
    moduleId: "corporate",
    front: "What is the formula for Weighted Average Cost of Capital (WACC)?",
    back: "WACC = (wd * rd * (1 - t)) + (wp * rp) + (we * re)\n\nWhere:\n• wd, wp, we = weights of debt, preferred stock, and common equity\n• rd, rp, re = marginal costs of debt, preferred stock, and common equity\n• t = marginal corporate tax rate",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_corporate_2",
    moduleId: "corporate",
    front: "What is the formula and definition of the Degree of Operating Leverage (DOL)?",
    back: "DOL measures the sensitivity of Operating Income (EBIT) to changes in Units Sold / Revenue.\n\nDOL = Percentage Change in EBIT / Percentage Change in Sales\n\nAt a given output level:\nDOL = (Q * (P - V)) / (Q * (P - V) - F) = Gross Margin / EBIT\nWhere:\n• Q = quantity, P = price, V = variable cost per unit, F = fixed operating costs",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_corporate_3",
    moduleId: "corporate",
    front: "Explain why NPV is preferred over IRR for mutually exclusive projects.",
    back: "NPV is preferred because of the reinvestment rate assumption:\n• NPV assumes cash flows are reinvested at the Cost of Capital (highly realistic).\n• IRR assumes cash flows are reinvested at the project's IRR (unrealistic for high-IRR projects).\n\nAdditionally, IRR can produce multiple rates or fail to rank projects of different scales correctly.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_portfolio_1",
    moduleId: "portfolio",
    front: "What is the Capital Asset Pricing Model (CAPM) formula?",
    back: "E(Ri) = Rf + βi * [E(Rm) - Rf]\n\nWhere:\n• E(Ri) = Expected return of asset i\n• Rf = Risk-free rate\n• βi = Beta of asset i\n• [E(Rm) - Rf] = Market risk premium (MRP)",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_portfolio_2",
    moduleId: "portfolio",
    front: "What is the difference between the Capital Market Line (CML) and the Security Market Line (SML)?",
    back: "• Capital Market Line (CML): Plots expected return against TOTAL RISK (standard deviation, σ) for efficient portfolios only.\n• Security Market Line (SML): Plots expected return against SYSTEMATIC RISK (Beta, β) for any individual asset or portfolio. Represents CAPM.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_equity_1",
    moduleId: "equity",
    front: "What is the Gordon Growth Model (GGM) formula for stock valuation?",
    back: "V0 = D1 / (ke - g)\n\nWhere:\n• V0 = Intrinsic value of stock today\n• D1 = Expected dividend next year (D0 * (1 + g))\n• ke = Required rate of return on equity\n• g = Constant growth rate of dividends (must be < ke)",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_equity_2",
    moduleId: "equity",
    front: "What is the formula for Enterprise Value (EV)?",
    back: "EV = Market Value of Common Stock + Market Value of Preferred Stock + Market Value of Debt + Minority Interest - Cash and Short-Term Investments\n\nIt represents the theoretical takeover cost of a company, looking at its entire capital structure.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_fixed_1",
    moduleId: "fixed",
    front: "Describe the difference between Macaulay Duration and Modified Duration.",
    back: "• Macaulay Duration: The weighted average time (in years) until cash flows are received.\n• Modified Duration: Measures the percentage price change of a bond in response to a 100 bps change in yield.\n\nFormula:\nModified Duration = Macaulay Duration / (1 + YTM / m)\nWhere m = number of coupon payments per year.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_fixed_2",
    moduleId: "fixed",
    front: "Explain the relationship between Spot Rates and Forward Rates.",
    back: "A spot rate is the yield to maturity on a zero-coupon bond today. A forward rate is an interest rate agreed upon today for a loan to be made at a future date.\n\nRelationship (e.g. 2-year spot rate): \n(1 + S2)² = (1 + S1) * (1 + 1y1y)\nWhere S2 = 2-year spot rate, S1 = 1-year spot rate, 1y1y = 1-year forward rate starting 1 year from now.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_derivatives_1",
    moduleId: "derivatives",
    front: "Define Put-Call Parity for European options.",
    back: "c + X / (1 + r)^T = p + S0\n\nWhere:\n• c = European call price\n• p = European put price\n• S0 = Spot price of underlying asset today\n• X = Strike/exercise price\n• r = Risk-free rate\n• T = Time to expiration",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_derivatives_2",
    moduleId: "derivatives",
    front: "Define Option Moneyness (ITM, ATM, OTM) for Call and Put options.",
    back: "Where S = Spot Price, X = Strike Price:\n\n• Call Option:\n  - In-the-Money (ITM): S > X\n  - At-the-Money (ATM): S = X\n  - Out-of-the-Money (OTM): S < X\n\n• Put Option:\n  - In-the-Money (ITM): S < X\n  - At-the-Money (ATM): S = X\n  - Out-of-the-Money (OTM): S > X",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_alt_1",
    moduleId: "alt",
    front: "What is the difference between a Hard Hurdle Rate and a Soft Hurdle Rate in hedge funds?",
    back: "• Hard Hurdle Rate: Performance fees are earned ONLY on returns exceeding the hurdle rate.\n• Soft Hurdle Rate: Performance fees are earned on ALL returns once the hurdle rate is cleared.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_alt_2",
    moduleId: "alt",
    front: "Describe the J-Curve effect in Private Equity investments.",
    back: "The J-Curve effect refers to the tendency of private equity funds to experience negative returns and net cash outflows in the initial years (due to management fees, transaction costs, and write-downs of underperforming assets) before generating positive returns and cash distributions in later years as investments mature and are exited.",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_ethics_1",
    moduleId: "ethics",
    front: "What are the 7 Standards of Professional Conduct?",
    back: "1. Professionalism\n2. Integrity of Capital Markets\n3. Duties to Clients\n4. Duties to Employers\n5. Investment Analysis, Recommendations, and Actions\n6. Conflicts of Interest\n7. Responsibilities as a CFA Institute Member or CFA Candidate",
    box: 1,
    nextReview: new Date().toISOString()
  },
  {
    id: "pre_ethics_2",
    moduleId: "ethics",
    front: "What is the Mosaic Theory in the context of insider trading?",
    back: "The Mosaic Theory states that an analyst can construct a mosaic of public information and non-material non-public information to arrive at a material investment conclusion.\n\nUsing non-material non-public information combined with public information to trade or issue recommendations does NOT violate CFA Institute Standards.",
    box: 1,
    nextReview: new Date().toISOString()
  }
];

interface FlashcardsPaneProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  subjects: Subject[];
}

export default function FlashcardsPane({ userProfile, setUserProfile, subjects }: FlashcardsPaneProps) {
  // Combine preloaded default flashcards and custom candidate ones
  const customCards = userProfile.customFlashcards || [];
  const allCards = [...DEFAULT_FLASHCARDS, ...customCards];

  // Subject options
  const subjectList = [
    { id: "all", name: "All Subjects", color: "#64748b" },
    ...subjects.map(s => ({ id: s.id, name: s.name, color: s.color }))
  ];

  const [activeSubject, setActiveSubject] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [revealStreak, setRevealStreak] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [gradeHistory, setGradeHistory] = useState<Record<string, "mastered" | "review" | "new">>({});

  // Creator state
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newSubject, setNewSubject] = useState("quant");
  const [creatorSuccess, setCreatorSuccess] = useState("");

  // Filtered Cards
  const filteredCards = allCards.filter(
    card => activeSubject === "all" || card.moduleId === activeSubject
  );

  // Active Card
  const activeCard = filteredCards[currentIndex] || null;

  // Sync state stats when subject shifts
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [activeSubject]);

  const handleGrade = (cardId: string, status: "mastered" | "review") => {
    // Record in local grade history for active session visual cue
    setGradeHistory(prev => ({
      ...prev,
      [cardId]: status
    }));

    // Update streak and session reviewed counts
    setSessionCount(p => p + 1);
    if (status === "mastered") {
      setRevealStreak(p => p + 1);
    } else {
      setRevealStreak(0);
    }

    // Update global state inside userProfile for persistence and Supabase sync
    const currentHistory = userProfile.flashcardHistory || {};
    const cardHistory = currentHistory[cardId] || {
      correctCount: 0,
      incorrectCount: 0,
      lastReviewedAt: new Date().toISOString(),
      status: "new"
    };

    const updatedCardHistory = {
      ...cardHistory,
      correctCount: status === "mastered" ? cardHistory.correctCount + 1 : cardHistory.correctCount,
      incorrectCount: status === "review" ? cardHistory.incorrectCount + 1 : cardHistory.incorrectCount,
      lastReviewedAt: new Date().toISOString(),
      status: status
    };

    const updatedHistory = {
      ...currentHistory,
      [cardId]: updatedCardHistory
    };

    const updatedProfile = {
      ...userProfile,
      flashcardHistory: updatedHistory
    };

    setUserProfile(updatedProfile);

    // Proceed to next card automatically after a brief timeout for feel
    setTimeout(() => {
      if (currentIndex < filteredCards.length - 1) {
        setCurrentIndex(p => p + 1);
        setIsFlipped(false);
      } else {
        // Wrapped around / Finished deck
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    }, 450);
  };

  const handleAddCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: "custom_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      moduleId: newSubject,
      front: newFront.trim(),
      back: newBack.trim(),
      box: 1,
      nextReview: new Date().toISOString()
    };

    const updatedCustoms = [...customCards, newCard];
    const updatedProfile = {
      ...userProfile,
      customFlashcards: updatedCustoms
    };

    setUserProfile(updatedProfile);

    // Reset fields
    setNewFront("");
    setNewBack("");
    setCreatorSuccess("Custom memory card added successfully to your candidates deck!");
    setTimeout(() => setCreatorSuccess(""), 3500);
  };

  const handleDeleteCustomCard = (cardId: string) => {
    const updatedCustoms = customCards.filter(c => c.id !== cardId);
    const updatedProfile = {
      ...userProfile,
      customFlashcards: updatedCustoms
    };
    setUserProfile(updatedProfile);
    if (currentIndex >= filteredCards.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Calculations for Stats
  const masteredCount = Object.values(userProfile.flashcardHistory || {}).filter(h => h.status === "mastered").length;
  const reviewNeededCount = Object.values(userProfile.flashcardHistory || {}).filter(h => h.status === "review").length;
  const totalAttempted = masteredCount + reviewNeededCount;
  const recallMasteryPercent = totalAttempted > 0 ? Math.round((masteredCount / totalAttempted) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Upper header section */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎴</span>
            <h2 className="text-lg font-serif font-bold text-slate-100">Spaced Repetition Active Recall</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard CFA formulas and tricky core definitions. Flashcard grading stores your retention history and calculates active study metrics.
          </p>
        </div>

        {/* Mini scorecard details */}
        <div className="flex gap-4 bg-slate-800 p-2.5 rounded-xl border border-slate-700 shrink-0 w-full md:w-auto">
          <div className="text-center px-2">
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">Recall Rate</div>
            <div className="text-sm font-bold text-slate-200 font-mono">{recallMasteryPercent}%</div>
          </div>
          <div className="text-center px-2 border-l border-slate-700">
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">Mastered</div>
            <div className="text-sm font-bold text-emerald-500 font-mono">{masteredCount} cards</div>
          </div>
          <div className="text-center px-2 border-l border-slate-700">
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">Active Streak</div>
            <div className="text-sm font-bold text-amber-500 font-mono">🔥 {revealStreak}</div>
          </div>
        </div>
      </div>

      {/* Main Flashcard Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Hand Controller Section */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase font-mono text-slate-300 tracking-wider flex items-center gap-1.5">
              <Filter size={13} className="text-blue-400" /> Deck Navigation
            </h3>

            {/* Subject Filters */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block mb-1">SELECT TARGET AREA:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {subjectList.map(s => {
                  const cardCount = allCards.filter(c => s.id === "all" || c.moduleId === s.id).length;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSubject(s.id)}
                      className={`text-[10px] py-2 px-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                        activeSubject === s.id
                          ? "bg-slate-800 border-blue-500 text-blue-400 font-bold"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                      }`}
                    >
                      <span className="truncate pr-1">{s.name}</span>
                      <span className="text-[8px] px-1 py-0.2 bg-slate-900 rounded font-mono font-medium border border-slate-800 text-slate-400 shrink-0">
                        {cardCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Guidelines */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-400 leading-relaxed space-y-1.5">
              <h4 className="font-semibold text-slate-300 flex items-center gap-1 font-mono">
                <HelpCircle size={11} /> GUIDELINES
              </h4>
              <p>• Click the main card to flip and view the answer key.</p>
              <p>• Grade your retention level using the buttons below.</p>
              <p>• Mix custom candidate notes with default preloaded cards for comprehensive mastery.</p>
            </div>
          </div>

          {/* Quick Creator Toggle */}
          <button
            onClick={() => setIsCreatorOpen(!isCreatorOpen)}
            className="w-full bg-[#5A6344] hover:bg-[#4d543a] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition shadow border-none cursor-pointer"
          >
            <Plus size={14} />
            {isCreatorOpen ? "Hide Custom Creator" : "Create Custom Flashcard"}
          </button>

          {/* Custom Card Creator drawer */}
          {isCreatorOpen && (
            <form onSubmit={handleAddCustomCard} className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg space-y-3 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase font-mono text-slate-300 tracking-wider">
                Create Custom Card
              </h3>

              {creatorSuccess && (
                <div className="p-2 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 rounded text-[10px] font-semibold text-center leading-relaxed">
                  {creatorSuccess}
                </div>
              )}

              <div>
                <label className="block text-[9px] uppercase font-mono font-bold text-slate-500 mb-1">CFA Subject Area</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded outline-none focus:border-blue-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-mono font-bold text-slate-500 mb-1">Front Text (Concept / formula / question)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gordon Growth model valuation formula?"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-mono font-bold text-slate-500 mb-1">Back Text (Explanation / Definition / Breakdown)</label>
                <textarea
                  required
                  placeholder="e.g. V0 = D1 / (ke - g). Perfect calculation detail."
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs p-2.5 rounded h-20 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#8E9B64] hover:bg-[#7d8a57] text-slate-950 text-xs font-bold py-2 rounded-lg border-none cursor-pointer transition"
              >
                Add Card to Active Deck
              </button>
            </form>
          )}
        </div>

        {/* Right Hand / Interactive Card Stage Area (Takes 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          
          {filteredCards.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-lg min-h-[350px]">
              <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-2xl">
                📭
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">No Flashcards Found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  There are no cards in the "{subjectList.find(s => s.id === activeSubject)?.name}" category. Create your own custom card below to start active recall!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Deck progress indicators */}
              <div className="flex justify-between items-center text-xs text-slate-400 px-1 font-mono">
                <span>
                  Card <strong className="text-slate-200 font-bold">{currentIndex + 1}</strong> of <strong className="text-slate-200 font-bold">{filteredCards.length}</strong>
                </span>
                <span className="text-[10px] text-slate-500">
                  {sessionCount} total ratings this session
                </span>
              </div>

              {/* Progress bar container */}
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / filteredCards.length) * 100}%` }}
                />
              </div>

              {/* Interactive Flipping Card Stage */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative h-[280px] w-full cursor-pointer select-none group"
              >
                {/* Unified transition card block */}
                <div 
                  className={`w-full h-full border border-slate-800 rounded-2xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 ${
                    isFlipped ? "bg-slate-950" : "bg-slate-900"
                  }`}
                >
                  {!isFlipped ? (
                    /* Card Front Component */
                    <div className="flex-1 flex flex-col justify-between animate-fadeIn">
                      {/* Gloss background highlight */}
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                      
                      {/* Header */}
                      <div className="flex justify-between items-center z-10">
                        <span className="text-[8px] font-mono tracking-widest font-bold uppercase bg-blue-950/50 border border-blue-900 text-blue-400 px-2 py-0.5 rounded-full">
                          {subjects.find(s => s.id === activeCard?.moduleId)?.name || "CFA Concept"}
                        </span>
                        <Bookmark size={14} className="text-slate-600 group-hover:text-slate-400 transition" />
                      </div>

                      {/* Question text content */}
                      <div className="text-center py-4 z-10 my-auto">
                        <p className="text-sm md:text-base font-serif font-semibold text-slate-100 leading-relaxed max-w-md mx-auto">
                          {activeCard?.front}
                        </p>
                      </div>

                      {/* Footer cue */}
                      <div className="text-center z-10 flex justify-center items-center gap-1.5 text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                        <RotateCw size={10} className="animate-spin-slow" />
                        <span>Click card to reveal recall answer</span>
                      </div>
                    </div>
                  ) : (
                    /* Card Back Component */
                    <div className="flex-1 flex flex-col justify-between animate-fadeIn overflow-y-auto">
                      {/* Gloss background highlight */}
                      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#5A6344]/5 rounded-full blur-3xl pointer-events-none" />

                      {/* Header */}
                      <div className="flex justify-between items-center mb-2 z-10">
                        <span className="text-[8px] font-mono tracking-widest font-bold uppercase bg-[#5A6344]/30 border border-[#5A6344]/50 text-[#8E9B64] px-2 py-0.5 rounded-full">
                          Answer Key & Breakdown
                        </span>
                        {userProfile.flashcardHistory?.[activeCard?.id] && (
                          <span className="text-[8px] font-mono font-semibold text-slate-500">
                            Last session: {userProfile.flashcardHistory[activeCard.id].status.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Answer text content */}
                      <div className="my-auto py-2 z-10">
                        <pre className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap text-left bg-slate-900/65 p-4 rounded-xl border border-slate-850 overflow-x-auto max-h-[160px]">
                          {activeCard?.back}
                        </pre>
                      </div>

                      {/* Footer visual indicators */}
                      <div className="text-center mt-2 text-[9px] text-slate-500 uppercase tracking-wider font-mono z-10">
                        Click anywhere to flip back
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tactile Grading Dashboard Buttons */}
              <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeCard) handleGrade(activeCard.id, "review");
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900 text-rose-400 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  <X size={14} />
                  <span>Forgot / Needs Review</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeCard) handleGrade(activeCard.id, "mastered");
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900 text-emerald-400 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  <Check size={14} />
                  <span>Correct / Got It</span>
                </button>
              </div>

              {/* Delete capability if it's a candidate custom card */}
              {activeCard?.id.startsWith("custom_") && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomCard(activeCard.id)}
                    className="flex items-center gap-1.5 text-[10px] text-rose-400/80 hover:text-rose-400 bg-transparent border-none cursor-pointer py-1"
                  >
                    <Trash2 size={11} />
                    <span>Delete custom card from deck</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
