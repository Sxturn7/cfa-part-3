import { Question } from "../curriculum";

// Standard Subject ID Mapping
const SUBJECTS = ["quant", "econ", "portfolio", "corporate", "fsa", "equity", "fixed", "derivatives", "alt", "ethics"];

export function getProceduralQuestion(subjectId: string, difficulty: string): Question {
  // If "all" is selected, choose a random subject
  const activeSubject = subjectId === "all" ? SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)] : subjectId;
  const subjId = activeSubject || "quant";

  const randomId = `proc-${subjId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Generate based on subject
  switch (subjId) {
    case "quant":
      return generateQuantQuestion(randomId, difficulty);
    case "econ":
      return generateEconQuestion(randomId, difficulty);
    case "portfolio":
      return generatePortfolioQuestion(randomId, difficulty);
    case "corporate":
      return generateCorporateQuestion(randomId, difficulty);
    case "fsa":
      return generateFsaQuestion(randomId, difficulty);
    case "equity":
      return generateEquityQuestion(randomId, difficulty);
    case "fixed":
      return generateFixedIncomeQuestion(randomId, difficulty);
    case "derivatives":
      return generateDerivativesQuestion(randomId, difficulty);
    case "alt":
      return generateAltInvestmentsQuestion(randomId, difficulty);
    case "ethics":
    default:
      return generateEthicsQuestion(randomId, difficulty);
  }
}

// Help format options with realistic distractors
function formatOptionsWithCorrect(correctVal: number, scale: string, formatDecimals = 2): { options: string[], correctIdx: number } {
  const deviation = Math.max(Math.abs(correctVal) * 0.15, 0.25);
  const incorrect1 = correctVal + deviation;
  const incorrect2 = correctVal - deviation;
  const incorrect3 = correctVal * 1.35;

  const vals = [correctVal, incorrect1, incorrect2, incorrect3].map(v => `${v.toFixed(formatDecimals)}${scale}`);
  const items = vals.map((val, idx) => ({ val, idx }));
  
  // Deterministic shuffle using custom math so options don't jump on re-renders, or standard shuffle
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  
  const options = shuffled.map(s => s.val);
  const correctIdx = shuffled.findIndex(s => s.idx === 0);

  return { options, correctIdx };
}

// 1. QUANT METHODS GENERATORS (5 patterns)
function generateQuantQuestion(id: string, diff: string): Question {
  const patternType = Math.floor(Math.random() * 5);

  if (patternType === 0 || diff === "easy") {
    // Pattern 0: Scales of measurement
    return {
      id,
      subjectId: "quant",
      moduleId: "qm-1",
      question: "Which of the following scales of measurement classifies data into mutually exclusive categories without any qualitative ranking or numeric order?",
      options: ["Ordinal scale", "Nominal scale", "Interval scale", "Ratio scale"],
      correctAnswerIndex: 1,
      explanation: "A Nominal scale simply classifies data into distinct groups with no ranking or quantitative status (e.g., Group A/Group B). Ordinal scale incorporates rankings; Interval scale has exact numerical differences with an arbitrary zero; Ratio scale has a true absolute zero."
    };
  } else if (patternType === 1 || diff === "medium") {
    // Pattern 1: EAR compounding calculation
    const r = parseFloat((4 + Math.random() * 8).toFixed(2)); // annual rate 4%-12%
    const frequencies = [
      { label: "quarterly", m: 4 },
      { label: "monthly", m: 12 },
      { label: "daily", m: 365 }
    ];
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
    const ear = (Math.pow(1 + (r / 100) / freq.m, freq.m) - 1) * 100;
    const { options, correctIdx } = formatOptionsWithCorrect(ear, "%", 3);

    return {
      id,
      subjectId: "quant",
      moduleId: "qm-2",
      question: `An investment product advertises an annual nominal interest rate of ${r}% with ${freq.label} compounding. What is the equivalent Effective Annual Rate (EAR)?`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `EAR is calculated using compounding frequency (m = ${freq.m}). Formula: EAR = (1 + r/m)^m - 1. In this scenario, EAR = (1 + ${r / 100}/${freq.m})^${freq.m} - 1 = ${(ear / 100).toFixed(5)} = ${ear.toFixed(3)}%.`
    };
  } else if (patternType === 2) {
    // Pattern 2: Present Value TVM Single Cash Flow
    const r = parseFloat((3 + Math.random() * 7).toFixed(2));
    const numYears = Math.floor(5 + Math.random() * 10);
    const fv = Math.floor(10000 + Math.random() * 90000);
    const pv = fv / Math.pow(1 + (r / 100), numYears);
    const { options, correctIdx } = formatOptionsWithCorrect(pv, "", 0);

    return {
      id,
      subjectId: "quant",
      moduleId: "qm-2",
      question: `An institutional allocator must fund a single-sum liability of $${fv.toLocaleString()} in exactly ${numYears} years. Assuming a constant annual discount rate of ${r}% compounded annually, what is the Present Value (PV) of this cash flow?`,
      options: options.map(o => `$${parseFloat(o).toLocaleString()}`),
      correctAnswerIndex: correctIdx,
      explanation: `The Present Value is calculated by discounting the single Future Value back: PV = FV / (1 + r)^N. PV = $${fv.toLocaleString()} / (1 + ${r/100})^${numYears} = $${Math.round(pv).toLocaleString()}.`
    };
  } else if (patternType === 3) {
    // Pattern 3: Sharpe Ratio calculation
    const rf = parseFloat((2 + Math.random() * 2).toFixed(2)); // risk-free rate 2%-4%
    const rp = parseFloat((rf + 4 + Math.random() * 6).toFixed(2)); // portfolio return
    const stdDev = parseFloat((8 + Math.random() * 10).toFixed(2)); // volatility
    const sharpe = (rp - rf) / stdDev;
    const { options, correctIdx } = formatOptionsWithCorrect(sharpe, "", 3);

    return {
      id,
      subjectId: "quant",
      moduleId: "qm-3",
      question: `An equity fund boasts an expected annual return of ${rp}% with a standard deviation of returns of ${stdDev}%. Assuming a risk-free rate of ${rf}%, what is the Sharpe Ratio of the portfolio?`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `The Sharpe Ratio measures the excess return per unit of total risk. Formula: Sharpe Ratio = (Rp - Rf) / Volatility. Here: Sharpe = (${rp}% - ${rf}%) / ${stdDev}% = ${sharpe.toFixed(3)}.`
    };
  } else {
    // Pattern 4: Coefficient of Variation
    const mean = parseFloat((6 + Math.random() * 6).toFixed(2)); // mean return 6%-12%
    const stdDev = parseFloat((12 + Math.random() * 10).toFixed(2)); // standard dev 12%-22%
    const cv = stdDev / mean;
    const { options, correctIdx } = formatOptionsWithCorrect(cv, "", 3);

    return {
      id,
      subjectId: "quant",
      moduleId: "qm-3",
      question: `A portfolio manager is evaluating a global real estate investment trust (REIT) that has an expected annual return of ${mean}% and a standard deviation of returns of ${stdDev}%. Calculate the Coefficient of Variation (CV) for the fund.`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `The Coefficient of Variation is a measure of relative dispersion. Formula: CV = Standard Deviation / Mean. In this case, CV = ${stdDev}% / ${mean}% = ${cv.toFixed(3)}.`
    };
  }
}

// 2. ECONOMICS GENERATORS (5 patterns)
function generateEconQuestion(id: string, diff: string): Question {
  const patternType = Math.floor(Math.random() * 5);

  if (patternType === 0 || diff === "easy") {
    // Pattern 0: Market structures
    return {
      id,
      subjectId: "econ",
      moduleId: "ec-1",
      question: "Which of the following is most accurate regarding the long-run market equilibrium of a firm operating in a perfectly competitive industry?",
      options: [
        "Firms produce where Price exceeds Marginal Cost and earn economic profits.",
        "Firms produce at the minimum point of their Average Total Cost curve and earn zero economic profits.",
        "Economic barrier structures prevent new capital entrances, creating long run monopoly rents.",
        "Monopolistic product differentiation allows perpetual control over output prices."
      ],
      correctAnswerIndex: 1,
      explanation: "In perfectly competitive long-run equilibrium, entry of new firms drives economic profit to zero. Firms produce where P = MC = min ATC, capturing only normal profit."
    };
  } else if (patternType === 1 || diff === "medium") {
    // Pattern 1: Price Elasticity of Demand
    const pIncreasePct = Math.floor(5 + Math.random() * 10); // 5%-15%
    const qDecreasePct = Math.floor(pIncreasePct * (1.2 + Math.random() * 1.5));
    const elasticity = qDecreasePct / pIncreasePct;

    return {
      id,
      subjectId: "econ",
      moduleId: "ec-1",
      question: `A consumer goods manufacturing firm measures that a price increase of ${pIncreasePct}% for its luxury line results in a corresponding reduction in quantity demanded of ${qDecreasePct}%. Calculate the absolute Price Elasticity of Demand.`,
      options: [
        `Elasticity = -${elasticity.toFixed(2)} (Inelastic)`,
        `Elasticity = ${elasticity.toFixed(2)} (Elastic)`,
        `Elasticity = 1.00 (Unit Elastic)`,
        `Elasticity = ${(1/elasticity).toFixed(2)} (Highly Inelastic)`
      ],
      correctAnswerIndex: 1,
      explanation: `Price Elasticity of Demand is absolute percentage change in quantity divided by percentage change in price: Elasticity = |-${qDecreasePct}% / ${pIncreasePct}%| = ${elasticity.toFixed(2)}. Since this is greater than 1.0, the luxury product demonstrates elastic demand.`
    };
  } else if (patternType === 2) {
    // Pattern 2: GDP Expenditure Approach
    const c = Math.floor(300 + Math.random() * 100); // Consumption
    const i = Math.floor(80 + Math.random() * 40);   // Investment
    const g = Math.floor(100 + Math.random() * 50);  // Gov spending
    const x = Math.floor(50 + Math.random() * 20);   // Exports
    const m = Math.floor(60 + Math.random() * 20);   // Imports
    const gdp = c + i + g + (x - m);
    const { options, correctIdx } = formatOptionsWithCorrect(gdp, " billion", 1);

    return {
      id,
      subjectId: "econ",
      moduleId: "ec-2",
      question: `An economist compiles national account details for an emerging market: Private consumption (C) = $${c} billion; Gross private investment (I) = $${i} billion; Government purchases (G) = $${g} billion; Exports (X) = $${x} billion; and Imports (M) = $${m} billion. Compute the Gross Domestic Product (GDP) using the expenditure approach.`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `Under the expenditure approach: GDP = C + I + G + (X - M). GDP = $${c} + $${i} + $${g} + ($${x} - $${m}) = $${gdp} billion.`
    };
  } else if (patternType === 3) {
    // Pattern 3: Monetary / Fiscal Policy
    return {
      id,
      subjectId: "econ",
      moduleId: "ec-3",
      question: "If a central bank wants to implement a stimulative monetary policy, which combination of open-market operations, reserve requirements, and policy interest rates is most appropriate?",
      options: [
        "Sell government bonds, raise reserve requirements, and increase the policy rate.",
        "Buy government bonds, lower reserve requirements, and decrease the policy rate.",
        "Buy government bonds, lower reserve requirements, and increase the policy rate.",
        "Sell government bonds, lower reserve requirements, and decrease the policy rate."
      ],
      correctAnswerIndex: 1,
      explanation: "A stimulative (or expansionary) monetary policy aims to increase money supply and aggregate demand. The central bank buys bonds (injecting reserves), lowers reserve requirements (allowing banks to lend more), and decreases policy rates (lowering borrowing costs)."
    };
  } else {
    // Pattern 4: Currency Cross-Rates
    const eurUsd = parseFloat((1.05 + Math.random() * 0.15).toFixed(4));
    const gbpUsd = parseFloat((1.20 + Math.random() * 0.15).toFixed(4));
    const eurGbp = eurUsd / gbpUsd;
    const { options, correctIdx } = formatOptionsWithCorrect(eurGbp, "", 4);

    return {
      id,
      subjectId: "econ",
      moduleId: "ec-4",
      question: `Assume currency spot exchange rates are quoted as: EUR/USD = ${eurUsd.toFixed(4)} (USD per EUR) and GBP/USD = ${gbpUsd.toFixed(4)} (USD per GBP). Calculate the cross-rate for EUR/GBP.`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `To find the EUR/GBP rate (GBP per EUR), divide the EUR/USD base quote by the GBP/USD quote: EUR/GBP = (EUR/USD) / (GBP/USD). EUR/GBP = ${eurUsd.toFixed(4)} / ${gbpUsd.toFixed(4)} = ${eurGbp.toFixed(4)}.`
    };
  }
}

// 3. PORTFOLIO MANAGEMENT GENERATORS (5 patterns)
function generatePortfolioQuestion(id: string, diff: string): Question {
  const patternType = Math.floor(Math.random() * 5);

  if (patternType === 0 || diff === "easy") {
    // Pattern 0: Systematic vs Unsystematic
    return {
      id,
      subjectId: "portfolio",
      moduleId: "pm-1",
      question: "According to modern portfolio theory, which of the following risks can be eliminated by constructing a widely diversified asset portfolio?",
      options: ["Systematic risk", "Market risk", "Nonsystematic risk", "Beta risk"],
      correctAnswerIndex: 2,
      explanation: "Nonsystematic risk (also called idiosyncratic, unique, or diversifiable risk) is specific to individual firms and is diversified away. Systematic risk (market risk) is non-diversifiable."
    };
  } else if (patternType === 1 || diff === "medium") {
    // Pattern 1: CAPM expected return
    const rf = parseFloat((2 + Math.random() * 3).toFixed(2)); // risk-free rate 2%-5%
    const mkt = parseFloat((rf + 4 + Math.random() * 6).toFixed(2)); // market return 6%-15%
    const beta = parseFloat((0.8 + Math.random() * 0.8).toFixed(2)); // Beta 0.8 - 1.6
    const capmReturn = rf + beta * (mkt - rf);
    const { options, correctIdx } = formatOptionsWithCorrect(capmReturn, "%");

    return {
      id,
      subjectId: "portfolio",
      moduleId: "pm-2",
      question: `Using the Capital Asset Pricing Model (CAPM), calculate the expected rate of return for an equity portfolio with a Beta of ${beta}, assuming a risk-free interest rate of ${rf}% and an expected market index return of ${mkt}%.`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `CAPM expected return formula: E(R) = Rf + beta * [E(Rm) - Rf]. Under these inputs: E(R) = ${rf}% + ${beta} * (${mkt}% - ${rf}%) = ${rf}% + ${(beta * (mkt - rf)).toFixed(2)}% = ${capmReturn.toFixed(2)}%.`
    };
  } else if (patternType === 2) {
    // Pattern 2: Jensen's Alpha
    const rf = parseFloat((2 + Math.random() * 2).toFixed(2));
    const mkt = parseFloat((rf + 5 + Math.random() * 5).toFixed(2));
    const beta = parseFloat((0.9 + Math.random() * 0.5).toFixed(2));
    const actualReturn = parseFloat((rf + beta * (mkt - rf) + (1 + Math.random() * 3)).toFixed(2)); // beat CAPM
    const capmReturn = rf + beta * (mkt - rf);
    const alpha = actualReturn - capmReturn;
    const { options, correctIdx } = formatOptionsWithCorrect(alpha, "%");

    return {
      id,
      subjectId: "portfolio",
      moduleId: "pm-2",
      question: `An active large-cap mutual fund achieves a realized annual return of ${actualReturn}%. The fund's Beta is ${beta}. If the risk-free rate is ${rf}% and the market return is ${mkt}%, calculate the fund's Jensen's Alpha.`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `Jensen's Alpha measures active manager outperformance relative to CAPM. Formula: Alpha = Rp - [Rf + beta * (Rm - Rf)]. CAPM Expected Return = ${rf}% + ${beta} * (${mkt}% - ${rf}%) = ${capmReturn.toFixed(2)}%. Alpha = ${actualReturn}% - ${capmReturn.toFixed(2)}% = ${alpha.toFixed(2)}%.`
    };
  } else if (patternType === 3) {
    // Pattern 3: Behavioral Biases
    return {
      id,
      subjectId: "portfolio",
      moduleId: "pm-3",
      question: "An investor refuses to sell a stock currently trading at $35, which they originally purchased at $50, solely because they are hoping to 'get even' on their purchase. This scenario best highlights which cognitive or emotional bias?",
      options: ["Confirmation bias", "Loss aversion bias", "Overconfidence bias", "Anchoring bias"],
      correctAnswerIndex: 1,
      explanation: "Loss aversion is an emotional bias where investors feel the pain of losses much more intensely than the pleasure of equivalent gains, leading them to hold on to losing investments far too long in hopes of returning to breakeven."
    };
  } else {
    // Pattern 4: IPS Constraints
    return {
      id,
      subjectId: "portfolio",
      moduleId: "pm-4",
      question: "In standard Investment Policy Statement (IPS) formulation, which of the following falls under the category of unique investor circumstances and constraints rather than objectives?",
      options: [
        "A nominal capital preservation goal of 4% annually.",
        "An institutional payout target of 5.5% to fund scholarships.",
        "Liquidity requirements to fund a real estate deposit in 6 months.",
        "A long-term target capital appreciation of CPI + 3%."
      ],
      correctAnswerIndex: 2,
      explanation: "Liquidity requirements represent one of the 5 standard constraints of an IPS (Liquidity, Time Horizon, Tax concerns, Legal/Regulatory, and Unique circumstances). Investment objectives are classified into Return objectives and Risk objectives."
    };
  }
}

// 4. CORPORATE ISSUERS GENERATORS (5 patterns)
function generateCorporateQuestion(id: string, diff: string): Question {
  const patternType = Math.floor(Math.random() * 5);

  if (patternType === 0 || diff === "easy") {
    // Pattern 0: Capital Budgeting decision metrics
    return {
      id,
      subjectId: "corporate",
      moduleId: "ci-1",
      question: "Which of the following capital budgeting decision criteria is defined as the present value of cash inflows divided by the initial cash outlay?",
      options: ["Internal Rate of Return (IRR)", "Profitability Index (PI)", "Net Present Value (NPV)", "Payback Period"],
      correctAnswerIndex: 1,
      explanation: "The Profitability Index (PI) is the PV of future cash flows divided by the initial investment. A PI > 1.0 indicates positive Net Present Value."
    };
  } else if (patternType === 1 || diff === "medium") {
    // Pattern 1: WACC calculation
    const wd = Math.floor(30 + Math.random() * 20); // debt weight 30%-50%
    const we = 100 - wd;
    const rd = parseFloat((4 + Math.random() * 3).toFixed(2)); // pretax cost of debt 4%-7%
    const tax = Math.floor(20 + Math.random() * 15); // tax rate 20%-35%
    const re = parseFloat((8 + Math.random() * 6).toFixed(2)); // cost of equity 8%-14%
    const wacc = (wd / 100) * rd * (1 - tax / 100) + (we / 100) * re;
    const { options, correctIdx } = formatOptionsWithCorrect(wacc, "%");

    return {
      id,
      subjectId: "corporate",
      moduleId: "ci-2",
      question: `A corporation's capital structure consists of ${we}% equity and ${wd}% debt. The cost of equity is estimated at ${re}%, and the pretax cost of debt is ${rd}%. With a corporate tax rate of ${tax}%, what is the Weighted Average Cost of Capital (WACC)?`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `WACC = (We * Re) + [Wd * Rd * (1 - T)]. WACC = (${we / 100} * ${re}%) + [${wd / 100} * ${rd}% * (1 - ${tax / 100})] = ${(we / 100 * re).toFixed(3)}% + ${(wd / 100 * rd * (1 - tax / 100)).toFixed(3)}% = ${wacc.toFixed(2)}%.`
    };
  } else if (patternType === 2) {
    // Pattern 2: Operating Leverage
    const Q = Math.floor(1000 + Math.random() * 2000); // units sold
    const P = parseFloat((25 + Math.random() * 15).toFixed(2)); // price per unit
    const V = parseFloat((P * 0.4).toFixed(2)); // variable cost per unit
    const F = Math.floor(10000 + Math.random() * 5000); // fixed costs
    const dol = (Q * (P - V)) / (Q * (P - V) - F);
    const { options, correctIdx } = formatOptionsWithCorrect(dol, "", 2);

    return {
      id,
      subjectId: "corporate",
      moduleId: "ci-3",
      question: `A widget firm manufactures items at a wholesale Price (P) of $${P} per unit, with Variable Costs (V) of $${V} per unit. If Fixed Costs (F) are $${F.toLocaleString()} and the firm sells ${Q.toLocaleString()} units, calculate the Degree of Operating Leverage (DOL).`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `Degree of Operating Leverage measures the sensitivity of operating income to changes in sales. Formula: DOL = [Q * (P - V)] / [Q * (P - V) - F]. Numerator = ${Q} * ($${P} - $${V}) = $${(Q * (P - V)).toLocaleString()}. Denominator = $${(Q * (P - V)).toLocaleString()} - $${F.toLocaleString()} = $${(Q * (P - V) - F).toLocaleString()}. DOL = $${(Q * (P - V)).toFixed(0)} / $${(Q * (P - V) - F).toFixed(0)} = ${dol.toFixed(2)}.`
    };
  } else if (patternType === 3) {
    // Pattern 3: NPV vs IRR
    return {
      id,
      subjectId: "corporate",
      moduleId: "ci-1",
      question: "Which of the following is most accurate regarding the underlying reinvestment rate assumptions of the Net Present Value (NPV) and Internal Rate of Return (IRR) methods?",
      options: [
        "NPV assumes cash flows are reinvested at the internal rate of return; IRR assumes cost of capital.",
        "NPV assumes cash flows are reinvested at the cost of capital; IRR assumes the internal rate of return.",
        "Both methods assume cash flows are reinvested at the risk-free treasury yield.",
        "Neither method makes any structural assumption about cash flow reinvestment."
      ],
      correctAnswerIndex: 1,
      explanation: "NPV mathematically assumes that intermediate cash inflows are reinvested at the project's discount rate (cost of capital). Conversely, IRR assumes that intermediate cash inflows can be reinvested at the project's calculated IRR. This difference is the source of ranking conflicts for mutually exclusive projects."
    };
  } else {
    // Pattern 4: Cash Conversion Cycle
    const dso = Math.floor(30 + Math.random() * 20); // days sales outstanding
    const dio = Math.floor(40 + Math.random() * 25); // days inventory outstanding
    const dpo = Math.floor(25 + Math.random() * 15); // days payable outstanding
    const ccc = dso + dio - dpo;

    return {
      id,
      subjectId: "corporate",
      moduleId: "ci-4",
      question: `A firm manages working capital with the following average metrics: Days Sales Outstanding (DSO) = ${dso} days; Days Inventory Outstanding (DIO) = ${dio} days; and Days Payable Outstanding (DPO) = ${dpo} days. Calculate the Cash Conversion Cycle (CCC) of the firm.`,
      options: [
        `${ccc} days`,
        `${dso + dio + dpo} days`,
        `${dio - dso + dpo} days`,
        `${ccc - 10} days`
      ],
      correctAnswerIndex: 0,
      explanation: `The Cash Conversion Cycle measures the time elapsed between paying for raw materials and collecting cash from sales. Formula: CCC = DSO + DIO - DPO. CCC = ${dso} + ${dio} - ${dpo} = ${ccc} days.`
    };
  }
}

// 5. FSA GENERATORS (5 patterns)
function generateFsaQuestion(id: string, diff: string): Question {
  const patternType = Math.floor(Math.random() * 5);

  if (patternType === 0 || diff === "easy") {
    // Pattern 0: Inventory cost flow assumptions
    return {
      id,
      subjectId: "fsa",
      moduleId: "fsa-1",
      question: "Under US GAAP, which of the following costs must be capitalized as part of raw inventory value rather than expensed as incurred?",
      options: [
        "Selling and marketing expenses",
        "Abnormal waste of materials and labor",
        "Freight-in transportation costs",
        "Administrative general overhead"
      ],
      correctAnswerIndex: 2,
      explanation: "Freight-in transportation costs represent necessary costs to bring inventory to its present location and condition and must be capitalized under both GAAP and IFRS. Marketing and abnormal waste are expensed."
    };
  } else if (patternType === 1 || diff === "medium") {
    // Pattern 1: DuPont 3-step breakdown
    return {
      id,
      subjectId: "fsa",
      moduleId: "fsa-2",
      question: "Using the traditional DuPont framework, a firm's Return on Equity (ROE) formula is decomposed into which three multiplicative ratios?",
      options: [
        "Gross Margin, Asset Turnover, debt-to-equity ratio",
        "Net Profit Margin, Asset Turnover, Financial Leverage multiplier",
        "Operating Margin, Inventory Turnover, interest coverage ratio",
        "Net Profit Margin, Working Capital ratio, debt-to-assets ratio"
      ],
      correctAnswerIndex: 1,
      explanation: "Under the 3-step DuPont model: ROE = Net Profit Margin (Net Income / Revenue) * Asset Turnover (Revenue / Assets) * Financial Leverage Multiplier (Assets / Equity)."
    };
  } else if (patternType === 2) {
    // Pattern 2: DuPont ROE Math
    const netIncome = Math.floor(50000 + Math.random() * 50000);
    const revenue = netIncome * 10;
    const assets = revenue * 0.8;
    const equity = assets / 2;
    const margin = (netIncome / revenue) * 100;
    const turnover = revenue / assets;
    const leverage = assets / equity;
    const roe = (netIncome / equity) * 100;
    const { options, correctIdx } = formatOptionsWithCorrect(roe, "%");

    return {
      id,
      subjectId: "fsa",
      moduleId: "fsa-2",
      question: `A retailer reports annual Revenue of $${revenue.toLocaleString()}, Net Income of $${netIncome.toLocaleString()}, Total Assets of $${assets.toLocaleString()}, and Total Equity of $${equity.toLocaleString()}. Calculate the Return on Equity (ROE) using DuPont Decomposition.`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `ROE = (Net Income / Equity) = $${netIncome.toLocaleString()} / $${equity.toLocaleString()} = ${roe.toFixed(2)}%.\nDeconstructed DuPont analysis:\n1. Net Profit Margin = Income/Revenue = ${margin.toFixed(1)}%\n2. Asset Turnover = Revenue/Assets = ${turnover.toFixed(2)}x\n3. Leverage Multiplier = Assets/Equity = ${leverage.toFixed(2)}x\nMultiplying these yields ROE = (${(margin/100).toFixed(4)} * ${turnover.toFixed(2)} * ${leverage.toFixed(2)}) = ${roe.toFixed(2)}%.`
    };
  } else if (patternType === 3) {
    // Pattern 3: LIFO vs FIFO in inflation
    return {
      id,
      subjectId: "fsa",
      moduleId: "fsa-1",
      question: "In an environment of rising prices (inflation), which inventory accounting method results in a lower Cost of Goods Sold (COGS), higher ending inventory balance, and a higher current ratio?",
      options: ["FIFO (First-In, First-Out)", "LIFO (Last-In, First-Out)", "Weighted Average Cost", "Specific Identification"],
      correctAnswerIndex: 0,
      explanation: "During inflation, FIFO assigns the oldest (cheaper) costs to COGS, resulting in lower COGS and higher net income. The newest (more expensive) costs remain in ending inventory, raising ending inventory value and the Current Ratio."
    };
  } else {
    // Pattern 4: Capitalize vs Expense
    return {
      id,
      subjectId: "fsa",
      moduleId: "fsa-3",
      question: "Which of the following is most accurate regarding the financial statement impact of capitalizing a cost rather than expensing it in the current period?",
      options: [
        "Capitalizing increases cash flow from operations (CFO) and decreases assets on the balance sheet.",
        "Capitalizing increases assets on the balance sheet and increases cash flow from operations (CFO) during the initial period.",
        "Capitalizing lowers current-period assets and increases current-period operating expenses.",
        "Capitalizing has no impact on cash flows but increases the debt-to-equity ratio."
      ],
      correctAnswerIndex: 1,
      explanation: "When a cost is capitalized, it is recorded as an asset instead of an operating expense, boosting current net income. Under cash flows, a capitalized cost is classified as Cash Flow from Investing (CFI) rather than Cash Flow from Operations (CFO), making CFO look higher in the initial period."
    };
  }
}

// 6. EQUITY INVESTMENTS GENERATORS (5 patterns)
function generateEquityQuestion(id: string, diff: string): Question {
  const patternType = Math.floor(Math.random() * 5);

  if (patternType === 0 || diff === "easy") {
    // Pattern 0: Market efficiency
    return {
      id,
      subjectId: "equity",
      moduleId: "eq-1",
      question: "Which form of the Efficient Market Hypothesis (EMH) asserts that stock prices fully reflect all historical price and volume data, as well as all publicly available information?",
      options: ["Weak-form EMH", "Semi-strong form EMH", "Strong-form EMH", "Technical-form EMH"],
      correctAnswerIndex: 1,
      explanation: "Under Semi-strong form EMH, stock prices fully reflect all historical market data AND all publicly available information (e.g., earnings releases, macro data). Weak-form reflects only historical data. Strong-form reflects all public and private/insider information."
    };
  } else if (patternType === 1 || diff === "medium") {
    // Pattern 1: Gordon Growth Model
    const d0 = parseFloat((1 + Math.random() * 3).toFixed(2)); // dividend $1 - $4
    const g = parseFloat((2 + Math.random() * 3).toFixed(2)); // dividend growth 2%-5%
    const ke = parseFloat((d0 + g + 2 + Math.random() * 5).toFixed(2)); // discount rate 6%-14%
    const d1 = d0 * (1 + g / 100);
    const p0 = d1 / ((ke - g) / 100);
    const { options, correctIdx } = formatOptionsWithCorrect(p0, "", 2);

    return {
      id,
      subjectId: "equity",
      moduleId: "eq-2",
      question: `A company paid an annual dividend of $${d0.toFixed(2)} yesterday. Dividends are projected to grow at a constant annual rate of ${g}% indefinitely. If investors require a return of ${ke}%, calculate the current share value using the Gordon Growth Model.`,
      options: options.map(o => `$${parseFloat(o).toFixed(2)}`),
      correctAnswerIndex: correctIdx,
      explanation: `Gordon constant dividend growth valuation: V0 = D1 / (Ke - g) = D0 * (1 + g) / (Ke - g). Here, D1 = $${d0.toFixed(2)} * (1 + ${g/100}) = $${d1.toFixed(4)}. Intrinsic value V0 = $${d1.toFixed(4)} / (${ke/100} - ${g/100}) = $${p0.toFixed(2)}.`
    };
  } else if (patternType === 2) {
    // Pattern 2: Preferred Stock Valuation
    const div = parseFloat((2 + Math.random() * 5).toFixed(2)); // $2 - $7 dividend
    const r = parseFloat((5 + Math.random() * 5).toFixed(2)); // 5% - 10%
    const p0 = div / (r / 100);
    const { options, correctIdx } = formatOptionsWithCorrect(p0, "", 2);

    return {
      id,
      subjectId: "equity",
      moduleId: "eq-2",
      question: `A perpetual preferred share pays a fixed dividend of $${div.toFixed(2)} per year. If the required rate of return for investors on preferred shares is ${r}%, calculate the current intrinsic value of the share.`,
      options: options.map(o => `$${parseFloat(o).toFixed(2)}`),
      correctAnswerIndex: correctIdx,
      explanation: `Perpetual preferred share is valued as a perpetuity because dividends are fixed and constant forever. Formula: V0 = Dividend / required return. V0 = $${div.toFixed(2)} / ${r/100} = $${p0.toFixed(2)}.`
    };
  } else if (patternType === 3) {
    // Pattern 3: Justified Forward P/E
    const payout = Math.floor(40 + Math.random() * 30); // 40%-70%
    const r = parseFloat((8 + Math.random() * 4).toFixed(2));
    const g = parseFloat((3 + Math.random() * 3).toFixed(2));
    const justifiedPE = (payout / 100) / ((r - g) / 100);
    const { options, correctIdx } = formatOptionsWithCorrect(justifiedPE, "x", 1);

    return {
      id,
      subjectId: "equity",
      moduleId: "eq-2",
      question: `An equity research analyst is evaluating a stock with a constant dividend growth rate of ${g}% and an earnings payout ratio of ${payout}%. If the required cost of equity capital is ${r}%, compute the justified forward P/E ratio.`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `The Justified Forward P/E is modeled from the Gordon Growth Model. Formula: Justified Forward P/E = Payout Ratio / (r - g). Here, P/E = ${(payout/100).toFixed(2)} / (${r/100} - ${g/100}) = ${justifiedPE.toFixed(1)}x.`
    };
  } else {
    // Pattern 4: Enterprise Value
    const mcap = Math.floor(500 + Math.random() * 500); // 500M - 1000M
    const debt = Math.floor(100 + Math.random() * 100);
    const preferred = Math.floor(20 + Math.random() * 30);
    const cash = Math.floor(50 + Math.random() * 40);
    const ev = mcap + debt + preferred - cash;
    const { options, correctIdx } = formatOptionsWithCorrect(ev, "M", 1);

    return {
      id,
      subjectId: "equity",
      moduleId: "eq-3",
      question: `A firm has a common market capitalization of $${mcap}M, outstanding total debt of $${debt}M, outstanding preferred stock of $${preferred}M, and holds cash and cash equivalents of $${cash}M. Calculate the firm's Enterprise Value (EV).`,
      options: options.map(o => `$${o}`),
      correctAnswerIndex: correctIdx,
      explanation: `Enterprise Value (EV) measures the total economic cost of purchasing the entire firm. Formula: EV = Market Capitalization + Debt + Preferred Stock - Cash. EV = $${mcap}M + $${debt}M + $${preferred}M - $${cash}M = $${ev}M.`
    };
  }
}

// 7. FIXED INCOME GENERATORS (5 patterns)
function generateFixedIncomeQuestion(id: string, diff: string): Question {
  const patternType = Math.floor(Math.random() * 5);

  if (patternType === 0 || diff === "easy") {
    // Pattern 0: Coupon rate vs YTM relationship
    return {
      id,
      subjectId: "fixed",
      moduleId: "fi-1",
      question: "Which of the following bonds is characteristically priced at a premium above par value relative to interest rates?",
      options: [
        "A bond whose coupon rate exceeds its required yield to maturity (YTM).",
        "A bond whose coupon rate matches its current market yield.",
        "A zero-coupon bond with five years remaining.",
        "A bond whose coupon rate falls below its required market discount rate."
      ],
      correctAnswerIndex: 0,
      explanation: "If coupon rate > YTM (required yield), investors pay more than face value to capture that higher coupon cash stream, pricing the bond at a premium. Coupon < YTM is priced at a discount; zero-coupon is always a discount."
    };
  } else if (patternType === 1 || diff === "medium") {
    // Pattern 1: Current Yield
    const couponRate = Math.floor(4 + Math.random() * 4); // 4% - 8%
    const currentPricePct = Math.floor(90 + Math.random() * 9); // 90% - 99%
    const currentYield = couponRate / (currentPricePct / 100);
    const { options, correctIdx } = formatOptionsWithCorrect(currentYield, "%");

    return {
      id,
      subjectId: "fixed",
      moduleId: "fi-2",
      question: `A corporate bond has a coupon rate of ${couponRate}% paid annually and is currently trading in secondary markets at a price of $${(currentPricePct * 10).toLocaleString()} (representing ${currentPricePct}% of par value). Calculate its Current Yield.`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `Current Yield = Annual Coupon Payment / Current Market Price. Annual Coupon per $1,000 Bond = $${couponRate * 10}. Market Price = $${currentPricePct * 10}. Current Yield = $${couponRate * 10} / $${currentPricePct * 10} = ${currentYield.toFixed(2)}%.`
    };
  } else if (patternType === 2) {
    // Pattern 2: Approximate YTM
    const coupon = Math.floor(5 + Math.random() * 4) * 10; // annual coupon $50 - $80
    const price = Math.floor(910 + Math.random() * 80); // price $910 - $990
    const years = Math.floor(10 + Math.random() * 10); // 10-20 years
    const approxYtm = (coupon + (1000 - price) / years) / ((1000 + price) / 2) * 100;
    const { options, correctIdx } = formatOptionsWithCorrect(approxYtm, "%");

    return {
      id,
      subjectId: "fixed",
      moduleId: "fi-2",
      question: `A corporate bond has a face value of $1,000, matures in ${years} years, carries an annual coupon of $${coupon}, and is currently priced at $${price}. Compute the approximate Yield to Maturity (YTM) of this bond.`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `Approximate YTM is solved using: [Coupon + (Par - Price) / N] / [(Par + Price) / 2]. In this case: Approx YTM = [$${coupon} + ($1000 - $${price}) / ${years}] / [($1000 + $${price}) / 2] = [${(coupon + (1000 - price)/years).toFixed(2)}] / [${((1000 + price)/2).toFixed(2)}] = ${approxYtm.toFixed(2)}%.`
    };
  } else if (patternType === 3) {
    // Pattern 3: Duration Price Impact
    const dur = parseFloat((4 + Math.random() * 4).toFixed(2)); // duration 4-8 years
    const changeBps = Math.floor(50 + Math.random() * 100); // 50-150 bps
    const pctChange = -dur * (changeBps / 100);
    const { options, correctIdx } = formatOptionsWithCorrect(pctChange, "%");

    return {
      id,
      subjectId: "fixed",
      moduleId: "fi-3",
      question: `An institutional portfolio holds a sovereign bond with a Modified Duration of ${dur} years. If interest rates increase by ${changeBps} basis points (bps) across the yield curve, calculate the estimated percentage change in the price of this bond.`,
      options,
      correctAnswerIndex: correctIdx,
      explanation: `Modified Duration measures price sensitivity to interest rate shifts. Formula: % Price Change = -Modified Duration * Change in Yield (decimal). Increase of ${changeBps} bps is +${(changeBps/100).toFixed(2)}% or ${(changeBps/10000).toFixed(4)} as a decimal. % Price Change = -${dur} * ${(changeBps/10000).toFixed(4)} = ${(pctChange).toFixed(2)}%.`
    };
  } else {
    // Pattern 4: Yield Spreads
    return {
      id,
      subjectId: "fixed",
      moduleId: "fi-4",
      question: "Which of the following yield spreads is defined as the constant spread added to a benchmark swap yield curve that equates the present value of bond cash flows to its market price?",
      options: ["G-spread (Government spread)", "I-spread (Interbank spread)", "Z-spread (Zero-volatility spread)", "OAS (Option-Adjusted Spread)"],
      correctAnswerIndex: 1,
      explanation: "The I-spread (Interbank spread) is the yield premium relative to the swap rate benchmark curve (interbank swap curve). G-spread is relative to a government benchmark; Z-spread is added to spot curves; OAS incorporates option valuations."
    };
  }
}

// 8. DERIVATIVES GENERATORS (5 patterns)
function generateDerivativesQuestion(id: string, diff: string): Question {
  const patternType = Math.floor(Math.random() * 5);

  if (patternType === 0 || diff === "easy") {
    // Pattern 0: Put-call parity concept
    return {
      id,
      subjectId: "derivatives",
      moduleId: "de-1",
      question: "In the context of standard options markets, which of the following is most accurate regarding the principle of put-call parity?",
      options: [
        "Fiduciary call (long call + riskless bond) must equal protective put (long put + long underlying stock).",
        "Fiduciary call (short call + long put) must equal protective put (long underlying + bond).",
        "A long collar allows risk-free arbitrage under all option pairings.",
        "An out-of-the-money call option has positive intrinsic pricing."
      ],
      correctAnswerIndex: 0,
      explanation: "Put-call parity states: C + X / (1+r)^T = P + S0. This means a Fiduciary Call (C + riskless bond X) has the identical payoff at maturity as a Protective Put (P + Stock S0), and must trade at equal current price."
    };
  } else if (patternType === 1 || diff === "medium") {
    // Pattern 1: Put-call parity math
    const s0 = Math.floor(45 + Math.random() * 15); // stock spot $45 - $60
    const strike = s0; // At the money strike
    const callPrice = parseFloat((3 + Math.random() * 3).toFixed(2));
    const r = parseFloat((3 + Math.random() * 2).toFixed(2)); // rate 3%-5%
    const t = 1.0; // 1 year
    const pvStrike = strike / (1 + r / 100);
    const putPrice = callPrice + pvStrike - s0;
    const { options, correctIdx } = formatOptionsWithCorrect(putPrice, "", 2);

    return {
      id,
      subjectId: "derivatives",
      moduleId: "de-1",
      question: `A stock trades at $${s0}. A 1-year European call option with a strike price of $${strike} is priced at $${callPrice}. Assuming a risk-free interest rate of ${r}% compounded annually, calculate the fair price of a 1-year European put option on the same stock with a strike price of $${strike}.`,
      options: options.map(o => `$${parseFloat(o).toFixed(2)}`),
      correctAnswerIndex: correctIdx,
      explanation: `By Put-Call Parity: C + PV(Strike) = P + Spot. So: P = C + Strike / (1+r)^T - Spot. Here, PV(Strike) = $${strike} / (1 + ${r/100})^1 = $${pvStrike.toFixed(2)}. Put Price = $${callPrice} + $${pvStrike.toFixed(2)} - $${s0} = $${putPrice.toFixed(2)}.`
    };
  } else if (patternType === 2) {
    // Pattern 2: Forward Contract Value at expiration
    const contractPrice = Math.floor(100 + Math.random() * 50); // forward contract price $100-$150
    const spotAtExpiry = Math.floor(contractPrice * (1.1 + Math.random() * 0.15)); // spot rose
    const payoff = spotAtExpiry - contractPrice;
    const { options, correctIdx } = formatOptionsWithCorrect(payoff, "", 0);

    return {
      id,
      subjectId: "derivatives",
      moduleId: "de-1",
      question: `An investor enters into a long forward contract on gold at a contract price of $${contractPrice}. At the contract's expiration date, gold is trading in the spot market at $${spotAtExpiry}. Calculate the net profit or loss per contract for the investor.`,
      options: options.map(o => `$${parseFloat(o).toFixed(0)} Profit` || `$${Math.abs(parseFloat(o)).toFixed(0)} Loss`),
      correctAnswerIndex: correctIdx,
      explanation: `For a long forward position, the profit or loss at expiration is equal to Spot Price at Expiry - Forward Contract Price. Gold spot rose to $${spotAtExpiry}, so profit is $${spotAtExpiry} - $${contractPrice} = $${payoff} profit.`
    };
  } else if (patternType === 3) {
    // Pattern 3: Moneyness
    return {
      id,
      subjectId: "derivatives",
      moduleId: "de-1",
      question: "Which of the following descriptions represents a put option that is in-the-money (ITM)?",
      options: [
        "The current asset spot price is equal to the strike price.",
        "The current asset spot price is lower than the strike price.",
        "The current asset spot price is higher than the strike price.",
        "The premium of the option has declined below its intrinsic value."
      ],
      correctAnswerIndex: 1,
      explanation: "A European put option gives the holder the right to sell at the strike price. If the stock spot price falls below the strike price, the holder can sell at a price higher than market value, meaning the option has positive intrinsic value and is in-the-money."
    };
  } else {
    // Pattern 4: Futures Margin
    const initialMargin = Math.floor(4000 + Math.random() * 2000); // 4000 - 6000
    const maintMargin = Math.floor(initialMargin * 0.75); // 75% maintenance
    const loss = initialMargin - maintMargin + Math.floor(200 + Math.random() * 300); // triggers call
    const callValue = loss;

    return {
      id,
      subjectId: "derivatives",
      moduleId: "de-1",
      question: `An investor initiates a long position in a commodity futures contract. The initial margin requirement is $${initialMargin.toLocaleString()} and the maintenance margin is $${maintMargin.toLocaleString()}. If a sudden price decline causes the account balance to fall to $${(initialMargin - loss).toLocaleString()}, calculate the amount of cash (variation margin) the investor must deposit to keep the position open.`,
      options: [
        `$${callValue.toLocaleString()}`,
        `$${(maintMargin - (initialMargin - loss)).toLocaleString()}`,
        "No deposit required",
        `$${initialMargin.toLocaleString()}`
      ],
      correctAnswerIndex: 0,
      explanation: `When a futures margin account balance falls below the maintenance margin level ($${maintMargin.toLocaleString()}), a margin call is triggered. The investor is required to deposit funds to restore the account all the way back to the initial margin requirement ($${initialMargin.toLocaleString()}). Deposit required = $${initialMargin.toLocaleString()} - $${(initialMargin - loss).toLocaleString()} = $${callValue.toLocaleString()}.`
    };
  }
}

// 9. ALTERNATIVE INVESTMENTS GENERATORS (5 patterns)
function generateAltInvestmentsQuestion(id: string, diff: string): Question {
  const patternType = Math.floor(Math.random() * 5);

  if (patternType === 0 || diff === "easy") {
    // Pattern 0: AI definition
    return {
      id,
      subjectId: "alt",
      moduleId: "ai-1",
      question: "Which of the following investment assets is categorized under Alternative Investments in standard asset selection?",
      options: ["Corporate bonds", "Blue-chip common equities", "Real estate investment trusts (REITs) and Private Equity", "Municipal notes"],
      correctAnswerIndex: 2,
      explanation: "Alternative investments include private equity, real estate, hedge funds, commodities, and infrastructure. Tradable capital debt/equity represents traditional assets."
    };
  } else if (patternType === 1 || diff === "medium") {
    // Pattern 1: Direct Capitalization real estate valuation
    const cap = parseFloat((4 + Math.random() * 4).toFixed(2)); // cap rate 4%-8%
    const noi = Math.floor(100000 + Math.random() * 100000); // NOI $100k-$200k
    const value = noi / (cap / 100);
    const { options, correctIdx } = formatOptionsWithCorrect(value, "", 0);

    return {
      id,
      subjectId: "alt",
      moduleId: "ai-2",
      question: `A commercial property produces a stabilized Net Operating Income (NOI) of $${noi.toLocaleString()} per year. Commercial market capitalization rates for comparable properties are currently sitting at ${cap}%. Calculate the estimated property valuation using direct capitalization.`,
      options: options.map(o => `$${parseFloat(o).toLocaleString()}`),
      correctAnswerIndex: correctIdx,
      explanation: `Real estate Direct Capitalization value formula: Property value = NOI / Capitalization Rate. Value = $${noi.toLocaleString()} / ${(cap/100).toFixed(4)} = $${Math.round(value).toLocaleString()}.`
    };
  } else if (patternType === 2) {
    // Pattern 2: Hedge Fund Fees
    const initAssets = 100; // $100M
    const returnPct = Math.floor(10 + Math.random() * 15); // 10%-25% return
    const mgmtFeePct = 2; // 2% management fee
    const perfFeePct = 20; // 20% performance fee
    const assetsEnd = initAssets * (1 + returnPct / 100);
    const grossReturn = assetsEnd - initAssets;
    const mgmtFee = assetsEnd * (mgmtFeePct / 100);
    const perfFee = (grossReturn - mgmtFee) * (perfFeePct / 100);
    const totalFees = mgmtFee + perfFee;
    const { options, correctIdx } = formatOptionsWithCorrect(totalFees, "M", 2);

    return {
      id,
      subjectId: "alt",
      moduleId: "ai-1",
      question: `A hedge fund starts the year with $100M in assets under management. During the year, the fund achieves a gross return of ${returnPct}%. The fund charges a 2% management fee (calculated on year-end gross assets) and a 20% incentive fee (calculated on gross profits net of the management fee). Compute the total fees paid to the fund manager.`,
      options: options.map(o => `$${o}`),
      correctAnswerIndex: correctIdx,
      explanation: `Year-end gross assets = $100M * (1 + ${returnPct/100}) = $${assetsEnd}M. Management Fee (2%) = $${assetsEnd}M * 0.02 = $${mgmtFee.toFixed(2)}M. Gross Return profit = $${grossReturn.toFixed(2)}M. Profit net of management fee = $${grossReturn.toFixed(2)}M - $${mgmtFee.toFixed(2)}M = $${(grossReturn - mgmtFee).toFixed(2)}M. Incentive/performance fee (20%) = $${(grossReturn - mgmtFee).toFixed(2)}M * 0.20 = $${perfFee.toFixed(2)}M. Total Fees = $${mgmtFee.toFixed(2)}M + $${perfFee.toFixed(2)}M = $${totalFees.toFixed(2)}M.`
    };
  } else if (patternType === 3) {
    // Pattern 3: Contango vs Backwardation
    return {
      id,
      subjectId: "alt",
      moduleId: "ai-1",
      question: "In commodities futures markets, when the spot price exceeds the futures price (representing a downward-sloping futures curve), the market is characteristically described as being in:",
      options: ["Contango", "Backwardation", "Contrapose", "Arbitrage equilibrium"],
      correctAnswerIndex: 1,
      explanation: "Backwardation is a commodities market condition where futures contracts are trading at a discount relative to the current spot price (spot > futures). Contango is the opposite condition, where futures prices exceed spot prices (futures > spot)."
    };
  } else {
    // Pattern 4: Infrastructure Greenfield vs Brownfield
    return {
      id,
      subjectId: "alt",
      moduleId: "ai-1",
      question: "Which of the following infrastructure asset types involves upgrading or expanding an existing, fully operating facility and typically has a lower risk profile?",
      options: ["Greenfield investment", "Brownfield investment", "Venture capital project", "Blind-pool mezzanine project"],
      correctAnswerIndex: 1,
      explanation: "A Brownfield investment is an infrastructure project that involves leasing or buying an already built, operating, and revenue-generating facility (e.g., an active toll road). A Greenfield investment involves constructing a brand-new facility from scratch, which carries higher execution and financial risk."
    };
  }
}

// 10. ETHICS GENERATORS (5 patterns)
function generateEthicsQuestion(id: string, diff: string): Question {
  const patternType = Math.floor(Math.random() * 5);

  if (patternType === 0 || diff === "easy") {
    // Pattern 0: Standard I(C) Misrepresentation
    return {
      id,
      subjectId: "ethics",
      moduleId: "et-1",
      question: "Under the CFA Institute Code of Ethics, which of the following actions represents a violation under Standard I(C): Misrepresentation?",
      options: [
        "Providing a full list of sources when referencing third-party historical financial models.",
        "Citing general market benchmarks without attributing standard indices directly in promotional material.",
        "Plagiarizing another researcher's economic analysis and presenting it as one's own proprietary work.",
        "Disclosing prior underperformance records of private accounts to new prospects."
      ],
      correctAnswerIndex: 2,
      explanation: "Standard I(C) Misrepresentation prohibits plagiarism (the use of another researcher's material without attribution) as well as making false promises, misrepresenting qualifications, or misstating performance statistics."
    };
  } else if (patternType === 1 || diff === "medium") {
    // Pattern 1: Standard II(A) Material Nonpublic Information
    return {
      id,
      subjectId: "ethics",
      moduleId: "et-1",
      question: "An analyst overhears two executives from a public telecom company discussing an unannounced, lucrative acquisition in a public airport lounge. If the analyst immediately issues a 'buy' recommendation based solely on this conversation, has a violation occurred?",
      options: [
        "No, because the executive conversation took place in a public area, making the information public.",
        "Yes, because the analyst traded on material nonpublic information in violation of Standard II(A).",
        "No, because the analyst did not actively seek out or bribe anyone to acquire the details.",
        "Yes, but only if the executives are close relatives of the analyst."
      ],
      correctAnswerIndex: 1,
      explanation: "Overhearing executives discuss an unannounced acquisition represents acquiring material nonpublic information. Even though the conversation was accidentally overheard in a public setting, the underlying merger details are still confidential and nonpublic. Trading or recommending trades based on this violates Standard II(A)."
    };
  } else if (patternType === 2) {
    // Pattern 2: Standard III(B) Fair Dealing
    return {
      id,
      subjectId: "ethics",
      moduleId: "et-2",
      question: "According to Standard III(B): Fair Dealing, when a firm changes its rating recommendation on a major equity, the firm is required to:",
      options: [
        "Notify its highest-fee institutional clients at least 24 hours prior to other clients.",
        "Distribute the change in recommendation to all active clients simultaneously, or as closely as possible.",
        "Immediately buy or sell the stock in the firm's own proprietary trading account first.",
        "Delay notifications until the next quarterly reporting period to ensure statistical stability."
      ],
      correctAnswerIndex: 1,
      explanation: "Standard III(B) requires members and candidates to treat all clients fairly when disseminating investment recommendations or taking investment action. Distributing a major rating change must be handled so that all clients receive the recommendation at approximately the same time."
    };
  } else if (patternType === 3) {
    // Pattern 3: Standard III(C) Suitability
    return {
      id,
      subjectId: "ethics",
      moduleId: "et-2",
      question: "An advisor manages a portfolio for an elderly client whose primary IPS objective is capital preservation. A high-growth speculative IPO is released, and the advisor purchases it for the client because the advisor believes the stock will quadruple. Has a violation occurred?",
      options: [
        "No, because the advisor has a fiduciary duty to maximize client wealth by any means necessary.",
        "Yes, because the investment is highly speculative and is unsuitable under the client's IPS constraints, violating Standard III(C).",
        "No, provided the advisor discloses the trade to the client's estate executors within 30 days.",
        "Yes, but only if the trade results in an actual financial loss."
      ],
      correctAnswerIndex: 1,
      explanation: "Under Standard III(C): Suitability, any investment action taken on behalf of a client must be assessed against the client's written constraints and objectives in their Investment Policy Statement (IPS). Purchasing a high-risk speculative stock for a capital-preservation client is a suitability violation, regardless of whether the trade is profitable."
    };
  } else {
    // Pattern 4: Standard IV(A) Loyalty to Employers
    return {
      id,
      subjectId: "ethics",
      moduleId: "et-3",
      question: "An analyst resigns from an investment bank to start their own independent firm. Which of the following is most accurate regarding their duties to their former employer under Standard IV(A): Loyalty?",
      options: [
        "The analyst can copy and take the bank's proprietary valuation models and client records.",
        "The analyst must not take proprietary models, files, or client contact details without explicit consent, but can use skills and knowledge acquired.",
        "The analyst is legally barred from ever competing in the same city or financial sector.",
        "The analyst is free to download the corporate client database as long as they delete the files within 30 days."
      ],
      correctAnswerIndex: 1,
      explanation: "Upon leaving an employer, Standard IV(A) states that assets, records, proprietary software/models, and client list details belong to the employer. Taking them without explicit consent is a violation. However, the analyst's general skills, industry expertise, and non-confidential knowledge are theirs to keep and use."
    };
  }
}
