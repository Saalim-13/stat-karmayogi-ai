import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-40 w-full rounded-xl border border-[#d9d0c0] bg-white px-3 py-2 text-sm text-[#102033] outline-none focus:ring-2 focus:ring-[#e07a2f]/40",
        className,
      )}
      {...props}
    />
  );
}
