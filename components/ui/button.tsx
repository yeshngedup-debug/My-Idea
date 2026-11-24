'use client';

import * as React from 'react';
import styles from './pressable.module.css';

export function Button({
  children,
  disabled,
  onClick,
  className = '',
  variant = 'default',
  type = 'button',
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  type?: 'button' | 'submit' | 'reset';
}) {
  const baseStyles = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${styles.press} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d84f37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea] disabled:opacity-50 whitespace-nowrap`;
  
  const variantStyles = {
    default: 'bg-[#17352b] text-[#fffefa] hover:bg-[#244b3e]',
    outline: 'border border-[#ded8cb] bg-[#fffefa] text-[#17352b] hover:bg-[#eeeae1]',
    ghost: 'text-[#17352b] hover:bg-[#eeeae1]',
    destructive: 'bg-[#b23c26] text-[#fffefa] hover:bg-[#9d3328]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
