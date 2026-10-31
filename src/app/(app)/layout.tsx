import { Suspense, type ReactNode } from "react";
import { BottomNav } from "@/components/app/BottomNav";
import { SideNav } from "@/components/app/SideNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1">
      <Suspense fallback={null}>
        <SideNav />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col pb-28 md:pb-10 md:pl-60">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col md:max-w-5xl">{children}</div>
      </div>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
