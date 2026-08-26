import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type IconBadgeVariant = 'teal' | 'violet' | 'slate';
export type IconBadgeSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASS: Record<IconBadgeVariant, string> = {
  teal: 'icon-badge-teal',
  violet: 'icon-badge-violet',
  slate: 'icon-badge-slate',
};

const SIZE_CLASS: Record<IconBadgeSize, string> = {
  sm: 'w-8 h-8 rounded-lg [&_svg]:w-4 [&_svg]:h-4',
  md: 'w-10 h-10 rounded-xl [&_svg]:w-5 [&_svg]:h-5',
  lg: 'w-12 h-12 rounded-xl [&_svg]:w-6 [&_svg]:h-6',
};

interface IconBadgeProps {
  icon?: LucideIcon;
  children?: React.ReactNode;
  variant?: IconBadgeVariant;
  size?: IconBadgeSize;
  className?: string;
  title?: string;
}

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon: Icon,
  children,
  variant = 'teal',
  size = 'md',
  className = '',
  title,
}) => (
  <span
    title={title}
    className={`icon-badge ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
  >
    {Icon ? <Icon aria-hidden /> : children}
  </span>
);
