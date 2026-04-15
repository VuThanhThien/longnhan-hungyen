import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md text-sm font-medium',
    'touch-manipulation',
    'transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'motion-reduce:transition-none motion-reduce:transform-none',
    'active:translate-y-px active:scale-[0.99]',
    'motion-reduce:active:translate-y-0 motion-reduce:active:scale-100',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        outline:
          'border border-border bg-background shadow-sm hover:bg-muted hover:text-foreground',
        ghost: 'hover:bg-muted hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonProps = (
  | ({ asChild?: false } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ asChild: true } & React.HTMLAttributes<HTMLElement> & {
        children: React.ReactElement<{ className?: string }>;
        className?: string;
      })
) &
  VariantProps<typeof buttonVariants> & {
    /**
     * Avoid early "client component" constraints: this implements `asChild`
     * without Radix `Slot`, so it can be used from both server and client.
     */
    asChild?: boolean;
    /** Shows spinner, disables interaction, sets `aria-busy`. Ignored when `asChild`. */
    loading?: boolean;
    /** Present on union for `asChild` + native button usage. */
    disabled?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild,
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size }), className);
    const isLoading = Boolean(loading);

    if (asChild) {
      const child = children as React.ReactElement<{ className?: string }>;
      const passthrough = props as Record<string, unknown>;

      return React.cloneElement(child, {
        ...passthrough,
        className: cn(classes, child.props.className),
      });
    }

    const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
    const spinnerSize =
      size === 'sm'
        ? 'size-3.5'
        : size === 'lg'
          ? 'size-5'
          : size === 'icon'
            ? 'size-4'
            : 'size-4';

    return (
      <button
        ref={ref}
        type={buttonProps.type ?? 'button'}
        className={classes}
        {...buttonProps}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
      >
        {isLoading ? (
          <>
            <Loader2
              className={cn('shrink-0 animate-spin', spinnerSize)}
              aria-hidden
            />
            <span className="sr-only">Đang xử lý</span>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
