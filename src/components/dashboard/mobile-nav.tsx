"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  ArrowLeftRight,
  Layers,
  Settings,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Overview", href: "/", icon: LayoutDashboard },
  { title: "Bridge & Fees", href: "/bridge", icon: ArrowLeftRight },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-[rgba(239,143,54,0.15)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EF8F36] to-[#EB582A] flex items-center justify-center">
              <Layers className="w-4 h-4 text-background" />
            </div>
            <span className="font-semibold text-foreground">Citrea</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-64 glass-card border-l border-[rgba(239,143,54,0.15)] transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 pt-16">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-[rgba(239,143,54,0.15)] text-foreground border border-[rgba(239,143,54,0.2)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-[#EF8F36]" : "text-muted-foreground"
                    )}
                  />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom links */}
          <div className="mt-6 pt-4 border-t border-[rgba(239,143,54,0.1)] space-y-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                pathname === "/settings"
                  ? "bg-[rgba(239,143,54,0.15)] text-foreground border border-[rgba(239,143,54,0.2)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Settings className={cn("w-5 h-5", pathname === "/settings" ? "text-[#EF8F36]" : "text-muted-foreground")} />
              <span className="text-sm font-medium">Settings</span>
            </Link>
            <a
              href="https://github.com/manukyancloud/citrea-watch-frontend"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Documentation</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
            </a>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-14" />
    </div>
  );
}

