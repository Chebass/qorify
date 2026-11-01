import { Suspense, type ReactNode } from "react";
import { LandscapeBackground } from "@/components/landscape/LandscapeBackground";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-1 flex-col">
      <Suspense
        fallback={<div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0b0a24] to-[#2a2460]" />}
      >
        <LandscapeBackground />
      </Suspense>
      <main className="pointer-events-none relative z-10 flex flex-1 items-end justify-center px-4 pb-6 pt-28 sm:pb-10">
        <div className="pointer-events-auto w-full max-w-[19rem]">{children}</div>
      </main>
    </div>
  );
}
