"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Theme = "dark" | "light" | "system";
export type Currency = "USD" | "EUR" | "BTC";
export type RefreshRate = "10" | "30" | "60" | "300";

export interface UserSettings {
    theme: Theme;
    currency: Currency;
    refreshRate: RefreshRate;
    compactNumbers: boolean;
    showTooltips: boolean;
    animationsEnabled: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
    theme: "dark",
    currency: "USD",
    refreshRate: "30",
    compactNumbers: false,
    showTooltips: true,
    animationsEnabled: true,
};

const STORAGE_KEY = "citrea-watch-settings";

function loadSettings(): UserSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function saveSettings(settings: UserSettings) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function resolveTheme(theme: Theme): "dark" | "light" {
    if (theme === "system") {
        if (typeof window === "undefined") return "dark";
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }
    return theme;
}

function applyThemeToDOM(resolved: "dark" | "light") {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(resolved);
}

interface SettingsContextValue {
    settings: UserSettings;
    resolvedTheme: "dark" | "light";
    refreshMs: number;
    updateSetting: <K extends keyof UserSettings>(
        key: K,
        value: UserSettings[K]
    ) => void;
    formatNumber: (value: number | null | undefined) => string;
    formatUsd: (value: number | null | undefined) => string;
    formatCbtc: (value: number | null | undefined) => string;
    formatPct: (value: number | null | undefined) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
    const [mounted, setMounted] = useState(false);
    const [exchangeRates, setExchangeRates] = useState<{ EUR: number; BTC: number }>({ EUR: 1, BTC: 1 });

    // Initial load
    useEffect(() => {
        const loaded = loadSettings();
        setSettings(loaded);
        const resolved = resolveTheme(loaded.theme);
        setResolvedTheme(resolved);
        applyThemeToDOM(resolved);
        setMounted(true);
    }, []);

    // Fetch exchange rates (USD → EUR, USD → BTC)
    useEffect(() => {
        let cancelled = false;
        const fetchRates = async () => {
            try {
                const res = await fetch(
                    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur"
                );
                if (!res.ok) return;
                const data = await res.json();
                const btcUsd = data?.bitcoin?.usd as number | undefined;
                const btcEur = data?.bitcoin?.eur as number | undefined;
                if (btcUsd && btcEur && !cancelled) {
                    setExchangeRates({
                        EUR: btcEur / btcUsd,   // 1 USD = x EUR
                        BTC: 1 / btcUsd,        // 1 USD = x BTC
                    });
                }
            } catch {
                // keep previous rates on error
            }
        };
        fetchRates();
        const interval = setInterval(fetchRates, 5 * 60_000);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        if (settings.theme !== "system") return;
        const mql = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent) => {
            const resolved = e.matches ? "dark" : "light";
            setResolvedTheme(resolved);
            applyThemeToDOM(resolved);
        };
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, [settings.theme]);

    const updateSetting = useCallback(
        <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
            setSettings((prev) => {
                const next = { ...prev, [key]: value };
                saveSettings(next);
                if (key === "theme") {
                    const resolved = resolveTheme(value as Theme);
                    setResolvedTheme(resolved);
                    applyThemeToDOM(resolved);
                }
                return next;
            });
        },
        []
    );

    const refreshMs = Number(settings.refreshRate) * 1000;

    const formatNumber = useCallback(
        (value: number | null | undefined): string => {
            if (value === null || value === undefined) return "—";
            if (settings.compactNumbers) {
                if (Math.abs(value) >= 1_000_000_000)
                    return `${(value / 1_000_000_000).toFixed(2)}B`;
                if (Math.abs(value) >= 1_000_000)
                    return `${(value / 1_000_000).toFixed(2)}M`;
                if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
            }
            return value.toLocaleString();
        },
        [settings.compactNumbers]
    );

    const formatUsd = useCallback(
        (value: number | null | undefined): string => {
            if (value === null || value === undefined) return "—";
            let converted = value;
            let prefix = "$";
            let maxFrac = 2;

            if (settings.currency === "EUR") {
                converted = value * exchangeRates.EUR;
                prefix = "€";
            } else if (settings.currency === "BTC") {
                converted = value * exchangeRates.BTC;
                prefix = "₿";
                maxFrac = 6;
            }

            const formatted = settings.compactNumbers
                ? formatNumber(converted)
                : converted.toLocaleString(undefined, { maximumFractionDigits: maxFrac });
            return `${prefix}${formatted}`;
        },
        [settings.currency, settings.compactNumbers, formatNumber, exchangeRates]
    );

    const formatCbtc = useCallback(
        (value: number | null | undefined): string => {
            if (value === null || value === undefined) return "—";
            return `${value.toLocaleString(undefined, { maximumFractionDigits: 6 })} cBTC`;
        },
        []
    );

    const formatPct = useCallback(
        (value: number | null | undefined): string => {
            if (value === null || value === undefined) return "—";
            const sign = value >= 0 ? "+" : "";
            return `${sign}${value.toFixed(2)}%`;
        },
        []
    );

    // Prevent flash of wrong theme
    if (!mounted) {
        return null;
    }

    return (
        <SettingsContext.Provider
            value={{
                settings,
                resolvedTheme,
                refreshMs,
                updateSetting,
                formatNumber,
                formatUsd,
                formatCbtc,
                formatPct,
            }}
        >
            <div className={settings.animationsEnabled ? "" : "no-animations"}>
                {children}
            </div>
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return ctx;
}
