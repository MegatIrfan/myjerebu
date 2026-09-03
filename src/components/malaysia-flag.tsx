import { cn } from "@/lib/utils";

export type MalaysiaFlagCode =
  | "jhr"
  | "kdh"
  | "ktn"
  | "mlk"
  | "nsn"
  | "phg"
  | "png"
  | "prk"
  | "pls"
  | "sbh"
  | "swk"
  | "sgr"
  | "trg"
  | "kul"
  | "lbn"
  | "pjy"
  | "ft";

interface MalaysiaFlagProps extends React.HTMLAttributes<HTMLSpanElement> {
  code: MalaysiaFlagCode | string;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizeClasses: Record<string, string> = {
  xs: "w-4 h-2.5",
  sm: "w-5 h-3.5",
  md: "w-6 h-4",
  lg: "w-8 h-5",
};

export function MalaysiaFlag({ code, size = "md", className, ...props }: MalaysiaFlagProps) {
  const normalizedCode = code.toLowerCase();
  return (
    <span
      className={cn(
        "malaysia-state-flag-icon shrink-0",
        `malaysia-state-flag-icon-${normalizedCode}`,
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
