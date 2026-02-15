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

    // Initial load
    useEffect(() => {
        const loaded = loadSettings();
        setSettings(loaded);
        const resolved = resolveTheme(loaded.theme);
        setResolvedTheme(resolved);
        applyThemeToDOM(resolved);
        setMounted(true);
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
            const formatted = settings.compactNumbers
                ? formatNumber(value)
                : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
            switch (settings.currency) {
                case "EUR":
                    return `€${formatted}`;
                case "BTC":
                    return `₿${formatted}`;
                default:
                    return `$${formatted}`;
            }
        },
        [settings.currency, settings.compactNumbers, formatNumber]
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
