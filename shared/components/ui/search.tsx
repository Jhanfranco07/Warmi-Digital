import { SearchIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/lib/utils";

export type SearchProps = {
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onClear?: () => void;
  className?: string;
  "aria-label"?: string;
};

export function Search({
  name = "search",
  placeholder = "Buscar",
  value,
  onChange,
  onClear,
  className,
  "aria-label": ariaLabel = "Buscar"
}: SearchProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pl-9 pr-10"
      />
      {value && onClear ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-10 w-10"
          onClick={onClear}
          aria-label="Limpiar busqueda"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
