import React, { createContext, useContext, useState, useEffect } from "react";
import { useUserAppState, useSetUserAppState } from "@dynatrace-sdk/react-hooks";

// ---------------------------------------------------------------------------
// Types & defaults
// ---------------------------------------------------------------------------
export type StepDef = { label: string; identifiers: string[]; type: "view" | "request" };

export const DEFAULT_FRONTEND = "www.angular.easytravel.com";
export const MIN_STEPS = 2;
export const MAX_STEPS = 10;

export const DEFAULT_FUNNEL_STEPS: StepDef[] = [
  { label: "Home", identifiers: ["/easytravel/home", "/"], type: "view" },
  { label: "Search", identifiers: ["/easytravel/search"], type: "view" },
  { label: "Journey Detail", identifiers: ["/easytravel/journeys/:id:"], type: "view" },
  { label: "Book", identifiers: ["/easytravel/journeys/:id:/book"], type: "view" },
];

export const DEFAULT_AOV = 1200;
export const DEFAULT_MONTHLY_INFRA_COST = 100000;
export const DEFAULT_CDN_MONTHLY_COST = 100;
export const DEFAULT_COMPUTE_COST_PER_HOUR = 100;
export const DEFAULT_COST_PER_GB = 100;
export const DEFAULT_ENGINEER_HOURLY_RATE = 100;
const FRONTEND_STATE_KEY = "uj-frontend-app";
const STEPS_STATE_KEY = "uj-funnel-steps";
const AOV_STATE_KEY = "uj-average-order-value";
const MONTHLY_INFRA_COST_STATE_KEY = "uj-monthly-infra-cost";
const CDN_MONTHLY_COST_STATE_KEY = "uj-cdn-monthly-cost";
const COMPUTE_COST_PER_HOUR_STATE_KEY = "uj-compute-cost-per-hour";
const COST_PER_GB_STATE_KEY = "uj-cost-per-gb";
const ENGINEER_HOURLY_RATE_STATE_KEY = "uj-engineer-hourly-rate";

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
  saveFrontend: (v: string) => void;
  saveSteps: (v: StepDef[]) => void;
  saveAov: (v: number) => void;
  saveMonthlyInfraCost: (v: number) => void;
  saveCdnMonthlyCost: (v: number) => void;
  saveComputeCostPerHour: (v: number) => void;
  saveCostPerGb: (v: number) => void;
  saveEngineerHourlyRate: (v: number) => void;
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

  const savedFrontend = useUserAppState({ key: FRONTEND_STATE_KEY });
  const savedSteps = useUserAppState({ key: STEPS_STATE_KEY });
  const savedAov = useUserAppState({ key: AOV_STATE_KEY });
  const savedMonthlyInfraCost = useUserAppState({ key: MONTHLY_INFRA_COST_STATE_KEY });
  const savedCdnMonthlyCost = useUserAppState({ key: CDN_MONTHLY_COST_STATE_KEY });
  const savedComputeCostPerHour = useUserAppState({ key: COMPUTE_COST_PER_HOUR_STATE_KEY });
  const savedCostPerGb = useUserAppState({ key: COST_PER_GB_STATE_KEY });
  const savedEngineerHourlyRate = useUserAppState({ key: ENGINEER_HOURLY_RATE_STATE_KEY });
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

  return (
    <SettingsContext.Provider value={{ frontend, setFrontend, steps, setSteps, aov, setAov, monthlyInfraCost, setMonthlyInfraCost, cdnMonthlyCost, setCdnMonthlyCost, computeCostPerHour, setComputeCostPerHour, costPerGb, setCostPerGb, engineerHourlyRate, setEngineerHourlyRate, saveFrontend, saveSteps, saveAov, saveMonthlyInfraCost, saveCdnMonthlyCost, saveComputeCostPerHour, saveCostPerGb, saveEngineerHourlyRate }}>
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
