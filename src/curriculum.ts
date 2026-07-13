import { Subject } from "./types";

export interface Question {
  id: string;
  subjectId: string;
  moduleId: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export const CURRICULUM_2026: Subject[] = [
  {
    id: "quant",
    name: "Quantitative Methods",
    weight: "6-9%",
    color: "emerald",
    modules: [
      { id: "qm-1", name: "Rates and Returns", order: 1 },
      { id: "qm-2", name: "The Time Value of Money in Finance", order: 2 },
      { id: "qm-3", name: "Statistical Measures of Asset Return", order: 3 },
      { id: "qm-4", name: "Probability Trees and Conditional Expectations", order: 4 },
      { id: "qm-5", name: "Portfolio Mathematics", order: 5 },
      { id: "qm-6", name: "Simulation Methods", order: 6 },
      { id: "qm-7", name: "Estimation and Inference", order: 7 },
      { id: "qm-8", name: "Hypothesis Testing", order: 8 },
      { id: "qm-9", name: "Parametric and Non-Parametric Tests of Independence", order: 9 },
      { id: "qm-10", name: "Simple Linear Regression", order: 10 },
      { id: "qm-11", name: "Introduction to Big Data Techniques", order: 11 }
    ]
  },
  {
    id: "econ",
    name: "Economics",
    weight: "6-9%",
    color: "blue",
    modules: [
      { id: "ec-1", name: "The Firm and Market Structures", order: 12 },
      { id: "ec-2", name: "Understanding Business Cycles", order: 13 },
      { id: "ec-3", name: "Fiscal Policy", order: 14 },
      { id: "ec-4", name: "Monetary Policy", order: 15 },
      { id: "ec-5", name: "Introduction to Geopolitics", order: 16 },
      { id: "ec-6", name: "International Trade", order: 17 },
      { id: "ec-7", name: "Capital Flows and the FX Market", order: 18 },
      { id: "ec-8", name: "Exchange Rate Calculations", order: 19 }
    ]
  },
  {
    id: "corporate",
    name: "Corporate Issuers",
    weight: "6-9%",
    color: "cyan",
    modules: [
      { id: "ci-1", name: "Organizational Forms, Corporate Issuer Features, and Ownership", order: 20 },
      { id: "ci-2", name: "Investors and Other Stakeholders", order: 21 },
      { id: "ci-3", name: "Corporate Governance: Conflicts, Mechanisms, Risks, and Benefits", order: 22 },
      { id: "ci-4", name: "Working Capital and Liquidity", order: 23 },
      { id: "ci-5", name: "Capital Investments and Capital Allocation", order: 24 },
      { id: "ci-6", name: "Capital Structure", order: 25 },
      { id: "ci-7", name: "Business Models", order: 26 }
    ]
  },
  {
    id: "fsa",
    name: "Financial Statement Analysis",
    weight: "11-14%",
    color: "indigo",
    modules: [
      { id: "fsa-1", name: "Introduction to Financial Statement Analysis", order: 27 },
      { id: "fsa-2", name: "Understanding Income Statements", order: 28 },
      { id: "fsa-3", name: "Understanding Balance Sheets", order: 29 },
      { id: "fsa-4", name: "Analyzing Statements of Cash Flow I", order: 30 },
      { id: "fsa-5", name: "Analyzing Statements of Cash Flow II", order: 31 },
      { id: "fsa-6", name: "Analysis of Inventories", order: 32 },
      { id: "fsa-7", name: "Analysis of Long-Term Assets", order: 33 },
      { id: "fsa-8", name: "Topics in Long-Term Liabilities and Equity", order: 34 },
      { id: "fsa-9", name: "Analysis of Income Taxes", order: 35 },
      { id: "fsa-10", name: "Financial Reporting Quality", order: 36 },
      { id: "fsa-11", name: "Financial Analysis Techniques", order: 37 },
      { id: "fsa-12", name: "Introduction to Financial Statement Modeling", order: 38 }
    ]
  },
  {
    id: "equity",
    name: "Equity Investments",
    weight: "11-14%",
    color: "pink",
    modules: [
      { id: "eq-1", name: "Market Organization and Structure", order: 39 },
      { id: "eq-2", name: "Security Market Indexes", order: 40 },
      { id: "eq-3", name: "Market Efficiency", order: 41 },
      { id: "eq-4", name: "Overview of Equity Securities", order: 42 },
      { id: "eq-5", name: "Company Analysis: Past and Present", order: 43 },
      { id: "eq-6", name: "Industry and Competitive Analysis", order: 44 },
      { id: "eq-7", name: "Company Analysis: Forecasting", order: 45 },
      { id: "eq-8", name: "Equity Valuation: Concepts and Basic Tools", order: 46 }
    ]
  },
  {
    id: "fixed",
    name: "Fixed Income",
    weight: "11-14%",
    color: "rose",
    modules: [
      { id: "fi-1", name: "Bond Features (Fixed-Income Instrument Features)", order: 47 },
      { id: "fi-2", name: "Types of Fixed-Income Instruments (Fixed-Income Cash Flows and Types)", order: 48 },
      { id: "fi-3", name: "Fixed-Income Issuance and Trading", order: 49 },
      { id: "fi-4", name: "Bond Markets for Corporate Issuers", order: 50 },
      { id: "fi-5", name: "Bond Markets for Government Issuers", order: 51 },
      { id: "fi-6", name: "Bond Valuation (Fixed-Income Bond Valuation: Prices and Yields)", order: 52 },
      { id: "fi-7", name: "Fixed-Rate Bonds: Yields and Yield Spreads", order: 53 },
      { id: "fi-8", name: "Floating-Rate Instruments: Yields and Yield Spreads", order: 54 },
      { id: "fi-9", name: "Term Structure of Interest Rates (Spot, Par, and Forward Curves)", order: 55 },
      { id: "fi-10", name: "Risk Associated with Bonds - Introduction (Interest Rate Risk and Return)", order: 56 },
      { id: "fi-11", name: "Yield-Based Bond Duration", order: 57 },
      { id: "fi-12", name: "Yield-Based Bond Convexity", order: 58 },
      { id: "fi-13", name: "Curve-Based and Empirical Fixed-Income Risk Measures", order: 59 },
      { id: "fi-14", name: "Credit Risk", order: 60 },
      { id: "fi-15", name: "Credit Analysis: Government Issuers", order: 61 },
      { id: "fi-16", name: "Credit Analysis: Corporate Issuers", order: 62 },
      { id: "fi-17", name: "Securitization (Fixed-Income Securitization)", order: 63 },
      { id: "fi-18", name: "Asset-Backed Securities", order: 64 },
      { id: "fi-19", name: "Mortgage-Backed Securities", order: 65 }
    ]
  },
  {
    id: "derivatives",
    name: "Derivatives",
    weight: "5-8%",
    color: "violet",
    modules: [
      { id: "de-1", name: "Derivative Instrument and Derivative Market Features", order: 66 },
      { id: "de-2", name: "Forward Commitment and Contingent Claim Features and Instruments", order: 67 },
      { id: "de-3", name: "Derivative Benefits, Risks, and Issuer and Investor Uses", order: 68 },
      { id: "de-4", name: "Arbitrage, Replication, and the Cost of Carry in Pricing Derivatives", order: 69 },
      { id: "de-5", name: "Pricing and Valuation of Forward Contracts", order: 70 },
      { id: "de-6", name: "Pricing and Valuation of Futures Contracts", order: 71 },
      { id: "de-7", name: "Pricing and Valuation of Interest Rate and Other Swaps", order: 72 },
      { id: "de-8", name: "Pricing and Valuation of Options", order: 73 },
      { id: "de-9", name: "Option Replication Using Put-Call Parity", order: 74 },
      { id: "de-10", name: "Valuing a Derivative Using a One-Period Binomial Model", order: 75 }
    ]
  },
  {
    id: "alt",
    name: "Alternative Investments",
    weight: "7-10%",
    color: "amber",
    modules: [
      { id: "ai-1", name: "Alternative Investment Features, Methods, and Structures", order: 76 },
      { id: "ai-2", name: "Alternative Investment Performance and Returns", order: 77 },
      { id: "ai-3", name: "Investments in Private Capital: Equity and Debt", order: 78 },
      { id: "ai-4", name: "Real Estate and Infrastructure", order: 79 },
      { id: "ai-5", name: "Natural Resources", order: 80 },
      { id: "ai-6", name: "Hedge Funds", order: 81 },
      { id: "ai-7", name: "Introduction to Digital Assets", order: 82 }
    ]
  },
  {
    id: "portfolio",
    name: "Portfolio Management",
    weight: "5-8%",
    color: "teal",
    modules: [
      { id: "pm-1", name: "Portfolio Risk & Return: Part I", order: 83 },
      { id: "pm-2", name: "Portfolio Risk & Return: Part II", order: 84 },
      { id: "pm-3", name: "Portfolio Management: An Overview", order: 85 },
      { id: "pm-4", name: "Basics of Portfolio Planning & Construction", order: 86 },
      { id: "pm-5", name: "The Behavioral Biases of Individuals", order: 87 },
      { id: "pm-6", name: "Introduction to Risk Management", order: 88 }
    ]
  },
  {
    id: "ethics",
    name: "Ethical and Professional Standards",
    weight: "15-20%",
    color: "purple",
    modules: [
      { id: "et-1", name: "Ethics and Trust in the Investment Profession", order: 89 },
      { id: "et-2", name: "Code of Ethics and Standards of Professional Conduct", order: 90 },
      { id: "et-3", name: "Guidance for Standards I-VII", order: 91 },
      { id: "et-4", name: "Introduction to the Global Investment Performance Standards (GIPS)", order: 92 },
      { id: "et-5", name: "Ethics Application", order: 93 }
    ]
  }
];

export const CURRICULUM_L2_2026: Subject[] = [
  {
    id: "quant",
    name: "Quantitative Methods",
    weight: "5-10%",
    color: "emerald",
    modules: [
      { id: "qm-l2-1", name: "Basics of Multiple Regression and Underlying Assumptions", order: 1 },
      { id: "qm-l2-2", name: "Evaluating Regression Model Fit and Interpreting Model Results", order: 2 },
      { id: "qm-l2-3", name: "Model Misspecification", order: 3 },
      { id: "qm-l2-4", name: "Extensions of Multiple Regression", order: 4 },
      { id: "qm-l2-5", name: "Time-Series Analysis", order: 5 },
      { id: "qm-l2-6", name: "Machine Learning (Note: One advanced LOS on neural networks removed in 2026)", order: 6 },
      { id: "qm-l2-7", name: "Big Data Projects", order: 7 }
    ]
  },
  {
    id: "econ",
    name: "Economics",
    weight: "5-10%",
    color: "blue",
    modules: [
      { id: "ec-l2-1", name: "Currency Exchange Rates: Understanding Equilibrium Value", order: 8 },
      { id: "ec-l2-2", name: "Economic Growth", order: 9 }
    ]
  },
  {
    id: "fsa",
    name: "Financial Statement Analysis",
    weight: "10-15%",
    color: "indigo",
    modules: [
      { id: "fsa-l2-1", name: "Intercorporate Investments", order: 10 },
      { id: "fsa-l2-2", name: "Employee Compensation: Post-Employment and Share-Based", order: 11 },
      { id: "fsa-l2-3", name: "Multinational Operations", order: 12 },
      { id: "fsa-l2-4", name: "Analysis of Financial Institutions", order: 13 },
      { id: "fsa-l2-5", name: "Evaluating Quality of Financial Reports", order: 14 },
      { id: "fsa-l2-6", name: "Integration of Financial Statement Analysis Techniques", order: 15 }
    ]
  },
  {
    id: "corporate",
    name: "Corporate Issuers",
    weight: "5-10%",
    color: "cyan",
    modules: [
      { id: "ci-l2-1", name: "Analysis of Dividends and Share Repurchases", order: 16 },
      { id: "ci-l2-2", name: "Environmental, Social, and Governance (ESG) Considerations in Investment Analysis", order: 17 },
      { id: "ci-l2-3", name: "Cost of Capital: Advanced Topics", order: 18 },
      { id: "ci-l2-4", name: "Corporate Restructuring", order: 19 }
    ]
  },
  {
    id: "equity",
    name: "Equity Investments",
    weight: "10-15%",
    color: "pink",
    modules: [
      { id: "eq-l2-1", name: "Equity Valuation: Applications and Processes", order: 20 },
      { id: "eq-l2-2", name: "Discounted Dividend Valuation", order: 21 },
      { id: "eq-l2-3", name: "Free Cash Flow Valuation", order: 22 },
      { id: "eq-l2-4", name: "Market-Based Valuation: Price and Enterprise Value Multiples", order: 23 },
      { id: "eq-l2-5", name: "Residual Income Valuation", order: 24 },
      { id: "eq-l2-6", name: "Private Company Valuation", order: 25 }
    ]
  },
  {
    id: "fixed",
    name: "Fixed Income",
    weight: "10-15%",
    color: "rose",
    modules: [
      { id: "fi-l2-1", name: "The Term Structure and Interest Rate Dynamics", order: 26 },
      { id: "fi-l2-2", name: "The Arbitrage-Free Valuation Framework", order: 27 },
      { id: "fi-l2-3", name: "Valuation and Analysis of Bonds with Embedded Options", order: 28 },
      { id: "fi-l2-4", name: "Credit Analysis Models", order: 29 },
      { id: "fi-l2-5", name: "Credit Default Swaps", order: 30 }
    ]
  },
  {
    id: "derivatives",
    name: "Derivatives",
    weight: "5-10%",
    color: "violet",
    modules: [
      { id: "de-l2-1", name: "Pricing and Valuation of Forward Commitments", order: 31 },
      { id: "de-l2-2", name: "Valuation of Contingent Claims", order: 32 }
    ]
  },
  {
    id: "alt",
    name: "Alternative Investments",
    weight: "5-10%",
    color: "amber",
    modules: [
      { id: "ai-l2-1", name: "Introduction to Commodities and Commodity Derivatives", order: 33 },
      { id: "ai-l2-2", name: "Overview of Types of Real Estate Investment", order: 34 },
      { id: "ai-l2-3", name: "Investments in Real Estate Through Publicly Traded Securities", order: 35 },
      { id: "ai-l2-4", name: "Hedge Fund Strategies", order: 36 }
    ]
  },
  {
    id: "portfolio",
    name: "Portfolio Management",
    weight: "10-15%",
    color: "teal",
    modules: [
      { id: "pm-l2-1", name: "Economics and Investment Markets", order: 37 },
      { id: "pm-l2-2", name: "Analysis of Active Portfolio Management", order: 38 },
      { id: "pm-l2-3", name: "Exchange-Traded Funds: Mechanics and Applications", order: 39 },
      { id: "pm-l2-4", name: "Using Multifactor Models", order: 40 },
      { id: "pm-l2-5", name: "Measuring and Managing Market Risk", order: 41 },
      { id: "pm-l2-6", name: "Backtesting and Simulation", order: 42 }
    ]
  },
  {
    id: "ethics",
    name: "Ethical and Professional Standards",
    weight: "10-15%",
    color: "purple",
    modules: [
      { id: "et-l2-1", name: "Code of Ethics and Standards of Professional Conduct", order: 43 },
      { id: "et-l2-2", name: "Guidance for Standards I–VII", order: 44 },
      { id: "et-l2-3", name: "Application of the Code and Standards: Level II", order: 45 }
    ]
  }
];

export const CURRICULUM_L2_2027: Subject[] = [
  {
    id: "ethics",
    name: "Ethical and Professional Standards",
    weight: "10-15%",
    color: "purple",
    modules: [
      { id: "et-l2-27-1", name: "Code of Ethics and Standards of Professional Conduct", order: 1 },
      { id: "et-l2-27-2", name: "Standard I: Professionalism", order: 2 },
      { id: "et-l2-27-3", name: "Standard II: Integrity of Capital Markets", order: 3 },
      { id: "et-l2-27-4", name: "Standard III: Duties to Clients", order: 4 },
      { id: "et-l2-27-5", name: "Standard IV: Duties to Employers", order: 5 },
      { id: "et-l2-27-6", name: "Standard V: Investment Analysis, Recommendations, and Actions", order: 6 },
      { id: "et-l2-27-7", name: "Standard VI: Conflicts of Interest", order: 7 },
      { id: "et-l2-27-8", name: "Standard VII: Responsibilities as a CFA Institute Member or CFA Candidate", order: 8 },
      { id: "et-l2-27-9", name: "Application of the Code and Standards: Level II", order: 9 }
    ]
  },
  {
    id: "quant",
    name: "Quantitative Methods",
    weight: "5-10%",
    color: "emerald",
    modules: [
      { id: "qm-l2-27-1", name: "Basics of Multiple Regression and Underlying Assumptions", order: 10 },
      { id: "qm-l2-27-2", name: "Evaluating Regression Model Fit and Interpreting Model Results", order: 11 },
      { id: "qm-l2-27-3", name: "Model Misspecification", order: 12 },
      { id: "qm-l2-27-4", name: "Extensions of Multiple Regression", order: 13 },
      { id: "qm-l2-27-5", name: "Time-Series Analysis", order: 14 },
      { id: "qm-l2-27-6", name: "Machine Learning", order: 15 },
      { id: "qm-l2-27-7", name: "Big Data Projects", order: 16 }
    ]
  },
  {
    id: "econ",
    name: "Economics",
    weight: "5-10%",
    color: "blue",
    modules: [
      { id: "ec-l2-27-1", name: "Currency Exchange Rates: Understanding Equilibrium Value", order: 17 },
      { id: "ec-l2-27-2", name: "Economic Growth", order: 18 }
    ]
  },
  {
    id: "fsa",
    name: "Financial Statement Analysis",
    weight: "10-15%",
    color: "indigo",
    modules: [
      { id: "fsa-l2-27-1", name: "Intercorporate Investments", order: 19 },
      { id: "fsa-l2-27-2", name: "Employee Compensation: Post-Employment and Share-Based", order: 20 },
      { id: "fsa-l2-27-3", name: "Multinational Operations", order: 21 },
      { id: "fsa-l2-27-4", name: "Analysis of Financial Institutions", order: 22 },
      { id: "fsa-l2-27-5", name: "Evaluating the Quality of Financial Reports", order: 23 },
      { id: "fsa-l2-27-6", name: "Integration of Financial Statement Analysis Techniques", order: 24 }
    ]
  },
  {
    id: "corporate",
    name: "Corporate Finance",
    weight: "5-10%",
    color: "cyan",
    modules: [
      { id: "ci-l2-27-1", name: "Environmental, Social, and Governance (ESG) Considerations in Investment Analysis", order: 25 },
      { id: "ci-l2-27-2", name: "Cost of Capital: Advanced Topics", order: 26 },
      { id: "ci-l2-27-3", name: "Corporate Restructuring", order: 27 }
    ]
  },
  {
    id: "equity",
    name: "Equities",
    weight: "10-15%",
    color: "pink",
    modules: [
      { id: "eq-l2-27-1", name: "Equity Valuation: Applications and Processes", order: 28 },
      { id: "eq-l2-27-2", name: "Discounted Dividend Valuation", order: 29 },
      { id: "eq-l2-27-3", name: "Free Cash Flow Valuation", order: 30 },
      { id: "eq-l2-27-4", name: "Market-Based Valuation: Price and Enterprise Value Multiples", order: 31 },
      { id: "eq-l2-27-5", name: "Residual Income Valuation", order: 32 },
      { id: "eq-l2-27-6", name: "Private Company Valuation", order: 33 }
    ]
  },
  {
    id: "fixed",
    name: "Fixed Income",
    weight: "10-15%",
    color: "rose",
    modules: [
      { id: "fi-l2-27-1", name: "The Term Structure & Interest Rate Dynamics", order: 34 },
      { id: "fi-l2-27-2", name: "The Arbitrage-Free Valuation Framework", order: 35 },
      { id: "fi-l2-27-3", name: "Valuation & Analysis of Bonds with Embedded Options", order: 36 },
      { id: "fi-l2-27-4", name: "Credit Analysis Models", order: 37 },
      { id: "fi-l2-27-5", name: "Credit Default Swaps", order: 38 }
    ]
  },
  {
    id: "derivatives",
    name: "Derivatives",
    weight: "5-10%",
    color: "violet",
    modules: [
      { id: "de-l2-27-1", name: "Pricing & Valuation of Forward Commitments", order: 39 },
      { id: "de-l2-27-2", name: "Valuation of Contingent Claims", order: 40 }
    ]
  },
  {
    id: "alt",
    name: "Alternative Investments",
    weight: "5-10%",
    color: "amber",
    modules: [
      { id: "ai-l2-27-1", name: "Introduction to Commodities & Commodity Derivatives", order: 41 },
      { id: "ai-l2-27-2", name: "Overview of Types of Real Estate Investment", order: 42 },
      { id: "ai-l2-27-3", name: "Investments in Real Estate Through Publicly Traded Securities", order: 43 },
      { id: "ai-l2-27-4", name: "Hedge Fund Strategies", order: 44 },
      { id: "ai-l2-27-5", name: "Private Equity Valuation", order: 45 }
    ]
  },
  {
    id: "portfolio",
    name: "Portfolio Construction",
    weight: "10-15%",
    color: "teal",
    modules: [
      { id: "pm-l2-27-1", name: "Exchange-Traded Funds: Mechanics & Applications", order: 46 },
      { id: "pm-l2-27-2", name: "Using Multifactor Models", order: 47 },
      { id: "pm-l2-27-3", name: "Measuring & Managing Market Risk", order: 48 },
      { id: "pm-l2-27-4", name: "Economics and Investment Markets", order: 49 },
      { id: "pm-l2-27-5", name: "Analysis of Active Portfolio Management", order: 50 },
      { id: "pm-l2-27-6", name: "Backtesting and Simulation", order: 51 }
    ]
  }
];

export const CURRICULUM_2027: Subject[] = [
  {
    id: "quant",
    name: "Quantitative Methods",
    weight: "6-9%",
    color: "emerald",
    modules: [
      { id: "qm-27-1", name: "Returns of Financial Assets and Instruments", order: 1 },
      { id: "qm-27-2", name: "Types of Financial Returns", order: 2 },
      { id: "qm-27-3", name: "Benchmarking Returns", order: 3 },
      { id: "qm-27-4", name: "The Time Value of Money in Finance", order: 4 },
      { id: "qm-27-5", name: "Statistical Characteristics of Asset Returns", order: 5 },
      { id: "qm-27-6", name: "Statistical Distributions for Financial Asset Prices and Returns", order: 6 },
      { id: "qm-27-7", name: "Estimation and Hypothesis Testing", order: 7 },
      { id: "qm-27-8", name: "The Return and Risk of a Financial Portfolio", order: 8 },
      { id: "qm-27-9", name: "Simulation of Financial Asset Prices and Returns", order: 9 },
      { id: "qm-27-10", name: "Applications of Simple Linear Regression in Finance", order: 10 },
      { id: "qm-27-11", name: "Introduction to Financial Data Science", order: 11 }
    ]
  },
  {
    id: "econ",
    name: "Economics",
    weight: "6-9%",
    color: "blue",
    modules: [
      { id: "ec-27-1", name: "The Firm and Market Structures", order: 12 },
      { id: "ec-27-2", name: "Understanding Business Cycles", order: 13 },
      { id: "ec-27-3", name: "Fiscal Policy", order: 14 },
      { id: "ec-27-4", name: "Monetary Policy", order: 15 },
      { id: "ec-27-5", name: "Introduction to Geopolitics", order: 16 },
      { id: "ec-27-6", name: "International Trade", order: 17 },
      { id: "ec-27-7", name: "Capital Flows and the FX Market", order: 18 },
      { id: "ec-27-8", name: "Exchange Rate Calculations", order: 19 }
    ]
  },
  {
    id: "corporate",
    name: "Corporate Finance",
    weight: "6-9%",
    color: "cyan",
    modules: [
      { id: "ci-27-1", name: "Organizational Forms, Corporate Issuer Features, and Ownership", order: 20 },
      { id: "ci-27-2", name: "Investors and Other Stakeholders", order: 21 },
      { id: "ci-27-3", name: "Corporate Governance: Conflicts, Mechanisms, Risks, and Benefits", order: 22 },
      { id: "ci-27-4", name: "Working Capital and Liquidity", order: 23 },
      { id: "ci-27-5", name: "Capital Investments and Capital Allocation", order: 24 },
      { id: "ci-27-6", name: "Capital Structure", order: 25 },
      { id: "ci-27-7", name: "Business Models", order: 26 }
    ]
  },
  {
    id: "fsa",
    name: "Financial Statement Analysis",
    weight: "11-14%",
    color: "indigo",
    modules: [
      { id: "fsa-27-1", name: "Introduction to Financial Statement Analysis", order: 27 },
      { id: "fsa-27-2", name: "Analyzing Income Statements", order: 28 },
      { id: "fsa-27-3", name: "Analyzing Balance Sheets", order: 29 },
      { id: "fsa-27-4", name: "Analyzing Statements of Cash Flows I", order: 30 },
      { id: "fsa-27-5", name: "Analyzing Statements of Cash Flows II", order: 31 },
      { id: "fsa-27-6", name: "Analysis of Inventories", order: 32 },
      { id: "fsa-27-7", name: "Analysis of Long-Term Assets", order: 33 },
      { id: "fsa-27-8", name: "Topics in Long-Term Liabilities and Equity", order: 34 },
      { id: "fsa-27-9", name: "Analysis of Income Taxes", order: 35 },
      { id: "fsa-27-10", name: "Financial Reporting Quality", order: 36 },
      { id: "fsa-27-11", name: "Financial Analysis Techniques", order: 37 },
      { id: "fsa-27-12", name: "Introduction to Financial Statement Modeling", order: 38 }
    ]
  },
  {
    id: "equity",
    name: "Equities",
    weight: "11-14%",
    color: "pink",
    modules: [
      { id: "eq-27-1", name: "Equity Instrument Features", order: 39 },
      { id: "eq-27-2", name: "Equity Jurisdictions, Classes, and the Voting Process", order: 40 },
      { id: "eq-27-3", name: "Equity Issuance and Trading", order: 41 },
      { id: "eq-27-4", name: "Sources of Equity Returns", order: 42 },
      { id: "eq-27-5", name: "Introduction to Equity Valuation", order: 43 },
      { id: "eq-27-6", name: "Discounted Cash Flow (DCF) and Growth Models", order: 44 },
      { id: "eq-27-7", name: "Relative Value Equity Valuation Approaches", order: 45 },
      { id: "eq-27-8", name: "Financial Statement Forecasting in Equity Valuation", order: 46 },
      { id: "eq-27-9", name: "Industry and Competitive Analysis", order: 47 },
      { id: "eq-27-10", name: "Company Analysis: Past, Present, and Future", order: 48 },
      { id: "eq-27-11", name: "Equity Analyst Research Reports", order: 49 },
      { id: "eq-27-12", name: "The Capital Asset Pricing Model, Market Model, and Other Factor-Based Equity Models", order: 50 }
    ]
  },
  {
    id: "fixed",
    name: "Fixed Income",
    weight: "11-14%",
    color: "rose",
    modules: [
      { id: "fi-27-1", name: "Fixed-Income Instrument Features", order: 51 },
      { id: "fi-27-2", name: "Fixed-Income Cash Flows and Types", order: 52 },
      { id: "fi-27-3", name: "Fixed-Income Issuance and Trading", order: 53 },
      { id: "fi-27-4", name: "Fixed-Income Markets for Corporate Issuers", order: 54 },
      { id: "fi-27-5", name: "Fixed-Income Markets for Government Issuers", order: 55 },
      { id: "fi-27-6", name: "Fixed-Income Bond Valuation: Prices and Yields", order: 56 },
      { id: "fi-27-7", name: "Yield and Yield Spread Measures for Fixed-Rate Bonds", order: 57 },
      { id: "fi-27-8", name: "Yield and Yield Spread Measures for Floating-Rate Instruments", order: 58 },
      { id: "fi-27-9", name: "The Term Structure of Interest Rates: Spot, Par, and Forward Curves", order: 59 },
      { id: "fi-27-10", name: "Interest Rate Risk and Return", order: 60 },
      { id: "fi-27-11", name: "Yield-Based Bond Duration Measures and Properties", order: 61 },
      { id: "fi-27-12", name: "Yield-Based Bond Convexity and Portfolio Properties", order: 62 },
      { id: "fi-27-13", name: "Curve-Based and Empirical Fixed-Income Risk Measures", order: 63 },
      { id: "fi-27-14", name: "Credit Risk", order: 64 },
      { id: "fi-27-15", name: "Credit Analysis for Government Issuers", order: 65 },
      { id: "fi-27-16", name: "Credit Analysis for Corporate Issuers", order: 66 },
      { id: "fi-27-17", name: "Fixed-Income Securitization", order: 67 },
      { id: "fi-27-18", name: "Asset-Backed Security (ABS) Instrument and Market Features", order: 68 },
      { id: "fi-27-19", name: "Mortgage-Backed Security (MBS) Instrument and Market Features", order: 69 }
    ]
  },
  {
    id: "derivatives",
    name: "Derivatives",
    weight: "5-8%",
    color: "violet",
    modules: [
      { id: "de-27-1", name: "Derivative Instrument and Derivative Market Features", order: 70 },
      { id: "de-27-2", name: "Forward Commitment and Contingent Claim Features and Instruments", order: 71 },
      { id: "de-27-3", name: "Derivative Benefits, Risks, and Issuer and Investor Uses", order: 72 },
      { id: "de-27-4", name: "Arbitrage, Replication, and the Cost of Carry in Pricing Derivatives", order: 73 },
      { id: "de-27-5", name: "Pricing and Valuation of Forward Contracts and for an Underlying with Varying Maturities", order: 74 },
      { id: "de-27-6", name: "Pricing and Valuation of Futures Contracts", order: 75 },
      { id: "de-27-7", name: "Pricing and Valuation of Interest Rate and Other Swaps", order: 76 },
      { id: "de-27-8", name: "Pricing and Valuation of Options", order: 77 },
      { id: "de-27-9", name: "Option Replication Using Put–Call Parity", order: 78 },
      { id: "de-27-10", name: "Valuing a Derivative Using a One-Period Binomial Model", order: 79 }
    ]
  },
  {
    id: "alt",
    name: "Alternative Investments",
    weight: "7-10%",
    color: "amber",
    modules: [
      { id: "ai-27-1", name: "Alternative Investment Features, Methods, and Structures", order: 80 },
      { id: "ai-27-2", name: "Alternative Investment Performance and Returns", order: 81 },
      { id: "ai-27-3", name: "Investments in Private Capital: Equity and Debt", order: 82 },
      { id: "ai-27-4", name: "Real Estate and Infrastructure", order: 83 },
      { id: "ai-27-5", name: "Natural Resources", order: 84 },
      { id: "ai-27-6", name: "Hedge Funds", order: 85 },
      { id: "ai-27-7", name: "Introduction to Digital Assets", order: 86 }
    ]
  },
  {
    id: "portfolio",
    name: "Portfolio Construction",
    weight: "5-8%",
    color: "teal",
    modules: [
      { id: "pm-27-1", name: "Portfolio Risk and Return: Part I", order: 87 },
      { id: "pm-27-2", name: "Portfolio Risk and Return: Part II", order: 88 },
      { id: "pm-27-3", name: "Portfolio Management: An Overview", order: 89 },
      { id: "pm-27-4", name: "Basics of Portfolio Planning and Construction", order: 90 },
      { id: "pm-27-5", name: "The Behavioral Biases of Individuals", order: 91 },
      { id: "pm-27-6", name: "Introduction to Risk Management", order: 92 }
    ]
  },
  {
    id: "ethics",
    name: "Ethical and Professional Standards",
    weight: "15-20%",
    color: "purple",
    modules: [
      { id: "et-27-1", name: "Ethics and Trust in the Investment Profession", order: 93 },
      { id: "et-27-2", name: "Code of Ethics and Standards of Professional Conduct", order: 94 },
      { id: "et-27-3", name: "Guidance for Standard I: Professionalism", order: 95 },
      { id: "et-27-4", name: "Guidance for Standard II: Integrity of Capital Markets", order: 96 },
      { id: "et-27-5", name: "Guidance for Standard III: Duties to Clients", order: 97 },
      { id: "et-27-6", name: "Guidance for Standard IV: Duties to Employers", order: 98 },
      { id: "et-27-7", name: "Guidance for Standard V: Investment Analysis, Recommendations, and Actions", order: 99 },
      { id: "et-27-8", name: "Guidance for Standard VI: Conflicts of Interest", order: 100 },
      { id: "et-27-9", name: "Guidance for Standard VII: Responsibilities as a CFA Institute Member or CFA Candidate", order: 101 },
      { id: "et-27-10", name: "Application of the Code and Standards: Level I", order: 102 }
    ]
  }
];

export function getExamYear(targetExamDate?: string): number {
  if (!targetExamDate) return 2026;
  try {
    const d = new Date(targetExamDate);
    const y = d.getFullYear();
    if (isNaN(y)) return 2026;
    return y;
  } catch (e) {
    return 2026;
  }
}

export function getCurriculum(targetExamDate?: string, cfaLevel?: number): Subject[] {
  const level = cfaLevel || 1;
  const year = getExamYear(targetExamDate);
  if (level === 2) {
    return year === 2027 ? CURRICULUM_L2_2027 : CURRICULUM_L2_2026;
  }
  return year === 2027 ? CURRICULUM_2027 : CURRICULUM_2026;
}

export const FLAT_MODULES_2026 = CURRICULUM_2026.flatMap(subj => 
  subj.modules.map(mod => ({
    ...mod,
    subjectId: subj.id,
    subjectName: subj.name,
    color: subj.color,
    weight: subj.weight
  }))
);

export const FLAT_MODULES_2027 = CURRICULUM_2027.flatMap(subj => 
  subj.modules.map(mod => ({
    ...mod,
    subjectId: subj.id,
    subjectName: subj.name,
    color: subj.color,
    weight: subj.weight
  }))
);

export const FLAT_MODULES_L2_2026 = CURRICULUM_L2_2026.flatMap(subj => 
  subj.modules.map(mod => ({
    ...mod,
    subjectId: subj.id,
    subjectName: subj.name,
    color: subj.color,
    weight: subj.weight
  }))
);

export const FLAT_MODULES_L2_2027 = CURRICULUM_L2_2027.flatMap(subj => 
  subj.modules.map(mod => ({
    ...mod,
    subjectId: subj.id,
    subjectName: subj.name,
    color: subj.color,
    weight: subj.weight
  }))
);

export function getFlatModules(targetExamDate?: string, cfaLevel?: number) {
  const level = cfaLevel || 1;
  const year = getExamYear(targetExamDate);
  if (level === 2) {
    return year === 2027 ? FLAT_MODULES_L2_2027 : FLAT_MODULES_L2_2026;
  }
  return year === 2027 ? FLAT_MODULES_2027 : FLAT_MODULES_2026;
}

export function getModuleById(id: string, targetExamDate?: string, cfaLevel?: number) {
  const flatModules = getFlatModules(targetExamDate, cfaLevel);
  const found = flatModules.find(m => m.id === id);
  if (found) return found;
  
  // Search fallback
  const allFlat = [
    ...FLAT_MODULES_2026, 
    ...FLAT_MODULES_2027,
    ...FLAT_MODULES_L2_2026,
    ...FLAT_MODULES_L2_2027
  ];
  return allFlat.find(m => m.id === id);
}

// Keep defaults for legacy static imports
export const CURRICULUM = CURRICULUM_2026;
export const FLAT_MODULES = FLAT_MODULES_2026;

export const SAMPLE_QUESTIONS_2026: Question[] = [
  {
    id: "q-qm-1",
    subjectId: "quant",
    moduleId: "qm-1",
    question: "An investor places $10,000 into a mutual fund with an annual nominal rate of 6% compounded monthly. What is the effective annual rate (EAR)?",
    options: ["6.00%", "6.17%", "6.18%", "6.24%"],
    correctAnswerIndex: 1,
    explanation: "EAR = (1 + r/m)^m - 1 = (1 + 0.06/12)^12 - 1 = (1.005)^12 - 1 ≈ 6.1678% ≈ 6.17%."
  },
  {
    id: "q-qm-2",
    subjectId: "quant",
    moduleId: "qm-2",
    question: "Which of the following is most accurate regarding the Time Value of Money?",
    options: [
      "The value of a future dollar increases as the discount rate increases.",
      "The present value of a future cash flow decreases as the discount rate increases.",
      "An annuity due has cash flows at the end of each compounding period.",
      "A perpetuity has a finite lifespan."
    ],
    correctAnswerIndex: 1,
    explanation: "Present value is inversely related to the discount rate. As the discount rate increases, present value decreases. An annuity due has cash flows at the beginning of each period, and perpetuities are infinite."
  },
  {
    id: "q-ec-1",
    subjectId: "econ",
    moduleId: "ec-1",
    question: "If the price of a good increases by 10% and the quantity demanded decreases by 20%, the good's price elasticity of demand is:",
    options: ["Perfectely inelastic", "Inelastic", "Elastic", "Unit elastic"],
    correctAnswerIndex: 2,
    explanation: "Price elasticity of demand = % change in quantity demanded / % change in price = -20% / 10% = -2.0. Since the absolute value is greater than 1, it is elastic."
  },
  {
    id: "q-ec-2",
    subjectId: "econ",
    moduleId: "ec-2",
    question: "Which market structure is characterized by a single unique seller, no close substitutes, and extremely high barriers to entry?",
    options: ["Monopolistic competition", "Oligopoly", "Pure monopoly", "Perfect competition"],
    correctAnswerIndex: 2,
    explanation: "A pure monopoly is characterized by a single producer of a good with no close substitutes and very high blockades to entrance."
  },
  {
    id: "q-fsa-1",
    subjectId: "fsa",
    moduleId: "fsa-3",
    question: "Which of the following would be classified as an operating activity under US GAAP but could be operating or financing under IFRS?",
    options: [
      "Payment of dividends",
      "Receipt of interest",
      "Purchase of equipment",
      "Payment of taxes"
    ],
    correctAnswerIndex: 1,
    explanation: "Under US GAAP, interest received must be classified as an operating activity. Under IFRS, interest received can be either operating or investing."
  },
  {
    id: "q-fsa-2",
    subjectId: "fsa",
    moduleId: "fsa-5",
    question: "An analyst discovers that a firm capitalized a cost that should have been expensed. Under US GAAP, compared to correct expensing, this error results in:",
    options: [
      "Higher cash flow from operations and higher net income in the current year.",
      "Lower cash flow from investing and lower net income in the current year.",
      "Higher cash flow from investing and higher net income in the current year.",
      "No change to net income but higher cash flow from operations."
    ],
    correctAnswerIndex: 0,
    explanation: "Capitalization moves the cash flow from Operating Activities to Investing Activities (re-classified as CAPEX), thus boosting current Operating Cash Flow. Expensing capital increases expenses, lowering current Net Income; hence, capitalization results in higher net income."
  },
  {
    id: "q-equity-1",
    subjectId: "equity",
    moduleId: "eq-4",
    question: "Which of the following equity security types represents direct ownership in a firm with dividends paid at the discretion of the board and residual claim on assets?",
    options: ["Preferred share", "Common share", "Participating preferred share", "Treasury share"],
    correctAnswerIndex: 1,
    explanation: "Common shares represent ownership, have residual claim on assets during liquidation, and get discretionary dividends voted by the Board of Directors."
  },
  {
    id: "q-fixed-1",
    subjectId: "fixed",
    moduleId: "fi-3",
    question: "A bond has a coupon rate of 5%, pays interest semi-annually, and has 10 years to maturity. If the yield to maturity (YTM) is 6%, the bond will trade at:",
    options: ["A discount", "Par", "A premium", "Face value"],
    correctAnswerIndex: 0,
    explanation: "If YTM (6%) > Coupon Rate (5%), investors require a higher return than what the coupon offers. Therefore, the bond price must drop below its par value to sell at a discount."
  },
  {
    id: "q-derivatives-1",
    subjectId: "derivatives",
    moduleId: "de-2",
    question: "What is the difference between an forward contract and a futures contract?",
    options: [
      "Forwards are standardized, while futures are highly customized.",
      "Forwards trade on exchanges, whereas futures are over-the-counter (OTC).",
      "Futures are marked-to-market daily, while forwards are settled only at maturity.",
      "Forwards have zero default risk, whereas futures have significant counterparty risk."
    ],
    correctAnswerIndex: 2,
    explanation: "Futures are standardized contract units traded on exchanges and marked-to-market daily with margin accounts. Forwards are custom credit agreements over-the-counter with single settlement at maturity."
  },
  {
    id: "q-ethics-1",
    subjectId: "ethics",
    moduleId: "et-2",
    question: "According to the CFA Institute Standards of Professional Conduct, an analyst who receives a material nonpublic tip represents a violation if they trade on it. This refers to Standard:",
    options: ["I(A) Knowledge of the Law", "II(A) Material Nonpublic Information", "III(B) Fair Dealing", "VI(A) Disclosure of Conflicts"],
    correctAnswerIndex: 1,
    explanation: "Standard II(A) Material Nonpublic Information forbids members who possess material nonpublic information from trading or causing others to trade on that information."
  }
];

export const SAMPLE_QUESTIONS_2027: Question[] = [
  {
    id: "q-27-qm-1",
    subjectId: "quant",
    moduleId: "qm-27-4",
    question: "An investor places $10,000 into a mutual fund with an annual nominal rate of 6% compounded monthly. What is the effective annual rate (EAR)?",
    options: ["6.00%", "6.17%", "6.18%", "6.24%"],
    correctAnswerIndex: 1,
    explanation: "EAR = (1 + r/m)^m - 1 = (1 + 0.06/12)^12 - 1 = (1.005)^12 - 1 ≈ 6.1678% ≈ 6.17%."
  },
  {
    id: "q-27-qm-2",
    subjectId: "quant",
    moduleId: "qm-27-4",
    question: "Which of the following is most accurate regarding the Time Value of Money?",
    options: [
      "The value of a future dollar increases as the discount rate increases.",
      "The present value of a future cash flow decreases as the discount rate increases.",
      "An annuity due has cash flows at the end of each compounding period.",
      "A perpetuity has a finite lifespan."
    ],
    correctAnswerIndex: 1,
    explanation: "Present value is inversely related to the discount rate. As the discount rate increases, present value decreases. An annuity due has cash flows at the beginning of each period, and perpetuities are infinite."
  },
  {
    id: "q-27-ec-1",
    subjectId: "econ",
    moduleId: "ec-27-1",
    question: "If the price of a good increases by 10% and the quantity demanded decreases by 20%, the good's price elasticity of demand is:",
    options: ["Perfectely inelastic", "Inelastic", "Elastic", "Unit elastic"],
    correctAnswerIndex: 2,
    explanation: "Price elasticity of demand = % change in quantity demanded / % change in price = -20% / 10% = -2.0. Since the absolute value is greater than 1, it is elastic."
  },
  {
    id: "q-27-ec-2",
    subjectId: "econ",
    moduleId: "ec-27-1",
    question: "Which market structure is characterized by a single unique seller, no close substitutes, and extremely high barriers to entry?",
    options: ["Monopolistic competition", "Oligopoly", "Pure monopoly", "Perfect competition"],
    correctAnswerIndex: 2,
    explanation: "A pure monopoly is characterized by a single producer of a good with no close substitutes and very high blockades to entrance."
  },
  {
    id: "q-27-fsa-1",
    subjectId: "fsa",
    moduleId: "fsa-27-4",
    question: "Which of the following would be classified as an operating activity under US GAAP but could be operating or financing under IFRS?",
    options: [
      "Payment of dividends",
      "Receipt of interest",
      "Purchase of equipment",
      "Payment of taxes"
    ],
    correctAnswerIndex: 1,
    explanation: "Under US GAAP, interest received must be classified as an operating activity. Under IFRS, interest received can be either operating or investing."
  },
  {
    id: "q-27-fsa-2",
    subjectId: "fsa",
    moduleId: "fsa-27-10",
    question: "An analyst discovers that a firm capitalized a cost that should have been expensed. Under US GAAP, compared to correct expensing, this error results in:",
    options: [
      "Higher cash flow from operations and higher net income in the current year.",
      "Lower cash flow from investing and lower net income in the current year.",
      "Higher cash flow from investing and higher net income in the current year.",
      "No change to net income but higher cash flow from operations."
    ],
    correctAnswerIndex: 0,
    explanation: "Capitalization moves the cash flow from Operating Activities to Investing Activities (re-classified as CAPEX), thus boosting current Operating Cash Flow. Expensing capital increases expenses, lowering current Net Income; hence, capitalization results in higher net income."
  },
  {
    id: "q-27-equity-1",
    subjectId: "equity",
    moduleId: "eq-27-5",
    question: "Which of the following equity security types represents direct ownership in a firm with dividends paid at the discretion of the board and residual claim on assets?",
    options: ["Preferred share", "Common share", "Participating preferred share", "Treasury share"],
    correctAnswerIndex: 1,
    explanation: "Common shares represent ownership, have residual claim on assets during liquidation, and get discretionary dividends voted by the Board of Directors."
  },
  {
    id: "q-27-fixed-1",
    subjectId: "fixed",
    moduleId: "fi-27-3",
    question: "A bond has a coupon rate of 5%, pays interest semi-annually, and has 10 years to maturity. If the yield to maturity (YTM) is 6%, the bond will trade at:",
    options: ["A discount", "Par", "A premium", "Face value"],
    correctAnswerIndex: 0,
    explanation: "If YTM (6%) > Coupon Rate (5%), investors require a higher return than what the coupon offers. Therefore, the bond price must drop below its par value to sell at a discount."
  },
  {
    id: "q-27-derivatives-1",
    subjectId: "derivatives",
    moduleId: "de-27-2",
    question: "What is the difference between an forward contract and a futures contract?",
    options: [
      "Forwards are standardized, while futures are highly customized.",
      "Forwards trade on exchanges, whereas futures are over-the-counter (OTC).",
      "Futures are marked-to-market daily, while forwards are settled only at maturity.",
      "Forwards have zero default risk, whereas futures have significant counterparty risk."
    ],
    correctAnswerIndex: 2,
    explanation: "Futures are standardized contract units traded on exchanges and marked-to-market daily with margin accounts. Forwards are custom credit agreements over-the-counter with single settlement at maturity."
  },
  {
    id: "q-27-ethics-1",
    subjectId: "ethics",
    moduleId: "et-27-4",
    question: "According to the CFA Institute Standards of Professional Conduct, an analyst who receives a material nonpublic tip represents a violation if they trade on it. This refers to Standard:",
    options: ["I(A) Knowledge of the Law", "II(A) Material Nonpublic Information", "III(B) Fair Dealing", "VI(A) Disclosure of Conflicts"],
    correctAnswerIndex: 1,
    explanation: "Standard II(A) Material Nonpublic Information forbids members who possess material nonpublic information from trading or causing others to trade on that information."
  }
];

export const SAMPLE_QUESTIONS_L2_2026: Question[] = [
  {
    id: "q-l2-qm-1",
    subjectId: "quant",
    moduleId: "qm-l2-1",
    question: "An analyst runs a multiple regression model and calculates a Durbin-Watson statistic of 0.55. This value most likely indicates:",
    options: [
      "No serial correlation in the regression residuals.",
      "Significant positive serial correlation in the residuals.",
      "Significant negative serial correlation in the residuals.",
      "Extreme multicollinearity among the independent variables."
    ],
    correctAnswerIndex: 1,
    explanation: "A Durbin-Watson statistic near 2.0 indicates no serial correlation. A value significantly below 2.0 (like 0.55) indicates positive serial correlation, whereas a value significantly above 2.0 indicates negative serial correlation."
  },
  {
    id: "q-l2-ec-1",
    subjectId: "econ",
    moduleId: "ec-l2-1",
    question: "Under the Uncovered Interest Rate Parity (UIP) theory, if the nominal interest rate is 5% in Country A and 2% in Country B, the currency of Country A is expected to:",
    options: [
      "Appreciate by approximately 3% against Country B's currency.",
      "Depreciate by approximately 3% against Country B's currency.",
      "Remain stable because of arbitrage equilibrium.",
      "Depreciate by exactly 5% due to inflation differentials."
    ],
    correctAnswerIndex: 1,
    explanation: "According to UIP, the currency of the country with the higher interest rate (Country A, 5%) is expected to depreciate relative to the currency of the country with the lower interest rate (Country B, 2%) by approximately the interest rate differential (5% - 2% = 3%)."
  },
  {
    id: "q-l2-fsa-1",
    subjectId: "fsa",
    moduleId: "fsa-l2-1",
    question: "Under the equity method of accounting for an intercorporate investment, which of the following best describes the effect of receiving a cash dividend from the investee?",
    options: [
      "It increases the investor's net income for the period.",
      "It has no effect on the investment account on the balance sheet.",
      "It decreases the investment account asset on the balance sheet.",
      "It is recorded as an increase in interest income."
    ],
    correctAnswerIndex: 2,
    explanation: "Under the equity method, cash dividends received from the investee are treated as a return of capital, which reduces the carrying value of the investment asset on the investor's balance sheet. Net income is only affected by the investor's share of the investee's earnings, not by dividends."
  },
  {
    id: "q-l2-ci-1",
    subjectId: "corporate",
    moduleId: "ci-l2-1",
    question: "Which share repurchase method is characterized by a company offering to buy back a specific number of shares where shareholders specify the minimum price they are willing to accept?",
    options: [
      "Open market share repurchase",
      "Dutch auction tender offer",
      "Fixed-price tender offer",
      "Direct negotiation repurchase"
    ],
    correctAnswerIndex: 1,
    explanation: "In a Dutch auction tender offer, the company specifies a price range and the number of shares it wants to repurchase. Shareholders submit bids indicating how many shares they are willing to sell and at what price. The company then determines the single lowest price that allows it to buy back the desired number of shares."
  },
  {
    id: "q-l2-eq-1",
    subjectId: "equity",
    moduleId: "eq-l2-2",
    question: "Using the Gordon Growth Model, if a stock just paid a dividend (D0) of $2.00, has a required rate of return of 10%, and dividends are expected to grow at a constant rate of 6% forever, what is the intrinsic value?",
    options: ["$50.00", "$53.00", "$20.00", "$47.17"],
    correctAnswerIndex: 1,
    explanation: "V0 = D1 / (r - g) = [D0 * (1 + g)] / (r - g) = [$2.00 * (1.06)] / (0.10 - 0.06) = $2.12 / 0.04 = $53.00."
  },
  {
    id: "q-l2-fi-1",
    subjectId: "fixed",
    moduleId: "fi-l2-3",
    question: "For a callable bond, as interest rates decrease, the value of the embedded call option held by the issuer:",
    options: [
      "Decreases, causing the callable bond to outperform an otherwise identical straight bond.",
      "Increases, putting a ceiling on the callable bond's price appreciation.",
      "Remains constant since the option strike price is fixed.",
      "Decreases, which increases the option adjusted spread (OAS)."
    ],
    correctAnswerIndex: 1,
    explanation: "As interest rates fall, the value of the call option to the issuer increases because the issuer can refinance at lower rates. This increases option value, which reduces the value of the callable bond (Price_callable = Price_straight - Price_call), capping price appreciation."
  },
  {
    id: "q-l2-de-1",
    subjectId: "derivatives",
    moduleId: "de-l2-1",
    question: "Which of the following is most accurate regarding the difference between the pricing and valuation of a forward commitment?",
    options: [
      "Pricing remains constant throughout the contract, whereas value changes as spot prices move.",
      "Pricing changes daily with market parameters, while value remains at zero.",
      "Both pricing and valuation remain constant over the life of the contract.",
      "Value is determined at inception, whereas pricing is determined at maturity."
    ],
    correctAnswerIndex: 0,
    explanation: "The forward price (pricing) is fixed at inception and remains constant. The value of the contract is zero at inception but fluctuates during the contract's life as market spot prices and interest rates change."
  },
  {
    id: "q-l2-ai-1",
    subjectId: "alt",
    moduleId: "ai-l2-4",
    question: "A hedge fund that takes long positions in undervalued equities and short positions in overvalued equities within the same sector to eliminate systematic market risk is utilizing which strategy?",
    options: [
      "Distressed securities strategy",
      "Global macro strategy",
      "Equity market neutral strategy",
      "Merger arbitrage strategy"
    ],
    correctAnswerIndex: 2,
    explanation: "An equity market neutral strategy seeks to eliminate systematic market risk (beta) by matching long and short exposures in undervalued and overvalued stocks, typically within similar sectors or industries, to profit purely from stock selection."
  },
  {
    id: "q-l2-et-1",
    subjectId: "ethics",
    moduleId: "et-l2-2",
    question: "Under the CFA Institute Standards of Professional Conduct, an analyst is permitted to use nonpublic and nonmaterial information in conjunction with public information to arrive at an investment thesis. This is known as:",
    options: [
      "The Material Information Doctrine",
      "The Mosaic Theory",
      "The Plagiarism Safe Harbor",
      "The Fair Dealing Exception"
    ],
    correctAnswerIndex: 1,
    explanation: "The Mosaic Theory allows CFA charterholders and candidates to use nonpublic, nonmaterial information alongside public material information to build a comprehensive investment analysis without violating Standard II(A) Material Nonpublic Information."
  }
];

export const SAMPLE_QUESTIONS_L2_2027: Question[] = [
  {
    id: "q-27-l2-qm-1",
    subjectId: "quant",
    moduleId: "qm-l2-27-1",
    question: "An analyst runs a multiple regression model and calculates a Durbin-Watson statistic of 0.55. This value most likely indicates:",
    options: [
      "No serial correlation in the regression residuals.",
      "Significant positive serial correlation in the residuals.",
      "Significant negative serial correlation in the residuals.",
      "Extreme multicollinearity among the independent variables."
    ],
    correctAnswerIndex: 1,
    explanation: "A Durbin-Watson statistic near 2.0 indicates no serial correlation. A value significantly below 2.0 (like 0.55) indicates positive serial correlation, whereas a value significantly above 2.0 indicates negative serial correlation."
  },
  {
    id: "q-27-l2-ec-1",
    subjectId: "econ",
    moduleId: "ec-l2-27-1",
    question: "Under the Uncovered Interest Rate Parity (UIP) theory, if the nominal interest rate is 5% in Country A and 2% in Country B, the currency of Country A is expected to:",
    options: [
      "Appreciate by approximately 3% against Country B's currency.",
      "Depreciate by approximately 3% against Country B's currency.",
      "Remain stable because of arbitrage equilibrium.",
      "Depreciate by exactly 5% due to inflation differentials."
    ],
    correctAnswerIndex: 1,
    explanation: "According to UIP, the currency of the country with the higher interest rate (Country A, 5%) is expected to depreciate relative to the currency of the country with the lower interest rate (Country B, 2%) by approximately the interest rate differential (5% - 2% = 3%):"
  },
  {
    id: "q-27-l2-fsa-1",
    subjectId: "fsa",
    moduleId: "fsa-l2-27-1",
    question: "Under the equity method of accounting for an intercorporate investment, which of the following best describes the effect of receiving a cash dividend from the investee?",
    options: [
      "It increases the investor's net income for the period.",
      "It has no effect on the investment account on the balance sheet.",
      "It decreases the investment account asset on the balance sheet.",
      "It is recorded as an increase in interest income."
    ],
    correctAnswerIndex: 2,
    explanation: "Under the equity method, cash dividends received from the investee are treated as a return of capital, which reduces the carrying value of the investment asset on the investor's balance sheet. Net income is only affected by the investor's share of the investee's earnings, not by dividends."
  },
  {
    id: "q-27-l2-ci-1",
    subjectId: "corporate",
    moduleId: "ci-l2-27-1",
    question: "Under the CFA Level II curriculum, which of the following is most accurate regarding the integration of ESG factors into the investment analysis process?",
    options: [
      "ESG factors are only relevant for designated socially responsible investment (SRI) funds.",
      "Integrating ESG factors involves identifying and assessing material ESG risks and opportunities that may affect a company's performance.",
      "ESG integration requires a mandate to sacrifice financial returns to achieve environmental goals.",
      "ESG analysis is strictly qualitative and cannot be integrated into quantitative valuation models."
    ],
    correctAnswerIndex: 1,
    explanation: "ESG integration is the practice of systematically incorporating material ESG factors into investment analysis and decisions to better manage risk and improve long-term returns, without sacrificing performance."
  },
  {
    id: "q-27-l2-eq-1",
    subjectId: "equity",
    moduleId: "eq-l2-27-2",
    question: "Using the Gordon Growth Model, if a stock just paid a dividend (D0) of $2.00, has a required rate of return of 10%, and dividends are expected to grow at a constant rate of 6% forever, what is the intrinsic value?",
    options: ["$50.00", "$53.00", "$20.00", "$47.17"],
    correctAnswerIndex: 1,
    explanation: "V0 = D1 / (r - g) = [D0 * (1 + g)] / (r - g) = [$2.00 * (1.06)] / (0.10 - 0.06) = $2.12 / 0.04 = $53.00."
  },
  {
    id: "q-27-l2-fi-1",
    subjectId: "fixed",
    moduleId: "fi-l2-27-3",
    question: "For a callable bond, as interest rates decrease, the value of the embedded call option held by the issuer:",
    options: [
      "Decreases, causing the callable bond to outperform an otherwise identical straight bond.",
      "Increases, putting a ceiling on the callable bond's price appreciation.",
      "Remains constant since the option strike price is fixed.",
      "Decreases, which increases the option adjusted spread (OAS)."
    ],
    correctAnswerIndex: 1,
    explanation: "As interest rates fall, the value of the call option to the issuer increases because the issuer can refinance at lower rates. This increases option value, which reduces the value of the callable bond (Price_callable = Price_straight - Price_call), capping price appreciation."
  },
  {
    id: "q-27-l2-de-1",
    subjectId: "derivatives",
    moduleId: "de-l2-27-1",
    question: "Which of the following is most accurate regarding the difference between the pricing and valuation of a forward commitment?",
    options: [
      "Pricing remains constant throughout the contract, whereas value changes as spot prices move.",
      "Pricing changes daily with market parameters, while value remains at zero.",
      "Both pricing and valuation remain constant over the life of the contract.",
      "Value is determined at inception, whereas pricing is determined at maturity."
    ],
    correctAnswerIndex: 0,
    explanation: "The forward price (pricing) is fixed at inception and remains constant. The value of the contract is zero at inception but fluctuates during the contract's life as market spot prices and interest rates change."
  },
  {
    id: "q-27-l2-ai-1",
    subjectId: "alt",
    moduleId: "ai-l2-27-4",
    question: "A hedge fund that takes long positions in undervalued equities and short positions in overvalued equities within the same sector to eliminate systematic market risk is utilizing which strategy?",
    options: [
      "Distressed securities strategy",
      "Global macro strategy",
      "Equity market neutral strategy",
      "Merger arbitrage strategy"
    ],
    correctAnswerIndex: 2,
    explanation: "An equity market neutral strategy seeks to eliminate systematic market risk (beta) by matching long and short exposures in undervalued and overvalued stocks, typically within similar sectors or industries, to profit purely from stock selection."
  },
  {
    id: "q-27-l2-et-1",
    subjectId: "ethics",
    moduleId: "et-l2-27-3",
    question: "Under the CFA Institute Standards of Professional Conduct, an analyst is permitted to use nonpublic and nonmaterial information in conjunction with public information to arrive at an investment thesis. This is known as:",
    options: [
      "The Material Information Doctrine",
      "The Mosaic Theory",
      "The Plagiarism Safe Harbor",
      "The Fair Dealing Exception"
    ],
    correctAnswerIndex: 1,
    explanation: "The Mosaic Theory allows CFA charterholders and candidates to use nonpublic, nonmaterial information alongside public material information to build a comprehensive investment analysis without violating Standard II(A) Material Nonpublic Information."
  }
];

export const SAMPLE_QUESTIONS = SAMPLE_QUESTIONS_2026;

export function getSampleQuestions(targetExamDate?: string, cfaLevel?: number): Question[] {
  const level = cfaLevel || 1;
  const year = getExamYear(targetExamDate);
  if (level === 2) {
    return year === 2027 ? SAMPLE_QUESTIONS_L2_2027 : SAMPLE_QUESTIONS_L2_2026;
  }
  return year === 2027 ? SAMPLE_QUESTIONS_2027 : SAMPLE_QUESTIONS_2026;
}
