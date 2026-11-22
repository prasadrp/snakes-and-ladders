'use client';

import React from 'react';
import { soundManager } from '@/lib/audio/sound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      soundManager.playClick();
      onClick?.(e);
    }
  };

  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-wide rounded-2xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 shadow-sm';

  const sizeStyles = {
    sm: 'text-sm px-3.5 py-1.5 h-9',
    md: 'text-base px-5 py-2.5 h-12',
    lg: 'text-lg px-7 py-3.5 h-14 shadow-md',
  };

  const variantStyles = {
    primary:
      'bg-[#6558E8] text-white hover:bg-[#5245DA] active:bg-[#4337C4] shadow-[0_4px_12px_rgba(101,88,232,0.35)]',
    secondary:
      'bg-white text-[#25233A] border-2 border-[#E9E2D9] hover:bg-[#F9F5EF] hover:border-[#D5CDC2]',
    accent:
      'bg-[#FFB84D] text-[#4A3200] hover:bg-[#F5AB3A] active:bg-[#E59C2A] shadow-[0_4px_12px_rgba(255,184,77,0.4)]',
    danger:
      'bg-[#F06B6B] text-white hover:bg-[#E25656] shadow-[0_4px_12px_rgba(240,107,107,0.35)]',
    ghost:
      'bg-transparent text-[#77758A] hover:bg-black/5 hover:text-[#25233A] shadow-none',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
