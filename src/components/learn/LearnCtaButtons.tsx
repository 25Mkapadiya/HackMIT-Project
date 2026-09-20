"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function LearnCtaButtons() {
  const router = useRouter();
  const setProposeMode = useAppStore((s) => s.setProposeMode);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <button
        onClick={() => router.push("/")}
        className="w-full sm:w-auto text-[14px] font-semibold px-7 py-3 rounded-md bg-ink-100 text-base-950 hover:brightness-95 transition-all"
      >
        Explore the Map
      </button>
      <button
        onClick={() => {
          setProposeMode(true);
          router.push("/");
        }}
        className="w-full sm:w-auto text-[14px] font-semibold px-7 py-3 rounded-md bg-accent-proposed text-white hover:brightness-110 transition-all shadow-[0_0_0_3px_rgba(255,84,112,0.18)]"
      >
        Analyze a Location
      </button>
    </div>
  );
}
