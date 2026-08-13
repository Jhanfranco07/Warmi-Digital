import * as React from "react";

import { cn } from "@/shared/lib/utils";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1760px] px-4 md:px-8 lg:px-10 xl:px-14 2xl:px-20",
        className
      )}
      {...props}
    />
  );
}
