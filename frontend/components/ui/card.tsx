import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-5 shadow-[0_18px_40px_rgba(16,32,51,0.08)]", className)}
      {...props}
    />
  );
}
