import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50",
        variant === "primary" && "bg-[#e07a2f] text-white hover:bg-[#c45c14]",
        variant === "secondary" && "bg-white text-[#0c2744] ring-1 ring-[#d9d0c0] hover:bg-[#f4efe4]",
        variant === "ghost" && "bg-transparent text-[#e8eef5] hover:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}
