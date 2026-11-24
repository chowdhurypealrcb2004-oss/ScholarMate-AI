import React from 'react';

/**
 * Reusable Card Container Component
 */
export default function Card({
  children,
  className = '',
  padding = 'p-6',
  hover = true,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`stat-card ${hover ? 'cursor-pointer' : ''} ${className}`}
      style={{
        padding: padding === 'p-4' ? '1rem' : padding === 'p-8' ? '2rem' : '1.5rem',
      }}
    >
      {children}
    </div>
  );
}
