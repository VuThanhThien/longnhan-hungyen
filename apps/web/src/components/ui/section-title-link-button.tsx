'use client';

import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function getLeftCapSrc(solid: boolean) {
  return solid ? '/btn47-bg-left-hover-solid.png' : '/btn47-bg-left-hover.png';
}

function getRightCapSrc(solid: boolean) {
  return solid
    ? '/btn47-bg-right-hover-solid.png'
    : '/btn47-bg-right-hover.png';
}

export interface SectionTitleLinkButtonBaseProps {
  actionLabel: React.ReactNode;
  type?: 'primary' | 'secondary';
  solid?: boolean;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export type SectionTitleLinkButtonPropsUnion =
  | (SectionTitleLinkButtonBaseProps & { href: string; onClick?: never })
  | (SectionTitleLinkButtonBaseProps & { href?: never; onClick: () => void });

export const SectionTitleLinkButton: React.FC<
  SectionTitleLinkButtonPropsUnion
> = ({
  actionLabel,
  href,
  onClick,
  type = 'secondary',
  solid = false,
  className,
  buttonClassName,
  disabled = false,
  ariaLabel,
}) => {
  const resolvedType = type ?? (solid ? 'primary' : 'secondary');
  const isPrimary = resolvedType === 'primary';
  const leftCap = getLeftCapSrc(false);
  const leftCapSolid = getLeftCapSrc(true);
  const rightCap = getRightCapSrc(false);
  const rightCapSolid = getRightCapSrc(true);

  const actionContent = (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[14px]"
      >
        <span
          className={cn(
            'absolute inset-0 bg-[length:14px_47px] bg-no-repeat bg-left transition-opacity duration-200 ease-out motion-reduce:transition-none',
            isPrimary ? 'opacity-0' : 'opacity-100',
          )}
          style={{ backgroundImage: `url(${leftCap})` }}
        />
        <span
          className={cn(
            'absolute inset-0 bg-[length:14px_47px] bg-no-repeat bg-left transition-opacity duration-200 ease-out motion-reduce:transition-none',
            isPrimary
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
          )}
          style={{ backgroundImage: `url(${leftCapSolid})` }}
        />
      </span>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[14px]"
      >
        <span
          className={cn(
            'absolute inset-0 bg-[length:14px_47px] bg-no-repeat bg-right transition-opacity duration-200 ease-out motion-reduce:transition-none',
            isPrimary ? 'opacity-0' : 'opacity-100',
          )}
          style={{ backgroundImage: `url(${rightCap})` }}
        />
        <span
          className={cn(
            'absolute inset-0 bg-[length:14px_47px] bg-no-repeat bg-right transition-opacity duration-200 ease-out motion-reduce:transition-none',
            isPrimary
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
          )}
          style={{ backgroundImage: `url(${rightCapSolid})` }}
        />
      </span>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 rounded-none bg-(--brand-cream)"
      />

      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 left-[14px] right-[14px] z-0 rounded-none bg-(--brand-cream)',
          'transition-colors duration-200 ease-out motion-reduce:transition-none',
          isPrimary
            ? 'bg-[#8b0b0b]'
            : 'group-hover:bg-[#8b0b0b] group-focus-visible:bg-[#8b0b0b]',
        )}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 rounded-none border border-[#8b0b0b]"
      />

      <span
        className={cn(
          'relative z-20 px-4 transition-colors duration-200 ease-out motion-reduce:transition-none',
          isPrimary
            ? '!text-(--brand-cream)'
            : 'group-hover:!text-(--brand-cream) group-focus-visible:!text-(--brand-cream)',
        )}
      >
        {actionLabel}
      </span>
    </>
  );

  const sharedButtonClassName = cn(
    'group relative overflow-hidden rounded-none',
    'h-[47px] px-[14px]',
    'border-0 bg-transparent text-(--brand-forest)',
    'shadow-none',
    'transition-[transform,filter] duration-300 ease-out',
    'hover:brightness-[1.01]',
    'hover:scale-[0.97]',
    'active:scale-[0.98] active:translate-y-px',
    'motion-reduce:transition-none motion-reduce:transform-none',
    'motion-reduce:active:scale-100 motion-reduce:active:translate-y-0',
    buttonClassName,
    className,
  );

  if (href) {
    if (disabled) {
      return (
        <Button
          variant="ghost"
          className={sharedButtonClassName}
          disabled
          aria-label={
            ariaLabel ??
            (typeof actionLabel === 'string' ? actionLabel : undefined)
          }
        >
          {actionContent}
        </Button>
      );
    }
    return (
      <Button
        asChild
        variant="ghost"
        className={sharedButtonClassName}
        aria-label={
          ariaLabel ??
          (typeof actionLabel === 'string' ? actionLabel : undefined)
        }
      >
        <Link href={href}>{actionContent}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className={sharedButtonClassName}
      onClick={onClick}
      disabled={disabled}
      aria-label={
        ariaLabel ?? (typeof actionLabel === 'string' ? actionLabel : undefined)
      }
    >
      {actionContent}
    </Button>
  );
};

export default SectionTitleLinkButton;
