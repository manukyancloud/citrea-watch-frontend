"use client";

import React from "react"

import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a14] relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#EF8F36] rounded-full opacity-[0.02] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#EB582A] rounded-full opacity-[0.02] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[rgba(239,143,54,0.03)] to-transparent rounded-full" />
      </div>
      
      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(239, 143, 54, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 143, 54, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen relative">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
