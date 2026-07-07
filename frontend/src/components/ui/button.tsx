import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-primary-400 to-primary-600 text-white shadow-[0_0_20px_rgba(50,177,56,0.3),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-2px_0_rgba(0,0,0,0.1)] hover:from-primary-300 hover:to-primary-500 hover:shadow-[0_0_30px_rgba(50,177,56,0.5),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-2px_0_rgba(0,0,0,0.2)]",
        destructive: "bg-gradient-to-b from-rose-400 to-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] hover:from-rose-300 hover:to-rose-500",
        outline: "border border-gray-200 bg-white/50 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md hover:border-gray-300 text-gray-700",
        secondary: "bg-white/80 backdrop-blur-md text-primary-800 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
        ghost: "hover:bg-gray-100/80 text-gray-700 backdrop-blur-sm",
        link: "text-primary-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-14 rounded-2xl px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    return (
      <motion.button
        whileTap={{ scale: 0.94 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children as React.ReactNode}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
