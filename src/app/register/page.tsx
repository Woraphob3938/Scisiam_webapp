"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import AuthForm from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-16 overflow-hidden select-none">
      {/* Header/Navbar */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Main Authentication container */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6 sm:py-12 md:py-16">
        <AuthForm initialMode="register" />
      </main>
    </div>
  );
}
