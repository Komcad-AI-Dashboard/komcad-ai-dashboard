import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[6px] rounded-[6px] text-[12px] font-bold tracking-wide transition-[color,background-color,border-color,box-shadow,filter] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-border bg-elevated text-ink hover:border-accent hover:bg-surface-hover hover:text-accent-bright",
        outline: "border border-accent text-accent-bright bg-transparent hover:bg-accent-bright/10",
        solid:
          "bg-gradient-to-b from-accent-bright to-accent text-[#00170C] shadow-[0_0_18px_rgba(60,242,154,0.28),inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-110 hover:shadow-[0_0_26px_rgba(60,242,154,0.5)]",
        danger: "border border-red bg-red/15 text-[#F5A9A5] hover:bg-red/25",
        ghost: "text-ink-2 hover:bg-surface-hover hover:text-ink",
      },
      size: {
        default: "h-[30px] px-3",
        sm: "h-[26px] px-2 text-[11px]",
        icon: "size-[30px] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
