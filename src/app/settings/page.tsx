"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { GlassCard } from "@/components/dashboard/glass-card";
import {
    Sun,
    Moon,
    Monitor,
    RefreshCw,
    DollarSign,
    Bell,
    Github,
    ExternalLink,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light" | "system";
type Currency = "USD" | "EUR" | "BTC";
type RefreshRate = "10" | "30" | "60" | "300";

interface UserSettings {
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

function applyTheme(theme: Theme) {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", prefersDark);
        root.classList.toggle("light", !prefersDark);
    } else {
        root.classList.toggle("dark", theme === "dark");
        root.classList.toggle("light", theme === "light");
    }
}

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "dark", label: "Dark", icon: Moon },
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Monitor },
];

const currencyOptions: { value: Currency; label: string; symbol: string }[] = [
    { value: "USD", label: "US Dollar", symbol: "$" },
    { value: "EUR", label: "Euro", symbol: "€" },
    { value: "BTC", label: "Bitcoin", symbol: "₿" },
];

const refreshOptions: { value: RefreshRate; label: string }[] = [
    { value: "10", label: "10 seconds" },
    { value: "30", label: "30 seconds" },
    { value: "60", label: "1 minute" },
    { value: "300", label: "5 minutes" },
];

function ToggleSwitch({
    enabled,
    onChange,
}: {
    enabled: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none",
                enabled
                    ? "bg-[#EF8F36]"
                    : "bg-[rgba(255,255,255,0.1)]"
            )}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm",
                    enabled ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    );
}

function SavedIndicator({ show }: { show: boolean }) {
    return (
        <div
            className={cn(
                "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg glass-card border border-[rgba(34,197,94,0.3)] transition-all duration-300",
                show
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
            )}
        >
            <Check className="w-4 h-4 text-[#22c55e]" />
            <span className="text-sm text-foreground">Settings saved</span>
        </div>
    );
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [showSaved, setShowSaved] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setSettings(loadSettings());
        setMounted(true);
    }, []);

    const updateSetting = useCallback(
        <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
            setSettings((prev) => {
                const next = { ...prev, [key]: value };
                saveSettings(next);
                if (key === "theme") {
                    applyTheme(value as Theme);
                }
                return next;
            });
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
        },
        []
    );

    if (!mounted) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                            Settings
                        </h1>
                        <p className="text-sm text-muted-foreground">Loading preferences…</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-3xl">
                {/* Page Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                        Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Customize your dashboard experience. Preferences are saved locally.
                    </p>
                </div>

                {/* Appearance */}
                <GlassCard title="Appearance" icon={<Moon className="w-4 h-4" />}>
                    <div className="space-y-5">
                        {/* Theme Selector */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-3 block">
                                Theme
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {themeOptions.map((option) => {
                                    const isActive = settings.theme === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => updateSetting("theme", option.value)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200",
                                                isActive
                                                    ? "border-[#EF8F36] bg-[rgba(239,143,54,0.1)]"
                                                    : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(239,143,54,0.3)] hover:bg-[rgba(255,255,255,0.04)]"
                                            )}
                                        >
                                            <option.icon
                                                className={cn(
                                                    "w-5 h-5",
                                                    isActive ? "text-[#EF8F36]" : "text-muted-foreground"
                                                )}
                                            />
                                            <span
                                                className={cn(
                                                    "text-sm font-medium",
                                                    isActive ? "text-foreground" : "text-muted-foreground"
                                                )}
                                            >
                                                {option.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Animations Toggle */}
                        <div className="flex items-center justify-between py-1">
                            <div>
                                <p className="text-sm text-foreground">Animations</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Enable smooth transitions and micro-animations
                                </p>
                            </div>
                            <ToggleSwitch
                                enabled={settings.animationsEnabled}
                                onChange={(v) => updateSetting("animationsEnabled", v)}
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* Data & Display */}
                <GlassCard
                    title="Data & Display"
                    icon={<RefreshCw className="w-4 h-4" />}
                >
                    <div className="space-y-5">
                        {/* Refresh Rate */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-3 block">
                                Auto-refresh interval
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {refreshOptions.map((option) => {
                                    const isActive = settings.refreshRate === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => updateSetting("refreshRate", option.value)}
                                            className={cn(
                                                "px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200",
                                                isActive
                                                    ? "border-[#EF8F36] bg-[rgba(239,143,54,0.1)] text-foreground"
                                                    : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-muted-foreground hover:border-[rgba(239,143,54,0.3)]"
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Currency */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-3 block">
                                Display currency
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {currencyOptions.map((option) => {
                                    const isActive = settings.currency === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => updateSetting("currency", option.value)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200",
                                                isActive
                                                    ? "border-[#EF8F36] bg-[rgba(239,143,54,0.1)]"
                                                    : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(239,143,54,0.3)]"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "text-lg font-mono",
                                                    isActive ? "text-[#EF8F36]" : "text-muted-foreground"
                                                )}
                                            >
                                                {option.symbol}
                                            </span>
                                            <span
                                                className={cn(
                                                    "text-sm font-medium",
                                                    isActive ? "text-foreground" : "text-muted-foreground"
                                                )}
                                            >
                                                {option.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Compact Numbers */}
                        <div className="flex items-center justify-between py-1">
                            <div>
                                <p className="text-sm text-foreground">Compact numbers</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Display large values as 1.2M instead of 1,200,000
                                </p>
                            </div>
                            <ToggleSwitch
                                enabled={settings.compactNumbers}
                                onChange={(v) => updateSetting("compactNumbers", v)}
                            />
                        </div>

                        {/* Tooltips Toggle */}
                        <div className="flex items-center justify-between py-1">
                            <div>
                                <p className="text-sm text-foreground">Show tooltips</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Display helpful explanations on hover
                                </p>
                            </div>
                            <ToggleSwitch
                                enabled={settings.showTooltips}
                                onChange={(v) => updateSetting("showTooltips", v)}
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* Links & Resources */}
                <GlassCard title="Resources" icon={<ExternalLink className="w-4 h-4" />}>
                    <div className="space-y-3">
                        <a
                            href="https://github.com/manukyancloud/citrea-watch-frontend"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(239,143,54,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 group"
                        >
                            <div className="flex items-center gap-3">
                                <Github className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Frontend Source Code
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        View on GitHub
                                    </p>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <a
                            href="https://github.com/manukyancloud/citrea-watch-backend"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(239,143,54,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200 group"
                        >
                            <div className="flex items-center gap-3">
                                <Github className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Backend Source Code
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        View on GitHub
                                    </p>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </div>
                </GlassCard>

                {/* Version Info */}
                <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground">
                        Citrea Watch v1.0.0 • Built with Next.js
                    </p>
                </div>
            </div>

            <SavedIndicator show={showSaved} />
        </DashboardLayout>
    );
}
