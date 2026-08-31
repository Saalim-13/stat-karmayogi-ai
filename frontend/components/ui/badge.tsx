import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-[#16375c]/10 px-2.5 py-0.5 text-xs font-semibold text-[#16375c]",
        className,
      )}
      {...props}
    />
  );
}
