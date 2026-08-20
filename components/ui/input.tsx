import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border border-input bg-white/75 px-4 py-2 text-sm text-foreground shadow-inner outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";
