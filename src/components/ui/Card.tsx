import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid';
}

export function Card({
  children,
  className = '',
  variant = 'glass',
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variants = {
    glass:
      'border border-neutral-200 bg-white/80 backdrop-blur shadow-glass hover:shadow-lg',
    solid: 'border border-neutral-200 bg-white shadow-md hover:shadow-lg',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
