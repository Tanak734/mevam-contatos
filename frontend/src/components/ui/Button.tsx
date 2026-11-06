import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-[background-color,border-color,transform] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] select-none';

    const variants = {
      primary: 'bg-brand text-brand-foreground hover:bg-brand/90 border border-transparent shadow-none',
      secondary: 'bg-surface-2 text-foreground hover:bg-border/60 border border-border',
      outline: 'bg-transparent text-foreground hover:bg-surface-2 border border-border hover:border-border-strong',
      ghost: 'bg-transparent text-muted hover:text-foreground hover:bg-surface-2 border border-transparent',
      danger: 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20',
    };

    const sizes = {
      sm: 'text-xs min-h-9 px-3 gap-1.5',
      md: 'text-sm min-h-10 px-4 gap-2',
      lg: 'text-base min-h-12 px-5 gap-2.5',
    };

    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled} {...props}>
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
