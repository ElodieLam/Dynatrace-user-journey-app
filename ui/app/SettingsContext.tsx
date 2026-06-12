import React, { createContext, useContext, useState, useEffect } from "react";
import { useUserAppState, useSetUserAppState } from "@dynatrace-sdk/react-hooks";

// ---------------------------------------------------------------------------
// Types & defaults
// ---------------------------------------------------------------------------
export type StepDef = { label: string; identifiers: string[]; type: "view" | "request"; app?: string };

export const DEFAULT_FRONTEND = "www.angular.easytravel.com";
export const MIN_STEPS = 2;
export const MAX_STEPS = 10;

export const DEFAULT_FUNNEL_STEPS: StepDef[] = [
  { label: "Home", identifiers: ["/easytravel/home", "/"], type: "view", app: "www.angular.easytravel.com" },
  { label: "Search", identifiers: ["/easytravel/search"], type: "view", app: "www.angular.easytravel.com" },
  { label: "Journey Detail", identifiers: ["/easytravel/journeys/:id:"], type: "view", app: "www.angular.easytravel.com" },
  { label: "Book", identifiers: ["/easytravel/journeys/:id:/book"], type: "view", app: "www.angular.easytravel.com" },
];

export const DEFAULT_AOV = 1200;
export const DEFAULT_MONTHLY_INFRA_COST = 100000;
export const DEFAULT_CDN_MONTHLY_COST = 100;
export const DEFAULT_COMPUTE_COST_PER_HOUR = 100;
export const DEFAULT_COST_PER_GB = 100;
export const DEFAULT_ENGINEER_HOURLY_RATE = 100;

export type IndustryType = "ecommerce" | "saas" | "media" | "financial" | "travel" | "healthcare" | "gaming" | "general";
export const DEFAULT_INDUSTRY: IndustryType = "ecommerce";
export const INDUSTRY_OPTIONS: { label: string; value: IndustryType }[] = [
  { label: "E-Commerce / Retail", value: "ecommerce" },
  { label: "SaaS / B2B", value: "saas" },
  { label: "Media / Publishing", value: "media" },
  { label: "Financial Services", value: "financial" },
  { label: "Travel / Hospitality", value: "travel" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Gaming", value: "gaming" },
  { label: "General / Other", value: "general" },
];

export interface IndustryBenchmark {
  // FinOps
  costPerConvLow: number; costPerConvHigh: number; revCostRatioTarget: number;
  infraPctRevenueLow: number; infraPctRevenueHigh: number; errorRateTarget: number;
  cdnRoiTarget: number; latencyImpactPerSec: number; idleUtilTarget: number; breakEvenHoursTarget: number;
  // Performance & UX
  convRateTarget: number; apdexTarget: number; avgDurationTarget: number;
  bounceRateTarget: number; frustratedPctTarget: number;
  lcpTarget: number; clsTarget: number; inpTarget: number;
  // Engagement & Retention
  sessionDepthTarget: number; retentionD7Target: number;
  thirdPartyBudgetMs: number; mobileShareExpected: number;
  // Context
  label: string;
}

export const INDUSTRY_BENCHMARKS: Record<IndustryType, IndustryBenchmark> = {
  ecommerce: { costPerConvLow: 0.5, costPerConvHigh: 5, revCostRatioTarget: 7, infraPctRevenueLow: 2, infraPctRevenueHigh: 5, errorRateTarget: 1, cdnRoiTarget: 10, latencyImpactPerSec: 7, idleUtilTarget: 70, breakEvenHoursTarget: 160, convRateTarget: 3.5, apdexTarget: 0.85, avgDurationTarget: 2500, bounceRateTarget: 40, frustratedPctTarget: 8, lcpTarget: 2500, clsTarget: 0.1, inpTarget: 200, sessionDepthTarget: 4.5, retentionD7Target: 25, thirdPartyBudgetMs: 800, mobileShareExpected: 65, label: "E-Commerce / Retail" },
  saas: { costPerConvLow: 50, costPerConvHigh: 500, revCostRatioTarget: 4, infraPctRevenueLow: 10, infraPctRevenueHigh: 20, errorRateTarget: 0.5, cdnRoiTarget: 3, latencyImpactPerSec: 3, idleUtilTarget: 60, breakEvenHoursTarget: 320, convRateTarget: 7, apdexTarget: 0.9, avgDurationTarget: 1500, bounceRateTarget: 30, frustratedPctTarget: 5, lcpTarget: 2000, clsTarget: 0.05, inpTarget: 150, sessionDepthTarget: 8, retentionD7Target: 60, thirdPartyBudgetMs: 500, mobileShareExpected: 25, label: "SaaS / B2B" },
  media: { costPerConvLow: 0.01, costPerConvHigh: 0.1, revCostRatioTarget: 25, infraPctRevenueLow: 5, infraPctRevenueHigh: 15, errorRateTarget: 2, cdnRoiTarget: 20, latencyImpactPerSec: 5, idleUtilTarget: 50, breakEvenHoursTarget: 80, convRateTarget: 1.5, apdexTarget: 0.8, avgDurationTarget: 3000, bounceRateTarget: 55, frustratedPctTarget: 12, lcpTarget: 3000, clsTarget: 0.15, inpTarget: 250, sessionDepthTarget: 3, retentionD7Target: 35, thirdPartyBudgetMs: 1200, mobileShareExpected: 70, label: "Media / Publishing" },
  financial: { costPerConvLow: 10, costPerConvHigh: 100, revCostRatioTarget: 10, infraPctRevenueLow: 3, infraPctRevenueHigh: 8, errorRateTarget: 0.1, cdnRoiTarget: 5, latencyImpactPerSec: 10, idleUtilTarget: 80, breakEvenHoursTarget: 240, convRateTarget: 5, apdexTarget: 0.92, avgDurationTarget: 1200, bounceRateTarget: 25, frustratedPctTarget: 3, lcpTarget: 1800, clsTarget: 0.03, inpTarget: 100, sessionDepthTarget: 6, retentionD7Target: 70, thirdPartyBudgetMs: 300, mobileShareExpected: 45, label: "Financial Services" },
  travel: { costPerConvLow: 5, costPerConvHigh: 50, revCostRatioTarget: 6, infraPctRevenueLow: 3, infraPctRevenueHigh: 7, errorRateTarget: 1, cdnRoiTarget: 7, latencyImpactPerSec: 8, idleUtilTarget: 65, breakEvenHoursTarget: 200, convRateTarget: 4, apdexTarget: 0.82, avgDurationTarget: 3500, bounceRateTarget: 45, frustratedPctTarget: 10, lcpTarget: 2800, clsTarget: 0.12, inpTarget: 220, sessionDepthTarget: 5, retentionD7Target: 20, thirdPartyBudgetMs: 900, mobileShareExpected: 60, label: "Travel / Hospitality" },
  healthcare: { costPerConvLow: 20, costPerConvHigh: 200, revCostRatioTarget: 5, infraPctRevenueLow: 5, infraPctRevenueHigh: 12, errorRateTarget: 0.1, cdnRoiTarget: 4, latencyImpactPerSec: 4, idleUtilTarget: 75, breakEvenHoursTarget: 400, convRateTarget: 6, apdexTarget: 0.9, avgDurationTarget: 2000, bounceRateTarget: 35, frustratedPctTarget: 5, lcpTarget: 2200, clsTarget: 0.05, inpTarget: 150, sessionDepthTarget: 5, retentionD7Target: 50, thirdPartyBudgetMs: 400, mobileShareExpected: 50, label: "Healthcare" },
  gaming: { costPerConvLow: 1, costPerConvHigh: 15, revCostRatioTarget: 8, infraPctRevenueLow: 8, infraPctRevenueHigh: 20, errorRateTarget: 1, cdnRoiTarget: 15, latencyImpactPerSec: 6, idleUtilTarget: 55, breakEvenHoursTarget: 120, convRateTarget: 8, apdexTarget: 0.88, avgDurationTarget: 1800, bounceRateTarget: 30, frustratedPctTarget: 7, lcpTarget: 2000, clsTarget: 0.08, inpTarget: 100, sessionDepthTarget: 10, retentionD7Target: 40, thirdPartyBudgetMs: 600, mobileShareExpected: 55, label: "Gaming" },
  general: { costPerConvLow: 1, costPerConvHigh: 50, revCostRatioTarget: 5, infraPctRevenueLow: 5, infraPctRevenueHigh: 15, errorRateTarget: 1, cdnRoiTarget: 5, latencyImpactPerSec: 5, idleUtilTarget: 65, breakEvenHoursTarget: 200, convRateTarget: 3, apdexTarget: 0.85, avgDurationTarget: 3000, bounceRateTarget: 45, frustratedPctTarget: 10, lcpTarget: 2500, clsTarget: 0.1, inpTarget: 200, sessionDepthTarget: 4, retentionD7Target: 30, thirdPartyBudgetMs: 800, mobileShareExpected: 55, label: "General / Other" },
};

const FRONTEND_STATE_KEY = "uj-frontend-app";
const STEPS_STATE_KEY = "uj-funnel-steps";
const AOV_STATE_KEY = "uj-average-order-value";
const MONTHLY_INFRA_COST_STATE_KEY = "uj-monthly-infra-cost";
const CDN_MONTHLY_COST_STATE_KEY = "uj-cdn-monthly-cost";
const COMPUTE_COST_PER_HOUR_STATE_KEY = "uj-compute-cost-per-hour";
const COST_PER_GB_STATE_KEY = "uj-cost-per-gb";
const ENGINEER_HOURLY_RATE_STATE_KEY = "uj-engineer-hourly-rate";
const INDUSTRY_STATE_KEY = "uj-industry";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
interface SettingsContextValue {
  frontend: string;
  setFrontend: (v: string) => void;
  steps: StepDef[];
  setSteps: (v: StepDef[]) => void;
  aov: number;
  setAov: (v: number) => void;
  monthlyInfraCost: number;
  setMonthlyInfraCost: (v: number) => void;
  cdnMonthlyCost: number;
  setCdnMonthlyCost: (v: number) => void;
  computeCostPerHour: number;
  setComputeCostPerHour: (v: number) => void;
  costPerGb: number;
  setCostPerGb: (v: number) => void;
  engineerHourlyRate: number;
  setEngineerHourlyRate: (v: number) => void;
  industry: IndustryType;
  setIndustry: (v: IndustryType) => void;
  saveFrontend: (v: string) => void;
  saveSteps: (v: StepDef[]) => void;
  saveAov: (v: number) => void;
  saveMonthlyInfraCost: (v: number) => void;
  saveCdnMonthlyCost: (v: number) => void;
  saveComputeCostPerHour: (v: number) => void;
  saveCostPerGb: (v: number) => void;
  saveEngineerHourlyRate: (v: number) => void;
  saveIndustry: (v: IndustryType) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [frontend, setFrontend] = useState<string>(DEFAULT_FRONTEND);
  const [steps, setSteps] = useState<StepDef[]>(DEFAULT_FUNNEL_STEPS);
  const [aov, setAov] = useState<number>(DEFAULT_AOV);
  const [monthlyInfraCost, setMonthlyInfraCost] = useState<number>(DEFAULT_MONTHLY_INFRA_COST);
  const [cdnMonthlyCost, setCdnMonthlyCost] = useState<number>(DEFAULT_CDN_MONTHLY_COST);
  const [computeCostPerHour, setComputeCostPerHour] = useState<number>(DEFAULT_COMPUTE_COST_PER_HOUR);
  const [costPerGb, setCostPerGb] = useState<number>(DEFAULT_COST_PER_GB);
  const [engineerHourlyRate, setEngineerHourlyRate] = useState<number>(DEFAULT_ENGINEER_HOURLY_RATE);
  const [industry, setIndustry] = useState<IndustryType>(DEFAULT_INDUSTRY);

  const savedFrontend = useUserAppState({ key: FRONTEND_STATE_KEY });
  const savedSteps = useUserAppState({ key: STEPS_STATE_KEY });
  const savedAov = useUserAppState({ key: AOV_STATE_KEY });
  const savedMonthlyInfraCost = useUserAppState({ key: MONTHLY_INFRA_COST_STATE_KEY });
  const savedCdnMonthlyCost = useUserAppState({ key: CDN_MONTHLY_COST_STATE_KEY });
  const savedComputeCostPerHour = useUserAppState({ key: COMPUTE_COST_PER_HOUR_STATE_KEY });
  const savedCostPerGb = useUserAppState({ key: COST_PER_GB_STATE_KEY });
  const savedEngineerHourlyRate = useUserAppState({ key: ENGINEER_HOURLY_RATE_STATE_KEY });
  const savedIndustry = useUserAppState({ key: INDUSTRY_STATE_KEY });
  const { execute: saveState } = useSetUserAppState();

  useEffect(() => {
    if (savedFrontend.data?.value) {
      const val = savedFrontend.data.value as string;
      if (val.trim()) setFrontend(val.trim());
    }
  }, [savedFrontend.data?.value]);

  useEffect(() => {
    if (savedSteps.data?.value) {
      try {
        const parsed = JSON.parse(savedSteps.data.value as string) as any[];
        if (Array.isArray(parsed) && parsed.length >= MIN_STEPS && parsed.length <= MAX_STEPS) {
          // Migrate old format: identifier (string) → identifiers (string[])
          const migrated: StepDef[] = parsed.map((s: any) => ({
            label: s.label ?? "",
            identifiers: Array.isArray(s.identifiers) ? s.identifiers : (s.identifier ? [s.identifier] : [""]),
            type: s.type ?? "view",
            app: s.app ?? undefined,
          }));
          setSteps(migrated);
        }
      } catch { /* ignore parse errors */ }
    }
  }, [savedSteps.data?.value]);

  useEffect(() => {
    if (savedAov.data?.value) {
      const v = Number(savedAov.data.value);
      if (!isNaN(v) && v >= 0) setAov(v);
    }
  }, [savedAov.data?.value]);

  useEffect(() => {
    if (savedMonthlyInfraCost.data?.value) {
      const v = Number(savedMonthlyInfraCost.data.value);
      if (!isNaN(v) && v >= 0) setMonthlyInfraCost(v);
    }
  }, [savedMonthlyInfraCost.data?.value]);

  useEffect(() => {
    if (savedCdnMonthlyCost.data?.value) {
      const v = Number(savedCdnMonthlyCost.data.value);
      if (!isNaN(v) && v >= 0) setCdnMonthlyCost(v);
    }
  }, [savedCdnMonthlyCost.data?.value]);

  useEffect(() => {
    if (savedComputeCostPerHour.data?.value) {
      const v = Number(savedComputeCostPerHour.data.value);
      if (!isNaN(v) && v >= 0) setComputeCostPerHour(v);
    }
  }, [savedComputeCostPerHour.data?.value]);

  useEffect(() => {
    if (savedCostPerGb.data?.value) {
      const v = Number(savedCostPerGb.data.value);
      if (!isNaN(v) && v >= 0) setCostPerGb(v);
    }
  }, [savedCostPerGb.data?.value]);

  useEffect(() => {
    if (savedEngineerHourlyRate.data?.value) {
      const v = Number(savedEngineerHourlyRate.data.value);
      if (!isNaN(v) && v >= 0) setEngineerHourlyRate(v);
    }
  }, [savedEngineerHourlyRate.data?.value]);

  useEffect(() => {
    if (savedIndustry.data?.value) {
      const v = savedIndustry.data.value as string;
      if (INDUSTRY_OPTIONS.some(o => o.value === v)) setIndustry(v as IndustryType);
    }
  }, [savedIndustry.data?.value]);

  const saveFrontend = (v: string) => {
    setFrontend(v);
    saveState({ key: FRONTEND_STATE_KEY, body: { value: v } });
  };

  const saveSteps = (v: StepDef[]) => {
    setSteps(v);
    saveState({ key: STEPS_STATE_KEY, body: { value: JSON.stringify(v) } });
  };

  const saveAov = (v: number) => {
    setAov(v);
    saveState({ key: AOV_STATE_KEY, body: { value: String(v) } });
  };

  const saveMonthlyInfraCost = (v: number) => {
    setMonthlyInfraCost(v);
    saveState({ key: MONTHLY_INFRA_COST_STATE_KEY, body: { value: String(v) } });
  };

  const saveCdnMonthlyCost = (v: number) => {
    setCdnMonthlyCost(v);
    saveState({ key: CDN_MONTHLY_COST_STATE_KEY, body: { value: String(v) } });
  };

  const saveComputeCostPerHour = (v: number) => {
    setComputeCostPerHour(v);
    saveState({ key: COMPUTE_COST_PER_HOUR_STATE_KEY, body: { value: String(v) } });
  };

  const saveCostPerGb = (v: number) => {
    setCostPerGb(v);
    saveState({ key: COST_PER_GB_STATE_KEY, body: { value: String(v) } });
  };

  const saveEngineerHourlyRate = (v: number) => {
    setEngineerHourlyRate(v);
    saveState({ key: ENGINEER_HOURLY_RATE_STATE_KEY, body: { value: String(v) } });
  };

  const saveIndustry = (v: IndustryType) => {
    setIndustry(v);
    saveState({ key: INDUSTRY_STATE_KEY, body: { value: v } });
  };

  return (
    <SettingsContext.Provider value={{ frontend, setFrontend, steps, setSteps, aov, setAov, monthlyInfraCost, setMonthlyInfraCost, cdnMonthlyCost, setCdnMonthlyCost, computeCostPerHour, setComputeCostPerHour, costPerGb, setCostPerGb, engineerHourlyRate, setEngineerHourlyRate, industry, setIndustry, saveFrontend, saveSteps, saveAov, saveMonthlyInfraCost, saveCdnMonthlyCost, saveComputeCostPerHour, saveCostPerGb, saveEngineerHourlyRate, saveIndustry }}>
      {children}
    </SettingsContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
