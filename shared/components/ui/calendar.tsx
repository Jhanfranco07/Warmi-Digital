import { CalendarDays } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";

export type CalendarProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Calendar({ className, label = "Fecha", ...props }: CalendarProps) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-label-ui">{label}</span>
      <span className="relative block">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="date" className="pl-9" {...props} />
      </span>
    </label>
  );
}
